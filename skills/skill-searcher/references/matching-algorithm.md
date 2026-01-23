# Matching Algorithm

Score calculation for skill-to-project matching.

## Scoring Formula

```
Score = 基础分(50) + 关键词匹配(+8/个) + 分类匹配(+10/个) + 类型加分(+10)
```

### Weight Breakdown

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Base Score | 50% | Minimum matching threshold |
| Keyword Match | +8% | Per matched keyword (expanded) |
| Category Match | +10% | Per matched category |
| Type Bonus | +10% | If project is skill-repository and result contains "skill" or "plugin" |

### Match Level Thresholds

| Level | Score Range | Meaning |
|-------|-------------|---------|
| High | ≥75% | Core keywords highly match |
| Medium | 50-74% | Partial match |
| Low | <50% | Low match rate |

## Quality Scoring (Downloads)

| Quality | Downloads | Advice |
|---------|-----------|--------|
| Excellent | >1000 | Verified by many users, recommended |
| Good | >100 | Some user base, safe to use |
| Fair | >10 | Few users, test first |
| New | >0 | No downloads yet, use with caution |
| Unknown | 0 | Unable to get download info, self-assess |

## Keyword Expansion

```typescript
const KEYWORD_EXPANSION = {
  "skill": ["skill", "plugin", "tool", "workflow", "prompt"],
  "claude": ["claude", "ai", "llm", "assistant", "agent"],
  "organize": ["organize", "manage", "catalog", "index", "collection"],
  "note": ["note", "笔记", "markdown", "documentation", "knowledge"],
  "knowledge": ["knowledge", "knowledge-base", "wiki", "documentation"],
  "code": ["code", "编程", "development", "repository", "git"],
  "file": ["file", "document", "data", "content", "storage"],
  "search": ["search", "discover", "find", "query", "retrieve"],
  "recommend": ["recommend", "suggest", "match", "filter"],
  "efficiency": ["efficiency", "productivity", "workflow", "automation"],
  "translation": ["translation", "language", "multilingual"],
  "pdf": ["pdf", "document", "converter", "extraction"],
  "meeting": ["meeting", "minutes", "summary", "transcription"],
};
```
