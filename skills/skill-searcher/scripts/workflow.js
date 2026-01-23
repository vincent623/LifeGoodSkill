#!/usr/bin/env node
import { spawn } from "child_process";
import { readdirSync, readFileSync, existsSync, mkdirSync } from "fs";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const exec = promisify(spawn);

const CACHE_DIR = ".skill-searcher-cache";
const CACHE_TTL = 3600000;

const STOP_WORDS = new Set([
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
  "的", "是", "在", "有", "和", "就", "不", "人", "都", "一",
  "一个", "上", "也", "很", "到", "说", "要", "去", "你",
  "会", "着", "没有", "看", "好", "自己", "这", "那",
]);

const KEYWORD_EXPANSION = {
  "skill": ["skill", "plugin", "tool", "workflow", "prompt"],
  "claude": ["claude", "ai", "llm", "assistant", "agent"],
  "organize": ["organize", "manage", "catalog", "index", "collection"],
  "note": ["note", "笔记", "markdown", "documentation", "knowledge"],
  "knowledge": ["knowledge", "knowledge-base", "wiki", "documentation"],
  "code": ["code", "编程", "development", "repository", "git"],
  "file": ["file", "document", "data", "content", "storage"],
  "search": ["search", "discover", "find", "query", "retrieve"],
  "recommend": ["recommend", "suggest", "match", "filter"],
  "efficiency": ["efficiency", "productivity", "workflow", "automation"],
  "translation": ["translation", "language", "multilingual"],
  "pdf": ["pdf", "document", "converter", "extraction"],
  "meeting": ["meeting", "minutes", "summary", "transcription"],
};

const PROJECTFIGS = {
  "skill-repository": {
    suffixes: ["skill", "plugin", "workflow"],
    relatedSearches: [
      "skill organizer management plugin",
      "claude skill collection discovery",
      "productivity workflow automation",
    ],
  },
  "note-repository": {
    suffixes: ["note", "markdown", "knowledge", "documentation"],
    relatedSearches: [
      "note organization tool",
      "markdown knowledge management",
      "documentation workflow",
    ],
  },
  "code-repository": {
    suffixes: ["code", "development", "git", "repository"],
    relatedSearches: [
      "code analysis tool",
      "development workflow automation",
      "git repository management",
    ],
  },
  "knowledge-base": {
    suffixes: ["knowledge", "wiki", "documentation", "information"],
    relatedSearches: [
      "knowledge management tool",
      "documentation organization",
      "information retrieval",
    ],
  },
  "other": {
    suffixes: ["tool", "plugin", "automation"],
    relatedSearches: [
      "productivity tool",
      "workflow automation",
      "personal improvement",
    ],
  },
};

function loadCache(query) {
  try {
    const cacheFile = `${CACHE_DIR}/${encodeURIComponent(query)}.json`;
    if (!existsSync(cacheFile)) return null;

    const cache = JSON.parse(readFileSync(cacheFile, "utf-8"));
    if (Date.now() - cache.timestamp > CACHE_TTL) return null;

    return cache.results;
  } catch {
    return null;
  }
}

function saveCache(query, results) {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    const cacheFile = `${CACHE_DIR}/${encodeURIComponent(query)}.json`;
    Bun.write(cacheFile, JSON.stringify({
      timestamp: Date.now(),
      results,
    }));
  } catch {
  }
}

function detectProjectType(rootDir) {
  const indicators = {
    "skill-repository": ["skills", "skill-", "plugin", ".claude-plugin"],
    "note-repository": ["notes", "note-", "obsidian", "logseq", "markdown"],
    "code-repository": [".git", "package.json", "requirements.txt", "Cargo.toml", "pyproject.toml"],
    "knowledge-base": ["wiki", "docs", "documentation", "KB", "knowledge"],
  };

  const scores = {
    "skill-repository": 0,
    "note-repository": 0,
    "code-repository": 0,
    "knowledge-base": 0,
  };

  try {
    const entries = readdirSync(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      const name = entry.name.toLowerCase();
      for (const [type, patterns] of Object.entries(indicators)) {
        if (patterns.some(p => name.includes(p))) {
          scores[type]++;
        }
      }
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][1] > 0 ? sorted[0][0] : "other";
  } catch {
    return "other";
  }
}

function exploreProject(rootDir) {
  const items = [];
  const categories = [];

  try {
    const entries = readdirSync(rootDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        items.push(entry.name);

        if (entry.name.startsWith("life-")) {
          const category = entry.name.replace("life-", "").replace("-", " ");
          categories.push(category);
        }
      }
    }
  } catch {
  }

  let description = "";
  const readmeFiles = ["README.md", "readme.md", "README.zh.md"];
  for (const rf of readmeFiles) {
    const rfPath = rootDir + "/" + rf;
    if (existsSync(rfPath)) {
      try {
        const content = readFileSync(rfPath, "utf-8");
        description = content.slice(0, 200);
      } catch {}
      break;
    }
  }

  return {
    projectName: rootDir.split("/").pop() || "Unknown",
    projectType: detectProjectType(rootDir),
    projectDescription: description,
    existingItems: items,
    categories: [...new Set(categories)],
    keyFeatures: [],
  };
}

function parseExplorationReport(jsonStr) {
  try {
    const report = JSON.parse(jsonStr);
    return {
      projectName: report.projectName || "Unknown Project",
      projectType: report.projectType || "other",
      projectDescription: report.projectDescription || "",
      existingItems: report.existingItems || report.existingSkills || [],
      categories: report.categories || [],
      keyFeatures: report.keyFeatures || [],
      userIntent: report.userIntent || "",
      requirements: report.requirements || [],
    };
  } catch {
    return null;
  }
}

function analyzeIntent(report, userIntent) {
  const intentSummary = userIntent || report.userIntent || "探索相关资源";
  const keywords = [];
  const keywordsExpanded = [];
  const searchQueries = [];

  const allText = [
    report.projectDescription,
    report.categories.join(" "),
    report.keyFeatures.join(" "),
    intentSummary,
    ...report.requirements,
  ].join(" ").toLowerCase();

  for (const [word, expansions] of Object.entries(KEYWORD_EXPANSION)) {
    if (allText.includes(word)) {
      keywords.push(word);
      keywordsExpanded.push(word);
      keywordsExpanded.push(...expansions);
    }
  }

  const typeConfig = PROJECTFIGS[report.projectType] || PROJECTFIGS["other"];
  const uniqueKeywords = [...new Set(keywordsExpanded)].slice(0, 8);

  if (report.categories.length > 0) {
    for (const cat of report.categories.slice(0, 3)) {
      searchQueries.push(`${cat} ${typeConfig.suffixes[0] || "plugin"}`);
    }
  }

  if (report.keyFeatures.length > 0) {
    for (const feature of report.keyFeatures.slice(0, 2)) {
      searchQueries.push(`${feature} tool`);
    }
  }

  searchQueries.push(...typeConfig.relatedSearches);

  if (intentSummary.includes("搜索") || intentSummary.includes("search")) {
    searchQueries.push("resource discovery plugin");
  }
  if (intentSummary.includes("推荐") || intentSummary.includes("recommend")) {
    searchQueries.push("recommendation engine");
  }

  return {
    report,
    intentSummary,
    keywords: [...new Set(keywords)],
    keywordsExpanded: uniqueKeywords,
    searchQueries: [...new Set(searchQueries)].slice(0, 6),
  };
}

async function searchSkills(query) {
  const cached = loadCache(query);
  if (cached) return cached;

  const proc = spawn('42plugin', ['search', query, '--type', 'skill', '--limit', '5'], { cwd: process.cwd(), stdio: 'pipe' });

  const chunks = [];
  for await (const chunk of proc.stdout) {
    chunks.push(Buffer.from(chunk));
  }
  const output = Buffer.concat(chunks).toString("utf-8");

  const results = parseSearchOutput(output);
  saveCache(query, results);
  return results;
}

function parseSearchOutput(output) {
  const results = [];
  const lines = output.split("\n");

  let currentItem = null;

  for (const line of lines) {
    const skillMatch = line.match(/^⚡\s+(.+?)\s+\[Skill\]/i);
    const versionMatch = line.match(/v(\S+)\s+·\s+(\d+)\s+下载/);
    const installMatch = line.match(/安装:\s*42plugin install\s+(.+)/);
    const headerMatch = line.match(/找到\s*(\d+)\s*个/);

    if (headerMatch) continue;
    if (line.includes("是否继续查看")) break;

    if (skillMatch) {
      if (currentItem?.name) results.push(currentItem);
      currentItem = {
        fullName: skillMatch[1],
        name: skillMatch[1].split("/").pop() || skillMatch[1],
        description: "",
        version: "",
        downloads: "",
      };
    } else if (currentItem && versionMatch) {
      currentItem.version = versionMatch[1];
      currentItem.downloads = versionMatch[2];
    } else if (currentItem && installMatch) {
      currentItem.fullName = installMatch[1];
    } else if (currentItem && line.trim() && !line.includes("安装:")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("在内容") && !trimmed.startsWith("该插件")) {
        currentItem.description += (currentItem.description ? " " : "") + trimmed;
      }
    }
  }

  if (currentItem?.name) results.push(currentItem);
  return results;
}

function calculateMatchScore(result, analysis) {
  let score = 50;
  const gapAnalysis = [];
  const suggestions = [];

  const descLower = result.description.toLowerCase();
  const nameLower = result.name.toLowerCase();

  const matchedKeywords = analysis.keywordsExpanded.filter(
    k => descLower.includes(k) || nameLower.includes(k)
  );

  score += matchedKeywords.length * 8;

  const reportCategories = analysis.report.categories.map(c => c.toLowerCase());
  const matchedCategories = reportCategories.filter(
    c => descLower.includes(c) || nameLower.includes(c)
  );
  score += matchedCategories.length * 10;

  const typeBonus = analysis.report.projectType === "skill-repository" ? 10 : 0;
  if (descLower.includes("skill") || descLower.includes("plugin")) {
    score += typeBonus;
  }

  const downloads = parseInt(result.downloads || "0");
  let qualityScore = "未知";
  let qualityAdvice = "";

  if (downloads > 1000) {
    qualityScore = "优秀";
    qualityAdvice = "下载量大，用户验证充分，推荐使用";
  } else if (downloads > 100) {
    qualityScore = "良好";
    qualityAdvice = "有一定用户基础，可放心使用";
  } else if (downloads > 10) {
    qualityScore = "一般";
    qualityAdvice = "用户较少，建议先测试";
  } else if (downloads > 0) {
    qualityScore = "新发布";
    qualityAdvice = "暂无下载量，建议谨慎使用";
  } else {
    qualityScore = "未知";
    qualityAdvice = "无法获取下载信息，请自行评估";
  }

  if (matchedKeywords.length === 0 && matchedCategories.length === 0) {
    gapAnalysis.push("核心关键词匹配度低");
    suggestions.push("尝试调整搜索词或组合多个相关技能");
  } else if (matchedKeywords.length > 0) {
    suggestions.push(`匹配关键词: ${matchedKeywords.join(", ")}`);
  }

  if (qualityScore === "新发布" || qualityScore === "未知") {
    gapAnalysis.push("技能质量待验证");
    suggestions.push("建议先在测试环境验证");
  } else {
    suggestions.push(`技能质量: ${qualityScore} (${downloads} 下载)`);
  }

  const matchLevel = score >= 75 ? "高" : score >= 50 ? "中" : "低";

  return {
    result,
    score: Math.min(score, 100),
    matchLevel,
    qualityScore,
    qualityAdvice,
    gapAnalysis,
    suggestions,
  };
}

async function searchAllQueries(queries) {
  const allResults = new Map();

  for (const query of queries) {
    try {
      const results = await searchSkills(query);
      for (const r of results) {
        if (!allResults.has(r.fullName)) {
          allResults.set(r.fullName, r);
        }
      }
    } catch (e) {
      console.error(`搜索失败: ${query}`);
    }
  }

  return [...allResults.values()];
}

async function installSkill(fullName) {
  console.log(`\n正在安装: ${fullName}`);
  const proc = spawn(["42plugin", "install", fullName], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const chunks = [];
  for await (const chunk of proc.stdout) {
    chunks.push(Buffer.from(chunk));
  }
  const output = Buffer.concat(chunks).toString("utf-8");
  const exitCode = await proc.exited;

  if (exitCode === 0) {
    console.log(`✓ 安装成功: ${fullName}`);
    return true;
  } else {
    console.error(`✗ 安装失败: ${fullName}`);
    return false;
  }
}

async function installSkillsBatch(fullNames) {
  const success = [];
  const failed = [];

  for (const name of fullNames) {
    if (await installSkill(name)) {
      success.push(name);
    } else {
      failed.push(name);
    }
  }

  return { success, failed };
}

function outputAnalysisReport(analysis) {
  const r = analysis.report;
  const typeLabels = {
    "skill-repository": "技能仓库",
    "note-repository": "笔记仓库",
    "code-repository": "代码仓库",
    "knowledge-base": "知识库",
    "other": "其他项目",
  };

  console.log("\n" + "=".repeat(60));
  console.log("Step 1: Claude Code 探索报告");
  console.log("=".repeat(60));
  console.log(`项目名称: ${r.projectName}`);
  console.log(`项目类型: ${typeLabels[r.projectType] || r.projectType}`);
  console.log(`项目描述: ${r.projectDescription.slice(0, 100)}...`);
  console.log(`现有资源: ${r.existingItems.length} 个`);
  console.log(`资源分类: ${r.categories.join(", ") || "未识别"}`);
  console.log(`关键特性: ${r.keyFeatures.join(", ") || "未识别"}`);

  console.log("\n" + "=".repeat(60));
  console.log("Step 2: 意图拆解");
  console.log("=".repeat(60));
  console.log(`用户意图: ${analysis.intentSummary}`);
  console.log(`需求: ${r.requirements.join(", ") || "无"}`);

  console.log("\n" + "=".repeat(60));
  console.log("Step 3: 语义拆解");
  console.log("=".repeat(60));
  console.log(`核心关键词: ${analysis.keywords.join(", ") || "无"}`);
  console.log(`扩展关键词: ${analysis.keywordsExpanded.join(", ")}`);

  console.log("\n" + "=".repeat(60));
  console.log("Step 4: 搜索策略");
  console.log("=".repeat(60));
  analysis.searchQueries.forEach((q, i) => {
    console.log(`  ${i + 1}. "${q}"`);
  });
}

function outputMatchReport(matches) {
  console.log("\n" + "=".repeat(60));
  console.log("Step 5: 搜索结果");
  console.log("=".repeat(60));

  const sortedMatches = matches.sort((a, b) => b.score - a.score);

  if (sortedMatches.length === 0) {
    console.log("未找到匹配技能");
    return;
  }

  console.log(`\n找到 ${sortedMatches.length} 个相关技能:\n`);

  console.log("| 技能 | 匹配度 | 质量 | 安装命令 |");
  console.log("|------|--------|------|----------|");

  for (const m of sortedMatches.slice(0, 10)) {
    const r = m.result;
    console.log(`| ${r.name} | ${m.matchLevel} (${m.score}%) | ${m.qualityScore} | 42plugin install ${r.fullName} |`);
  }

  console.log("\n详细分析:");
  for (const m of sortedMatches.slice(0, 5)) {
    const r = m.result;
    console.log(`\n[${r.name}]`);
    console.log(`  描述: ${r.description?.slice(0, 80)}...`);
    console.log(`  匹配度: ${m.matchLevel} (${m.score}%)`);
    console.log(`  质量: ${m.qualityScore}`);
    console.log(`  建议: ${m.qualityAdvice}`);
    if (m.gapAnalysis.length > 0) {
      console.log(`  差距: ${m.gapAnalysis.join(", ")}`);
    }
  }
}

function outputGapAnalysis(matches, analysis) {
  console.log("=".repeat(60));
  console.log("Step 6: 差距分析");
  console.log("=".repeat(60));

  const topMatches = matches.sort((a, b) => b.score - a.score);

  console.log("\n当前项目定位:");
  console.log(`  - ${analysis.report.projectName} (${analysis.report.projectType})`);
  console.log(`  - 已有资源: ${analysis.report.existingItems.length} 个`);

  console.log("\n推荐分析表:");
  console.log("| 排名 | 技能 | 匹配度 | 质量 | 使用建议 |");
  console.log("|------|------|--------|------|----------|");

  for (let i = 0; i < Math.min(topMatches.length, 10); i++) {
    const m = topMatches[i];
    const r = m.result;
    let advice = "";
    if (m.matchLevel === "高" && m.qualityScore === "优秀") {
      advice = "强烈推荐 ✓";
    } else if (m.matchLevel === "高" || m.qualityScore === "良好") {
      advice = "推荐使用";
    } else if (m.matchLevel === "中" && m.qualityScore === "一般") {
      advice = "可试用";
    } else {
      advice = "谨慎使用";
    }
    console.log(`| ${i + 1} | ${r.name} | ${m.matchLevel} | ${m.qualityScore} | ${advice} |`);
  }

  console.log("\n差距分析:");
  const highMatches = topMatches.filter(m => m.matchLevel === "高");
  const midMatches = topMatches.filter(m => m.matchLevel === "中");
  const lowMatches = topMatches.filter(m => m.matchLevel === "低");

  console.log(`  - 高匹配: ${highMatches.length} 个`);
  console.log(`  - 中匹配: ${midMatches.length} 个`);
  console.log(`  - 低匹配: ${lowMatches.length} 个`);

  if (highMatches.length > 0) {
    console.log("\n最佳匹配:");
    highMatches.slice(0, 3).forEach(m => {
      console.log(`  - ${m.result.name}: ${m.qualityAdvice}`);
    });
  }

  if (lowMatches.length > 0 && lowMatches.length > highMatches.length + midMatches.length) {
    console.log("\n建议优化搜索策略:");
    console.log("  - 尝试更精确的关键词");
    console.log("  - 调整项目分类");
    console.log("  - 组合多个相关技能");
  }

  console.log("\n推荐探索方向:");
  console.log("  1. 高匹配技能可直接使用");
  console.log("  2. 中匹配技能可考虑改写适配");
  console.log("  3. 低匹配技能建议搜索替代方案");
  console.log("  4. 跨项目资源整合");
}

function generateAdaptationPlan(matches, analysis) {
  const topMatch = matches.sort((a, b) => b.score - a.score)[0];

  console.log("\n" + "=".repeat(60));
  console.log("Step 7: 改写计划");
  console.log("=".repeat(60));

  if (!topMatch) {
    console.log("无匹配技能，跳过改写计划");
    return;
  }

  console.log(`\n基于 ${topMatch.result.name} 的改写建议:\n`);

  console.log("## 改写计划\n");
  console.log("### 目标");
  console.log(`适配 ${analysis.report.projectName} (${analysis.report.projectType}) 项目需求\n`);

  console.log("### 改动点");
  console.log("1. 适配项目类型特性");
  console.log("2. 集成 42plugin CLI 搜索能力");
  console.log("3. 扩展匹配评分算法");
  console.log("4. 添加适应性改写建议生成\n");

  console.log("### 实施步骤");
  console.log("1. 分析项目类型和工作流");
  console.log("2. 实现与项目资源互补");
  console.log("3. 优化 match scoring 算法");
  console.log("4. 添加 adaptation strategies 参考");
  console.log("5. 测试完整工作流\n");

  console.log("### 参考资源");
  console.log(`- 项目类型: ${analysis.report.projectType}`);
  console.log(`- 资源分类: ${analysis.report.categories.join(", ")}`);
  console.log(`- 现有资源: ${analysis.report.existingItems.slice(0, 5).join(", ")}...`);
  console.log("- references/adaptation-strategies.md");
}

async function main() {
  const allArgs = process.argv.slice(2);
  const options = [];
  let reportJson = "";
  let autoExplore = false;
  let jsonOutput = false;
  for (const arg of allArgs) {
    if (arg === "--auto" || arg === "-a") {
      autoExplore = true;
    } else if (arg === "--json") {
      jsonOutput = true;
    } else if (arg.startsWith("--")) {
      options.push(arg);
    } else {
      reportJson += (reportJson ? " " : "") + arg;
    }
  }

  const shouldSearch = options.includes("--search");
  const shouldAdapt = options.includes("--adapt");
  const shouldInstall = options.includes("--install");
  const shouldAnalyze = options.includes("--analyze") || !shouldSearch;

  console.log("=".repeat(60));
  console.log("Skill Searcher - 智能资源发现工作流");
  console.log("=".repeat(60));

  let report = null;

  if (autoExplore) {
    console.log("\n自动探索项目...");
    const exploration = exploreProject(process.cwd());
    report = {
      projectName: exploration.projectName || "Unknown",
      projectType: exploration.projectType || "other",
      projectDescription: exploration.projectDescription || "",
      existingItems: exploration.existingItems || [],
      categories: exploration.categories || [],
      keyFeatures: exploration.keyFeatures || [],
      userIntent: "",
      requirements: [],
    };
    console.log(`检测到项目类型: ${report.projectType}`);
  } else if (reportJson.trim()) {
    report = parseExplorationReport(reportJson);
  }

  if (!report) {
    console.log("Usage: node workflow.js [--auto] '<exploration-report-json>' [--search] [--install] [--adapt]");
    console.log("  --auto     自动探索当前项目");
    console.log("  --search   执行搜索");
    console.log("  --install  安装选中技能");
    console.log("  --adapt    生成改写计划");
    console.log("\n示例:");
    console.log("  node workflow.js --auto --search");
    console.log('  node workflow.js \'{"projectName":"MyProject","projectType":"skill-repository"}\' --search');
    process.exit(1);
  }

  const userIntent = allArgs.filter(a => !a.startsWith("--") && !a.startsWith("{")).join(" ");
  const analysis = analyzeIntent(report, userIntent);
  outputAnalysisReport(analysis);

  if (shouldSearch || shouldAdapt || shouldInstall) {
    console.log("\n" + "=".repeat(60));
    console.log("Step 5: 多策略搜索");
    console.log("=".repeat(60));
    console.log("\n执行搜索...\n");

    const results = await searchAllQueries(analysis.searchQueries);
    const matches = results.map(r => calculateMatchScore(r, analysis));

    outputMatchReport(matches);
    outputGapAnalysis(matches, analysis);

    if (shouldInstall) {
      console.log("\n" + "=".repeat(60));
      console.log("Step 7: 批量安装");
      console.log("=".repeat(60));

      const topMatches = matches.sort((a, b) => b.score - a.score).slice(0, 3);
      const fullNames = topMatches.map(m => m.result.fullName);

      if (fullNames.length > 0) {
        console.log(`\n安装前 3 个推荐技能:`);
        const result = await installSkillsBatch(fullNames);
        console.log(`\n成功: ${result.success.length}, 失败: ${result.failed.length}`);
      } else {
        console.log("无技能可安装");
      }
    }

    if (shouldAdapt) {
      generateAdaptationPlan(matches, analysis);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("完成!");
  console.log("=".repeat(60));

  if (jsonOutput) {
    console.log(JSON.stringify({
      project: report,
      analysis,
      matches,
      summary: {
        totalMatches: matches.length,
        highMatches: matches.filter(m => m.matchLevel === '高').length
      }
    }, null, 2));
  }
}

main();
