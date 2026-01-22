#!/usr/bin/env bun
/**
 * Daily Starter - Morning Ritual Assistant
 * Based on zw (Zed Work) workflow
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, lstatSync, readdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const COLORS = {
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  nc: "\x1b[0m"
};

function log(msg) {
  console.log(`${COLORS.blue}[daily-starter]${COLORS.nc} ${msg}`);
}

function success(msg) {
  console.log(`${COLORS.green}✓${COLORS.nc} ${msg}`);
}

function warn(msg) {
  console.log(`${COLORS.yellow}⚠${COLORS.nc} ${msg}`);
}

function loadConfig() {
  const paths = [
    join(process.cwd(), ".life-good-skill", "life-daily-starter", "config.js"),
    join(process.env.HOME || "", ".life-good-skill", "life-daily-starter", "config.js")
  ];

  for (const p of paths) {
    if (existsSync(p)) {
      try {
        const config = JSON.parse(readFileSync(p, "utf-8"));
        return {
          desktopDir: p => p.replace("~", process.env.HOME || ""),
          archiveDir: "~/.archive",
          obsidianDailyDir: "~/.obsidian/daily",
          remindersList: "Reminders",
          editorCmd: "zed",
          aiBriefingFile: "00_AI_Briefing.md",
          dailyNoteLink: "00_DailyNote.md",
          timestampFormat: "%Y%m%d%H%M%S",
          ...config
        };
      } catch (e) {
        console.error("Config load error:", e.message);
      }
    }
  }

  return {
    desktopDir: "~/Desktop",
    archiveDir: "~/ZB/B.MyCreate/dev/Achieve",
    obsidianDailyDir: "~/ZB/B.MyCreate/00-daily/2026",
    remindersList: "Vincent's list",
    editorCmd: "zed",
    aiBriefingFile: "00_AI_Briefing.md",
    dailyNoteLink: "00_DailyNote.md",
    timestampFormat: "%Y%m%d%H%M%S"
  };
}

function expandPath(path) {
  return path.replace(/^~/, process.env.HOME || "");
}

function getToday() {
  return new Date();
}

function formatDate(fmt) {
  const d = getToday();
  const map = {
    "%Y": d.getFullYear(),
    "%m": String(d.getMonth() + 1).padStart(2, "0"),
    "%d": String(d.getDate()).padStart(2, "0"),
    "%H": String(d.getHours()).padStart(2, "0"),
    "%M": String(d.getMinutes()).padStart(2, "0"),
    "%S": String(d.getSeconds()).padStart(2, "0")
  };
  return fmt.replace(/%[YmdHMS]/g, m => map[m]);
}

function checkZombieWorkspaces(config) {
  const desktopDir = expandPath(config.desktopDir);
  const todayPrefix = formatDate("%Y%m%d");
  const zombies = [];

  if (!existsSync(desktopDir)) return [];

  const dirs = readdirSync(desktopDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const dir of dirs) {
    if (/^[0-9]{14}$/.test(dir) && !dir.startsWith(todayPrefix)) {
      zombies.push(dir);
    }
  }

  if (zombies.length > 0) {
    warn(`检测到 ${zombies.length} 个未归档的旧工作区：`);
    zombies.forEach(z => console.log(`  - ${z}`));
    console.log("");
  }

  return zombies;
}

function findTodayWorkspace(config) {
  const desktopDir = expandPath(config.desktopDir);
  const todayPrefix = formatDate("%Y%m%d");

  if (!existsSync(desktopDir)) return null;

  const dirs = readdirSync(desktopDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(n => n.startsWith(todayPrefix))
    .sort()
    .reverse();

  if (dirs.length > 0) {
    return join(desktopDir, dirs[0]);
  }
  return null;
}

function getLastArchive(config) {
  const archiveDir = expandPath(config.archiveDir);
  if (!existsSync(archiveDir)) return null;

  const dirs = readdirSync(archiveDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()
    .reverse();

  return dirs.length > 0 ? join(archiveDir, dirs[0]) : null;
}

function getAppleReminders(listName) {
  const script = `
    tell application "Reminders"
      set output to ""
      try
        set todoList to list "${listName}"
        set activeReminders to (reminders of todoList whose completed is false)
        repeat with r in activeReminders
          set output to output & "- [ ] " & name of r & linefeed
        end repeat
      on error
        set output to ""
      end try
      return output
    end tell
  `;

  try {
    const proc = Bun.spawn(["osascript", "-e", script], { stdout: "pipe" });
    const output = new TextDecoder().decode(proc.stdout);
    return output.trim();
  } catch (e) {
    return "";
  }
}

function generateAIBriefing(config, workspace) {
  const briefingFile = join(workspace, config.aiBriefingFile);

  if (existsSync(briefingFile)) {
    log("AI 简报已存在，跳过生成");
    return;
  }

  const lastArchive = getLastArchive(config);
  if (!lastArchive) {
    log("未找到历史归档，跳过 AI 简报");
    return;
  }

  log("正在生成 AI 简报...");

  let context = "";
  const reminders = getAppleReminders(config.remindersList);

  if (reminders) {
    context += `## 今日待办 (Apple Reminders)\n${reminders}\n\n`;
  }

  const lastBriefing = join(lastArchive, config.aiBriefingFile);
  if (existsSync(lastBriefing)) {
    try {
      context += `## 上次的工作简报\n${readFileSync(lastBriefing, "utf-8")}\n\n`;
    } catch (e) {}
  }

  context += `## 上次工作区的文件列表\n${readdirSync(lastArchive).join(", ")}\n`;

  if (existsSync("/usr/local/bin/claude")) {
    const prompt = `基于以下上下文，生成简洁的每日工作简报。用中文回复，使用 Markdown 格式。\n\n${context}`;

    const proc = Bun.spawn(["claude", "-p", prompt], { stdout: "pipe", stderr: "pipe" });
    const output = new TextDecoder().decode(proc.stdout);

    writeFileSync(briefingFile, output || "# 每日简报\n\nAI 简报生成失败");
    success("AI 简报已生成");
  } else {
    writeFileSync(briefingFile, "# 每日简报\n\nClaude CLI 未安装");
    log("Claude CLI 未安装，跳过 AI 简报");
  }
}

function linkObsidianDaily(config, workspace) {
  const workspaceName = basename(workspace);
  const linkPath = join(workspace, config.dailyNoteLink);
  const todayShort = formatDate("%Y%m%d");
  const dailyNote = join(expandPath(config.obsidianDailyDir), `${todayShort}.md`);

  if (!existsSync(expandPath(config.obsidianDailyDir))) {
    mkdirSync(expandPath(config.obsidianDailyDir), { recursive: true });
  }

  if (!existsSync(dailyNote)) {
    log("创建今日 Obsidian 日记...");
    writeFileSync(dailyNote, `# ${formatDate("%Y-%m-%d")} 日记\n\n---\n\n`);
  }

  if (!existsSync(linkPath)) {
    try {
      const { symlinkSync } = require("fs");
      symlinkSync(dailyNote, linkPath);
      success("已连接 Obsidian 日记");
    } catch (e) {}
  }

  const content = readFileSync(dailyNote, "utf-8");
  const backlinkMarker = "<!-- workspace-link -->";

  if (!content.includes(backlinkMarker)) {
    const backlink = `\n${backlinkMarker}\n## 代码工作区\n\n[📂 ${workspaceName}](file://${workspace})\n`;
    writeFileSync(dailyNote, content + backlink);
    success("已添加反向链接到日记");
  }
}

async function main() {
  const args = process.argv.slice(2);
  const config = loadConfig();

  console.log("");
  console.log(`${COLORS.cyan}╔════════════════════════════════════════╗${COLORS.nc}`);
  console.log(`${COLORS.cyan}║         Daily Starter - 每日启动         ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════╝${COLORS.nc}`);
  console.log("");

  if (args.includes("--status")) {
    const workspace = findTodayWorkspace(config);
    if (workspace) {
      success(`今日工作区已存在: ${basename(workspace)}`);
    } else {
      log("今日工作区尚未创建");
    }
    return;
  }

  if (args.includes("--link-only")) {
    const workspace = findTodayWorkspace(config) || join(expandPath(config.desktopDir), formatDate(config.timestampFormat));
    if (!existsSync(workspace)) {
      mkdirSync(workspace, { recursive: true });
    }
    linkObsidianDaily(config, workspace);
    return;
  }

  checkZombieWorkspaces(config);

  let workspace = findTodayWorkspace(config);
  let isNew = false;

  if (!workspace || args.includes("--new")) {
    workspace = join(expandPath(config.desktopDir), formatDate(config.timestampFormat));
    mkdirSync(workspace, { recursive: true });
    isNew = true;
    success(`创建工作区: ${basename(workspace)}`);
  } else {
    success(`找到今日工作区: ${basename(workspace)}`);
  }

  if (isNew) {
    generateAIBriefing(config, workspace);
  }

  linkObsidianDaily(config, workspace);

  log(`启动 ${config.editorCmd}...`);
  Bun.spawn([config.editorCmd, workspace], { detached: true });

  console.log("");
  success("工作区已就绪！开始新的一天 🚀");
  console.log("");

  console.log(`${COLORS.blue}工作区内容:${COLORS.nc}`);
  readdirSync(workspace).forEach(f => console.log(`  - ${f}`));
  console.log("");
}

main().catch(console.error);
