#!/usr/bin/env bun
/**
 * Life File Organizer - Auto-organize files with quality assessment
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, lstatSync, unlinkSync, renameSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const COLORS = { blue: "\x1b[34m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", cyan: "\x1b[36m", nc: "\x1b[0m" };

function log(msg) { console.log(`${COLORS.blue}[organizer]${COLORS.nc} ${msg}`); }
function success(msg) { console.log(`${COLORS.green}✓${COLORS.nc} ${msg}`); }
function warn(msg) { console.log(`${COLORS.yellow}⚠${COLORS.nc} ${msg}`); }
function error(msg) { console.log(`${COLORS.red}✗${COLORS.nc} ${msg}`); }

const FILE_TYPES = {
  Documents: [".pdf", ".doc", ".docx", ".txt", ".md", ".xlsx", ".pptx", ".odt", ".rtf"],
  Images: [".jpg", ".png", ".gif", ".svg", ".webp", ".psd", ".ai", ".heic"],
  Videos: [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv"],
  Audio: [".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg"],
  Archives: [".zip", ".7z", ".tar", ".gz", ".rar", ".dmg"],
  Code: [".js", ".ts", ".py", ".html", ".css", ".json", ".yaml", ".yml", ".xml", ".sh"]
};

function getCategory(filename) {
  const ext = extname(filename).toLowerCase();
  for (const [cat, exts] of Object.entries(FILE_TYPES)) {
    if (exts.includes(ext)) return cat;
  }
  return "Other";
}

function calculateFileHash(filepath) {
  try {
    const content = readFileSync(filepath);
    return createHash("md5").update(content).digest("hex");
  } catch { return null; }
}

function findDuplicates(dir) {
  const hashMap = new Map();
  const duplicates = [];

  function scan(path) {
    if (!existsSync(path)) return;
    const items = readdirSync(path, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(path, item.name);
      if (item.isDirectory() && !item.name.startsWith(".") && item.name !== "node_modules") {
        scan(fullPath);
      } else if (item.isFile()) {
        const hash = calculateFileHash(fullPath);
        if (hash) {
          if (hashMap.has(hash)) {
            duplicates.push([hashMap.get(hash), fullPath]);
          } else {
            hashMap.set(hash, fullPath);
          }
        }
      }
    }
  }
  scan(dir);
  return duplicates;
}

function assessDirectory(dir) {
  const files = [];
  const dirs = [];
  const namingIssues = [];
  const dangerousChars = ["【", "】", "：", "、", "——", "｜", "@", "（", "）"];
  let maxDepth = 0;

  function scan(path, depth = 0) {
    maxDepth = Math.max(maxDepth, depth);
    const items = readdirSync(path, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(path, item.name);
      if (item.isDirectory()) {
        if (!item.name.startsWith(".")) {
          dirs.push({ name: item.name, path: fullPath });
          scan(fullPath, depth + 1);
        }
      } else {
        files.push({ name: item.name, path: fullPath, ext: extname(item.name) });
        for (const char of dangerousChars) {
          if (item.name.includes(char)) {
            namingIssues.push({ file: item.name, issue: `含非法字符: ${char}` });
          }
        }
        if (/[\s]/.test(item.name)) {
          namingIssues.push({ file: item.name, issue: "含空格" });
        }
      }
    }
  }
  scan(dir);

  const sourceExists = dirs.some(d => d.name === "source" || d.name === "_raw");
  const scriptsExists = dirs.some(d => d.name === "scripts" || d.name === ".scripts");
  const gitExists = existsSync(join(dir, ".git"));

  return {
    totalFiles: files.length,
    totalDirs: dirs.length,
    maxDepth,
    rootCount: readdirSync(dir, { withFileTypes: true }).filter(d => !d.name.startsWith(".")).length,
    sourceExists,
    scriptsExists,
    gitExists,
    namingIssues,
    categories: Object.keys(FILE_TYPES).map(cat => ({
      name: cat,
      count: files.filter(f => getCategory(f.name) === cat).length
    })),
    otherCount: files.filter(f => getCategory(f.name) === "Other").length
  };
}

function organizeByType(dir, dryRun = true) {
  const items = readdirSync(dir, { withFileTypes: true }).filter(d => !d.name.startsWith("."));
  const moves = [];

  for (const item of items) {
    if (item.isFile()) {
      const cat = getCategory(item.name);
      const targetDir = join(dir, cat);
      const targetPath = join(targetDir, item.name);
      if (!existsSync(targetDir)) {
        if (!dryRun) mkdirSync(targetDir, { recursive: true });
        moves.push(`Create ${cat}/`);
      }
      if (targetPath !== item.fullPath) {
        moves.push(`${item.name} -> ${cat}/`);
        if (!dryRun) renameSync(item.fullPath, targetPath);
      }
    }
  }
  return moves;
}

function generateReport(assessment, dir, moves = []) {
  let report = `# 文件整理报告

**评估时间:** ${new Date().toLocaleString("zh-CN")}
**目标目录:** ${dir}

## 目录概况

| 指标 | 数值 |
|------|------|
| 文件总数 | ${assessment.totalFiles} |
| 目录数 | ${assessment.totalDirs} |
| 最大深度 | ${assessment.maxDepth} |
| 根目录项目 | ${assessment.rootCount} |

## 文件分类

| 类型 | 数量 |
|------|------|
${assessment.categories.map(c => `| ${c.name} | ${c.count} |`).join("\n")}
| 其他 | ${assessment.otherCount} |
`;

  if (assessment.namingIssues.length > 0) {
    report += `\n## 命名问题 (${assessment.namingIssues.length}项)

${assessment.namingIssues.map(i => `- \`${i.file}\`: ${i.issue}`).join("\n")}
`;
  }

  if (assessment.sourceExists || assessment.scriptsExists || assessment.gitExists) {
    report += `\n## 自动化检测

${assessment.sourceExists ? "- [x] 源数据目录 (source/_raw)" : "- [ ] 源数据目录"}
${assessment.scriptsExists ? "- [x] 脚本目录 (scripts)" : "- [ ] 脚本目录"}
${assessment.gitExists ? "- [x] Git 仓库" : "- [ ] Git 仓库"}
`;
  }

  if (moves.length > 0) {
    report += `\n## 整理建议

${moves.map(m => `- ${m}`).join("\n")}
`;
  }

  return report;
}

async function main() {
  const args = process.argv.slice(2);
  const targetDir = args.find(a => !a.startsWith("-")) || process.cwd();
  const dryRun = args.includes("--dry-run");
  const mode = args.find(a => a.startsWith("--mode="))?.split("=")[1] || "full";

  if (!existsSync(targetDir)) {
    error(`目录不存在: ${targetDir}`);
    return;
  }

  console.log(`${COLORS.cyan}╔══════════════════════════════════════╗${COLORS.nc}`);
  console.log(`${COLORS.cyan}║      Life File Organizer - 文件整理    ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}╚══════════════════════════════════════╝${COLORS.nc}`);
  console.log("");

  if (mode === "duplicates") {
    log("查找重复文件...");
    const dups = findDuplicates(targetDir);
    if (dups.length === 0) {
      success("未发现重复文件");
    } else {
      warn(`发现 ${dups.length} 组重复文件:`);
      dups.forEach(([a, b]) => console.log(`  - ${basename(a)} <-> ${basename(b)}`));
    }
    return;
  }

  if (mode === "assess") {
    log("评估目录质量...");
    const assessment = assessDirectory(targetDir);
    const report = generateReport(assessment, targetDir);
    console.log(report);
    return;
  }

  log(`扫描目录: ${targetDir}`);
  const assessment = assessDirectory(targetDir);
  console.log(`  文件: ${assessment.totalFiles}, 目录: ${assessment.totalDirs}, 最大深度: ${assessment.maxDepth}`);

  if (assessment.namingIssues.length > 0) {
    warn(`发现 ${assessment.namingIssues.length} 个命名问题`);
  }

  if (dryRun) {
    log("预览整理效果 (--dry-run)");
  }

  const moves = organizeByType(targetDir, dryRun);

  if (moves.length > 0) {
    console.log(`\n${COLORS.blue}整理计划:${COLORS.nc}`);
    moves.forEach(m => console.log(`  ${m}`));
  }

  const report = generateReport(assessment, targetDir, moves);
  const reportPath = join(targetDir, "file-organization-report.md");
  writeFileSync(reportPath, report);
  success(`报告已保存: ${reportPath}`);

  if (dryRun) {
    console.log(`\n${COLORS.yellow}使用 --dry-run 取消预览，实际执行整理${COLORS.nc}`);
  } else {
    success("整理完成");
  }
}

main().catch(console.error);
