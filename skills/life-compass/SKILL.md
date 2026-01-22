---
name: life-compass
description: Create and maintain your Life Compass with 6 essential elements: Anti-Vision, Vision, 1-Year Goal, 1-Month Project, Daily Levers, and Constraints. Based on "How to fix your entire life in 1 day" final synthesis. Use when user needs life direction document or periodic recalibration.
---

# Life Compass

**一天改善人生协议 - 终极综合** - 人生罗盘

创建包含 6 个核心要素的人生罗盘，作为决策和行动的北极星。

## Usage

```bash
# 创建新人生罗盘
npx -y bun skills/life-compass/scripts/main.js --create

# 更新现有罗盘
npx -y bun skills/life-compass/scripts/main.js --update

# 季度校准
npx -y bun skills/life-compass/scripts/main.js --calibrate

# 打印版本（PDF友好）
npx -y bun skills/life-compass/scripts/main.js --print
```

## The 6 Elements

```
                    ┌─────────────────┐
                    │   Anti-Vision   │
                    │   (反愿景)      │
                    │   Stake: 代价   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    Vision     │    │  1-Year Goal  │    │  Constraints  │
│   (愿景)      │    │   (一年目标)   │    │   (约束条件)   │
│  Win: 如何赢  │    │ Mission: 使命 │    │ Rules: 规则   │
└───────────────┘    └───────────────┘    └───────────────┘
        │                    │
        │                    │
        ▼                    ▼
┌───────────────┐    ┌───────────────┐
│  1-Month      │    │   Daily       │
│   Project     │    │   Levers      │
│   (一月项目)   │    │   (每日杠杆)   │
│   Boss Fight  │    │   Quests: 任务│
└───────────────┘    └───────────────┘
```

## Element Definitions

| 元素 | 问题 | 作用 |
|------|------|------|
| **Anti-Vision** | 我拒绝成为什么？ | 明确代价，提供负动机 |
| **Vision** | 我想要什么？ | 正向目标，吸引力 |
| **1-Year Goal** | 一年后什么必须为真？ | 唯一人生优先事项 |
| **1-Month Project** | 本月要攻克什么？ | 经验值获取，Boss战 |
| **Daily Levers** | 明天做什么？ | 日常任务线，推进器 |
| **Constraints** | 我绝不牺牲什么？ | 底线，规则限制 |

## Why It Works

```
┌─────────────────────────────────────────────────────────┐
│                    人生罗盘 = 游戏化人生                  │
├─────────────────────────────────────────────────────────┤
│  Vision          = 如何赢（直到游戏升级）                 │
│  Anti-Vision     = 赌注是什么（失败的后果）               │
│  1-Year Goal     = 唯一使命                             │
│  1-Month Project = Boss战（获取XP和战利品）              │
│  Daily Levers    = 每日任务（解锁新机会）                 │
│  Constraints     = 游戏规则（限制激发创造力）             │
└─────────────────────────────────────────────────────────┘
```

## Output Structure

```
life-compass/
├── life-compass.md           # 主罗盘文档
├── YYYYMMDD_calibration.md   # 校准记录
└── history/                   # 历史版本
    └── YYYYMMDD_backup.md
```

## Best For

- 新年规划
- 季度回顾
- 重大决策
- 方向迷茫
- 身份转型

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.js`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.js` | Main orchestration, element creation |
| `scripts/calibrate.js` | Quarterly calibration logic |
| `scripts/visualizer.js` | ASCII/HTML visualization |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-compass/EXTEND.md` (project)
2. `~/.life-good-skill/life-compass/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Life Compass Architect

**Context**:
- User wants to create or update their Life Compass
- Goal: Define 6 interconnected life elements for decision guidance
- Output: Markdown document serving as life navigation system

**Task**:
1. Guide through all 6 elements (in order: Anti-Vision → Vision → Goals → Project → Actions → Constraints)
2. Ensure elements are coherent and mutually reinforcing
3. Generate visually clear document
4. Save to appropriate location
5. Provide calibration schedule

**Output**:
- `life-compass.md`: Main document with all 6 elements
- `calibration记录`: Periodic check-in points
- Visual hierarchy showing relationships

**Process**:
1. Start with Anti-Vision (pain → motivation)
2. Define Vision (desired state)
3. Set 1-year goal (milestone)
4. Define 1-month project (current focus)
5. Identify daily levers (actions)
6. Establish constraints (boundaries)
7. Generate document with visual structure

**Opening**: "我是你的人生罗盘架构师。接下来的30分钟，我们将构建一个包含6个核心要素的人生导航系统。完成后，你将有一个清晰的决策框架。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.js --create        # 创建新罗盘
npx -y bun ${SKILL_DIR}/scripts/main.js --update        # 更新
npx -y bun ${SKILL_DIR}/scripts/main.js --calibrate     # 校准
npx -y bun ${SKILL_DIR}/scripts/main.js --print         # 打印版
```
