import { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// ============ 配置区域（根据需求修改） ============

// 差异列名（按优先级匹配）
const ERROR_COLUMNS = ["错误信息", "异常说明", "差异原因", "问题描述"];

// 实体标识提取（从文件名）
const parseEntityName = (filename: string): string => {
  return filename.replace(/\.(xls|xlsx)$/i, "").replace(/-报告$/, "");
};

// AI 配置
const AI_CONFIG = {
  apiUrl: "https://api.siliconflow.cn/v1/chat/completions",
  model: "deepseek-ai/DeepSeek-V3",
  batchSize: 3,
  timeout: 30000,
  maxTokens: 200,
};

// AI 提示词模板
const buildPrompt = (entity: string, total: number, issues: number, stats: string) => `
你是一个数据分析助手。请根据以下差异统计，提取1~5条核心问题，简要说明（不超过100字）。

实体：${entity}
总记录数：${total}
差异数量：${issues}

差异类型统计：
${stats}

请直接列出核心问题，格式如"1. xxx 2. xxx"，不要有任何前缀。
`;

// ============ 类型定义 ============

interface FileItem {
  file: File;
  status: "pending" | "parsing" | "done" | "error";
}

interface IssueData {
  entity: string;
  sourceFile: string;
  totalCount: number;
  issueCount: number;
  issues: Record<string, unknown>[];
  summary?: string;
}

// ============ 工具函数 ============

const normalizeFilename = (name: string): string =>
  name.replace(/[<>:"/\\|?*]/g, "_").trim().replace(/\s+/g, "_");

// ============ 主组件 ============

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("diff_api_key") || "");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [results, setResults] = useState<IssueData[]>([]);
  const [processing, setProcessing] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 保存 API Key
  const saveApiKey = useCallback(() => {
    localStorage.setItem("diff_api_key", apiKey);
  }, [apiKey]);

  // 添加文件
  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const valid = Array.from(fileList).filter((f) => /\.(xls|xlsx)$/i.test(f.name));
    setFiles((prev) => [...prev, ...valid.map((file) => ({ file, status: "pending" as const }))]);
  }, []);

  // 清空
  const clearAll = useCallback(() => {
    setFiles([]);
    setResults([]);
  }, []);

  // 解析 Excel
  const parseExcel = async (file: File): Promise<Record<string, unknown>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          resolve(XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // 提取差异
  const extractIssues = (data: Record<string, unknown>[], filename: string): IssueData => {
    const entity = parseEntityName(filename);
    let errorCol: string | null = null;

    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      for (const col of ERROR_COLUMNS) {
        if (columns.includes(col)) {
          errorCol = col;
          break;
        }
      }
    }

    if (!errorCol) {
      return { entity, sourceFile: filename, totalCount: data.length, issueCount: 0, issues: [] };
    }

    const issues = data
      .filter((row) => row[errorCol!] !== undefined && row[errorCol!] !== null && row[errorCol!] !== "")
      .map((row) => ({ ...row, 异常信息: row[errorCol!] }));

    return { entity, sourceFile: filename, totalCount: data.length, issueCount: issues.length, issues };
  };

  // 第一阶段：并行提取
  const startExtract = useCallback(async () => {
    if (files.length === 0 || processing) return;
    saveApiKey();
    setProcessing(true);
    setResults([]);
    setFiles((prev) => prev.map((f) => ({ ...f, status: "parsing" })));

    const parseResults = await Promise.all(
      files.map(async (item, idx) => {
        try {
          const data = await parseExcel(item.file);
          return { idx, success: true, data: extractIssues(data, item.file.name) };
        } catch {
          return { idx, success: false };
        }
      })
    );

    const newResults: IssueData[] = [];
    parseResults.forEach((r) => {
      if (r.success && r.data) {
        newResults.push(r.data);
        setFiles((prev) => prev.map((f, i) => (i === r.idx ? { ...f, status: "done" } : f)));
      } else {
        setFiles((prev) => prev.map((f, i) => (i === r.idx ? { ...f, status: "error" } : f)));
      }
    });

    setResults(newResults);
    setProcessing(false);
  }, [files, processing, saveApiKey]);

  // 第二阶段：AI 总结
  const startSummarize = useCallback(async () => {
    if (results.length === 0 || summarizing || !apiKey) return;
    setSummarizing(true);

    const needSummary = results.filter((r) => !r.summary && r.issueCount > 0);
    const { batchSize, timeout, apiUrl, model, maxTokens } = AI_CONFIG;

    for (let i = 0; i < needSummary.length; i += batchSize) {
      const batch = needSummary.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (item) => {
          const stats = Object.entries(
            item.issues.reduce((acc: Record<string, number>, issue) => {
              const type = String(issue["异常信息"] || "未知");
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {})
          )
            .map(([type, count]) => `- ${type}: ${count}条`)
            .join("\n");

          const prompt = buildPrompt(item.entity, item.totalCount, item.issueCount, stats);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          try {
            const res = await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
              body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: maxTokens }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return { entity: item.entity, summary: data.choices?.[0]?.message?.content?.trim() || "生成失败" };
          } catch (err) {
            clearTimeout(timeoutId);
            return { entity: item.entity, summary: `失败: ${(err as Error).message}` };
          }
        })
      );

      setResults((prev) =>
        prev.map((r) => {
          const match = batchResults.find((br) => br.entity === r.entity);
          return match ? { ...r, summary: match.summary } : r;
        })
      );
    }

    setSummarizing(false);
  }, [results, summarizing, apiKey]);

  // 下载 ZIP
  const downloadZip = useCallback(async () => {
    if (results.length === 0) return;
    const zip = new JSZip();
    const jsonFolder = zip.folder("json");

    results.forEach((r) => {
      const filename = `${normalizeFilename(r.sourceFile.replace(/\.(xls|xlsx)$/i, ""))}.json`;
      jsonFolder?.file(filename, JSON.stringify({ ...r, summary: undefined }, null, 2));
    });

    const csv =
      "\ufeff实体,源文件,差异数量,JSON路径,AI摘要\n" +
      results
        .map((r) => {
          const jsonPath = `json/${normalizeFilename(r.sourceFile.replace(/\.(xls|xlsx)$/i, ""))}.json`;
          return `"${r.entity}","${r.sourceFile}","${r.issueCount}","${jsonPath}","${(r.summary || "").replace(/"/g, '""')}"`;
        })
        .join("\n");
    zip.file("index.csv", csv);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `分析结果_${new Date().toISOString().slice(0, 10)}.zip`);
  }, [results]);

  // 渲染
  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Excel 差异分析器</h1>

      {/* API 配置 */}
      <div className="mb-6 flex gap-4">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API Key（可选，用于 AI 总结）"
          className="flex-1 px-3 py-2 border border-border"
        />
      </div>

      {/* 工具栏 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button onClick={() => fileInputRef.current?.click()} disabled={processing} className="px-4 py-2 bg-primary text-white disabled:opacity-50">
          选择文件
        </button>
        <button onClick={startExtract} disabled={processing || files.length === 0} className="px-4 py-2 bg-primary text-white disabled:opacity-50">
          {processing ? "解析中..." : "提取差异"}
        </button>
        <button onClick={startSummarize} disabled={summarizing || results.length === 0 || !apiKey} className="px-4 py-2 bg-blue-600 text-white disabled:opacity-50">
          {summarizing ? "总结中..." : "AI 总结"}
        </button>
        <button onClick={downloadZip} disabled={results.length === 0} className="px-4 py-2 bg-green-600 text-white disabled:opacity-50">
          下载 ZIP
        </button>
        <button onClick={clearAll} className="px-4 py-2 border border-border">
          清空
        </button>
      </div>

      <input ref={fileInputRef} type="file" multiple accept=".xls,.xlsx" onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />

      {/* 文件列表 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">文件 ({files.length})</h2>
        <div className="border border-border p-4 min-h-[100px]" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
          {files.length === 0 ? (
            <p className="text-muted-foreground text-center">拖拽文件到此处或点击选择</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className={`px-2 py-1 text-sm ${f.status === "done" ? "bg-green-100" : f.status === "error" ? "bg-red-100" : "bg-muted"}`}>
                  {f.file.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 结果表格 */}
      {results.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">结果 ({results.length})</h2>
          <table className="w-full text-sm border border-border">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left border-b">实体</th>
                <th className="p-2 text-left border-b">源文件</th>
                <th className="p-2 text-right border-b">差异数</th>
                <th className="p-2 text-left border-b">AI 摘要</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="p-2 border-b">{r.entity}</td>
                  <td className="p-2 border-b text-muted-foreground">{r.sourceFile}</td>
                  <td className="p-2 border-b text-right text-red-600">{r.issueCount}</td>
                  <td className={`p-2 border-b ${r.summary?.startsWith("失败") ? "text-red-500" : "text-muted-foreground"}`}>
                    {r.summary || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
