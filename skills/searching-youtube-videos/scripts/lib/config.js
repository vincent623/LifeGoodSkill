#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export const CONFIG = {
  SKILL_DIR: "",
  PROJECT_ROOT: "",
  DEFAULT_OUTPUT_DIR: "downloads",
  DOWNLOAD_LOG: ".downloads.json",
  SILICON_FLOW_API_URL: "https://api.siliconflow.cn/v1/audio/transcriptions",
  TRANSCRIPTION_MODEL: "FunAudioLLM/SenseVoiceSmall",
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  MAX_AUDIO_DURATION: 3600,
  CHUNK_DURATION: 1800,
};

export function getTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
}

export function getSiliconFlowApiKey() {
  return process.env.SILICON_FLOW_API_KEY || "";
}

export function getDownloadLog() {
  try {
    if (existsSync(CONFIG.DOWNLOAD_LOG)) {
      return JSON.parse(readFileSync(CONFIG.DOWNLOAD_LOG, "utf-8"));
    }
  } catch {}
  return {};
}

export function saveDownloadLog(log) {
  writeFileSync(CONFIG.DOWNLOAD_LOG, JSON.stringify(log, null, 2));
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "N/A";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatViewCount(count) {
  if (!count) return "N/A";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}
