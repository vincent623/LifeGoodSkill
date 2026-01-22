---
name: life-daily-starter
description: Daily workspace launcher that creates timestamped work folders, generates AI briefings from Apple Reminders, and links with Obsidian Daily Notes. Use for morning routine, workspace management, and daily planning integration.
---

# Daily Starter (zw)

Your morning ritual for workspace management and daily planning.

## Usage

```bash
# Start daily routine (creates workspace, AI briefing, opens editor)
/life-daily-starter

# Quick status check
/life-daily-starter --status

# Connect Obsidian only
/life-daily-starter --link-only

# Force new workspace
/life-daily-starter --new
```

## What It Does

| Step | Action | Output |
|------|--------|--------|
| 1. Check | Detect zombie workspaces | Archive prompt if found |
| 2. Create | Create timestamped workspace folder | ~/Desktop/YYYYMMDDHHMMSS/ |
| 3. Briefing | Generate AI daily briefing | 00_AI_Briefing.md |
| 4. Link | Connect Obsidian Daily Note | Bidirectional links |
| 5. Launch | Open editor (Zed) | Workspace ready |

## Workflow Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Daily Starter                     │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │  Check   │──▶│  Create  │──▶│ AI Brief │        │
│  │Zombies   │   │Workspace │   │ from Reminders│    │
│  └──────────┘   └──────────┘   └──────────┘        │
│       │               │               │             │
│       ▼               ▼               ▼             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐        │
│  │ Archive  │   │ Timestamp│   │  Linked  │        │
│  │ Prompt   │   │  Folder  │   │Obsidian  │        │
│  └──────────┘   └──────────┘   └──────────┘        │
│                                           │         │
│                                           ▼         │
│                                    ┌──────────┐    │
│                                    │   Open   │    │
│                                    │  Editor  │    │
│                                    └──────────┘    │
└─────────────────────────────────────────────────────┘
```

## Configuration

Create `~/.life-good-skill/life-daily-starter/config.js` to customize:

```javascript
export default {
  // Directories
  desktopDir: "~/Desktop",
  archiveDir: "~/ZB/B.MyCreate/dev/Achieve",
  obsidianDailyDir: "~/ZB/B.MyCreate/00-daily/2026",

  // Apple Reminders
  remindersList: "Vincent's list",

  // Editor
  editorCmd: "zed",

  // Files
  aiBriefingFile: "00_AI_Briefing.md",
  dailyNoteLink: "00_DailyNote.md",

  // Format
  timestampFormat: "%Y%m%d%H%M%S"
}
```

## Best For

- Morning workspace creation
- Daily planning integration
- Obsidian workflow connection
- AI-assisted daily briefings
- Zed editor users

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.js`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.js` | Main entry point, workflow orchestration |
| `scripts/workspace.js` | Workspace creation and detection |
| `scripts/briefing.js` | AI briefing generation |
| `scripts/obsidian.js` | Obsidian Daily Note linking |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-daily-starter/config.js` (project)
2. `~/.life-good-skill/life-daily-starter/config.js` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Daily Productivity Coach

**Context**:
- User wants to start their day with organized workspace
- Goal: Create daily workspace, generate briefing, connect Obsidian
- Workflow: Check → Create → Brief → Link → Launch

**Task**:
1. Check for zombie workspaces (old unarchived folders)
2. Create or find today's workspace with timestamp
3. Generate AI briefing from:
   - Apple Reminders (incomplete tasks)
   - Last archive context
   - Previous AI briefing
4. Create Obsidian Daily Note if not exists
5. Establish bidirectional links
6. Launch editor

**Output**:
- Workspace folder: `~/Desktop/YYYYMMDDHHMMSS/`
- AI Briefing: `00_AI_Briefing.md`
- Obsidian Link: `00_DailyNote.md` → Daily Note
- Backlink in Obsidian → Workspace

**Opening**: "早上好！运行 /life-daily-starter 开始每日启动仪式，创建工作区并生成简报。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.js --new  # Force new workspace
npx -y bun ${SKILL_DIR}/scripts/main.js --status  # Check status only
```
