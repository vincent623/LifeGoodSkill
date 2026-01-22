#!/usr/bin/env bun
/**
 * File Organizer - Automatic file classification and organization
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from "fs";
import { join, dirname, extname, parse } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, "..");

const FILE_CATEGORIES = {
  Documents: [".pdf", ".doc", ".docx", ".txt", ".md", ".xlsx", ".pptx", ".csv", ".rtf"],
  Images: [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".psd", ".ai", ".fig"],
  Videos: [".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv"],
  Audio: [".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg", ".wma"],
  Archives: [".zip", ".7z", ".tar", ".gz", ".rar", ".bz2", ".xz"],
  Code: [".js", ".ts", ".py", ".html", ".css", ".json", ".xml", ".yaml", ".yml", ".go", ".rs", ".java"],
  Executables: [".exe", ".dmg", ".app", ".pkg", ".deb", ".rpm", ".apk"],
};

const MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

function getCategory(filename) {
  const ext = extname(filename).toLowerCase();
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if (extensions.includes(ext)) return category;
  }
  return "Other";
}

function getFileHash(filepath) {
  try {
    const content = readFileSync(filepath);
    return createHash("md5").update(content).digest("hex");
  } catch {
    return null;
  }
}

function getMonthName(date) {
  return MONTHS[date.getMonth()];
}

function organizeByType(targetDir, options = {}) {
  const { dryRun = false, verbose = true } = options;
  const results = { moved: [], skipped: [], duplicates: [] };
  const files = [];

  if (!existsSync(targetDir)) {
    console.log(`❌ Directory not found: ${targetDir}`);
    return results;
  }

  const items = readdirSync(targetDir);
  for (const item of items) {
    const fullPath = join(targetDir, item);
    if (statSync(fullPath).isFile()) {
      files.push({ name: item, path: fullPath });
    }
  }

  for (const file of files) {
    const category = getCategory(file.name);
    const targetFolder = join(targetDir, category);

    if (!existsSync(targetFolder) && !dryRun) {
      mkdirSync(targetFolder, { recursive: true });
    }

    const targetPath = join(targetFolder, file.name);
    const exists = existsSync(targetPath);

    if (exists && file.path !== targetPath) {
      const srcHash = getFileHash(file.path);
      const tgtHash = getFileSync(targetPath);
      if (srcHash === tgtHash) {
        results.duplicates.push({ original: file.path, duplicate: targetPath });
        if (verbose) console.log(`🔄 Duplicate: ${file.name}`);
      }
    }

    if (!exists || file.path !== targetPath) {
      results.moved.push({ from: file.path, to: targetPath });
      if (verbose) console.log(`📁 ${dryRun ? "[DRY] " : ""}${file.name} → ${category}/`);
      if (!dryRun) {
        cpSync(file.path, targetPath);
        rmSync(file.path);
      }
    } else {
      results.skipped.push(file.name);
    }
  }

  return results;
}

function organizeByDate(targetDir, options = {}) {
  const { dryRun = false, verbose = true } = options;
  const results = { moved: [], created: [] };
  const files = [];

  if (!existsSync(targetDir)) {
    console.log(`❌ Directory not found: ${targetDir}`);
    return results;
  }

  const items = readdirSync(targetDir);
  for (const item of items) {
    const fullPath = join(targetDir, item);
    if (statSync(fullPath).isFile()) {
      const stats = statSync(fullPath);
      const date = stats.mtime || stats.birthtime;
      const year = date.getFullYear().toString();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const monthName = getMonthName(date);

      files.push({ name: item, path: fullPath, year, month, monthName });
    }
  }

  for (const file of files) {
    const yearFolder = join(targetDir, file.year);
    const monthFolder = join(yearFolder, `${file.month}-${file.monthName}`);

    for (const folder of [yearFolder, monthFolder]) {
      if (!existsSync(folder) && !dryRun) {
        mkdirSync(folder, { recursive: true });
        results.created.push(folder);
      }
    }

    const targetPath = join(monthFolder, file.name);
    if (file.path !== targetPath) {
      results.moved.push({ from: file.path, to: targetPath });
      if (verbose) console.log(`📁 ${dryRun ? "[DRY] " : ""}${file.name} → ${file.year}/${file.month}-${file.monthName}/`);
      if (!dryRun) {
        cpSync(file.path, targetPath);
        rmSync(file.path);
      }
    }
  }

  return results;
}

function findDuplicates(targetDir, options = {}) {
  const { verbose = true, deleteDuplicates = false } = options;
  const hashMap = new Map();
  const duplicates = [];

  if (!existsSync(targetDir)) {
    console.log(`❌ Directory not found: ${targetDir}`);
    return duplicates;
  }

  const items = readdirSync(targetDir);
  const files = [];

  for (const item of items) {
    const fullPath = join(targetDir, item);
    if (statSync(fullPath).isFile()) {
      files.push({ name: item, path: fullPath });
    }
  }

  for (const file of files) {
    const hash = getFileHash(file.path);
    if (hash) {
      if (hashMap.has(hash)) {
        duplicates.push({ original: hashMap.get(hash), duplicate: file.path });
        if (verbose) console.log(`🔄 Duplicate found: ${file.name}`);
        if (deleteDuplicates) {
          rmSync(file.path);
          if (verbose) console.log(`🗑️ Deleted: ${file.name}`);
        }
      } else {
        hashMap.set(hash, file.path);
      }
    }
  }

  return duplicates;
}

async function main() {
  const args = process.argv.slice(2);
  const targetDir = args.find(a => !a.startsWith("-")) || ".";
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const mode = args.find(a => a.startsWith("--mode="))?.split("=")[1] || "type";
  const verbose = !args.includes("--quiet");

  console.log(`\n📂 File Organizer`);
  console.log(`   Target: ${targetDir}`);
  console.log(`   Mode: ${mode}`);
  console.log(`   Dry Run: ${dryRun ? "Yes" : "No"}`);
  console.log("");

  let results;
  if (mode === "type") {
    results = organizeByType(targetDir, { dryRun, verbose });
  } else if (mode === "date") {
    results = organizeByDate(targetDir, { dryRun, verbose });
  } else if (mode === "duplicates") {
    results = findDuplicates(targetDir, { verbose, deleteDuplicates: args.includes("--delete") });
  } else {
    console.log(`Unknown mode: ${mode}`);
    return;
  }

  console.log("\n📊 Summary");
  console.log(`   Moved: ${results.moved?.length || 0}`);
  console.log(`   Duplicates: ${results.duplicates?.length || 0}`);
  if (results.created) console.log(`   Folders Created: ${results.created.length}`);

  if (dryRun) {
    console.log("\n⚠️ This was a dry run. Run without --dry-run to apply changes.");
  } else {
    console.log("\n✅ Organization complete!");
  }
}

main().catch(console.error);
