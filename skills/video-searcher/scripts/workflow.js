#!/usr/bin/env node
import { spawn } from "child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { CONFIG, getTimestamp, saveDownloadLog, getDownloadLog, ensureDir, getSiliconFlowApiKey } from "./lib/config.js";
import { searchVideos, displayVideos, downloadVideo, downloadMp3, downloadSubtitles, getVideoInfo, generateIntroMd } from "./lib/download.js";
import { transcribeAudio, getTranscriptionResult, formatTranscriptMd, findAudioFile } from "./lib/transcribe.js";
import { diagnoseAudioFile, chunkAudio } from "./lib/audio.js";

function checkCommandExists(command) {
  return new Promise((resolve) => {
    const proc = spawn("which", [command], { stdio: "pipe" });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

async function checkDependencies() {
  console.log("检查依赖... / Checking dependencies...\n");

  const deps = [
    { name: "yt-dlp", install: "brew install yt-dlp" },
    { name: "ffmpeg", install: "brew install ffmpeg" },
  ];

  const missing = [];
  for (const dep of deps) {
    const exists = await checkCommandExists(dep.name);
    if (exists) {
      console.log(`  ✓ ${dep.name} 已安装 / installed`);
    } else {
      console.log(`  ✗ ${dep.name} 未安装 / not installed`);
      missing.push(dep);
    }
  }

  if (missing.length > 0) {
    console.log("\n请安装缺失的依赖 / Please install missing dependencies:");
    for (const dep of missing) {
      console.log(`  ${dep.install}`);
    }
    return false;
  }

  console.log("\n所有依赖已就绪! / All dependencies ready!");
  return true;
}

function checkApiKey() {
  const key = getSiliconFlowApiKey();
  if (!key) {
    console.log("\n⚠️  未设置 SILICON_FLOW_API_KEY / SILICON_FLOW_API_KEY not set");
    console.log("如需语音转文字功能，请设置 / For transcription, set:");
    console.log("  export SILICON_FLOW_API_KEY=\"your_api_key\"");
    console.log("  或 / or");
    console.log("  SILICON_FLOW_API_KEY=\"key\" bun workflow.js \"视频链接\" --transcribe-only\n");
    return false;
  }
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
    transcribeOnly: false,
    lang: "en",
    format: "best",
    limit: 5,
    output: CONFIG.DEFAULT_OUTPUT_DIR,
    urls: [],
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--search") {
      options.search = true;
    } else if (arg === "--download") {
      options.download = true;
    } else if (arg === "--limit" || arg === "-n") {
      options.limit = parseInt(args[++i]) || 5;
    } else if (arg === "--extract-audio" || arg === "-x") {
      options.extractAudio = true;
    } else if (arg === "--subtitles" || arg === "--subs") {
      options.subtitles = true;
    } else if (arg === "--transcribe-only" || arg === "-t") {
      options.transcribeOnly = true;
    } else if (arg === "--lang" || arg === "-l") {
      options.lang = args[++i] || "en";
    } else if (arg === "--format" || arg === "-f") {
      options.format = args[++i] || "best";
    } else if (arg === "--output" || arg === "-o") {
      options.output = args[++i] || CONFIG.DEFAULT_OUTPUT_DIR;
    } else if (arg === "--yes" || arg === "-y") {
      options.force = true;
    } else if (!arg.startsWith("--") && !arg.startsWith("http")) {
      options.query += (options.query ? " " : "") + arg;
    } else if (arg.startsWith("http")) {
      options.urls.push(arg);
    }
  }

  options.search = options.search || (options.query && options.urls.length === 0 && !options.transcribeOnly);
  if (!options.search) {
    options.download = options.download || options.extractAudio || options.subtitles;
  }

  return options;
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

async function downloadVideos(videos, indices, options, skipDownload = false) {
  const timestamp = getTimestamp();
  ensureDir(CONFIG.DEFAULT_OUTPUT_DIR);
  console.log(`\n  输出目录: ${CONFIG.DEFAULT_OUTPUT_DIR}`);

  const sessionDir = join(CONFIG.DEFAULT_OUTPUT_DIR, timestamp);
  ensureDir(sessionDir);
  console.log(`  时间戳目录: ${sessionDir}\n`);

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

    const safeTitle = video.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50);
    const videoDir = join(sessionDir, `${safeTitle}_${video.id}`);
    ensureDir(videoDir);

    try {
      console.log(`\n  开始 / Start: ${video.title}`);

      let mp3Path = null;
      let existingAudio = null;

      if (skipDownload) {
        const audioFile = await findAudioFile(videoDir);
        if (audioFile) {
          existingAudio = audioFile;
          console.log(`    已找到音频文件 / Found audio: ${audioFile.split('/').pop()}`);
        }
      }

      if (!existingAudio) {
        if (skipDownload) {
          console.log(`    ⚠️  未找到音频文件，跳过下载`);
        } else {
          await downloadVideo(video, videoDir);
          console.log(`    视频下载完成 / Video downloaded`);
        }

        mp3Path = await downloadMp3(video.url, videoDir, video.title);
        console.log(`    MP3 下载完成 / MP3 downloaded`);
      } else {
        mp3Path = existingAudio;
      }

      if (options.subtitles && !skipDownload) {
        try {
          await downloadSubtitles(video.url, videoDir, options.lang);
          console.log(`    字幕下载完成 / Subtitles downloaded (${options.lang})`);
        } catch (err) {
          console.log(`    ⚠️  字幕下载失败 / Subtitles failed: ${err.message}`);
        }
      }

      if (!skipDownload) {
        const videoInfo = await getVideoInfo(video.url);
        const introMd = generateIntroMd(videoInfo, video.url);
        const safeTitle = video.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50);
        writeFileSync(join(videoDir, `${safeTitle}-info.md`), introMd);
        console.log(`    简介.md 生成完成 / Intro generated`);
      }

      let transcriptSource = null;

      if (options.subtitles || getSiliconFlowApiKey()) {
        console.log(`    尝试获取字幕... / Fetching subtitles...`);

        let subsDownloaded = false;
        if (options.subtitles) {
          try {
            await downloadSubtitles(video.url, videoDir, options.lang);
            console.log(`    ✓ 字幕下载成功 / Subtitles downloaded (${options.lang})`);
            subsDownloaded = true;
          } catch (err) {
            console.log(`    ⚠️  字幕下载失败，无字幕可用 / No subtitles available`);
          }
        }

        if (!subsDownloaded && getSiliconFlowApiKey()) {
          console.log(`    启用 ASR 转写 / Using ASR transcription...`);
          const audioAnalysis = diagnoseAudioFile(mp3Path);
          let fullTranscript = "";

          if (audioAnalysis.needsChunking) {
            console.log(`    ⚠️  ${audioAnalysis.issues.map(i => i.message).join("; ")}`);
            const chunks = await chunkAudio(mp3Path, videoDir);
            console.log(`    已分割为 ${chunks.length} 个片段 / Split into ${chunks.length} chunks`);

            for (let i = 0; i < chunks.length; i++) {
              console.log(`    转写第 ${i + 1}/${chunks.length} 个片段...`);
              const result = await transcribeAudio(chunks[i]);
              const { success, text } = getTranscriptionResult(result);
              if (success) fullTranscript += text + "\n";
            }
          } else {
            console.log(`    正在转写语音... / Transcribing...`);
            const result = await transcribeAudio(mp3Path);
            const { success, text } = getTranscriptionResult(result);
            if (success) fullTranscript = text;
          }

          if (fullTranscript) {
            const title = video.title || "Video Transcript";
            const videoUrl = video.url;
            let mdContent = await formatTranscriptMd(fullTranscript.trim(), title, videoUrl, {
              duration: video.duration,
              viewCount: video.viewCount
            });

            const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50);
            writeFileSync(join(videoDir, `${safeTitle}-srt.md`), mdContent);
            console.log(`    语音文字稿.md 生成完成 / Transcript generated`);
            transcriptSource = "ASR";
          }
        } else if (subsDownloaded) {
          const subsPath = join(videoDir, `${options.lang}.vtt`);
          if (existsSync(subsPath)) {
            console.log(`    字幕文件已保存 / Subtitles saved: ${options.lang}.vtt`);
            transcriptSource = "subs";
          }
        }
      } else if (!getSiliconFlowApiKey()) {
        console.log(`    ⚠️  未设置 API Key，跳过转写 / No API key, skipping transcription`);
      }

      log[logId].status = "completed";
      log[logId].endTime = new Date().toISOString();
      saveDownloadLog(log);
      results.push({ success: true, video, dir: videoDir });
      console.log(`  ✓ 完成 / Done: ${video.title}`);
    } catch (error) {
      log[logId].status = "failed";
      log[logId].error = error.message;
      saveDownloadLog(log);
      results.push({ success: false, video, error: error.message });
      console.log(`  ✗ 失败 / Failed: ${video.title} - ${error.message}`);
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

  const safeTitle = results[0]?.video.title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 40) || "video";
  md += `
## 目录结构

\`\`\`
downloads/
└── ${timestamp}/
    └── ${safeTitle}_${results[0]?.video.id || 'id'}/
        ├── ${safeTitle}-info.md
        ├── ${safeTitle}-srt.md
        ├── ${safeTitle}.webm
        └── ${safeTitle}.mp3
\`\`\`

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
  console.log("Video Searcher - 视频搜索与下载工作流 / Video Search & Download");
  console.log("=".repeat(60));

  const depsOk = await checkDependencies();
  if (!depsOk) {
    process.exit(1);
  }

  checkApiKey();

  if (!options.query && options.urls.length === 0 && !options.transcribeOnly) {
    console.log("\nUsage: node workflow.js <query> [options]");
    console.log("       node workflow.js <url> [options]");
    console.log("       node workflow.js <video_dir> --transcribe-only");
    console.log("");
    console.log("Options:");
    console.log("  --search, -s        搜索视频 / Search videos");
    console.log("  --download, -d      下载视频 / Download video");
    console.log("  --limit N, -n       搜索结果数量 (默认: 5)");
    console.log("  --extract-audio, -x 提取音频 (MP3)");
    console.log("  --subtitles, --subs 下载字幕 / Download subtitles");
    console.log("  --transcribe-only, -t  只转写已有音频 / Transcribe existing audio only");
    console.log("  --lang LANG         字幕语言 (默认: en)");
    console.log("  --format FORMAT     视频格式");
    console.log("  --output DIR        输出目录");
    console.log("  --yes, -y           跳过确认，直接下载第 1 个");
    console.log("");
    console.log("Examples:");
    console.log("  node workflow.js Python 教程 --search");
    console.log("  node workflow.js Python 教程 --search --download");
    console.log("  node workflow.js Python 教程 --extract-audio --yes");
    console.log("  node workflow.js downloads/1_xxx --transcribe-only");
    process.exit(1);
  }

  if (options.transcribeOnly) {
    const { existsSync } = await import("fs");
    if (!existsSync(options.query)) {
      console.log(`\n⚠️  目录不存在 / Directory not found: ${options.query}`);
      process.exit(1);
    }
    console.log(`\n  只转写模式 / Transcribe only mode`);
    console.log(`  目录 / Directory: ${options.query}`);

    const audioFile = await findAudioFile(options.query);
    if (!audioFile) {
      console.log(`  ⚠️  未找到音频文件 / No audio file found`);
      process.exit(1);
    }

    console.log(`  找到音频 / Found audio: ${audioFile.split('/').pop()}`);

    if (getSiliconFlowApiKey()) {
      const { readFileSync, readdirSync: rd } = await import("fs");
      const title = options.query.split('/').pop();
      console.log(`  正在转写... / Transcribing...`);
      const result = await transcribeAudio(audioFile);
      const { success, text } = getTranscriptionResult(result);

      if (success) {
        let videoTitle = title;
        try {
          const entries = rd(options.query);
          const infoFile = entries.find(e => e.includes('视频简介') || e.includes('info') || e.includes('intro'));
          if (infoFile) {
            const content = readFileSync(join(options.query, infoFile), "utf-8");
            const match = content.match(/^# (.+)$/m);
            if (match) videoTitle = match[1];
          }
        } catch {}

        const mdContent = await formatTranscriptMd(text.trim(), videoTitle, "");
        const safeTitle = videoTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50);
        writeFileSync(join(options.query, `${safeTitle}-srt.md`), mdContent);
        console.log(`  ✓ ${safeTitle}-srt.md 已生成`);
      } else {
        console.log(`  ✗ 转写失败 / Transcription failed`);
      }
    } else {
      console.log(`  ⚠️  未设置 API Key`);
    }

    console.log("=".repeat(60));
    console.log("完成! / Done!");
    console.log("=".repeat(60));
    return;
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
      videos = await searchVideos(options.query, options.limit);
      displayVideos(videos);

      if (options.download) {
        if (options.force || options.limit === 1) {
          console.log(`  (自动模式: 下载第 1 个 / Auto mode: download #1)`);
          await downloadVideos(videos, [0], options);
        } else {
          const indices = await askUserChoice(videos);
          if (indices.length > 0) {
            await downloadVideos(videos, indices, options);
          } else {
            console.log("  已取消下载 / Cancelled");
          }
        }
      }
    } catch (error) {
      console.error(`搜索失败 / Search failed: ${error.message}`);
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
  console.log("完成! / Done!");
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(`错误: ${error.message}`);
  process.exit(1);
});
