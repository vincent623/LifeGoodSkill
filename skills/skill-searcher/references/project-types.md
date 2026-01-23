# Project Types

Skill Searcher supports 5 project types with automatic detection.

## Supported Types

| Type | Indicators | Search Suffixes |
|------|------------|-----------------|
| `skill-repository` | skills, skill-, plugin, .claude-plugin | skill, plugin, workflow |
| `note-repository` | notes, note-, obsidian, logseq, markdown | note, markdown, knowledge |
| `code-repository` | .git, package.json, Cargo.toml, pyproject.toml | code, development, git |
| `knowledge-base` | wiki, docs, documentation, KB, knowledge | knowledge, wiki, documentation |
| `other` | mixed or unclear | tool, plugin, automation |

## Detection Algorithm

Score-based detection: each matching indicator adds +1 point. Highest score wins.

```typescript
const indicators = {
  "skill-repository": ["skills", "skill-", "plugin", ".claude-plugin"],
  "note-repository": ["notes", "note-", "obsidian", "logseq", "markdown"],
  "code-repository": [".git", "package.json", "Cargo.toml", "pyproject.toml"],
  "knowledge-base": ["wiki", "docs", "documentation", "KB", "knowledge"],
};
```

## Related Searches by Type

```typescript
const PROJECTFIGS = {
  "skill-repository": {
    suffixes: ["skill", "plugin", "workflow"],
    relatedSearches: [
      "skill organizer management plugin",
      "claude skill collection discovery",
      "productivity workflow automation",
    ],
  },
  "note-repository": {
    suffixes: ["note", "markdown", "knowledge"],
    relatedSearches: [
      "note organization tool",
      "markdown knowledge management",
      "documentation workflow",
    ],
  },
  "code-repository": {
    suffixes: ["code", "development", "git"],
    relatedSearches: [
      "code analysis tool",
      "development workflow automation",
      "git repository management",
    ],
  },
  "knowledge-base": {
    suffixes: ["knowledge", "wiki", "documentation"],
    relatedSearches: [
      "knowledge management tool",
      "documentation organization",
      "information retrieval",
    ],
  },
  "other": {
    suffixes: ["tool", "plugin", "automation"],
    relatedSearches: [
      "productivity tool",
      "workflow automation",
      "personal improvement",
    ],
  },
};
```
