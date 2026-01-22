---
name: life-okr-generator
description: Generate SMART-compliant OKR (Objectives and Key Results) documents from job descriptions and planning cycles. Uses SMART principles for clear, measurable goals. Use when user needs to create OKRs, set goals, or plan work periods.
---

# OKR Generator

Create professional OKR documents following SMART principles.

## Usage

```bash
# Generate OKRs
/life-okr-generator

# Provide job info and planning cycle when prompted
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

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-okr-generator/EXTEND.md` (project)
2. `~/.life-good-skill/life-okr-generator/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
