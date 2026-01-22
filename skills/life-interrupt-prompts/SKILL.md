---
name: life-interrupt-prompts
description: Generate personalized daily interrupt prompts to break autopilot mode and foster self-reflection. Based on "How to fix your entire life in 1 day" Part 2 protocol. Use when user needs structured self-reflection throughout the day or wants to break unconscious patterns.
---

# Interrupt Prompts Generator

**一天改善人生协议 Part 2** - 日间打断自动巡航

生成个性化的日间打断提示，帮助打破无意识模式，保持自我觉察。

## Usage

```bash
# 生成今日打断提示
npx -y bun skills/life-interrupt-prompts/scripts/main.js

# 生成一周提示
npx -y bun skills/life-interrupt-prompts/scripts/main.js --week

# 导出到日历格式
npx -y bun skills/life-interrupt-prompts/scripts/main.js --calendar

# 自定义时间点
npx -y bun skills/life-interrupt-prompts/scripts/main.js --times "09:00,12:00,15:00,18:00,21:00"
```

## Default Schedule

| 时间 | 问题 | 目的 |
|------|------|------|
| **11:00** | 我现在通过做什么来逃避什么？ | 识别逃避模式 |
| **13:30** | 如果过去2小时被拍下来，人们会认为我想要什么？ | 行为意图分析 |
| **15:15** | 我是在走向讨厌的生活还是想要的生活？ | 方向检查 |
| **17:00** | 我假装不重要但最重要的那件事是什么？ | 优先级识别 |
| **19:30** | 今天我做了什么身份保护而非真正想要的？ | 动机检验 |
| **21:00** | 今天什么时候最有活力？什么时候最死气沉沉？ | 能量追踪 |

## Bonus Prompts

| 问题 | 触发场景 |
|------|----------|
| 如果我不再需要让别人看到我是[身份]，什么会改变？ | 通勤、散步时 |
| 我在哪里用安全感换了活力？ | 独处时刻 |
| 明天就能成为我想成为的人，最小版本是什么？ | 睡前 |

## Output Formats

### Console Output
```
━━━ 今日打断提示 ━━━
[11:00] 我现在通过做什么来逃避什么？
[13:30] 如果过去2小时被拍下来...
...
```

### Calendar Format (.ics)
可导入到日历应用，自动提醒。

### JSON Export
```json
{
  "date": "2026-01-23",
  "prompts": [
    {"time": "11:00", "question": "...", "type": "avoidance"}
  ]
}
```

## Best For

- 打破自动驾驶模式
- 日间自我检查
- 习惯改变
- 提高觉察力
- 保持目标方向

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.js`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.js` | Main entry point, prompt generation |
| `scripts/calendar.js` | iCalendar format export |
| `scripts/exporter.js` | JSON/HTML export |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-interrupt-prompts/EXTEND.md` (project)
2. `~/.life-good-skill/life-interrupt-prompts/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Autopilot Interrupt Coach

**Context**:
- User wants to break unconscious patterns throughout the day
- Goal: Generate personalized interrupt prompts at strategic times
- Output: Scheduled prompts in various formats

**Task**:
1. Present 6 core interrupt prompts with timestamps
2. Explain the psychological purpose of each
3. Offer bonus prompts for reflection moments
4. Generate calendar-compatible export
5. Provide journaling template for responses

**Output**:
- Console display of all prompts
- JSON export for apps
- ICS calendar file for import
- Response journal template

**Process**:
1. Display all 6 scheduled prompts
2. Explain why each matters
3. Offer customization options
4. Generate export formats
5. Provide response guidelines

**Opening**: "我是你的自动驾驶打断教练。这些提示将帮助你在一天中保持觉察，打破无意识的行为模式。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.js                    # 今日提示
npx -y bun ${SKILL_DIR}/scripts/main.js --week            # 一周
npx -y bun ${SKILL_DIR}/scripts/main.js --calendar        # 日历
npx -y bun ${SKILL_DIR}/scripts/main.js --times "09:00,12:00"
```
