#!/usr/bin/env bun
/**
 * Life Compass - 6-Element Life Navigation System
 * Final synthesis of "How to fix your entire life in 1 day"
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, renameSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const COLORS = { blue: "\x1b[34m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m", red: "\x1b[31m", nc: "\x1b[0m" };

function log(msg) { console.log(`${COLORS.blue}[life-compass]${COLORS.nc} ${msg}`); }
function success(msg) { console.log(`${COLORS.green}✓${COLORS.nc} ${msg}`); }
function section(msg) { console.log(`\n${COLORS.cyan}━━━ ${msg} ━━━${COLORS.nc}\n`); }

const ELEMENTS = [
  {
    id: "anti-vision",
    title: "Anti-Vision (反愿景)",
    subtitle: "Stake - 代价",
    question: "你拒绝成为什么？描述你不想要的生活",
    hint: "参考晨间愿景协议的反愿景部分",
    question2: "如果保持现状5年、10年、临终时，分别会失去什么？"
  },
  {
    id: "vision",
    title: "Vision (愿景)",
    subtitle: "Win - 如何赢",
    question: "你想要什么？描述你理想的生活",
    hint: "不要考虑可行性，只考虑真正想要的",
    question2: "3年后理想生活的 average Tuesday 是什么样的？"
  },
  {
    id: "year-goal",
    title: "1-Year Goal (一年目标)",
    subtitle: "Mission - 使命",
    question: "一年后什么必须为真，才算打破了旧模式？",
    hint: "一个具体的、可衡量的结果",
    question2: "如果只能用一件事概括这一年，是什么？"
  },
  {
    id: "month-project",
    title: "1-Month Project (一月项目)",
    subtitle: "Boss Fight - Boss战",
    question: "本月要攻克什么来推进年度目标？",
    hint: "技能学习、项目构建、关系建立",
    question2: "本月最重要的里程碑是什么？"
  },
  {
    id: "daily-levers",
    title: "Daily Levers (每日杠杆)",
    subtitle: "Quests - 任务",
    question: "明天哪2-3件事是'那个人'会做的？",
    hint: "与月度项目直接相关的高影响力任务",
    question2: "每天固定时间块需要保护的是什么？"
  },
  {
    id: "constraints",
    title: "Constraints (约束条件)",
    subtitle: "Rules - 规则",
    question: "为了实现愿景，你绝不牺牲什么？",
    hint: "健康、家庭、诚信、底线",
    question2: "什么是你不会为了成功而妥协的？"
  }
];

function generateCompass(date, elements, identity) {
  let doc = `# Life Compass (人生罗盘)

**创建日期:** ${date}
**最后更新:** ${new Date().toLocaleString("zh-CN")}

---

## 快速导航

| 元素 | 关键问题 |
|------|----------|
| [Anti-Vision](#antivision-反愿景) | 我拒绝成为什么？ |
| [Vision](#vision-愿景) | 我想要什么？ |
| [1-Year Goal](#1-year-goal-一年目标) | 一年后什么必须为真？ |
| [1-Month Project](#1-month-project-一月项目) | 本月攻克什么？ |
| [Daily Levers](#daily-levers-每日杠杆) | 明天做什么？ |
| [Constraints](#constraints-约束条件) | 我绝不牺牲什么？ |

---

## 视觉结构

\`\`\`
                    ┌─────────────────┐
                    │   Anti-Vision   │
                    │   (反愿景)      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    Vision     │    │  1-Year Goal  │    │  Constraints  │
└───────────────┘    └───────────────┘    └───────────────┘
        │                    │
        ▼                    ▼
┌───────────────┐    ┌───────────────┐
│  1-Month      │    │   Daily       │
│   Project     │    │   Levers      │
└───────────────┘    └───────────────┘
\`\`\`

---

`;

  for (const e of elements) {
    doc += `## ${e.title}\n\n`;
    doc += `**${e.subtitle}**\n\n`;
    doc += `### ${e.id === "daily-levers" ? "核心行动（明天）" : "核心定义"}\n\n`;
    doc += `${e.answer || "待填写"}\n\n`;
    
    if (e.id === "daily-levers" && e.schedule) {
      doc += `### 时间安排\n\n${e.schedule}\n\n`;
    }
    
    if (e.id === "year-goal" && e.metrics) {
      doc += `### 成功指标\n\n${e.metrics}\n\n`;
    }
    
    doc += `---\n\n`;
  }
  
  if (identity) {
    doc += `## 身份声明\n\n`;
    doc += `**"I am the type of person who..."**\n\n`;
    doc += `${identity}\n\n`;
    doc += `---\n\n`;
  }
  
  doc += `## 校准记录\n\n`;
  doc += `| 日期 | 状态 | 备注 |\n`;
  doc += `|------|------|------|\n`;
  doc += `| ${date} | 创建 | 初始版本 |\n\n`;
  
  doc += `---

*使用说明:*
- *每周回顾此文档*
- *每月进行一次校准*
- *每季度考虑是否需要重大调整*
- *当决策困难时，回到罗盘*
`;
  
  return doc;
}

async function main() {
  const args = process.argv.slice(2);
  const create = args.includes("--create");
  const update = args.includes("--update");
  const calibrate = args.includes("--calibrate");
  const print = args.includes("--print");
  
  console.log(`${COLORS.cyan}╔════════════════════════════════════════╗${COLORS.nc}`);
  console.log(`${COLORS.cyan}║         Life Compass - 人生罗盘          ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}║    6要素人生导航系统 - 终极综合           ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════╝${COLORS.nc}`);
  
  const outputDir = join(process.cwd(), "life-compass");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const date = new Date().toISOString().split("T")[0];
  const compassFile = join(outputDir, "life-compass.md");
  
  let existingCompass = null;
  if (existsSync(compassFile) && (update || calibrate)) {
    log("找到现有罗盘，将进行更新/校准");
    try {
      existingCompass = readFileSync(compassFile, "utf-8");
    } catch (e) {}
  }
  
  if (calibrate) {
    section("季度校准");
    console.log("回顾现有罗盘并评估进展...\n");
    
    for (const e of ELEMENTS.slice(0, 3)) {
      console.log(`${COLORS.yellow}${e.title}:${COLORS.nc}`);
      console.log(`当前状态如何？ (1-10分)`);
      const score = await prompt("评分: ");
      console.log("");
    }
    
    const calibrationFile = join(outputDir, `${date}_calibration.md`);
    writeFileSync(calibrationFile, `# 校准记录 - ${date}

## 自我评估

| 元素 | 上次评分 | 本次评分 | 变化 |
|------|----------|----------|------|
${ELEMENTS.slice(0, 3).map(e => `| ${e.title} | - | ${"| - |"}`).join("\n")}

## 调整记录

-

## 下一步

-
`);
    success(`校准记录已保存: ${calibrationFile}`);
  }
  
  if (create || !existingCompass) {
    section("创建人生罗盘");
    log("将引导你完成6个核心要素的定义");
    
    const elements = [];
    let identity = "";
    
    for (const e of ELEMENTS) {
      section(e.title);
      console.log(`${COLORS.yellow}${e.question}${COLORS.nc}`);
      if (e.hint) console.log(`${COLORS.gray}提示: ${e.hint}${COLORS.nc}`);
      
      const answer = await prompt("回答: ");
      elements.push({ ...e, answer });
      console.log("");
      
      if (e.id === "daily-levers") {
        console.log(`${COLORS.green}${e.question2}${COLORS.nc}`);
        const schedule = await prompt("时间安排: ");
        elements[elements.length - 1].schedule = schedule;
        console.log("");
      }
      
      if (e.id === "year-goal") {
        console.log(`${COLORS.green}${e.question2}${COLORS.nc}`);
        const metrics = await prompt("成功指标: ");
        elements[elements.length - 1].metrics = metrics;
        console.log("");
      }
    }
    
    section("身份声明");
    console.log(`${COLORS.cyan}最后，写出你的身份声明:${COLORS.nc}`);
    console.log(`"I am the type of person who..."`);
    identity = await prompt("完整声明: ");
    
    writeFileSync(compassFile, generateCompass(date, elements, identity));
    success(`人生罗盘已创建: ${compassFile}`);
  }
  
  if (print) {
    console.log(`\n${COLORS.cyan}━━━ 打印版本预览 ━━━${COLORS.nc}`);
    console.log("（双栏布局，适合打印或PDF导出）\n");
    console.log(`${COLORS.gray}提示: 使用浏览器打印功能，选择双面打印${COLORS.nc}`);
  }
  
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.nc}`);
  success("人生罗盘准备就绪！");
  console.log(`\n${COLORS.blue}主文件: ${compassFile}${COLORS.nc}`);
  console.log(`${COLORS.blue}目录:   ${outputDir}${COLORS.nc}\n`);
  console.log("建议:");
  console.log("- 每周回顾");
  console.log("- 每月校准");
  console.log("- 打印版贴可见处");
}

async function prompt(message) {
  Bun.write(Bun.stdout, message);
  const chunks = [];
  for await (const chunk of Bun.stdin) chunks.push(chunk);
  return new TextDecoder().decode(Bun.concat(chunks)).trim();
}

main().catch(console.error);
