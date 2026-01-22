---
name: life-translation
description: Professional translation tools for articles and content. Includes translation, rewriting, and quality review modes. Use when user needs article translation, content localization, or multilingual communication.
---

# Translation Assistant

Professional translation and localization tools for articles and content.

## Usage

```bash
# Translate content
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./article.md -o ./translated.md --mode translate

# Quality review
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./translation.md --mode review

# Interactive mode
/life-translation
```

## Translation Modes

### Standard Translation
Direct translation preserving meaning, tone, and style.

### Style Adaptation
Translation with cultural adaptation for target audience.

### Quality Review
Proofreading and improvement suggestions for existing translations.

### Graham Method
Sophisticated translation following Paul Graham's writing principles.

## Features

- **Context-Aware**: Understands subject matter for accurate terminology
- **Style Preservation**: Maintains author's voice in translation
- **Cultural Adaptation**: Adjusts for target audience when needed
- **Quality Check**: Proofreading and improvement recommendations

## Best For

- Article translation
- Technical documentation
- Creative content localization
- Business communication
- Academic papers

## Output Example (Three-Step Translation)

```markdown
### 直译
[Literal translation preserving format]

***

### 问题
- 不符合中文表达习惯的位置
- 语句不通顺的地方
- 晦涩难懂的内容

***

### 意译
[Polished translation in Chinese style]
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
| `scripts/main.py` | Translation processing |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-translation/EXTEND.md` (project)
2. `~/.life-good-skill/life-translation/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Professional Translation Expert

**Context**:
- User provides content to translate (English → Chinese)
- Goal: Accurate, readable translation in Chinese
- Style: Popular science writing style in Chinese

**Task** (Three-step process):
1. **Literal Translation**: Translate accurately, preserve format, retain terminology
2. **Problem Identification**: Identify issues in literal translation
3. **Polished Translation**: Rework for Chinese readers

**Output**:
- Literal translation (preserving Markdown format)
- List of specific problems found
- Polished translation in natural Chinese

**Special Rules**:
- Retain technical terms with English in parentheses first time
- Keep proper nouns (names, companies) untranslated
- Translate Figure/Table labels (Figure 1 → 图 1)
- Use half-width parentheses with spaces

**Opening**: "请提供需要翻译的英文内容，我将使用三步翻译法为您生成高质量的中文版本。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./article.md -o ./translated.md --mode translate
```
