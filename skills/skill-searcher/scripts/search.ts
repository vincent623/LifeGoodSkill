#!/usr/bin/env bun

interface SearchResult {
  name: string;
  fullName: string;
  description: string;
  version: string;
  downloads: string;
}

async function searchSkills(query: string): Promise<SearchResult[]> {
  const proc = Bun.spawn(["42plugin", "search", query, "--type", "skill"], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    console.error(`Search failed with exit code ${exitCode}`);
    return [];
  }

  return parseSearchOutput(output);
}

function parseSearchOutput(output: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lines = output.split("\n");

  let currentItem: Partial<SearchResult> | null = null;
  let collectingDescription = false;

  for (const line of lines) {
    const skillMatch = line.match(/^⚡\s+(.+?)\s+\[Skill\]/);
    const versionMatch = line.match(/v(\S+)\s+·\s+(\d+)\s+下载/);
    const installMatch = line.match(/安装:\s*42plugin install\s+(.+)/);
    const headerMatch = line.match(/找到\s*(\d+)\s*个/);

    if (headerMatch) {
      continue;
    }

    if (skillMatch) {
      if (currentItem?.name) {
        results.push(currentItem as SearchResult);
      }
      currentItem = {
        fullName: skillMatch[1],
        name: skillMatch[1].split("/").pop() || skillMatch[1],
        description: "",
        version: "",
        downloads: "",
      };
      collectingDescription = true;
    } else if (currentItem && versionMatch) {
      currentItem.version = versionMatch[1];
      currentItem.downloads = versionMatch[2];
      collectingDescription = false;
    } else if (currentItem && installMatch) {
      currentItem.fullName = installMatch[1];
    } else if (currentItem && collectingDescription) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("在内容") && !trimmed.startsWith("该插件")) {
        if (currentItem.description) {
          currentItem.description += " ";
        }
        currentItem.description += trimmed;
      }
    }
  }

  if (currentItem?.name) {
    results.push(currentItem as SearchResult);
  }

  return results;
}

function displayResults(results: SearchResult[], query: string): void {
  if (results.length === 0) {
    console.log(`\n未找到匹配 "${query}" 的技能。\n`);
    console.log("建议:");
    console.log("  - 尝试更通用的关键词");
    console.log("  - 使用英文搜索");
    console.log("  - 减少搜索词数量\n");
    return;
  }

  console.log(`\n找到 ${results.length} 个相关技能:\n`);

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    console.log(`${i + 1}. ${r.name}`);
    console.log(`   ${r.description || "暂无描述"}`);
    console.log(`   安装: 42plugin install ${r.fullName}`);
    console.log(`   版本: ${r.version} · ${r.downloads} 下载`);
    console.log("");
  }

  console.log("---");
  console.log("适应性建议:");
  console.log("  如果以上结果不完全匹配:");
  console.log("  - 尝试更精确的关键词");
  console.log("  - 组合多个相关技能使用");
  console.log("  - 参考 adaptation-strategies.md 获取详细建议\n");
}

function extractKeywords(input: string): string {
  const stopWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare",
    "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
    "into", "through", "during", "before", "after", "above", "below",
    "between", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "each", "few",
    "more", "most", "other", "some", "such", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "just",
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
    "你", "我", "他", "她", "它", "我们", "你们", "他们",
    "需要", "想要", "有个", "可以", "能", "帮我", "找一个",
    "处理", "转换", "生成", "整理", "分析", "搜索", "查找",
    "帮我", "给我", "找个", "有什么", "有没有", "有没有",
  ]);

  return input
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w))
    .join(" ");
}

async function main() {
  const args = Bun.argv.slice(2);
  const query = args.join(" ") || "";

  if (!query) {
    console.log("Usage: bun search.ts <search query>");
    console.log("Example: bun search.ts pdf converter");
    console.log("  bun search.ts 翻译");
    process.exit(1);
  }

  const keywords = extractKeywords(query);

  if (!keywords) {
    console.log("请提供更具体的查询词。");
    process.exit(1);
  }

  console.log(`正在搜索: "${keywords}"...`);
  const results = await searchSkills(keywords);
  displayResults(results, keywords);
}

main();
