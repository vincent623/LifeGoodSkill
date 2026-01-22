---
name: life-okr-generator
description: Generate SMART-compliant OKR (Objectives and Key Results) documents from job descriptions and planning cycles. Uses SMART principles for clear, measurable goals. Use when user needs to create OKRs, set goals, or plan work periods.
---

# OKR Generator

Create professional OKR documents following SMART principles.

## Usage

```bash
# Generate OKRs
npx -y bun ${SKILL_DIR}/scripts/main.py -j "高级产品经理" -c "2026年Q1"

# Interactive mode
/life-okr-generator
```

## SMART Principles Applied

| Principle | Description | Example |
|-----------|-------------|---------|
| **S**pecific | Clear and well-defined | "Increase sales" → "Acquire 50 new enterprise customers" |
| **M**easurable | Quantifiable metrics | "Improve quality" → "Reduce defects to <1%" |
| **A**chievable | Realistic targets | Challenging but attainable |
| **R**elevant | Aligned with company goals | Supports organizational objectives |
| **T**ime-bound | Clear deadline | "By Q4 2026" |

## Output Structure

```markdown
# Objective 1: [Title]

**Rationale**: Why this objective matters

**Key Results:**
- [ ] KR1: Measurable result 1
- [ ] KR2: Measurable result 2
- [ ] KR3: Measurable result 3

# Objective 2: [Title]
...
```

## Best For

- Quarterly planning
- Performance reviews
- Team goal setting
- Career development
- Sprint planning

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Generate OKR document |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-okr-generator/EXTEND.md` (project)
2. `~/.life-good-skill/life-okr-generator/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Professional OKR Writing Expert

**Context**:
- User provides job information and planning cycle
- Goal: Create SMART-compliant OKR document for the period
- Apply SMART principles: Specific, Measurable, Achievable, Relevant, Time-bound

**Task**:
1. Analyze job responsibilities and role requirements
2. Create 3-5 objectives aligned with role expectations
3. For each objective, define 3-4 measurable key results
4. Ensure KR are quantifiable and challenging but achievable

**Output**: Complete OKR document in Markdown with:
- Objectives with clear titles and rationales
- Measurable key results (checklist format)
- Alignment with role and company goals

**Process**:
1. Analyze job description and responsibilities
2. Identify key performance areas
3. Draft objectives for each area
4. Define measurable key results
5. Review against SMART principles

**Opening**: "请提供您的岗位信息和计划周期，我将为您生成SMART原则的OKR文档。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py -j "岗位描述" -c "周期" -o ./okrs.md
```
