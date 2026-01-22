---
name: life-file-organizer
description: Automatically organize messy directories by type, date, and custom rules. Detects duplicates, cleans desktop/downloads, and generates organized folder structures. Use when user needs to clean up cluttered directories, organize downloads, or maintain file order.
---

# File Organizer

Automatically organize and clean up your file chaos.

## Usage

```bash
# Organize current directory
/life-file-organizer

# Organize specific directory
/life-file-organizer ./downloads

# Dry run (preview changes)
/life-file-organizer ./desktop --dry-run

# Clean duplicates only
/life-file-organizer --mode duplicates ./folder
```

## What It Does

| Messy State | Organized State |
|-------------|-----------------|
| Desktop chaos | Categorized by type |
| Downloads clutter | Dated subfolders |
| Mixed formats | Organized structure |
| Duplicate files | Deduplicated |

## File Categories

| Category | Extensions |
|----------|------------|
| **Documents** | .pdf, .doc, .docx, .txt, .md, .xlsx, .pptx |
| **Images** | .jpg, .png, .gif, .svg, .webp, .psd |
| **Videos** | .mp4, .mov, .avi, .mkv, .webm |
| **Audio** | .mp3, .wav, .flac, .m4a |
| **Archives** | .zip, .7z, .tar, .gz, .rar |
| **Code** | .js, .ts, .py, .html, .css, .json |
| **Other** | Everything else |

## Organizing Strategies

### By Type
```
folder/
├── Documents/
├── Images/
├── Videos/
├── Archives/
└── Other/
```

### By Date (Year/Month)
```
folder/
├── 2024/
│   ├── 01-January/
│   └── 02-February/
└── 2025/
    └── 01-January/
```

### By Project
```
folder/
├── Project-A/
├── Project-B/
└── Project-C/
```

## Features

- **Auto Classification** - Detect and sort by file type
- **Duplicate Detection** - Find identical files by hash
- **Desktop Cleanup** - Special handling for desktop
- **Downloads Management** - Date-based organization
- **Dry Run** - Preview before applying
- **Undo Support** - Restore original structure

## Best For

- Desktop cleanup
- Downloads folder management
- Project folder organization
- Photo library maintenance
- Document archiving

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Main entry point, orchestration |
| `scripts/classifier.py` | File type detection and classification |
| `scripts/duplicates.py` | Duplicate file finder |
| `scripts/cleaner.py` | Desktop/downloads cleanup |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-file-organizer/EXTEND.md` (project)
2. `~/.life-good-skill/life-file-organizer/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: File Organization Expert

**Context**:
- User provides a messy directory that needs organization
- Goal: Automatically sort files by type, date, or custom rules
- Output: Organized directory structure with moved files

**Task**:
1. Scan directory for all files
2. Classify files by extension/type
3. Apply organizing strategy (type/date/project)
4. Handle duplicates (report or remove)
5. Generate organization report

**Output**: Organized directory with:
- Categorized subfolders
- Moved files (preserving metadata)
- Duplicate report
- Change log

**Process**:
1. Scan and count files
2. Classify into categories
3. Create folder structure
4. Move files (with --dry-run option)
5. Generate report

**Opening**: "请提供需要整理的目录，我将自动分类文件并创建有序的结构。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py ./downloads --strategy date --dry-run
```
