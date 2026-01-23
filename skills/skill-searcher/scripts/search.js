#!/usr/bin/env node
import { spawn } from "child_process";

const KEYWORD_MAP = {
  "效率": ["productivity", "efficiency", "organize", "task", "workflow", "organizer", "manage"],
  "任务": ["task", "todo", "plan", "planning", "project", "management", "breakdown"],
  "笔记": ["note", "note-taking", "markdown", "obsidian", "knowledge", "organize", "notebook"],
  "整理": ["organize", "file", "sort", "clean", "management", "organizer", "tidy"],
  "时间": ["time", "schedule", "calendar", "time-management", "timer"],
  "自动化": ["automation", "workflow", "script", "auto", "automate"],
  "翻译": ["translate", "translation", "language", "multilingual"],
  "PDF": ["pdf", "document", "pdf-processing"],
  "会议": ["meeting", "summary", "minutes", "meeting-notes"],
  "日程": ["schedule", "calendar", "agenda", "planner"],
  "目标": ["goal", "okr", "objective", "target", "goal-setting"],
  "复盘": ["review", "retro", "reflect", "summary", "retrospective"],
  "文件": ["file", "folder", "organize", "file-management"],
  "知识": ["knowledge", "knowledge-base", "wiki", "knowledge-management"],
  "工具": ["tool", "utility", "helper", "assistant"],
  "管理": ["manage", "management", "manager", "organizer"],
};

function expandKeywords(input) {
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
  ]);

  const COMPOUND_WORDS = [
    "效率工具", "任务管理", "笔记整理", "时间管理", "文件整理",
    "会议纪要", "日程安排", "目标管理", "知识整理", "自动化工具",
  ];

  let words = input.toLowerCase().split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));

  for (const compound of COMPOUND_WORDS) {
    if (input.includes(compound)) {
      words.push(compound);
      words.push(compound.slice(0, 2));
      words.push(compound.slice(2));
    }
  }

  const queries = new Set();

  for (const word of words) {
    queries.add(word);
    if (KEYWORD_MAP[word]) {
      for (const en of KEYWORD_MAP[word]) {
        queries.add(en);
      }
    }
    if (word.includes("工具")) {
      queries.add("tool");
      queries.add("productivity");
    }
    if (word.includes("管理")) {
      queries.add("manage");
      queries.add("management");
    }
  }

  return Array.from(queries);
}

async function searchSkills(query) {
  const { execSync } = await import("child_process");
  try {
    const output = execSync(`42plugin search "${query}" --type skill --all --json`, {
      encoding: "utf-8",
      maxBuffer: 1024 * 1024,
    });
    return { success: true, results: parseSearchOutput(output) };
  } catch (e) {
    return { success: false, results: [], error: e.message };
  }
}

function parseSearchOutput(output) {
  try {
    const data = JSON.parse(output);
    if (data.plugins && Array.isArray(data.plugins)) {
      return data.plugins.map(p => ({
        fullName: p.fullName,
        name: p.name,
        description: p.description || p.title || "",
        version: p.version || "",
        downloads: String(p.downloads || 0),
      }));
    }
  } catch (e) {
  }

  const results = [];
  const lines = output.split("\n");

  let currentItem = null;
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
        results.push(currentItem);
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
    results.push(currentItem);
  }

  return results;
}

function displayResults(results, query) {
  if (results.length === 0) {
    console.log(`\n未找到匹配 "${query}" 的技能。\n`);
    console.log("建议:");
    console.log("  - 尝试更通用的关键词");
    console.log("  - 使用英文搜索");
    console.log("  - 减少搜索词数量\n");
    return;
  }

  console.log(`\n找到 ${results.length} 个相关技能 (去重后):\n`);

  for (let i = 0; i < Math.min(results.length, 20); i++) {
    const r = results[i];
    console.log(`${i + 1}. ${r.name}`);
    console.log(`   ${r.description || "暂无描述"}`);
    console.log(`   安装: 42plugin install ${r.fullName}`);
    console.log(`   版本: ${r.version} · ${r.downloads} 下载${r.matchedQuery ? ` · 匹配词: ${r.matchedQuery}` : ""}`);
    console.log("");
  }

  if (results.length > 20) {
    console.log(`... 还有 ${results.length - 20} 个结果\n`);
  }

  console.log("---");
  console.log("适应性建议:");
  console.log("  如果以上结果不完全匹配:");
  console.log("  - 尝试更精确的关键词");
  console.log("  - 组合多个相关技能使用");
  console.log("  - 参考 adaptation-strategies.md 获取详细建议\n");
}

function extractKeywords(input) {
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

async function multiStrategySearch(originalQuery) {
  const allResults = new Map();

  console.log(`原始查询: "${originalQuery}"`);
  const queries = expandKeywords(originalQuery);
  console.log(`扩展关键词: ${queries.join(", ")}\n`);

  for (const q of queries.slice(0, 5)) {
    process.stdout.write(`搜索 "${q}"... `);
    const { success, results, error } = await searchSkills(q);

    if (success && results.length > 0) {
      console.log(`✓ 找到 ${results.length} 个`);
      for (const r of results) {
        const key = r.fullName || r.name;
        if (!allResults.has(key)) {
          allResults.set(key, { ...r, matchedQuery: q });
        }
      }
    } else {
      console.log(`✗ ${error || "无结果"}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return Array.from(allResults.values());
}

async function main() {
  const args = process.argv.slice(2);
  const query = args.join(" ") || "";

  if (!query) {
    console.log("Usage: node search.js <search query>");
    console.log("Example: node search.js pdf converter");
    console.log("  node search.js 效率工具");
    process.exit(1);
  }

  const results = await multiStrategySearch(query);
  displayResults(results, query);
}

main();
