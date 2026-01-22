---
name: life-task-breakdown
description: Problem decomposition tool that converts complex problems into actionable task lists with HTML reports including Gantt charts, dependency visualization, and estimated effort. Use when user has complex problems that need systematic breakdown into executable tasks.
---

# Task Breakdown Generator

Transform complex problems into actionable task lists with visual HTML reports.

## Usage

```bash
# Decompose a complex problem
npx -y bun ${SKILL_DIR}/scripts/main.py "用户增长停滞" -o task-breakdown.html

# From file input
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./problem.txt -o ./plan.html

# Generate sample
npx -y bun ${SKILL_DIR}/scripts/main.py --sample
```

## What It Does

| Input | Output |
|-------|--------|
| Complex problem description | HTML task breakdown |
| Problem context | Phased execution plan |
| Implicit assumptions | Identified dependencies |

## Output Report

```
task-breakdown.html
├── Problem Decomposition Tree
├── Gantt Chart (CSS-based)
├── Task List with Priority/Estimate
├── Dependency Graph
├── Risk Indicators
└── Milestone Timeline
```

## Best For

- Project planning
- Problem-solving sessions
- Strategic initiative breakdown
- Complex decision support

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
| `scripts/decomposer.py` | Problem decomposition engine |
| `scripts/estimator.py` | Effort estimation |
| `scripts/gantt.py` | Gantt chart rendering |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-task-breakdown/EXTEND.md` (project)
2. `~/.life-good-skill/life-task-breakdown/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Strategic Problem-Solving Architect

**Context**:
- User provides a complex problem or challenge
- Goal: Systematically decompose into actionable tasks
- Output: HTML report with Gantt chart visualization

**Task**:
1. Analyze problem structure using MECE principle
2. Identify problem domains and sub-challenges
3. Generate concrete tasks for each sub-challenge
4. Estimate effort (hours/days) for each task
5. Identify task dependencies
6. Generate CSS-based Gantt chart

**Output**: `task-breakdown.html` with:
- Problem decomposition tree
- Task list with priority (P1-P5), effort estimates
- CSS Gantt chart visualization
- Dependency arrows
- Risk indicators

**Process**:
1. Receive problem description
2. Decompose into 3-5 major phases
3. Break each phase into 3-5 tasks
4. Add dependencies (tasks that must complete first)
5. Estimate effort for each task
6. Render HTML with Gantt visualization

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py "复杂问题描述" -o ./breakdown.html
```
