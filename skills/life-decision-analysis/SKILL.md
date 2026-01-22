---
name: life-decision-analysis
description: Multi-perspective decision analyzer using Six Thinking Hats with multi-round debate simulation and weighted scoring. Generates HTML reports with perspective comparison and actionable recommendations. Use when user needs structured decision analysis from multiple viewpoints.
---

# Decision Analysis Generator

Multi-round Six Thinking Hats debate simulation with weighted scoring for better decisions.

## Usage

```bash
# Analyze a decision
npx -y bun ${SKILL_DIR}/scripts/main.py "是否应该跳槽到创业公司" -o analysis.html

# With context
npx -y bun ${SKILL_DIR}/scripts/main.py "是否上线这个功能" -c "用户数据、竞品分析、资源限制" -o analysis.html

# Generate sample
npx -y bun ${SKILL_DIR}/scripts/main.py --sample
```

## What It Does

| Input | Output |
|-------|--------|
| Decision question + context | HTML debate report |
| Multiple perspectives | 3-round analysis |
| Uncertainty | Weighted scoring matrix |

## Output Report

```
decision-analysis.html
├── Question Statement
├── Three-Round Debate Log
│   ├── Round 1: Initial Perspectives
│   ├── Round 2: Debate & Confrontation
│   └── Round 3: Convergence & Conclusion
├── Perspective Comparison Cards
│   ├── 🤍 White - Facts
│   ├── ❤️ Red - Emotions
│   ├── 🖤 Black - Risks
│   ├── 💛 Yellow - Values
│   ├── 💚 Green - Creativity
│   └── 💙 Blue - Summary
├── Weighted Score Matrix
├── Alliance/Conflict Graph
└── Action Recommendations
```

## Best For

- Career decisions
- Business investments
- Product launches
- Strategic choices
- Personal planning

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Entry point, orchestration |
| `scripts/debate.py` | Multi-round debate engine |
| `scripts/scorer.py` | Weighted scoring system |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-decision-analysis/EXTEND.md` (project)
2. `~/.life-good-skill/life-decision-analysis/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Six Thinking Hats Debate Facilitator

**Context**:
- User provides a decision question with optional context
- Goal: Run multi-round debate simulation with 6 perspectives
- Each round: Hats speak, may confront or ally with each other
- Final: Weighted scoring and recommendations

**Task**:
1. **Round 1**: Each hat provides initial perspective on the decision
2. **Round 2**: Hats debate - opposing views confront, similar views ally
3. **Round 3**: Convergence toward conclusion
4. Calculate weighted scores based on:
   - Perspective importance
   - Conflict resolution
   - Consensus level

**Output**: `decision-analysis.html` with:
- Full debate transcript (3 rounds)
- Perspective cards with key points
- Alliance/conflict visualization
- Final score (0-100)
- Recommendations

**Process**:
1. Analyze decision question
2. Generate 6 perspectives per round
3. Identify confrontations (opposing views)
4. Identify alliances (similar views)
5. Calculate weighted scores
6. Render HTML report

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py "是否应该跳槽" -c "当前薪资、工时、股权..." -o ./analysis.html
```
