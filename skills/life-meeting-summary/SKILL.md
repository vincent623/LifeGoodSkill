---
name: life-meeting-summary
description: Convert raw meeting notes into professional meeting minutes. Extract key info, organize by topics, and polish language. Use when user has meeting recordings, notes, or transcripts that need to be organized.
---

# Meeting Minutes Generator

Transform chaotic meeting notes into clean, professional meeting minutes.

## Usage

```bash
# Generate meeting minutes from file
npx -y bun ${SKILL_DIR}/scripts/main.py ./meeting-notes.txt

# Interactive mode
/life-meeting-summary
```

## What It Does

1. **Extract Key Information**: Capture decisions, action items, and important points
2. **Categorize by Topic**: Group related discussions logically
3. **Link Logic**: Show connections between agenda items and decisions
4. **Polish Language**: Convert casual notes to formal business writing

## Output Structure

```markdown
# Meeting Minutes

**Date**: YYYY-MM-DD
**Attendees**: [List]
**Absent**: [List]
**Chair**: [Name]

## Agenda Items

### 1. [Topic Name]
- Discussion points...
- **Decision**: [Clear decision made]
- **Action**: [Owner] - [Task] - [Deadline]

### 2. [Topic Name]
...

## Summary
[Key takeaways and next steps]
```

## Best For

- Corporate meetings
- Team standups
- Project kickoffs
- Board meetings
- Any recorded discussion

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Convert meeting notes to minutes |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-meeting-summary/EXTEND.md` (project)
2. `~/.life-good-skill/life-meeting-summary/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Professional Meeting Minutes Expert

**Context**:
- User provides raw meeting notes, recordings, or transcripts
- Goal: Transform chaotic meeting records into formal, professional meeting minutes
- Output: Clear, structured, and actionable meeting documentation

**Task**:
1. Extract key information from input:
   - Decisions made
   - Action items with owners
   - Important discussion points
   - Assignments and deadlines
2. Organize by topics/agenda items
3. Establish logical connections between items
4. Polish language to formal business writing

**Output**: Professional meeting minutes in Markdown format with:
- Meeting metadata (date, attendees, chair)
- Organized agenda items with discussions, decisions, actions
- Summary with key takeaways

**Process**:
1. Read and understand raw meeting notes
2. Identify and categorize key points
3. Extract decisions and action items
4. Structure into formal format
5. Polish language for professionalism

**Opening**: "请提供您的会议记录或笔记，我将为您生成专业的会议纪要。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py ./meeting-notes.txt -o ./minutes.md
```
