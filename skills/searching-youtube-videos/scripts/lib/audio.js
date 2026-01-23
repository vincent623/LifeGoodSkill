#!/usr/bin/env node
import { spawn } from "child_process";
import { statSync, existsSync, mkdirSync, unlinkSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function getAudioDuration(audioPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      audioPath,
    ], { stdio: "pipe" });

    let output = "";
    proc.stdout.on("data", (d) => (output += d.toString()));
    proc.on("close", (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        resolve(isNaN(duration) ? null : duration);
      } else {
        resolve(null);
      }
    });
    proc.on("error", () => resolve(null));
  });
}

export async function getAudioInfo(audioPath) {
  const stats = statSync(audioPath);
  const duration = await getAudioDuration(audioPath);

  return {
    path: audioPath,
    size: stats.size,
    sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
    duration: duration,
    durationStr: duration ? formatDuration(duration) : "未知",
    needsChunking: false,
    reasons: [],
  };
}

export function diagnoseAudioFile(audioPath) {
  const stats = statSync(audioPath);
  const issues = [];

  if (stats.size > 50 * 1024 * 1024) {
    issues.push({ type: "size", message: `文件大小 ${(stats.size / (1024 * 1024)).toFixed(2)}MB 超过 50MB 限制` });
  }

  return {
    path: audioPath,
    size: stats.size,
    sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
    issues,
    needsChunking: issues.length > 0,
  };
}

function formatDuration(seconds) {
  if (!seconds) return "未知";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function chunkAudio(audioPath, outputDir, maxDuration = 1800) {
  const baseName = audioPath.split("/").pop().replace(/\.[^.]+$/, "");
  const chunksDir = join(outputDir, `${baseName}_chunks`);
  ensureDir(chunksDir);

  const duration = await getAudioDuration(audioPath);
  if (!duration) throw new Error("无法获取音频时长");

  const chunkCount = Math.ceil(duration / maxDuration);
  const chunks = [];

  for (let i = 0; i < chunkCount; i++) {
    const startTime = i * maxDuration;
    const chunkPath = join(chunksDir, `${baseName}_part${i + 1}.mp3`);

    console.log(`    切割音频块 ${i + 1}/${chunkCount}...`);

    await new Promise((resolve, reject) => {
      const proc = spawn("ffmpeg", [
        "-i", audioPath,
        "-ss", String(startTime),
        "-t", String(Math.min(maxDuration, duration - startTime)),
        "-codec:a", "libmp3lame",
        "-q:a", "2",
        "-y",
        chunkPath,
      ], { stdio: "pipe" });

      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`切割失败，退出码: ${code}`));
      });
    });

    chunks.push(chunkPath);
  }

  return chunks;
}

export async function transcribeWithChunking(audioPath, transcribeFn, onProgress) {
  const info = await getAudioInfo(audioPath);
  const maxSize = 50 * 1024 * 1024;
  const maxDuration = 3600;

  if (info.size <= maxSize && info.duration <= maxDuration) {
    return await transcribeFn(audioPath);
  }

  console.log(`    ⚠️  音频文件较大，启用分块转写...`);
  if (info.size > maxSize) {
    console.log(`    文件大小: ${info.sizeMB}MB`);
  }
  if (info.duration > maxDuration) {
    console.log(`    音频时长: ${info.durationStr}`);
  }

  const chunks = await chunkAudio(audioPath, dirname(audioPath));
  console.log(`    共 ${chunks.length} 个音频块`);

  let fullTranscript = "";
  for (let i = 0; i < chunks.length; i++) {
    console.log(`    转写第 ${i + 1}/${chunks.length} 块...`);
    const text = await transcribeFn(chunks[i]);
    if (text) fullTranscript += text + "\n";
    if (onProgress) onProgress((i + 1) / chunks.length);

    if (i > 0) {
      try { unlinkSync(chunks[i - 1]); } catch {}
    }
  }

  try { unlinkSync(chunks[chunks.length - 1]); } catch {}
  const chunksDir = chunks[0].replace(/\/[^/]+$/, "_chunks");
  try { if (existsSync(chunksDir)) { const files = readdirSync(chunksDir); if (files.length === 0) unlinkSync(chunksDir); } } catch {}

  return fullTranscript.trim();
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}
