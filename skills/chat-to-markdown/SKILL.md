---
name: chat-to-markdown
description: Converts Claude Code JSONL chat logs into readable Markdown format with proper formatting, syntax highlighting for code blocks, and conversation structure. Use when archiving conversations, sharing key discussions, or converting logs for documentation.
---

# Chat to Markdown Converter

Converts Claude Code `chat_latest.jsonl` to well-formatted Markdown documents.

## Usage

```bash
# Basic conversion
npx -y bun skills/chat-to-markdown/scripts/main.js -i ./chat/chat_latest.jsonl -o ./chat.md

# Include metadata
npx -y bun skills/chat-to-markdown/scripts/main.js -i ./chat.jsonl --include-meta

# Single session extraction
npx -y bun skills/chat-to-markdown/scripts/main.js -i ./chat.jsonl --session session-id -o session.md

# Generate sample
npx -y bun skills/chat-to-markdown/scripts/main.js --sample
```

## Options

| Option | Description |
|--------|-------------|
| `-i, --input <path>` | Input JSONL chat log file (required) |
| `-o, --output <path>` | Output Markdown file |
| `--session <id>` | Extract only specific session |
| `--include-meta` | Include message metadata (timestamps, UUIDs) |
| `--compact` | Omit system messages and snapshots |
| `--format <type>` | Output format: markdown, html, json |

## Output Format

The converter produces structured Markdown:

```markdown
# Claude Code Conversation

> Session ID: xxx
> Created: 2026-01-22
> Total Messages: 156

---

## User [timestamp]

Message content...

---

## Assistant [timestamp]

Response with code blocks...

---
```

## Features

- **Conversation Structure**: Clear User/Assistant demarcation
- **Code Highlighting**: Preserves code blocks with language tags
- **Timestamps**: Optional date/time display
- **Session Grouping**: Organizes by conversation session
- **Metadata Toggle**: Include or exclude technical details
- **Compact Mode**: Filters out file snapshots and system events

## Examples

```bash
# Full conversation to Markdown
npx -y bun skills/chat-to-markdown/scripts/main.js -i ~/.claude/chat/chat_latest.jsonl -o full-conversation.md

# Compact version (user/assistant only)
npx -y bun skills/chat-to-markdown/scripts/main.js -i ./chat.jsonl --compact -o clean.md

# Single session for sharing
npx -y bun skills/chat-to-markdown/scripts/main.js -i ./chat.jsonl --session abc123 -o shareable.md
```

## See Also

- [JSONL Format Details](./references/jsonl-format.md) - Input file structure
- [Styling Options](./references/styling-options.md) - Customizing output appearance
- [Batch Processing](./references/batch-processing.md) - Converting multiple files
