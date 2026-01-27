#!/usr/bin/env node
import { spawn } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { CONFIG, getTimestamp, formatDuration, formatViewCount } from "./config.js";

export async function searchVideos(query, limit = 10) {
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

export function displayVideos(videos) {
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

export async function downloadVideo(video, outputDir, onProgress) {
  mkdirSync(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", [
      "-o", join(outputDir, "%(title)s.%(ext)s"),
      video.url,
    ], { stdio: "pipe" });

    let lastPercent = -1;

    proc.stdout.on("data", (d) => {
      const text = d.toString();
      const downloadMatch = text.match(/\[download\]\s+(\d+\.?\d*)%/);
      if (downloadMatch) {
        const percent = Math.floor(parseFloat(downloadMatch[1]));
        if (percent !== lastPercent && percent % 10 === 0) {
          if (onProgress) onProgress(percent);
          lastPercent = percent;
        }
      }
    });

    proc.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`下载失败，退出码: ${code}`));
    });
  });
}

export async function downloadMp3(url, outputDir, title) {
  const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_').slice(0, 50);
  const expectedPath = join(outputDir, `${safeTitle}.mp3`);

  return new Promise((resolve, reject) => {
    const args = [
      "-x", "--audio-format", "mp3",
      "-o", join(outputDir, `${safeTitle}.%(ext)s`),
      url,
    ];
    const proc = spawn("yt-dlp", args, { stdio: "pipe" });
    proc.on("close", (code) => {
      if (code === 0) resolve(expectedPath);
      else reject(new Error(`MP3 下载失败，退出码: ${code}`));
    });
  });
}

export async function downloadSubtitles(url, outputDir, lang = "en") {
  const subsPath = join(outputDir, `${lang}.vtt`);

  return new Promise((resolve, reject) => {
    const args = [
      "--write-subs",
      "--sub-lang", lang,
      "--sub-format", "vtt",
      "-o", join(outputDir, "%(title)s.%(ext)s"),
      url,
    ];
    const proc = spawn("yt-dlp", args, { stdio: "pipe" });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve({ path: subsPath, lang });
      } else {
        reject(new Error(`字幕下载失败，退出码: ${code}`));
      }
    });
  });
}

export async function getVideoInfo(url) {
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

export function generateIntroMd(info, url) {
  return `# ${info.title}

## Basic Info / 基本信息

- **Link / 链接**: ${url}
- **Author / 作者**: ${info.uploader}
- **Upload Date / 上传日期**: ${info.uploadDate}
- **Views / 观看次数**: ${info.viewCount.toLocaleString()}
- **Duration / 时长**: ${info.duration}

## Tags / 标签

${info.tags ? info.tags.split(',').map(t => `- ${t.trim()}`).join('\n') : 'None / 无'}

## Description / 内容简介

${info.description || 'No description / 暂无简介'}

---

*Generated by video-searcher / 由 video-searcher 自动生成*
`;
}
