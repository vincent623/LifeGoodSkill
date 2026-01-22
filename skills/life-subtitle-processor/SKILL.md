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

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-subtitle-processor/EXTEND.md` (project)
2. `~/.life-good-skill/life-subtitle-processor/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
