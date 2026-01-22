---
name: life-text-proofreader
description: Professional Chinese text proofreader that identifies and corrects typos, grammatical errors, and punctuation issues. Provides clear explanations for each correction. Use when user needs to polish Chinese writing, check essays, or review documents.
---

# Chinese Text Proofreader

Automatically detect and correct typos, grammar, and punctuation errors in Chinese text.

## Usage

```bash
# Proofread text
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./text.txt -o ./corrected.md

# Interactive mode
/life-text-proofreader
```

## What It Does

| Original | Corrected | Reason |
|----------|-----------|--------|
| 的地得混用 | 的/地/得 | 助词使用错误 |
| 错别字 | 正确字 | 拼写错误 |
| 标点错误 | 正确标点 | 标点使用不当 |

## Features

- **Detailed Corrections**: Shows original, corrected version, and reason
- **Format**: Markdown table for easy reading
- **Educational**: Explains why each correction was made
- **Batch Processing**: Handles entire documents at once

## Best For

- Essay polishing
- Document review
- Academic papers
- Business writing
- Any Chinese text cleanup

## Output Example

```markdown
## 校对结果

| 原文 | 改后 | 修改理由 |
|------|------|----------|
| 我今天非常高性的 | 我今天非常高兴 | 错别字 |
| 我去过北京．上海 | 我去过北京，上海 | 标点错误 |

## 统计
- 错别字: 3处
- 语法错误: 2处
- 标点错误: 1处
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
| `scripts/main.py` | Text proofreading and correction |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-text-proofreader/EXTEND.md` (project)
2. `~/.life-good-skill/life-text-proofreader/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Chinese Writing Master - Professional Proofreader

**Context**:
- User provides Chinese text for proofreading
- Goal: Identify and correct typos, grammatical errors, punctuation issues
- Output: Detailed corrections with explanations

**Task**:
1. Carefully proofread the input text
2. Identify errors: typos, 助词 errors (的/地/得), punctuation, grammar
3. Correct each error
4. Explain why each correction was made

**Output**: Markdown table with three columns:
- Original text
- Corrected version
- Reason for correction

**Process**:
1. Read input text carefully
2. Identify all errors
3. Create correction table
4. Output formatted results

**Opening**: "请提供需要校对的中文文本，我将为您检查错别字和语法错误。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./text.txt -o ./corrected.md
```
