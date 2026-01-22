---
name: life-vision-protocol
description: Guided protocol for uncovering your Anti-Vision (life you don't want) and Vision (life you truly want) through 7 deep reflection exercises. Use when user needs life direction clarity, New Year planning, or identity transformation.
---

# Vision Protocol

**一天改善人生协议 Part 1** - 晨间心理挖掘

通过 7 组深度问题，帮助你挖掘内心深处的 Anti-Vision 和 Vision，为人生方向提供清晰框架。

## Usage

```bash
# 启动完整协议
npx -y bun skills/life-vision-protocol/scripts/main.js

# 仅 Anti-Vision（反愿景）
npx -y bun skills/life-vision-protocol/scripts/main.js --mode anti-vision

# 仅 Vision（愿景）
npx -y bun skills/life-vision-protocol/scripts/main.js --mode vision

# 快速模式（精简问题）
npx -y bun skills/life-vision-protocol/scripts/main.js --quick
```

## Protocol Structure

### Part A: Anti-Vision (反愿景)

| 阶段 | 问题 | 目的 |
|------|------|------|
| 1 | 5年后的 average Tuesday | 揭示未来轨迹 |
| 2 | 10年后的代价 | 看清失去的机会 |
| 3 | 临终遗憾 | 终极恐惧 |
| 4 | 榜样对比 | 情绪触发点 |
| 5 | 身份代价 | 社会成本 |
| 6 | 尴尬原因 | 核心弱点 |
| 7 | 自我保护 | 代价分析 |

### Part B: Vision (愿景)

| 阶段 | 问题 | 目的 |
|------|------|------|
| 1 | 3年后的理想生活 | 清晰目标 |
| 2 | 身份声明 | "I am the type of person who..." |
| 3 | 本周行动 | 最小可行行动 |

## Output

```
vision-protocol/
├── YYYYMMDD_anti-vision.md    # 反愿景文档
├── YYYYMMDD_vision.md         # 愿景文档
└── YYYYMMDD_identity.md       # 身份声明
```

## Protocol Tips

**重要**: 这些问题需要深度思考，不要急于回答。
- 建议早晨第一件事完成
- 环境安静，无干扰
- 手写或语音输入更佳
- 至少 30 分钟

**问题难度**: 问题 3 和 6 最具挑战性，往往揭示核心真相。

## Best For

- New Year 规划
- 职业转型思考
- 人生方向迷茫
- 身份转变准备
- 年度复盘

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.js`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.js` | Protocol orchestration, question presentation |
| `scripts/generator.js` | Markdown output generation |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-vision-protocol/EXTEND.md` (project)
2. `~/.life-good-skill/life-vision-protocol/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Life Protocol Guide - Psychological Excavation Expert

**Context**:
- User wants to clarify life direction through deep reflection
- Goal: Complete Vision Protocol (Anti-Vision + Vision)
- Output: Three markdown documents (anti-vision, vision, identity)

**Task**:
1. Present Anti-Vision questions one by one (questions 1-7)
2. Capture user's responses in structured format
3. Present Vision questions (questions 1-3)
4. Help formulate identity statement
5. Generate markdown documents

**Output**:
- `anti-vision.md`: All 7 Anti-Vision responses
- `vision.md`: All 3 Vision responses
- `identity.md`: "I am the type of person who..." statement

**Process**:
1. Start with Anti-Vision (create discomfort)
2. Pause for processing
3. Transition to Vision (create positive direction)
4. Finalize with identity statement
5. Export to markdown files

**Opening**: "我是你的愿景协议引导师。接下来的 30 分钟，我们将通过 7 组深度问题挖掘你的 Anti-Vision（反愿景），然后构建你的 Vision（愿景）和身份声明。请准备好纸笔，我们开始。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.js --quick    # 精简模式
npx -y bun ${SKILL_DIR}/scripts/main.js --mode anti-vision
npx -y bun ${SKILL_DIR}/scripts/main.js --mode vision
```
