# JSONL Format Reference

Input format specification for chat-to-markdown converter.

## Claude Code JSONL Structure

Each line is a valid JSON object representing one message or event.

### Message Types

| Type | Description | Included in Output |
|------|-------------|-------------------|
| `message` | User or assistant message | ✅ Always |
| `file-history-snapshot` | File state capture | ❌ Skipped |
| `user` | Command execution | ✅ Always |

### Key Fields Used

```json
{
  "sessionId": "uuid-string",
  "timestamp": "2026-01-22T08:54:43.590Z",
  "message": {
    "role": "user" | "assistant",
    "content": [ { "type": "text", "text": "..." } ]
  },
  "uuid": "unique-message-id",
  "type": "message-type"
}
```

## Extraction Logic

### User Messages
```json
{
  "message": { "role": "user", "content": [...] },
  "timestamp": "..."
}
```
Output: `## User [timestamp]`

### Assistant Messages
```json
{
  "message": { "role": "assistant", "content": [...] },
  "timestamp": "..."
}
```
Output: `## Assistant [timestamp]`

### Tool Outputs
```json
{
  "message": {
    "role": "assistant",
    "content": [
      { "type": "text", "text": "Here are the results:" },
      { "type": "tool_use", "name": "Read", "input": {...} }
    ]
  }
}
```
Output: Text + JSON code block for tool_use

## Compact Mode

When `--compact` is enabled, these are filtered:

- `isMeta: true` messages
- `type: "file-history-snapshot"`
- `message.role: "system"`
- Empty content blocks

## Session Grouping

Messages are grouped by `sessionId`:
- Same session → contiguous in output
- Different sessions → separated by headers

### Multi-Session Output

```markdown
## Session: abc12345

## User [time]

Message 1...

## Assistant [time]

Response 1...

---

## Session: xyz67890

## User [time]

Message 2...
```
