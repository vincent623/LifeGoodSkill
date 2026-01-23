---
name: chat-log-analyzer
description: Parses Claude Code chat logs (JSONL format) and generates work statistics reports including frequently used skills, work duration, task completion rate, and activity patterns. Use when analyzing Claude Code usage patterns, tracking productivity, or reviewing conversation history.
---

# Chat Log Analyzer

Parses Claude Code `chat_latest.jsonl` files and generates productivity reports.

## Usage

```bash
# Analyze default chat log
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ./chat/chat_latest.jsonl -o ./report.html

# Quick summary (terminal output)
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ./chat/chat_latest.jsonl --summary

# Generate sample report
npx -y bun skills/chat-log-analyzer/scripts/main.js --sample
```

## Options

| Option | Description |
|--------|-------------|
| `-i, --input <path>` | Input JSONL chat log file (required) |
| `-o, --output <path>` | Output HTML report file |
| `--summary` | Print summary to stdout |
| `--json` | Output in JSON format |
| `--days <n>` | Only analyze last N days |
| `--format <type>` | Output format: html, markdown, json |

## Output Report Contents

The analyzer generates reports with these sections:

- **Session Overview**: Total messages, active days, average messages/day
- **Skills Usage**: Most frequently invoked Claude Code skills
- **Work Patterns**: Peak hours, session duration distribution
- **Task Categories**: Types of work performed (coding, analysis, etc.)
- **Tool Usage**: CLI tools and operations most used

## Examples

```bash
# HTML report with charts
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ~/.claude/chat/chat_latest.jsonl -o ~/work-report.html

# JSON for further processing
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ./chat.jsonl --json > stats.json

# Last 7 days analysis
npx -y bun skills/chat-log-analyzer/scripts/main.js -i ./chat.jsonl --days 7 --summary
```

## See Also

- [JSONL Format Details](./references/jsonl-format.md) - Chat log structure
- [Report Templates](./references/report-templates.md) - Customizing output
