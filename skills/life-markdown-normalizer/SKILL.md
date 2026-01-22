---
name: life-markdown-normalizer
description: Standardize markdown notes with unified timestamp naming, YAML frontmatter, and intelligent tag generation. Use when user needs to organize notes, add metadata, or prepare for Obsidian/Logseq.
---

# Markdown Notes Normalizer

Automatically organize and standardize your markdown note collection.

## Usage

```bash
# Normalize notes in current directory
/life-markdown-normalizer

# Normalize specific directory
/life-markdown-normalizer ./notes/
```

## What It Does

| Before | After |
|--------|-------|
| 混乱的文件名 | `20260122153000.md` |
| 缺少元数据 | 完整YAML frontmatter |
| 无标签 | 智能生成的3个标签 |
| 不一致的格式 | 统一的Markdown格式 |

## Features

- **Smart Renaming**: Timestamp-based naming
- **YAML Auto-Complete**: Title, dates, tags
- **Conflict Resolution**: Sequential suffixes for duplicates
- **Change Log**: Records all modifications

## Output Structure

```
notes/
├── 20260122153000.md    # Normalized file
├── 20260122153001.md    # Conflict resolved
└── changelog/           # Detailed change log
```

## Best For

- Personal knowledge management
- Obsidian/Logseq preparation
- Note collection organization
- Digital garden maintenance

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/normalize_notes.py` | Normalize markdown notes with timestamps and YAML |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-markdown-normalizer/EXTEND.md` (project)
2. `~/.life-good-skill/life-markdown-normalizer/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
