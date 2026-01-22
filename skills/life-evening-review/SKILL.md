---
name: life-evening-review
description: Evening synthesis protocol for integrating daily insights, identifying internal enemies, and setting next day actions. Based on "How to fix your entire life in 1 day" Part 3. Use when user needs daily wrap-up, next day preparation, or life pattern integration.
---

# Evening Review Protocol

**一天改善人生协议 Part 3** - 晚间综合与整合

完成每日闭环：整合洞察、识别敌人、设定次日行动。

## Usage

```bash
# 启动完整晚间复盘
npx -y bun skills/life-evening-review/scripts/main.js

# 快速复盘（精简版）
npx -y bun skills/life-evening-review/scripts/main.js --quick

# 仅洞察综合
npx -y bun skills/life-evening-review/scripts/main.js --mode insights

# 仅明日计划
npx -y bun skills/life-evening-review/scripts/main.js --mode tomorrow
```

## Protocol Structure

### Part A: 洞察综合

| 问题 | 目的 |
|------|------|
| 今天最真实的洞察是什么？ | 提炼核心学习 |
| 真正的敌人是谁？ | 识别内在模式/信念 |
| 一句话总结反愿景 | 强化不想成为的 |
| 一句话总结愿景 | 强化想成为的 |

### Part B: 目标设定

| 周期 | 问题 |
|------|------|
| 1年 | 一年后什么必须为真，才算打破旧模式？ |
| 1月 | 一个月后什么必须为真，才让一年目标可能？ |
| 明天 | 哪2-3件事是"那个人"会做的？ |

### Part C: 人生罗盘整合

| 要素 | 今晚需要明确的 |
|------|----------------|
| Anti-vision | 核心恐惧 |
| Vision | 核心渴望 |
| 1年目标 | 唯一优先事项 |
| 1月项目 | Boss战 |
| 每日杠杆 | 任务线 |
| 约束条件 | 底线 |

## Output

```
evening-review/
├── YYYYMMDD_evening-review.md    # 完整复盘文档
├── YYYYMMDD_tomorrow.md          # 明日计划
└── YYYYMMDD_life-compass.md      # 人生罗盘更新
```

## Best For

- 每日闭环
- 次日准备
- 洞察整合
- 目标校准
- 习惯追踪

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.js`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.js` | Protocol orchestration, question flow |
| `scripts/generator.js` | Markdown document generation |
| `scripts/compass.js` | Life compass update logic |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-evening-review/EXTEND.md` (project)
2. `~/.life-good-skill/life-evening-review/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Evening Synthesis Guide

**Context**:
- User wants to complete daily wrap-up protocol
- Goal: Integrate day's insights, identify patterns, plan tomorrow
- Output: Evening review markdown document with tomorrow's plan

**Task**:
1. Guide through insight synthesis questions
2. Help identify the "internal enemy" (pattern/belief)
3. Capture anti-vision and vision summaries
4. Set 3-level goals (1 year, 1 month, tomorrow)
5. Generate markdown documents

**Output**:
- `evening-review.md`: Complete evening review
- `tomorrow.md`: Next day action plan
- `life-compass.md`: Updated life compass (if exists)

**Process**:
1. Reflect on the day (5 min)
2. Extract key insights (3 min)
3. Identify internal enemy (3 min)
4. Summarize visions (2 min)
5. Set goals at 3 levels (5 min)
6. Generate documents (1 min)

**Opening**: "我是你的晚间复盘引导师。让我们用15分钟完成今天的闭环，为明天铺路。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.js              # 完整复盘
npx -y bun ${SKILL_DIR}/scripts/main.js --quick      # 精简版
npx -y bun ${SKILL_DIR}/scripts/main.js --mode insights
npx -y bun ${SKILL_DIR}/scripts/main.js --mode tomorrow
```
