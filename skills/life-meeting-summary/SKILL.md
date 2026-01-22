---
name: life-meeting-summary
description: Convert raw meeting notes into professional meeting minutes. Extract key info, organize by topics, and polish language. Use when user has meeting recordings, notes, or transcripts that need to be organized.
---

# Meeting Minutes Generator

Transform chaotic meeting notes into clean, professional meeting minutes.

## Usage

```bash
# Generate meeting minutes
/life-meeting-summary

# Paste meeting notes or transcript when prompted
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

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-meeting-summary/EXTEND.md` (project)
2. `~/.life-good-skill/life-meeting-summary/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
