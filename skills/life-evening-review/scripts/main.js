#!/usr/bin/env bun
/**
 * Evening Review Protocol - Daily Synthesis
 * Part 3 of "How to fix your entire life in 1 day"
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const COLORS = { blue: "\x1b[34m", green: "\x1b[32m", yellow: "\x1b[33m", cyan: "\x1b[36m", nc: "\x1b[0m" };

function log(msg) { console.log(`${COLORS.blue}[evening-review]${COLORS.nc} ${msg}`); }
function success(msg) { console.log(`${COLORS.green}✓${COLORS.nc} ${msg}`); }
function section(msg) { console.log(`\n${COLORS.cyan}━━━ ${msg} ━━━${COLORS.nc}\n`); }

const INSIGHT_QUESTIONS = [
  { id: 1, question: "今天最真实的洞察是什么？什么让你看清了什么？", key: "insight" },
  { id: 2, question: "真正的敌人是谁？不要怪环境或别人，是什么内在模式或信念在主导？", key: "enemy" },
  { id: 3, question: "一句话总结你的反愿景（你拒绝成为的）", key: "antiVisionSummary" },
  { id: 4, question: "一句话总结你的愿景（你想要的）", key: "visionSummary" }
];

const GOAL_QUESTIONS = [
  { period: "1年", question: "一年后什么必须为真，才算打破了旧模式？", key: "yearGoal" },
  { period: "1月", question: "一个月后什么必须为真，才让一年目标可能？", key: "monthGoal" },
  { period: "明天", question: "哪2-3件事是'那个人'会做的？时间block它们", key: "tomorrowActions" }
];

function generateReviewDoc(date, insights, goals) {
  return `# 晚间复盘 - ${date}

## Part A: 洞察综合

### 1. 今日洞察
${insights.insight || "待补充"}

### 2. 真正敌人
${insights.enemy || "待识别"}

> 真正的敌人不是外部环境，而是内在模式或信念。

### 3. 反愿景一句话
${insights.antiVisionSummary || "待总结"}

### 4. 愿景一句话
${insights.visionSummary || "待总结"}

---

## Part B: 目标设定

### 1年目标
${goals.yearGoal || "待设定"}

### 1月项目
${goals.monthGoal || "待设定"}

### 明日行动
${goals.tomorrowActions || "待设定"}

---

## Part C: 今日检查清单

- [ ] 回顾早间愿景协议
- [ ] 完成日间打断提示
- [ ] 执行明日计划
- [ ] 更新人生罗盘

---

*生成于: ${new Date().toLocaleString("zh-CN")}*
`;
}

function generateTomorrowDoc(date, tomorrowActions) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = nextDate.toISOString().split("T")[0];
  
  return `# 明日计划 - ${nextDateStr}

## 核心行动

${tomorrowActions || "待从晚间复盘复制"}

## 时间安排

| 时间 | 事项 | 优先级 |
|------|------|--------|
| 09:00 | | P0 |
| 11:00 | | P0 |
| 14:00 | | P1 |
| 17:00 | | P1 |
| 20:00 | | P2 |

## 晚间提醒

- [ ] 回顾今天的行为与身份声明
- [ ] 回答日间打断提示
- [ ] 完成晚间复盘
- [ ] 更新人生罗盘

## 能量追踪

| 时段 | 能量 | 任务类型 |
|------|------|----------|
| 上午 | ⭐⭐⭐⭐⭐ | 深度工作 |
| 下午 | ⭐⭐⭐ | 协作/会议 |
| 晚间 | ⭐⭐ | 学习/复盘 |

---

*为 ${date} 准备*
`;
}

async function main() {
  const args = process.argv.slice(2);
  const quick = args.includes("--quick");
  const mode = args.find(a => a.startsWith("--mode="))?.split("=")[1] || "full";
  
  console.log(`${COLORS.cyan}╔════════════════════════════════════════╗${COLORS.nc}`);
  console.log(`${COLORS.cyan}║      Evening Review - 晚间复盘          ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}║      Part 3: 综合与整合                 ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════╝${COLORS.nc}`);
  
  const outputDir = join(process.cwd(), "evening-review");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const date = new Date().toISOString().split("T")[0];
  let insights = {};
  let goals = {};
  
  if (mode === "full" || mode === "insights") {
    section("Part A: 洞察综合");
    log("这些问题帮助你提炼今天的核心学习");
    
    const questions = quick ? INSIGHT_QUESTIONS.slice(0, 2) : INSIGHT_QUESTIONS;
    
    for (const q of questions) {
      console.log(`${COLORS.yellow}${q.id}. ${q.question}${COLORS.nc}`);
      const answer = await prompt("回答: ");
      insights[q.key] = answer;
      console.log("");
    }
  }
  
  if (mode === "full" || mode === "tomorrow" || mode === "goals") {
    section("Part B: 目标设定");
    log("设定三个时间尺度的目标");
    
    for (const q of GOAL_QUESTIONS) {
      console.log(`${COLORS.green}${q.period}: ${q.question}${COLORS.nc}`);
      const answer = await prompt("回答: ");
      goals[q.key] = answer;
      console.log("");
    }
  }
  
  if (mode === "full") {
    const reviewFile = join(outputDir, `${date}_evening-review.md`);
    writeFileSync(reviewFile, generateReviewDoc(date, insights, goals));
    success(`晚间复盘已保存: ${reviewFile}`);
    
    const tomorrowFile = join(outputDir, `${date}_tomorrow.md`);
    writeFileSync(tomorrowFile, generateTomorrowDoc(date, goals.tomorrowActions));
    success(`明日计划已保存: ${tomorrowFile}`);
  }
  
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.nc}`);
  success("晚间复盘完成！");
  console.log(`${COLORS.blue}输出目录: ${outputDir}${COLORS.nc}\n`);
}

async function prompt(message) {
  Bun.write(Bun.stdout, message);
  const chunks = [];
  for await (const chunk of Bun.stdin) chunks.push(chunk);
  return new TextDecoder().decode(Bun.concat(chunks)).trim();
}

main().catch(console.error);
