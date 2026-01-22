# YAML Frontmatter Standard

## Overview

This document defines the standard YAML frontmatter format for normalized markdown notes.

## Standard Format

```yaml
---
title: Note Title
date_created: YYYYMMDDHHmmss
date_modified: YYYYMMDDHHmmss
tags: [tag1, tag2, tag3]
---
```

## Field Specifications

### title
- **Type**: String
- **Required**: Yes
- **Source Priority**:
  1. Existing YAML `title` field
  2. First `# Heading` in content
  3. Original filename (if not timestamp)
  4. Generated from timestamp

**Examples:**
```yaml
title: Meeting Notes from Project Alpha
title: 认知负荷测量方法
title: AI Agent Development Guide
```

### date_created
- **Type**: String (14-digit timestamp)
- **Required**: Yes
- **Format**: `YYYYMMDDHHmmss`
- **Source Priority**:
  1. Timestamp from filename (if exists)
  2. Existing YAML `date created` or `date_created` field
  3. File system creation time

**Examples:**
```yaml
date_created: 20250118143000
date_created: 20241225090000
```

### date_modified
- **Type**: String (14-digit timestamp)
- **Required**: Yes
- **Format**: `YYYYMMDDHHmmss`
- **Source Priority**:
  1. Existing YAML `date modified` or `date_modified` field
  2. File system modification time

**Examples:**
```yaml
date_modified: 20250118150000
date_modified: 20250101120000
```

### tags
- **Type**: Array of strings
- **Required**: Yes
- **Count**: Exactly 3 tags
- **Source Priority**:
  1. Existing YAML `tags` field (if ≥3 tags, use first 3)
  2. Intelligently generated from content

**Examples:**
```yaml
tags: [AI, 技术, 数据]
tags: [认知科学, 学习, 教育]
tags: [产品设计, 管理, 商业]
```

## Complete Example

```yaml
---
title: 从Claude Code设计机制看上下文工程
date_created: 20251202112156
date_modified: 20251202113149
tags: [AI, 认知科学, 技术]
---

# 从Claude Code设计机制看上下文工程

## 核心观点

编程正在经历从"指令式操纵"向"声明式语境构建"的范式转移...
```

## Compatibility Notes

### Obsidian
- Fully compatible with Obsidian's YAML frontmatter
- `date_created` and `date_modified` can be used in Dataview queries
- Tags are searchable and appear in tag pane

### Logseq
- Compatible with Logseq's properties system
- Tags work as page references
- Dates can be used in queries

### Notion
- Can be imported via Markdown import
- Metadata preserved in page properties
