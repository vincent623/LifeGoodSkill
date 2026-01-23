# Claude Code JSONL Format

Claude Code chat logs are stored in JSONL (JSON Lines) format with one JSON object per line.

## File Location

- **Default**: `~/.claude/chat/chat_latest.jsonl`
- **Project**: `./chat/chat_latest.jsonl`

## Record Structure

```json
{
  "parentUuid": "uuid-string",
  "isSidechain": false,
  "userType": "external",
  "cwd": "/Users/path/to/project",
  "sessionId": "uuid-string",
  "version": "2.0.53",
  "gitBranch": "main",
  "type": "message",
  "uuid": "uuid-string",
  "timestamp": "2026-01-22T08:54:43.590Z",
  "message": {
    "role": "user" | "assistant",
    "content": [
      {
        "type": "text",
        "text": "Message content"
      },
      {
        "type": "tool_use",
        "id": "tool-uuid",
        "name": "ToolName",
        "input": { ... }
      }
    ]
  }
}
```

## Key Fields

| Field | Description |
|-------|-------------|
| `sessionId` | Groups messages into conversation sessions |
| `timestamp` | ISO 8601 format timestamp |
| `message.role` | Either "user" or "assistant" |
| `message.content` | Array of content blocks (text, tool_use, etc.) |
| `cwd` | Current working directory when message was sent |
| `type` | Message type: "message", "file-history-snapshot", etc. |

## Common Types

1. **user message**: `type: "message"`, `message.role: "user"`
2. **assistant response**: `type: "message"`, `message.role: "assistant"`
3. **file snapshot**: `type: "file-history-snapshot"`
4. **meta event**: `isMeta: true` (system events like model changes)

## Example Entry

```json
{
  "parentUuid": "7c94e856-ad7b-4750-82f7-accf4462f8d1",
  "isSidechain": false,
  "userType": "external",
  "cwd": "/Users/vincent/Desktop/project",
  "sessionId": "96a01710-64d9-4712-8197-49f42cc2a05b",
  "version": "2.0.53",
  "type": "user",
  "message": {
    "role": "user",
    "content": "分析这个对话日志"
  },
  "uuid": "c8809289-11c4-43c8-8351-770c4953a8cc",
  "timestamp": "2026-01-22T08:54:43.590Z"
}
```
