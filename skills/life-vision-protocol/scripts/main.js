#!/usr/bin/env bun
/**
 * Vision Protocol - Anti-Vision & Vision Generator
 * Part 1 of "How to fix your entire life in 1 day"
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const COLORS = { blue: "\x1b[34m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", cyan: "\x1b[36m", nc: "\x1b[0m" };

function log(msg) { console.log(`${COLORS.blue}[vision-protocol]${COLORS.nc} ${msg}`); }
function success(msg) { console.log(`${COLORS.green}✓${COLORS.nc} ${msg}`); }
function warn(msg) { console.log(`${COLORS.yellow}⚠${COLORS.nc} ${msg}`); }
function section(msg) { console.log(`\n${COLORS.cyan}━━━ ${msg} ━━━${COLORS.nc}\n`); }

const ANTI_VISION_QUESTIONS = [
  {
    id: 1,
    question: "如果未来5年一切不变，描述你 average Tuesday 的一天。",
    hint: "在哪里醒来？身体感觉如何？第一个念头是什么？9-18点做什么？22点感觉如何？"
  },
  {
    id: 2,
    question: "如果10年后，你错过了什么？机会关闭了谁放弃了别人怎么评价你？",
    hint: "具体描述失去的机会、关系、对自己的失望"
  },
  {
    id: 3,
    question: "临终时你活了安全版本，从未打破模式。代价是什么？",
    hint: "你从未允许自己感受、尝试或成为什么？"
  },
  {
    id: 4,
    question: "谁正在过你描述的5-10年后的生活？看到他们你什么感受？",
    hint: "这个人可能是同学、同事、或社交媒体上的人"
  },
  {
    id: 5,
    question: "你要变成理想中的自己，需要放弃什么身份标签？",
    hint: "\"我是那种人...\" 这个标签不改变，社会成本是什么？"
  },
  {
    id: 6,
    question: "你没改变的最尴尬原因是什么？",
    hint: "听起来 weak、scary 或 lazy 而不是 reasonable 的原因"
  },
  {
    id: 7,
    question: "你现在的行为是自我保护，保护什么？代价是什么？",
    hint: "你在逃避什么恐惧？这种逃避让你失去了什么？"
  }
];

const VISION_QUESTIONS = [
  {
    id: 1,
    question: "3年后如果你能瞬间切换到理想生活，描述 average Tuesday。",
    hint: "不要考虑可行性，只考虑你真正想要的"
  },
  {
    id: 2,
    question: "要让那个生活感觉自然而非强迫，你相信自己什么？",
    hint: "写出身份声明："I am the type of person who...""
  },
  {
    id: 3,
    question: "如果你已经是那个人，本周会做哪件事？",
    hint: "最小可行行动，本周可执行的"
  }
];

function generateAntiVisionDoc(responses) {
  const date = new Date().toISOString().split("T")[0];
  let doc = `# Anti-Vision (反愿景)\n\n**Date:** ${date}\n\n`;
  
  for (const r of responses) {
    doc += `## ${r.id}. ${r.question}\n\n${r.answer}\n\n---\n\n`;
  }
  
  doc += `## 核心洞察\n\n`;
  doc += `**最触动的点:** ${responses.find(r => r.answer.length > 20)?.answer.slice(0, 100) || "待补充"}\n\n`;
  doc += `**不愿成为的人:** ${responses[3]?.answer.slice(0, 100) || "待补充"}\n\n`;
  
  return doc;
}

function generateVisionDoc(responses) {
  const date = new Date().toISOString().split("T")[0];
  let doc = `# Vision (愿景)\n\n**Date:** ${date}\n\n`;
  
  for (const r of responses) {
    doc += `## ${r.id}. ${r.question}\n\n${r.answer}\n\n---\n\n`;
  }
  
  return doc;
}

function generateIdentityDoc(identity) {
  const date = new Date().toISOString().split("T")[0];
  return `# Identity Statement (身份声明)

**Date:** ${date}

## "I am the type of person who..."

${identity}

---

## 含义

这个身份声明是你改变的北极星。每天早上提醒自己：
"${identity}"

## 行动检验

本周行动是否与这个身份一致？
- 如果一致，你在正确轨道上
- 如果不一致，问自己为什么
`;
}

async function interactiveMode() {
  const args = process.argv.slice(2);
  const mode = args.find(a => a.startsWith("--mode="))?.split("=")[1] || "full";
  const quick = args.includes("--quick");
  
  console.log(`${COLORS.cyan}╔════════════════════════════════════════╗${COLORS.nc}`);
  console.log(`${COLORS.cyan}║      Vision Protocol - 愿景协议         ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}║      Part 1: 心理挖掘与人生方向          ║${COLORS.nc}`);
  console.log(`${COLORS.cyan}╚════════════════════════════════════════╝${COLORS.nc}`);
  
  const outputDir = join(process.cwd(), "vision-protocol");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  let responses = [];
  let identity = "";
  
  if (mode === "anti-vision" || mode === "full") {
    section("Part A: Anti-Vision (反愿景)");
    log("这些问题旨在创造不适感，帮助你看清不想过的生活");
    console.log("");
    
    const questions = quick ? ANTI_VISION_QUESTIONS.slice(0, 3) : ANTI_VISION_QUESTIONS;
    
    for (const q of questions) {
      console.log(`${COLORS.yellow}${q.id}. ${q.question}${COLORS.nc}`);
      if (q.hint) console.log(`${COLORS.gray}提示: ${q.hint}${COLORS.nc}`);
      
      const answer = await prompt("你的回答: ");
      responses.push({ id: q.id, question: q.question, answer: answer });
      console.log("");
    }
    
    const antiVisionFile = join(outputDir, `${new Date().toISOString().slice(0,10).replace(/-/g,"")}_anti-vision.md`);
    writeFileSync(antiVisionFile, generateAntiVisionDoc(responses));
    success(`反愿景已保存: ${antiVisionFile}`);
  }
  
  if (mode === "vision" || mode === "full") {
    section("Part B: Vision (愿景)");
    log("现在转向积极方向，构建你想要的生活");
    console.log("");
    
    const questions = quick ? VISION_QUESTIONS.slice(0, 2) : VISION_QUESTIONS;
    responses = [];
    
    for (const q of questions) {
      console.log(`${COLORS.green}${q.id}. ${q.question}${COLORS.nc}`);
      if (q.hint) console.log(`${COLORS.gray}提示: ${q.hint}${COLORS.nc}`);
      
      const answer = await prompt("你的回答: ");
      responses.push({ id: q.id, question: q.question, answer: answer });
      console.log("");
    }
    
    const visionFile = join(outputDir, `${new Date().toISOString().slice(0,10).replace(/-/g,"")}_vision.md`);
    writeFileSync(visionFile, generateVisionDoc(responses));
    success(`愿景已保存: ${visionFile}`);
  }
  
  if (mode === "full") {
    section("Part C: Identity Statement (身份声明)");
    console.log(`${COLORS.cyan}写出你的身份声明:${COLORS.nc}`);
    console.log(`"I am the type of person who..."`);
    
    identity = await prompt("完整声明: ");
    
    const identityFile = join(outputDir, `${new Date().toISOString().slice(0,10).replace(/-/g,"")}_identity.md`);
    writeFileSync(identityFile, generateIdentityDoc(identity));
    success(`身份声明已保存: ${identityFile}`);
  }
  
  console.log(`\n${COLORS.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.nc}`);
  success("愿景协议完成！建议阅读生成的文件并定期回顾。");
  console.log(`${COLORS.blue}输出目录: ${outputDir}${COLORS.nc}\n`);
}

async function prompt(message) {
  Bun.write(Bun.stdout, message);
  const reader = Bun.stdin;
  const chunks = [];
  for await (const chunk of reader) chunks.push(chunk);
  return new TextDecoder().decode(Bun.concat(chunks)).trim();
}

async function main() {
  await interactiveMode();
}

main().catch(console.error);
