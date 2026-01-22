---
name: life-text-proofreader
description: Professional Chinese text proofreader that identifies and corrects typos, grammatical errors, and punctuation issues. Provides clear explanations for each correction. Use when user needs to polish Chinese writing, check essays, or review documents.
---

# Chinese Text Proofreader

Automatically detect and correct typos, grammar, and punctuation errors in Chinese text.

## Usage

```bash
# Proofread text
/life-text-proofreader

# Paste your Chinese text when prompted
# Corrections will be shown in table format
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
| 原文 | 改后 | 修改理由 |
|------|------|----------|
| 我今天非常高性的 | 我今天非常高兴 | 错别字 |
| 我去过北京．上海 | 我去过北京，上海 | 标点错误 |
```

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-text-proofreader/EXTEND.md` (project)
2. `~/.life-good-skill/life-text-proofreader/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
