#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from "fs";

const COMPASS_PATH = process.env.COMPASS_PATH || "./life-compass/life-compass.md";
const OUTPUT_DIR = process.env.OUTPUT_DIR || "./life-compass";

function parseCompassFile(content) {
  const compass = {
    antiVision: { title: "", content: "", type: "anti-vision" },
    vision: { title: "", content: "", type: "vision" },
    yearGoal: { title: "", content: "", type: "year-goal" },
    monthProject: { title: "", content: "", type: "month-project" },
    dailyLevers: [],
    constraints: []
  };

  const sections = content.split(/^##\s+/m);
  for (const section of sections) {
    const lines = section.trim().split("\n");
    const title = lines[0]?.trim() || "";
    const body = lines.slice(1).join("\n").trim();

    if (title.includes("反愿景") || title.includes("Anti-Vision")) {
      compass.antiVision = { title, content: body, type: "anti-vision" };
    } else if (title.includes("愿景") || title.includes("Vision")) {
      compass.vision = { title, content: body, type: "vision" };
    } else if (title.includes("一年目标") || title.includes("Year Goal")) {
      compass.yearGoal = { title, content: body, type: "year-goal" };
    } else if (title.includes("一月项目") || title.includes("Month Project")) {
      compass.monthProject = { title, content: body, type: "month-project" };
    } else if (title.includes("每日杠杆") || title.includes("Daily Levers")) {
      compass.dailyLevers = body.split("\n").filter(Boolean).map((item, i) => ({
        title: `Lever ${i + 1}`,
        content: item.replace(/^[-*]\s*/, ""),
        type: "daily-levers"
      }));
    } else if (title.includes("约束") || title.includes("Constraints")) {
      compass.constraints = body.split("\n").filter(Boolean).map(c => c.replace(/^[-*]\s*/, ""));
    }
  }

  return compass;
}

function generateHTML(compass) {
  const timestamp = new Date().toLocaleString("zh-CN");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>人生罗盘 - 可视化</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #fff;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 {
      text-align: center;
      font-size: 2.5em;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #e94560, #ff6b6b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .timestamp { text-align: center; color: #888; margin-bottom: 30px; }

    .compass-visual {
      position: relative;
      width: 100%;
      max-width: 900px;
      margin: 0 auto 40px;
      aspect-ratio: 1;
    }

    .center-star {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #e94560, #ff6b6b);
      clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
      animation: pulse 2s ease-in-out infinite;
      z-index: 10;
    }
    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.1); }
    }

    .element {
      position: absolute;
      padding: 20px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.2);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .element:hover { transform: scale(1.05); background: rgba(255,255,255,0.15); }
    .element h3 { font-size: 1em; margin-bottom: 8px; opacity: 0.9; }
    .element p { font-size: 0.85em; line-height: 1.5; opacity: 0.8; }

    .anti-vision { top: 5%; left: 50%; transform: translateX(-50%); border-color: #e94560; }
    .vision { top: 5%; left: 15%; border-color: #4ecdc4; }
    .year-goal { top: 20%; right: 5%; width: 220px; text-align: right; border-color: #ffe66d; }
    .month-project { top: 45%; right: 2%; width: 200px; text-align: right; border-color: #95e1d3; }
    .constraints { bottom: 15%; left: 50%; transform: translateX(-50%); border-color: #a29bfe; width: 80%; text-align: center;}
    .daily-1 { bottom: 30%; left: 5%; border-color: #fd79a8; }
    .daily-2 { bottom: 45%; left: 5%; border-color: #74b9ff; }
    .daily-3 { bottom: 30%; right: 25%; border-color: #00b894; }

    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }
    .card {
      background: rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .card h3 { margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .card ul { list-style: none; }
    .card li { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .card li:last-child { border: none; }
    .tag { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.75em; margin-right: 8px; }
    .tag-anti { background: rgba(233,69,96,0.3); color: #e94560; }
    .tag-vision { background: rgba(78,205,196,0.3); color: #4ecdc4; }
    .tag-goal { background: rgba(255,230,109,0.3); color: #ffe66d; }
    .tag-project { background: rgba(149,225,211,0.3); color: #95e1d3; }
    .tag-lever { background: rgba(116,185,255,0.3); color: #74b9ff; }
    .tag-constraint { background: rgba(162,155,254,0.3); color: #a29bfe; }

    .flow-chart {
      margin-top: 40px;
      background: rgba(0,0,0,0.2);
      border-radius: 16px;
      padding: 30px;
      text-align: center;
    }
    .flow-row { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 20px 0; }
    .flow-item {
      padding: 15px 25px;
      border-radius: 10px;
      font-weight: bold;
    }

    @media print {
      body { background: #fff; color: #000; }
      .element, .card { background: #f5f5f5; border-color: #ddd; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧭 人生罗盘</h1>
    <p class="timestamp">最后更新: ${timestamp}</p>

    <div class="compass-visual">
      <div class="center-star"></div>

      <div class="element anti-vision">
        <h3>🚫 反愿景</h3>
        <p>${(compass.antiVision.content || "").slice(0, 100) || "未定义"}...</p>
      </div>

      <div class="element vision">
        <h3>✨ 愿景</h3>
        <p>${(compass.vision.content || "").slice(0, 80) || "未定义"}...</p>
      </div>

      <div class="element year-goal">
        <h3>🎯 一年目标</h3>
        <p>${(compass.yearGoal.content || "").slice(0, 120) || "未定义"}...</p>
      </div>

      <div class="element month-project">
        <h3>⚔️ 一月项目</h3>
        <p>${(compass.monthProject.content || "").slice(0, 100) || "未定义"}...</p>
      </div>

      <div class="element constraints">
        <h3>🔒 约束条件</h3>
        <p>${compass.constraints.length > 0 ? compass.constraints.slice(0, 3).join(" • ") : "未定义"}</p>
      </div>

      ${compass.dailyLevers[0] ? `<div class="element daily-1"><h3>📊 ${compass.dailyLevers[0].title}</h3><p>${(compass.dailyLevers[0].content || "").slice(0, 60)}</p></div>` : ""}
      ${compass.dailyLevers[1] ? `<div class="element daily-2"><h3>📊 ${compass.dailyLevers[1].title}</h3><p>${(compass.dailyLevers[1].content || "").slice(0, 60)}</p></div>` : ""}
      ${compass.dailyLevers[2] ? `<div class="element daily-3"><h3>📊 ${compass.dailyLevers[2].title}</h3><p>${(compass.dailyLevers[2].content || "").slice(0, 60)}</p></div>` : ""}
    </div>

    <div class="grid-cards">
      <div class="card">
        <h3><span class="tag tag-anti">反</span>我不想要的生活</h3>
        <p>${compass.antiVision.content || "等待定义..."}</p>
      </div>

      <div class="card">
        <h3><span class="tag tag-vision">愿</span>我想要的生活</h3>
        <p>${compass.vision.content || "等待定义..."}</p>
      </div>

      <div class="card">
        <h3><span class="tag tag-goal">目</span>一年后必须为真</h3>
        <p>${compass.yearGoal.content || "等待定义..."}</p>
      </div>

      <div class="card">
        <h3><span class="tag tag-project">战</span>本月Boss战</h3>
        <p>${compass.monthProject.content || "等待定义..."}</p>
      </div>
    </div>

    <div class="flow-chart">
      <h3>📈 执行流程</h3>
      <div class="flow-row">
        <div class="flow-item" style="background: rgba(233,69,96,0.3); border: 1px solid #e94560;">
          Anti-Vision<br><small>为什么不能输</small>
        </div>
        <div style="align-self: center;">→</div>
        <div class="flow-item" style="background: rgba(78,205,196,0.3); border: 1px solid #4ecdc4;">
          Vision<br><small>想要什么</small>
        </div>
        <div style="align-self: center;">→</div>
        <div class="flow-item" style="background: rgba(255,230,109,0.3); border: 1px solid #ffe66d;">
          1年目标<br><small>唯一优先</small>
        </div>
        <div style="align-self: center;">→</div>
        <div class="flow-item" style="background: rgba(149,225,211,0.3); border: 1px solid #95e1d3;">
          1月项目<br><small>当前Boss</small>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 40px; color: #888;">
      <p>🧭 人生罗盘 = 一天改善人生协议终极综合</p>
    </div>
  </div>
</body>
</html>`;
}

function main() {
  let inputPath = process.argv[2] || COMPASS_PATH;

  if (process.argv.includes("--input")) {
    const idx = process.argv.indexOf("--input");
    inputPath = process.argv[idx + 1] || COMPASS_PATH;
  }

  if (!existsSync(inputPath)) {
    console.log("📝 未找到人生罗盘文件，将生成示例可视化...");
    const exampleCompass = {
      antiVision: { title: "反愿景", content: "5年后的某周二早上，我在不喜欢的公司做着不喜欢的工作...".repeat(3), type: "anti-vision" },
      vision: { title: "愿景", content: "3年后，我实现了财务自由，每天做着自己热爱的事业...".repeat(3), type: "vision" },
      yearGoal: { title: "一年目标", content: "建立被动收入体系，达到月入X万...", type: "year-goal" },
      monthProject: { title: "一月项目", content: "完成技能A的精通...".repeat(2), type: "month-project" },
      dailyLevers: [
        { title: "杠杆1", content: "每天学习2小时专业技能", type: "daily-levers" },
        { title: "杠杆2", content: "每日内容输出", type: "daily-levers" },
        { title: "杠杆3", content: "建立3个收入来源", type: "daily-levers" }
      ],
      constraints: ["绝不为钱牺牲健康", "绝不让工作侵占家庭时间", "绝不停止学习"]
    };

    const html = generateHTML(exampleCompass);
    const outputPath = `${OUTPUT_DIR}/compass-visual.html`;
    writeFileSync(outputPath, html);
    console.log(`✅ 示例可视化已生成: ${outputPath}`);
    return;
  }

  try {
    const content = readFileSync(inputPath, "utf-8");
    const compass = parseCompassFile(content);
    const html = generateHTML(compass);

    const outputPath = inputPath.replace(/\.md$/, "-visual.html");
    writeFileSync(outputPath, html);
    console.log(`✅ 可视化已生成: ${outputPath}`);

    if (process.argv.includes("--open")) {
      Bun.spawn(["open", outputPath]);
    }
  } catch (error) {
    console.error("❌ 生成失败:", error);
    process.exit(1);
  }
}

main();
