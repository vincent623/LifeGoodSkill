# Templates Reference

Built-in templates and configuration options.

## Templates

| Template | Type | Description |
|----------|------|-------------|
| `flowchart-basic` | flowchart | Basic flowchart with branches |
| `flowchart-decision` | flowchart | Decision flowchart |
| `sequence-api` | sequence | API call sequence |
| `class-simple` | class | Simple class diagram |
| `gantt-project` | gantt | Project timeline |
| `pie-distribution` | pie | Data distribution |

## Color Schemes

| Scheme | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| blue | #3b82f6 | #1d4ed8 | #60a5fa |
| green | #10b981 | #059669 | #34d399 |
| purple | #8b5cf6 | #7c3aed | #a78bfa |
| orange | #f97316 | #ea580c | #fb923c |

## Aspect Ratios

| Ratio | Use Case |
|-------|----------|
| 4:3 | General flowcharts |
| 16:9 | Wide diagrams, sequences |
| 1:1 | Pie charts, mindmaps |
| 3:4 | Tall hierarchies |
| 3:2 | Gantt charts |
| 2:3 | User journeys |

## Diagram Types Quick Reference

| Type | Keyword | Best For |
|------|---------|----------|
| Flowchart | `graph LR/TB` | Process flows |
| Sequence | `sequenceDiagram` | API calls |
| Class | `classDiagram` | OOP design |
| State | `stateDiagram-v2` | State machines |
| ER | `er` | Database schema |
| Gantt | `gantt` | Project timeline |
| Pie | `pie` | Data distribution |
| Mindmap | `mindmap` | Brainstorming |
| Journey | `journey` | User journeys |
