---
name: life-mermaid-master
description: Generates Mermaid diagrams from text. Use when creating flowcharts, sequences, classes, gantt, or pie charts. Supports ratios, colors, validation, and HTML export.
---

# Mermaid Diagram Master

Generate Mermaid diagrams from text with validation and optimization.

## Quick Start

```bash
# Basic flowchart
npx -y bun ${SKILL_DIR}/scripts/main.py "用户注册 -> 验证邮箱 -> 完成" -o flowchart.html

# Sequence diagram
npx -y bun ${SKILL_DIR}/scripts/main.py "API调用流程" -t sequence -r 16:9 -c green

# From template
npx -y bun ${SKILL_DIR}/scripts/main.py --template gantt-project -o project.html

# Generate samples
npx -y bun ${SKILL_DIR}/scripts/main.py --sample
```

## Options

| Option | Description |
|--------|-------------|
| `-t, --type` | Diagram: flowchart, sequence, class, state, er, gantt, pie, mindmap |
| `-r, --ratio` | Ratio: 4:3, 3:4, 16:9, 1:1, 3:2, 2:3 |
| `-c, --scheme` | Color: blue, green, purple, orange |
| `-i, --input` | Input file |
| `-o, --output` | Output file |
| `-s, --sample` | Generate sample diagrams |
| `--template` | Use built-in template |
| `--validate-only` | Validate syntax only |

## Layout Guide

**4-Step Process**: Count blocks → Set ratio → Choose direction → Balance nodes

| Subgraphs | Ratio | Min Width |
|-----------|-------|-----------|
| 2-6 | 4:3 | 800px |
| 7-12 | 16:9 | 950px |

Details: [layout.md](references/layout.md) | [Anti-patterns](references/layout.md#anti-patterns--fixes)

## References

- [Templates](references/templates.md) - Diagram templates, colors, ratios
- [Layout](references/layout.md) - Optimization guide, anti-patterns

## Extension Support

Custom styles via EXTEND.md (priority):
1. `.life-good-skill/life-mermaid-master/EXTEND.md`
2. `~/.life-good-skill/life-mermaid-master/EXTEND.md`

---

## Prompt Content

When loaded, AI acts as a Mermaid Diagram Expert.

**When**: User needs diagrams from text (flowcharts, sequences, timelines, visualizations).

**Task**:
1. Parse requirements with Minto Pyramid thinking
2. Apply layout: blocks → ratio (4:3 for 2-6, 16:9 for 7-12) → direction (TB/LR) → balance (max 6 nodes)
3. Generate Mermaid code with subgraph layout, Chinese labels, validated syntax
4. Export HTML with embedded Mermaid.js

**Output**:
- Mermaid code block
- HTML file
- Validation summary

**Common Issues**:
- `classDef` needs `%%` prefix
- Mindmap doesn't support `::` styling
- Use `min-width: 950px` for 7+ subgraphs
