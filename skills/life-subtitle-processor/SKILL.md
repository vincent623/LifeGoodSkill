---
name: life-subtitle-processor
description: Convert video subtitles to structured knowledge slices with format conversion and semantic segmentation. Use when user needs to process subtitles, extract knowledge points, or convert SRT to JSON.
---

# Subtitle Processor

Transform raw video subtitles into structured knowledge slices.

## Usage

```bash
# Process subtitle file
/life-subtitle-processor ./video.srt

# Full pipeline with semantic slicing
/life-subtitle-processor ./video.srt --semantic
```

## What It Does

```
SRT Subtitle → Markdown → Knowledge Slices → JSON
```

## Two Modes

| Mode | Speed | Quality | API Required |
|------|-------|---------|--------------|
| **Rule Engine** | Fast | Good | No |
| **LLM Semantic** | Slow | Excellent | Yes |

## Output Format

```json
{
  "source_file": "video.srt",
  "total_duration_seconds": 2100,
  "slice_count": 6,
  "slices": [
    {
      "slice_id": 1,
      "knowledge_type": "concept",
      "start_time": "00:00:00",
      "end_time": "00:10:00",
      "content": "..."
    }
  ]
}
```

## Best For

- Educational video processing
- Knowledge extraction
- Content repurposing
- Study note generation

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/batch_slicer.py` | Process subtitles and create knowledge slices |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-subtitle-processor/EXTEND.md` (project)
2. `~/.life-good-skill/life-subtitle-processor/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Content Knowledge Extraction Expert

**Context**:
- User provides video subtitles (SRT/VTT format)
- Goal: Convert raw subtitles into structured knowledge slices
- Output: JSON/Markdown with semantic segmentation

**Task**:
1. Parse subtitle file (SRT format)
2. Extract text content and timestamps
3. Apply segmentation strategy:
   - **Rule Engine**: Split by time gaps or line count
   - **LLM Semantic**: Use AI to identify knowledge boundaries
4. Classify slice types (concept, example, exercise, summary)
5. Generate structured output

**Output**:
- `output.json` with knowledge slices
- Each slice: ID, type, timestamp, content
- Optional: Markdown export for Obsidian/Logseq

**Process**:
1. Load and parse subtitle file
2. Clean text (remove HTML tags, normalize spacing)
3. Split into logical segments:
   - Rule mode: Based on time duration or line count
   - LLM mode: Semantic topic boundaries
4. Classify each segment's knowledge type
5. Export as structured JSON

**Opening**: "请提供视频字幕文件（SRT 格式），我将提取知识点并生成结构化的知识切片。"

**Script Usage**:
```bash
/life-subtitle-processor ./video.srt              # 规则引擎模式
/life-subtitle-processor ./video.srt --semantic   # LLM语义分割模式
```
