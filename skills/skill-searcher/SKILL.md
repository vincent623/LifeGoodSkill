---
name: skill-searcher
description: "在需要搜索 42plugin 市场、安装技能、发现互补资源、扩展项目能力、查找相关插件或推荐工作流时使用此技能。工作流：探索项目类型 → 生成结构化报告 → 语义拆解关键词 → 多策略搜索 → 匹配评分 → 差距分析。典型场景：\"帮我找几个 PDF 处理技能\"、\"搜索可以管理笔记的插件\"、\"推荐一些效率工具\"。"
---

# Skill Searcher

智能资源发现与搜索工作流。

## Usage

```bash
# 完整工作流：自动探索 → 搜索 → 安装 → 改写
node ${SKILL_DIR}/scripts/workflow.js --auto --search --install --adapt

# 自动探索当前项目并搜索
node ${SKILL_DIR}/scripts/workflow.js --auto --search

# 使用探索报告 JSON 搜索
node ${SKILL_DIR}/scripts/workflow.js '<exploration-report-json>' --search

# 仅搜索
node ${SKILL_DIR}/scripts/search.js "skill organizer"
```

## Options

| Option | Description |
|--------|-------------|
| `--auto, -a` | 自动探索当前项目 |
| `--search` | 执行多策略搜索 |
| `--install` | 安装 Top 3 推荐技能 |
| `--adapt` | 生成适应性改写计划 |

## Workflow Overview

```
Claude Code 探索项目 → 生成 JSON 报告 → 脚本分析意图
              ↓
         语义拆解 + 关键词扩展
              ↓
         类型化搜索策略
              ↓
         多策略搜索 42plugin
              ↓
         匹配评分 + 差距分析
              ↓
         批量安装 + 改写计划
```

## Features

- **通用项目类型** - 支持技能/笔记/代码/知识库等
- **类型化搜索** - 不同类型不同搜索策略
- **自动探索** - `--auto` 自动检测项目类型
- **语义理解** - 中英文关键词扩展
- **智能匹配** - 基于类型和特性评分
- **搜索缓存** - 1 小时 TTL 缓存
- **批量安装** - 一键安装 Top 推荐

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.js`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/workflow.js` | 完整工作流入口 |
| `scripts/search.js` | 独立搜索脚本 |

## Detailed Documentation

| File | Content |
|------|---------|
| `./project-types.md` | 项目类型定义与检测算法 |
| `./matching-algorithm.md` | 匹配评分算法详情 |
| `./adaptation-strategies.md` | 适应性改写策略 |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/skill-searcher/EXTEND.md` (project)
2. `~/.life-good-skill/skill-searcher/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Universal Resource Discovery Consultant

**Context**:
- Claude Code explores any type of project (skills, notes, code, knowledge-base)
- Generates structured exploration report in JSON
- Script analyzes intent and generates type-specific search strategy
- May need to adapt existing resources for custom requirements

**Task**:

1. **Explore Project** (with `--auto`)
   - Auto-detect project type from directory indicators
   - List existing resources
   - Identify categories and key features
   - Generate exploration report in JSON format

2. **Analyze Report** (Script)
   - Parse JSON report
   - Extract intent and keywords
   - Generate type-specific search strategy

3. **Search & Match**
   - Execute type-specific search queries
   - Calculate match scores (关键词 + 分类 + 类型)
   - Rank results by score

4. **Recommend**
   - Output match report with levels (高/中/低)
   - Output quality scores (优秀/良好/一般/新发布)
   - Output gap analysis with recommendation table
   - Suggest combinations and alternatives

5. **Install & Adapt** (optional)
   - Batch install top recommended skills
   - Generate type-specific adaptation plans
   - Provide installation guidance

**Exploration Report Template**:
```json
{
  "projectName": "string",
  "projectType": "skill-repository | note-repository | code-repository | knowledge-base | other",
  "projectDescription": "string",
  "existingItems": ["item1", "item2", ...],
  "categories": ["category1", "category2", ...],
  "keyFeatures": ["feature1", "feature2", ...],
  "userIntent": "string",
  "requirements": ["req1", "req2", ...]
}
```

**Opening**: "请探索项目并生成 MD 探索报告，然后使用 skill-searcher 工作流查找相关资源。"
