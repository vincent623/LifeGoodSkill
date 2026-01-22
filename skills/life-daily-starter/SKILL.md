---
name: life-daily-starter
description: Daily morning ritual assistant that generates structured daily plans from yesterday's review. Includes habit tracking, energy check, and automatic markdown journal generation. Use when user needs morning routine guidance, daily planning, or habit building.
---

# Daily Starter

Your morning ritual assistant for structured daily planning and reflection.

## Usage

```bash
# Start daily routine
/life-daily-starter

# Generate today's plan from yesterday's context
npx -y bun ${SKILL_DIR}/scripts/main.py --mode plan

# Log habit completion
npx -y bun ${SKILL_DIR}/scripts/main.py --mode habit --habit "运动"

# Check energy and mood
npx -y bun ${SKILL_DIR}/scripts/main.py --mode checkin
```

## What It Does

| Input | Output |
|-------|--------|
| Yesterday's incomplete tasks | Today's prioritized list |
| Habit goals | Tracking dashboard |
| Current energy/mood | Adjusted plan |
| Journal template | Filled daily entry |

## Core Features

### Morning Ritual (5 minutes)

1. **Energy Check** - Quick mood and capacity assessment
2. **Yesterday Review** - What completed vs. carried over
3. **Today Planning** - Generate 3 MITs (Most Important Tasks)
4. **Habit Commitments** - Select daily habits to track
5. **Output** - Daily markdown journal entry

### Daily Journal Structure

```markdown
# YYYY-MM-DD Daily Journal

## Energy & Context
- **Mood**: [emoji]
- **Energy Level**: 1-10
- **Focus Time**: [morning/afternoon/evening]

## Yesterday Review
- ✅ Completed:
- 🔄 Carried Over:
- 📝 Notes:

## Today's Priorities
### MIT 1: [Task] - Why it matters
### MIT 2: [Task] - Why it matters
### MIT 3: [Task] - Why it matters

## Habit Tracking
- [ ] Habit 1
- [ ] Habit 2
- [ ] Habit 3

## End of Day
- **Wins**: What went well
- **Learnings**: What was discovered
- **Tomorrow**: Carry forward
```

## Best For

- Morning routine consistency
- Task management
- Habit building
- Daily reflection
- Journal maintenance

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Daily starter orchestration |
| `scripts/planner.py` | Task prioritization engine |
| `scripts/habit.py` | Habit tracking system |
| `scripts/journal.py` | Journal entry generator |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-daily-starter/EXTEND.md` (project)
2. `~/.life-good-skill/life-daily-starter/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Daily Productivity Coach

**Context**:
- User starts their day and needs structured planning
- Goal: Generate actionable daily plan with task prioritization
- Output: Markdown journal with MITs and habit tracking

**Task**:
1. Guide through energy check-in
2. Review yesterday's incomplete tasks
3. Generate 3 MITs with context
4. Set daily habit commitments
5. Create journal entry

**Output**: `daily-journal.md` with:
- Date header
- Energy/mood section
- Yesterday review section
- Today's priorities (3 MITs)
- Habit checklist
- End-of-day template

**Opening**: "早上好！让我们开始今天的启动仪式。请先完成能量检查，然后回顾昨天的情况。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py --mode routine -o ./daily-$(date +%Y-%m-%d).md
```
