---
name: life-interview-guide
description: Interview preparation analyzer that compares resume and job description to generate HTML guide with priority-ranked questions. Identifies skill gaps and suggests behavioral interview questions. Use when user needs to prepare for job interviews or evaluate candidate fit.
---

# Interview Guide Generator

Generate prioritized interview questions and preparation guide by analyzing resume vs job description.

## Usage

```bash
# Analyze resume and job description
npx -y bun ${SKILL_DIR}/scripts/main.py -r ./resume.md -j ./job-description.md -o ./interview-guide.html

# Compare multiple candidates
npx -y bun ${SKILL_DIR}/scripts/main.py -r ./candidate1.md -r ./candidate2.md -j ./jd.md -o ./comparison.html

# Generate sample
npx -y bun ${SKILL_DIR}/scripts/main.py --sample
```

## What It Does

| Input | Output |
|-------|--------|
| Resume + Job Description | HTML Interview Guide |
| Skill gap analysis | Priority questions |
| Behavioral indicators | STAR question suggestions |

## Output Report

```
interview-guide.html
├── Gap Analysis Radar Chart
├── Priority Question List
├── Preparation Timeline
└── STAR Method Tips
```

## Best For

- Job interview preparation
- Candidate evaluation
- Hiring managers
- Career transition planning

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
| `scripts/analyzer.py` | Gap analysis engine |
| `scripts/generator.py` | Question generation |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-interview-guide/EXTEND.md` (project)
2. `~/.life-good-skill/life-interview-guide/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Interview Strategy Expert

**Context**:
- User provides resume(s) and job description
- Goal: Generate prioritized interview guide with questions
- Output: HTML report with visual gap analysis

**Task**:
1. Extract skills from resume
2. Extract requirements from job description
3. Calculate gap scores for each skill
4. Generate behavioral and technical questions
5. Render HTML report with CSS-based charts

**Output**: `interview-guide.html` with:
- Gap radar chart (candidate vs required)
- Priority sorted question list
- Preparation timeline
- Key talking points

**Process**:
1. Parse resume(s) for skills, experience, achievements
2. Parse job description for must-have vs nice-to-have
3. Identify top 5 gaps
4. Generate 3-5 questions per gap
5. Rank questions by importance

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py -r ./resume.pdf -j ./jd.md -o ./guide.html
```
