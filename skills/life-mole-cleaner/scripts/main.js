#!/usr/bin/env node
import { spawn } from "child_process";

function run(command) {
  return new Promise(resolve => {
    const proc = spawn(command, { shell: "/bin/zsh", stdio: "pipe" });
    let output = "";
    proc.stdout.on("data", d => output += d.toString());
    proc.stderr.on("data", d => output += d.toString());
    proc.on("close", code => resolve({ success: code === 0, output }));
  });
}

function isMoleInstalled() {
  try {
    const { execSync } = require("child_process");
    execSync("which mo", { encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

async function installMole() {
  console.log("未检测到 Mole，正在安装...\n");

  const checkBrew = await run("which brew");
  if (!checkBrew.success) {
    console.error("❌ 未安装 Homebrew，请先安装: https://brew.sh");
    return false;
  }

  console.log("安装 Mole 中...");
  const install = await run("brew install tw93/tap/mole 2>&1");

  if (install.success || install.output.includes("already installed")) {
    console.log("✅ Mole 安装成功\n");
    return true;
  } else {
    console.error("❌ 安装失败:", install.output);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || "preview";

  console.log("=== Mac 清理助手 ===\n");

  if (!isMoleInstalled()) {
    const installed = await installMole();
    if (!installed) return;
  }

  switch (action) {
    case "preview":
      console.log("=== 预览清理内容 (dry-run) ===\n");
      console.log("以下是可以安全清理的项目：\n");
      const preview = await run("mo clean --dry-run 2>&1 || true");
      console.log(preview.output || "暂无预览数据");
      console.log("\n💡 运行 'node main.js clean' 执行清理");
      break;

    case "status":
      console.log("=== 系统状态 ===\n");
      const status = await run("mo status 2>&1 || true");
      console.log(status.output || "无法获取状态");
      break;

    case "analyze":
      console.log("=== 磁盘分析 ===\n");
      const analyze = await run("mo analyze 2>&1 || true");
      console.log(analyze.output || "无法分析");
      break;

    case "clean":
      console.log("=== 安全清理流程 ===\n");
      console.log("将清理以下安全项目：");
      console.log("  • 系统缓存");
      console.log("  • 应用临时文件");
      console.log("  • 日志文件");
      console.log("  • 开发工具缓存 (npm, pip, Docker 等)\n");

      const readline = await import("readline");
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question("确认执行清理？清理后无法撤销 (y/n): ", async ans => {
        rl.close();
        if (ans.toLowerCase() === "y") {
          console.log("\n执行清理中...\n");
          const result = await run("mo clean 2>&1 || true");
          console.log(result.output);
          console.log("\n✅ 清理完成");
        } else {
          console.log("\n已取消");
        }
      });
      break;

    default:
      console.log("Usage: node main.js <command>");
      console.log("Commands:");
      console.log("  preview  - 预览清理内容（安全）");
      console.log("  status   - 查看系统状态");
      console.log("  analyze  - 分析磁盘使用");
      console.log("  clean    - 执行清理（需确认）");
  }
}

main();
