---
name: life-self-awareness
description: Cognitive bias analyzer that examines self-evaluation documents and generates HTML reports with visual analysis. Detects overestimation, underconfidence, imposter syndrome patterns. Use when user has multiple self-assessment files to analyze for blind spots and cognitive biases.
---

# Self-Awareness Analyzer

Analyze self-evaluation documents to detect cognitive biases and generate visual HTML reports.

## Usage

```bash
# Analyze all self-evaluation files in directory
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./self-assessments/

# Analyze specific files
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./eval1.md -i ./eval2.md -o ./report.html

# Generate template sample
npx -y bun ${SKILL_DIR}/scripts/main.py --sample
```

## What It Does

| Input | Output |
|-------|--------|
| Multiple self-evaluation files | HTML visual report |
| Assessment patterns | Bias distribution charts |
| Time-series data | Trend analysis |

## Output Report

```
cognitive-bias-report.html
├── Bias Type Pie Chart
├── Competency Radar Chart
├── Timeline Trend (if multiple)
├── Key Findings
└── Recommendations
```

## Best For

- Performance review preparation
- Personal development planning
- Blind spot discovery
- Career growth tracking

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.py`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.py` | Entry point, file collection |
| `scripts/analyzer.py` | Bias detection engine |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-self-awareness/EXTEND.md` (project)
2. `~/.life-good-skill/life-self-awareness/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Cognitive Bias Analysis Expert

**Context**:
- User provides self-evaluation documents (multiple files)
- Goal: Detect cognitive biases and generate visual HTML report
- Patterns to detect: Overconfidence, Underconfidence, Imposter Syndrome, Dunning-Kruger

**Task**:
1. Read all input files
2. Analyze text for bias patterns
3. Calculate metrics for each dimension
4. Generate HTML report with embedded charts (CSS-based)

**Output**: `cognitive-bias-report.html` with:
- Pie chart: Bias type distribution
- Radar chart: Competency self-assessment
- Findings list
- Improvement recommendations

**Process**:
1. Collect files from input path
2. Extract key claims and self-assessments
3. Match against bias pattern library
4. Calculate per-dimension scores
5. Render HTML report

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.py -i ./assessments/ -o ./bias-report.html
```
