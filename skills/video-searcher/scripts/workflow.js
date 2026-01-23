#!/usr/bin/env node
import { spawn } from "child_process";
import { readdirSync, existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = __dirname;
const PROJECT_ROOT = dirname(dirname(SKILL_DIR));
const DEFAULT_OUTPUT_DIR = join(PROJECT_ROOT, "downloads");
const DOWNLOAD_LOG = join(PROJECT_ROOT, ".downloads.json");

function getTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
}

function checkCommandExists(command) {
  return new Promise((resolve) => {
    const proc = spawn("which", [command], { stdio: "pipe" });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

function checkHomebrew() {
  return new Promise((resolve) => {
    const proc = spawn("which", ["brew"], { stdio: "pipe" });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

async function installWithBrew(packageName) {
  return new Promise((resolve, reject) => {
    console.log(`  安装 ${packageName}...`);
    const proc = spawn("brew", ["install", packageName], { stdio: "pipe" });
    proc.stdout.on("data", (d) => process.stdout.write(d.toString()));
    proc.stderr.on("data", (d) => process.stderr.write(d.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`安装失败，退出码: ${code}`));
    });
  });
}

async function checkDependencies() {
  console.log("检查依赖...\n");

  const deps = [
    { name: "yt-dlp", install: "brew install yt-dlp", brew: "yt-dlp" },
    { name: "ffmpeg", install: "brew install ffmpeg", brew: "ffmpeg" },
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
    const hasBrew = await checkHomebrew();
    if (!hasBrew) {
      console.log("\n⚠️  未检测到 Homebrew，请先安装:");
      console.log("  /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"");
      return false;
    }

    console.log("\n自动安装缺失的依赖...");
    for (const dep of missing) {
      try {
        await installWithBrew(dep.brew);
        console.log(`  ✓ ${dep.name} 安装成功`);
      } catch (error) {
        console.error(`  ✗ ${dep.name} 安装失败: ${error.message}`);
        return false;
      }
    }
  }

  console.log("\n所有依赖已就绪!");
  return true;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    query: "",
    search: false,
    download: false,
    extractAudio: false,
    subtitles: false,
    lang: "en",
    format: "best",
    output: DEFAULT_OUTPUT_DIR,
    urls: [],
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--search") {
      options.search = true;
    } else if (arg === "--download") {
      options.download = true;
    } else if (arg === "--extract-audio" || arg === "-x") {
      options.extractAudio = true;
    } else if (arg === "--subtitles" || arg === "--subs") {
      options.subtitles = true;
    } else if (arg === "--lang" || arg === "-l") {
      options.lang = args[++i] || "en";
    } else if (arg === "--format" || arg === "-f") {
      options.format = args[++i] || "best";
    } else if (arg === "--output" || arg === "-o") {
      options.output = args[++i] || DEFAULT_OUTPUT_DIR;
    } else if (arg === "--yes" || arg === "-y") {
      options.force = true;
    } else if (!arg.startsWith("--") && !arg.startsWith("http")) {
      options.query += (options.query ? " " : "") + arg;
    } else if (arg.startsWith("http")) {
      options.urls.push(arg);
    }
  }

  options.search = options.search || (!options.download && options.urls.length === 0);
  if (!options.search) {
    options.download = options.download || options.extractAudio || options.subtitles;
  }

  return options;
}

async function searchVideos(query, limit = 10) {
  const searchQuery = `ytsearch${limit}:${query}`;

  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", [
      "--print", "%(title)s\n%(view_count)s\n%(duration)s\n%(id)s\n---",
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

function parseSearchOutput(output) {
  const videos = [];
  const sections = output.split(/^---$/m);

  for (const section of sections) {
    const lines = section.trim().split("\n");
    if (lines.length < 4) continue;

    const title = lines[0]?.trim() || "";
    const viewCount = parseInt(lines[1]) || 0;
    const duration = lines[2]?.trim() || "";
    const id = lines[3]?.trim() || "";

    if (id && title) {
      videos.push({
        title,
        viewCount,
        duration,
        id,
        url: `https://youtube.com/watch/${id}`,
      });
    }
  }

  return videos;
}

async function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", [
      "--print", "%(title)s\n%(description)s\n%(uploader)s\n%(upload_date)s\n%(view_count)s\n%(duration)s\n%(tags)s",
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
        uploader: lines[2]?.trim() || "未知",
        uploadDate: lines[3]?.trim() || "",
        viewCount: parseInt(lines[4]) || 0,
        duration: lines[5]?.trim() || "",
        tags: lines[6]?.trim() || "",
      });
    });
  });
}

function generateIntroMd(info, url) {
  return `# ${info.title}

## 基本信息

- **链接**: ${url}
- **作者**: ${info.uploader}
- **上传日期**: ${info.uploadDate}
- **观看次数**: ${info.viewCount.toLocaleString()}
- **时长**: ${info.duration}

## 标签

${info.tags ? info.tags.split(',').map(t => `- ${t.trim()}`).join('\n') : '无'}

## 内容简介

${info.description || '暂无简介'}

---

*由 video-searcher 自动生成*
`;
}

async function downloadMp3(url, outputDir, title) {
  return new Promise((resolve, reject) => {
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50);
    const args = [
      "-x", "--audio-format", "mp3",
      "-o", join(outputDir, `${safeTitle}.%(ext)s`),
      url,
    ];
    const proc = spawn("yt-dlp", args, { stdio: "pipe" });
    proc.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`MP3 下载失败，退出码: ${code}`));
    });
  });
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "N/A";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViewCount(count) {
  if (!count) return "N/A";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function displayVideos(videos) {
  if (videos.length === 0) {
    console.log("未找到视频");
    return [];
  }

  console.log(`\n找到 ${videos.length} 个视频:\n`);
  console.log("  #   标题                                          观看      时长");
  console.log("  ────────────────────────────────────────────────────────────────");

  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const title = v.title.length > 44 ? v.title.slice(0, 44) + "..." : v.title;
    console.log(`  ${(i + 1).toString().padStart(2)}   ${title.padEnd(44)} ${formatViewCount(v.viewCount).padStart(8)} ${formatDuration(v.duration).padStart(6)}`);
  }

  console.log("");
  return videos;
}

function getDownloadLog() {
  try {
    if (existsSync(DOWNLOAD_LOG)) {
      return JSON.parse(readFileSync(DOWNLOAD_LOG, "utf-8"));
    }
  } catch {}
  return {};
}

function saveDownloadLog(log) {
  writeFileSync(DOWNLOAD_LOG, JSON.stringify(log, null, 2));
}

function startDownload(video, options, logId) {
  const args = [];

  if (options.extractAudio) {
    args.push("-x", "--audio-format", "mp3");
  } else {
    if (options.format !== "best") {
      args.push("-f", options.format);
    }
  }

  if (options.subtitles) {
    args.push("--write-subs");
    if (options.lang) args.push("--sub-langs", options.lang);
  }

  if (!existsSync(options.output)) {
    mkdirSync(options.output, { recursive: true });
  }

  args.push("-o", join(options.output, "%(title)s.%(ext)s"));
  args.push(video.url);

  const proc = spawn("yt-dlp", args, { stdio: "pipe" });

  let progress = "";
  let lastPercent = -1;

  proc.stdout.on("data", (d) => {
    const text = d.toString();
    progress += text;

    const downloadMatch = text.match(/\[download\]\s+(\d+\.?\d*)%/);
    if (downloadMatch) {
      const percent = Math.floor(parseFloat(downloadMatch[1]));
      if (percent !== lastPercent && percent % 10 === 0) {
        process.stdout.write(`\r  下载中: ${video.title.slice(0, 30)}... ${percent}%\n`);
        lastPercent = percent;
      }
    }
  });

  proc.stderr.on("data", (d) => {
    const text = d.toString();
    progress += text;
  });

  return new Promise((resolve, reject) => {
    proc.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, video, logId });
      } else {
        reject(new Error(`下载失败，退出码: ${code}`));
      }
    });
  });
}

async function askUserChoice(videos) {
  console.log("请选择要下载的视频（输入编号，多个用空格分隔，如: 1 3）:");
  console.log("  - 输入 'a' 下载全部");
  console.log("  - 输入 'n' 不下载");
  console.log("  - 直接回车 下载第 1 个");

  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("  > ", (answer) => {
      rl.close();
      answer = answer.trim();

      if (answer.toLowerCase() === "n") {
        resolve([]);
      } else if (answer.toLowerCase() === "a") {
        resolve(videos.map((_, i) => i));
      } else if (!answer) {
        resolve([0]);
      } else {
        const indices = answer.split(/\s+/).map((n) => parseInt(n) - 1).filter((n) => n >= 0 && n < videos.length);
        resolve(indices);
      }
    });
  });
}

async function createInterface({ input, output }) {
  const mod = await import("readline");
  return mod.createInterface({ input, output });
}

async function downloadVideos(videos, indices, options) {
  const timestamp = getTimestamp();
  const sessionDir = join(DEFAULT_OUTPUT_DIR, `download_${timestamp}`);
  mkdirSync(sessionDir, { recursive: true });

  const log = getDownloadLog();
  const results = [];

  for (const idx of indices) {
    const video = videos[idx];
    const logId = `${video.id}_${Date.now()}`;
    log[logId] = {
      title: video.title,
      url: video.url,
      status: "downloading",
      startTime: new Date().toISOString(),
    };
    saveDownloadLog(log);

    const videoDir = join(sessionDir, `${idx + 1}_${video.id}`);
    mkdirSync(videoDir, { recursive: true });

    try {
      console.log(`\n  开始下载: ${video.title}`);

      await startDownload(video, { ...options, output: videoDir }, logId);
      console.log(`    视频下载完成`);

      await downloadMp3(video.url, videoDir, video.title);
      console.log(`    MP3 下载完成`);

      const videoInfo = await getVideoInfo(video.url);
      const introMd = generateIntroMd(videoInfo, video.url);
      writeFileSync(join(videoDir, "视频简介.md"), introMd);
      console.log(`    简介.md 生成完成`);

      log[logId].status = "completed";
      log[logId].endTime = new Date().toISOString();
      saveDownloadLog(log);
      results.push({ success: true, video, dir: videoDir });
      console.log(`  ✓ 完成: ${video.title}`);
    } catch (error) {
      log[logId].status = "failed";
      log[logId].error = error.message;
      saveDownloadLog(log);
      results.push({ success: false, video, error: error.message });
      console.log(`  ✗ 失败: ${video.title} - ${error.message}`);
    }
  }

  if (results.length > 0) {
    const listMd = generateDownloadListMd(results, sessionDir, timestamp);
    writeFileSync(join(sessionDir, "下载清单.md"), listMd);
    console.log(`\n  清单.md 已生成: ${sessionDir}`);
  }

  return results;
}

function generateDownloadListMd(results, sessionDir, timestamp) {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  let md = `# 下载清单 - ${timestamp}

## 统计

- **总计**: ${results.length} 个
- **成功**: ${successful.length} 个
- **失败**: ${failed.length} 个

## 下载列表

| 序号 | 标题 | 状态 | 目录 |
|------|------|------|------|
`;

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const status = r.success ? "✓ 成功" : "✗ 失败";
    const dirName = r.dir ? r.dir.split("/").pop() : "-";
    const title = r.video.title.length > 30 ? r.video.title.slice(0, 30) + "..." : r.video.title;
    md += `| ${i + 1} | ${title} | ${status} | ${dirName} |\n`;
  }

  md += `
## 目录结构

\`\`\`
downloads/
└── download_${timestamp}/
`;

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.success) {
      md += `    ├── ${i + 1}_${r.video.id}/\n`;
      md += `    │   ├── 视频简介.md\n`;
      md += `    │   ├── ${r.video.title}.mp4\n`;
      md += `    │   └── ${r.video.title}.mp3\n`;
    }
  }

  md += `    └── 下载清单.md\n\`\`\`

---
*由 video-searcher 自动生成*
`;
  return md;
}

function displayDownloadSummary(results, options) {
  console.log("\n" + "=".repeat(60));
  console.log("下载完成!");
  console.log("=".repeat(60));
  console.log(`输出目录: ${options.output}`);
  console.log(`成功: ${results.filter((r) => r.success).length} 个`);
  console.log(`失败: ${results.filter((r) => !r.success).length} 个`);
  console.log("");

  if (options.extractAudio) {
    console.log("音频格式: MP3");
  }
  if (options.subtitles) {
    console.log(`字幕语言: ${options.lang}`);
  }
}

async function main() {
  const options = parseArgs();

  console.log("=".repeat(60));
  console.log("Video Searcher - 视频搜索与下载工作流");
  console.log("=".repeat(60));

  const depsOk = await checkDependencies();
  if (!depsOk) {
    process.exit(1);
  }

  if (!options.query && options.urls.length === 0) {
    console.log("\nUsage: node workflow.js <query> [options]");
    console.log("       node workflow.js <url> [options]");
    console.log("");
    console.log("Options:");
    console.log("  --search          搜索视频");
    console.log("  --download        下载视频");
    console.log("  --extract-audio   提取音频 (MP3)");
    console.log("  --subtitles       下载字幕");
    console.log("  --lang LANG       字幕语言 (默认: en)");
    console.log("  --format FORMAT   视频格式");
    console.log("  --output DIR      输出目录");
    console.log("  --yes, -y         跳过确认，直接下载第 1 个");
    console.log("");
    console.log("Examples:");
    console.log("  node workflow.js Python 教程 --search");
    console.log("  node workflow.js Python 教程 --search --download");
    console.log("  node workflow.js Python 教程 --extract-audio --yes");
    process.exit(1);
  }

  let videos = [];

  if (options.urls.length > 0) {
    videos = options.urls.map((url, i) => ({
      title: `视频 ${i + 1}`,
      url: url,
      id: url.split("watch/")[1]?.split("?")[0] || `video_${i}`,
    }));
  } else if (options.search) {
    try {
      videos = await searchVideos(options.query, 5);
      displayVideos(videos);

      if (options.download) {
        if (options.force) {
          console.log("  (自动模式: 下载第 1 个)");
          await downloadVideos(videos, [0], options);
        } else {
          const indices = await askUserChoice(videos);
          if (indices.length > 0) {
            await downloadVideos(videos, indices, options);
          } else {
            console.log("  已取消下载");
          }
        }
      }
    } catch (error) {
      console.error(`搜索失败: ${error.message}`);
      process.exit(1);
    }
  } else if (options.download && videos.length > 0) {
    if (options.force) {
      await downloadVideos(videos, [0], options);
    } else {
      displayVideos(videos);
      const indices = await askUserChoice(videos);
      if (indices.length > 0) {
        await downloadVideos(videos, indices, options);
      }
    }
  }

  console.log("=".repeat(60));
  console.log("完成!");
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(`错误: ${error.message}`);
  process.exit(1);
});
