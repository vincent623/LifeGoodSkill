---
name: life-pdf-to-ppt
description: Convert PDF pages to editable PowerPoint presentations using AI-powered vectorization. Preserves visual fidelity while making charts and shapes fully editable. Use when user needs to convert PDF documents to PPTX or extract editable graphics.
---

# PDF to Editable PPT Converter

Convert PDF documents into fully editable PowerPoint presentations.

## Usage

```bash
# Convert PDF to PPTX
/life-pdf-to-ppt ./document.pdf

# Batch convert all PDFs
/life-pdf-to-ppt ./pdfs/
```

## What It Does

| Input | Output |
|-------|--------|
| PDF (不可编辑) | PPTX (可编辑) |
| PDF图表 | 可编辑的矢量图形 |
| 单页/多页 | 完整的演示文稿 |

## Processing Pipeline

```
PDF → PNG (2x渲染) → SVG (AI向量化) → EMF → PPTX
```

## Features

- **Vector Graphics**: Charts become editable shapes
- **Batch Processing**: Handle multiple PDFs at once
- **Concurrent Processing**: Fast parallel conversion
- **Error Recovery**: Skip failed pages, continue processing

## Best For

- NotebookLM exports
- Presentation reuse
- Document transformation
- Academic paper conversion

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Convert PDF to editable PPTX |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-pdf-to-ppt/EXTEND.md` (project)
2. `~/.life-good-skill/life-pdf-to-ppt/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
