---
name: life-transcription
description: Transcription cleanup and organization tools for audio content. Includes meeting summary, interview analysis, and content structuring. Use when user has transcripts, recordings, or audio content that needs organization.
---

# Transcription Assistant

Clean up, organize, and extract insights from transcription content.

## Usage

```bash
# Process a transcript
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./transcript.txt -o ./organized.md

# Interactive mode
/life-transcription
```

## Tools Available

### Meeting Summary
Generate structured summaries from meeting transcripts with key decisions and action items.

### Interview Analysis
Extract insights from interview transcripts including themes, sentiment, and key quotes.

### Content Structuring
Organize raw transcription into clear, readable documents.

## What You Get

- **Clean Formatting**: Remove filler words, correct errors
- **Structured Output**: Clear hierarchy with headings and sections
- **Key Insights**: Extract main points, decisions, and action items
- **Sentiment Analysis**: Understand tone and emotional context

## Best For

- Meeting notes organization
- Interview summaries
- Podcast show notes
- Lecture notes
- Content repurposing

## Output Structure

```markdown
# 转录整理结果

## 概要
[核心内容总结]

## 结构化内容
### 章节1
- 内容...
### 章节2
- 内容...

## 关键要点
- 点1
- 点2

## 行动项
- [Owner] 任务 - 截止时间
```

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Transcription cleanup and organization |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-transcription/EXTEND.md` (project)
2. `~/.life-good-skill/life-transcription/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Professional Transcription Editor

**Context**:
- User provides raw transcript from audio/recording
- Goal: Transform into polished, structured written document
- Preserve meaning while improving readability

**Task**:
1. Clean up transcription:
   - Remove speaker identifiers and timestamps
   - Fix typos and grammatical errors
   - Convert to first-person narrative if needed
2. Organize content:
   - Structure with clear headings
   - Group related content
   - Highlight key points
3. Enhance:
   - Convert口语 to 书面语
   - Preserve emotion and emphasis
   - Add descriptive language where appropriate

**Output**: Structured document with:
- Summary/overview
- Organized sections
- Key insights
- Action items (if applicable)

**Process**:
1. Read raw transcript
2. Clean and correct
3. Structure content
4. Polish language

**Opening**: "请提供您的录音稿或转录内容，我将为您整理成规范的书面语文档。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./transcript.txt -o ./organized.md
```
