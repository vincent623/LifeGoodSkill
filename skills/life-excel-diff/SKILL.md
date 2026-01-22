---
name: life-excel-diff
description: Batch analyze multiple Excel files with consistent structure, extract differences and anomalies, and generate summary reports with AI-powered insights. Use when user needs to analyze Excel reports, find anomalies, or generate difference reports.
---

# Excel Difference Analyzer

Automatically detect and analyze differences across multiple Excel files.

## Usage

```bash
# Analyze Excel files in current directory
/life-excel-diff ./reports/

# Analyze with specific pattern
/life-excel-diff ./reports/ --pattern "*-报告.xls"
```

## What It Does

| Input | Output |
|-------|--------|
| 混乱的Excel文件群 | 差异分析汇总表 |
| 多个评分报告 | 异常数据清单 |
| 质检/财务/审计文件 | AI生成的摘要 |

## Detection Modes

| Mode | Use Case |
|------|----------|
| **Error Column** | Files with explicit error columns |
| **Value Compare** | Standard vs actual value comparison |
| **Status Mark** | Pass/fail status detection |

## Output

- **JSON**: Detailed difference data per entity
- **CSV**: Summary index with AI summaries

## Best For

- Quality inspection reports
- Financial reconciliation
- Audit anomaly detection
- Score report analysis

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-excel-diff/EXTEND.md` (project)
2. `~/.life-good-skill/life-excel-diff/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
