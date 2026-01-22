#!/usr/bin/env bun
/**
 * Interrupt Prompts Generator - Break Autopilot Mode
 * Part 2 of "How to fix your entire life in 1 day"
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const COLORS = { blue: "\x1b[34m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m", nc: "\x1b[0m" };

function log(msg) { console.log(`${COLORS.blue}[interrupt-prompts]${COLORS.nc} ${msg}`); }
function success(msg) { console.log(`${COLORS.green}✓${COLORS.nc} ${msg}`); }
function section(msg) { console.log(`\n${COLORS.cyan}━━━ ${msg} ━━━${COLORS.nc}\n`); }

const DEFAULT_PROMPTS = [
  { time: "11:00", question: "我现在通过做什么来逃避什么？", type: "avoidance", purpose: "识别逃避模式" },
  { time: "13:30", question: "如果过去2小时被拍下来，人们会认为我想要什么？", type: "intention", purpose: "行为意图分析" },
  { time: "15:15", question: "我是在走向讨厌的生活还是想要的生活？", type: "direction", purpose: "方向检查" },
  { time: "17:00", question: "我假装不重要但最重要的那件事是什么？", type: "priority", purpose: "优先级识别" },
  { time: "19:30", question: "今天我做了什么身份保护而非真正想要的？", type: "motivation", purpose: "动机检验" },
  { time: "21:00", question: "今天什么时候最有活力？什么时候最死气沉沉？", type: "energy", purpose: "能量追踪" }
];

const BONUS_PROMPTS = [
  { trigger: "通勤/散步时", question: "如果我不再需要让别人看到我是[身份]，什么会改变？" },
  { trigger: "独处时刻", question: "我在哪里用安全感换了活力？" },
  { trigger: "睡前", question: "明天就能成为我想成为的人，最小版本是什么？" }
];

const BONUS_PROMTS_POOL = [
  "我今天对谁撒谎了？对自己？",
  "什么机会我看到了但假装没看到？",
  "我今天回避了什么 difficult conversation？",
  "如果我死了，人们会怎么评价我今天？",
  "我今天的行动和声称的目标一致吗？",
  "什么让我感到不安全但我知道应该做？"
];

function generateICS(date, prompts) {
  let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//LifeGoodSkill//InterruptPrompts//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n`;
  
  for (const p of prompts) {
    const [h, m] = p.time.split(":");
    const startDate = new Date(date);
    startDate.setHours(parseInt(h), parseInt(m), 0);
    const endDate = new Date(startDate.getTime() + 10 * 60000);
    
    ics += `BEGIN:VEVENT\n`;
    ics += `DTSTART:${formatICSDate(startDate)}\n`;
    ics += `DTEND:${formatICSDate(endDate)}\n`;
    ics += `SUMMARY:${p.type.toUpperCase()} 自检提醒\n`;
    ics += `DESCRIPTION:${p.question}\\n\\n目的: ${p.purpose}\n`;
    ics += `RRULE:FREQ=DAILY\n`;
    ics += `END:VEVENT\n`;
  }
  
  ics += `END:VCALENDAR`;
  return ics;
}

function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function generateJSON(date, prompts, bonus) {
  return JSON.stringify({
    date: date,
    prompts: prompts,
    bonus: bonus,
    exportedAt: new Date().toISOString()
  }, null, 2);
}

async function main() {
  const args = process.argv.slice(2);
  const week = args.includes("--week");
  const calendar = args.includes("--calendar");
  const json = args.includes("--json");
  const customTimes = args.find(a => a.startsWith("--times="))?.split("=")[1];
  
  console.log(`${COLORS.cyan}╔════════════════════════════════════════╗${COLORS.nc}`);
  console.log(`${COLORS.cyan}║    Interrupt Prompts - 日间打断提示      ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}║    Part 2: 打破自动巡航模式              ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════╝${COLORS.nc}`);
  
  let prompts = DEFAULT_PROMPTS;
  
  if (customTimes) {
    const times = customTimes.split(",");
    prompts = times.map((t, i) => ({ ...DEFAULT_PROMPTS[i], time: t.trim() }));
  }
  
  const today = new Date().toISOString().split("T")[0];
  
  section("今日打断提示");
  
  for (const p of prompts) {
    console.log(`${COLORS.green}[${p.time}]${COLORS.nc} ${p.question}`);
    console.log(`${COLORS.gray}  目的: ${p.purpose}${COLORS.nc}\n`);
  }
  
  section("备用深度问题");
  BONUS_PROMTS_POOL.slice(0, 3).forEach((q, i) => {
    console.log(`${i + 1}. ${q}\n`);
  });
  
  section("使用方法");
  console.log("1. 在手机设置这些时间的日历提醒");
  console.log("2. 收到提醒时立即停下思考");
  console.log("3. 简短记录回答（30秒内）");
  console.log("4. 晚间回顾所有回答");
  
  if (calendar) {
    const icsFile = join(process.cwd(), `interrupt-prompts-${today}.ics`);
    writeFileSync(icsFile, generateICS(today, prompts));
    success(`日历文件已保存: ${icsFile}`);
    console.log("\n导入方法:");
    console.log("- iOS: 邮件发送给自己，打开");
    console.log("- Android: 设置 → 日历 → 添加账户");
    console.log("- Mac: 双击打开");
  }
  
  if (json) {
    const jsonFile = join(process.cwd(), `interrupt-prompts-${today}.json`);
    writeFileSync(jsonFile, generateJSON(today, prompts, BONUS_PROMPTS_POOL));
    success(`JSON文件已保存: ${jsonFile}`);
  }
  
  if (week) {
    console.log(`\n${COLORS.yellow}一周提示已生成（周一到周日重复）${COLORS.nc}`);
  }
  
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.nc}`);
  success("日间打断提示生成完成！");
}

main().catch(console.error);
