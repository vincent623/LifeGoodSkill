#!/usr/bin/env node
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function checkCommandExists(command) {
  return new Promise((resolve) => {
    const proc = spawn("which", [command], { stdio: "pipe" });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

async function checkDependencies() {
  console.log("检查依赖...\n");

  const deps = [
    { name: "yt-dlp", install: "brew install yt-dlp" },
    { name: "ffmpeg", install: "brew install ffmpeg" },
  ];

  const missing = [];
  for (const dep of deps) {
    const exists = await checkCommandExists(dep.name);
    if (exists) {
      console.log(`  ✓ ${dep.name} 已安装`);
    } else {
      console.log(`  ✗ ${dep.name} 未安装`);
      missing.push(dep);
    }
  }

  if (missing.length > 0) {
    console.log("\n请安装缺失的依赖:");
    for (const dep of missing) {
      console.log(`  ${dep.install}`);
    }
    return false;
  }

  console.log("\n所有依赖已就绪!");
  return true;
}

function parseSearchOutput(output) {
  const videos = [];
  const lines = output.split("\n");

  for (const line of lines) {
    const match = line.match(/^(.+?)\s+([a-zA-Z0-9_-]{11})$/);
    if (match) {
      videos.push({
        title: match[1].trim(),
        id: match[2],
        url: `https://youtube.com/watch/${match[2]}`,
      });
    }
  }

  return videos;
}

function displayVideos(videos) {
  if (videos.length === 0) {
    console.log("未找到视频");
    return;
  }

  console.log(`\n找到 ${videos.length} 个视频:\n`);

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    console.log(`${i + 1}. ${v.title}`);
    console.log(`   ${v.url}`);
    console.log("");
  }

  console.log("---");
  console.log("操作选项:");
  console.log("  下载视频: yt-dlp -o 'downloads/%(title)s.%(ext)s' 'URL'");
  console.log("  下载音频: yt-dlp -x --audio-format mp3 -o 'downloads/%(title)s.%(ext)s' 'URL'");
  console.log("  提取字幕: yt-dlp --write-subs --sub-langs en 'URL'");
  console.log("");
}

async function searchVideos(query, limit = 10) {
  const searchQuery = `ytsearch${limit}:${query}`;
  console.log(`\n搜索: "${query}"`);
  console.log("=".repeat(60));

  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", [
      "--print", "%(title)s %(id)s",
      "--no-download",
      searchQuery,
    ], { stdio: "pipe" });

    let output = "";
    proc.stdout.on("data", (d) => (output += d.toString()));
    proc.on("error", (error) => reject(new Error(`yt-dlp 错误: ${error.message}`)));
    proc.on("close", (code) => {
      if (code !== 0 && code !== 1) {
        reject(new Error(`yt-dlp 退出码: ${code}`));
        return;
      }
      resolve(parseSearchOutput(output));
    });
  });
}

async function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", [
      "--print", "%(title)s\n%(description)s\n%(view_count)s\n%(duration)s",
      "--no-download",
      url,
    ], { stdio: "pipe" });

    let output = "";
    proc.stdout.on("data", (d) => (output += d.toString()));
    proc.on("error", (error) => reject(new Error(`yt-dlp 错误: ${error.message}`)));
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp 退出码: ${code}`));
        return;
      }
      const lines = output.split("\n");
      resolve({
        title: lines[0]?.trim() || "未知标题",
        description: lines[1]?.trim() || "",
        viewCount: parseInt(lines[2]) || 0,
        duration: lines[3]?.trim() || "",
      });
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const options = {
    limit: 10,
    info: false,
  };

  let query = "";
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--limit" || arg === "-n") {
      options.limit = parseInt(args[++i]) || 10;
    } else if (arg.startsWith("--limit=")) {
      options.limit = parseInt(arg.split("=")[1]) || 10;
    } else if (arg === "--info" || arg === "-i") {
      options.info = true;
    } else if (!arg.startsWith("--")) {
      query = arg;
    }
  }

  const depsOk = await checkDependencies();
  if (!depsOk) {
    process.exit(1);
  }

  if (!query) {
    console.log("Usage: node search.js <search query> [options]");
    console.log("       node search.js <video_url> --info");
    console.log("Options:");
    console.log("  --limit N    搜索结果数量 (默认: 10)");
    console.log("  --info       获取视频详细信息");
    console.log("Examples:");
    console.log("  node search.js Python 教程 --limit 5");
    console.log("  node search.js https://youtube.com/watch/XXX --info");
    process.exit(1);
  }

  try {
    if (query.startsWith("http")) {
      if (options.info) {
        const info = await getVideoInfo(query);
        console.log("\n视频信息:");
        console.log("=".repeat(60));
        console.log(`标题: ${info.title}`);
        console.log(`观看: ${info.viewCount}`);
        console.log(`时长: ${info.duration}`);
        console.log(`简介: ${info.description.slice(0, 200)}...`);
      }
    } else {
      const videos = await searchVideos(query, options.limit);
      displayVideos(videos);
    }
  } catch (error) {
    console.error(`搜索失败: ${error.message}`);
    process.exit(1);
  }
}

main();
