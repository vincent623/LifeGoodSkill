---
name: skill-searcher
description: Universal resource discovery for any project type. Workflow: Claude Code explores project → generates JSON report → script analyzes intent → generates type-specific search strategy → searches 42plugin → adapts. Supports skill-repository, note-repository, code-repository, knowledge-base, and custom types.
---

# Skill Searcher

通用资源发现与搜索工作流。

## Workflow

```
Claude Code 探索项目 → 生成探索报告(JSON) → 脚本接收报告
                     ↓
              意图拆解 + 语义拆解
                     ↓
              类型化搜索策略
                     ↓
              多策略搜索 42plugin
                     ↓
              差距分析 + 匹配评分
                     ↓
              批量安装 + 改写计划
```

## Usage

```bash
# 完整工作流：自动探索 → 搜索 → 安装 → 改写
bun ${SKILL_DIR}/scripts/workflow.ts --auto --search --install --adapt

# 自动探索当前项目并搜索
bun ${SKILL_DIR}/scripts/workflow.ts --auto --search

# 使用探索报告 JSON 搜索
bun ${SKILL_DIR}/scripts/workflow.ts '<exploration-report-json>' --search

# 仅分析报告
bun ${SKILL_DIR}/scripts/workflow.ts --auto --analyze
```

## Options

| Option | Description |
|--------|-------------|
| `--auto, -a` | 自动探索当前项目 |
| `--search` | 执行多策略搜索 |
| `--install` | 安装 Top 3 推荐技能 |
| `--adapt` | 生成适应性改写计划 |
| `--analyze` | 仅分析，不搜索 |

## Supported Project Types

| Type | Description | Indicators |
|------|-------------|------------|
| `skill-repository` | 技能/插件仓库 | skills/, skill-, .claude-plugin |
| `note-repository` | 笔记仓库 | notes/, obsidian, logseq, markdown |
| `code-repository` | 代码仓库 | .git, package.json, Cargo.toml |
| `knowledge-base` | 知识库 | wiki/, docs/, documentation |
| `other` | 自定义项目 | 无识别标志 |

## Exploration Report Format

Claude Code 探索项目后生成 JSON 报告：

```json
{
  "projectName": "MyProject",
  "projectType": "skill-repository",
  "projectDescription": "项目描述",
  "existingItems": ["item1", "item2"],
  "categories": ["分类1", "分类2"],
  "keyFeatures": ["特性1", "特性2"],
  "userIntent": "搜索相关资源",
  "requirements": ["需求1", "需求2"]
}
```

## Steps

### Step 1: Claude Code 探索报告 (或 --auto 自动探索)

Claude Code 使用 Task/Explore 工具探索项目，生成结构化报告。

或使用 `--auto` 自动检测：
- 项目类型识别（基于目录结构）
- 现有资源列表
- 资源分类（自动识别 life- 前缀目录）
- README 描述提取

### Step 2: 意图拆解

脚本解析用户意图和项目需求。

| 维度 | 内容 |
|------|------|
| 用户意图 | 搜索、推荐、发现、适配 |
| 项目需求 | 基于项目类型的需求 |
| 类型适配 | 不同类型不同策略 |

### Step 3: 语义拆解

从探索报告中提取关键词并扩展。

```
核心关键词: skill, organize, life, efficiency
扩展关键词: skill → plugin, tool, workflow, prompt
           organize → manage, catalog, index
           life → lifestyle, productivity, personal
```

### Step 4: 类型化搜索策略

根据项目类型生成不同的搜索查询：

| Project Type | Search Suffixes | Related Searches |
|--------------|-----------------|------------------|
| skill-repository | skill, plugin, workflow | skill organizer, claude skill discovery |
| note-repository | note, markdown, knowledge | note organization, markdown management |
| code-repository | code, development, git | code analysis, dev workflow automation |
| knowledge-base | knowledge, wiki, documentation | knowledge management, information retrieval |
| other | tool, plugin, automation | productivity tool, workflow automation |

### Step 5: 多策略搜索

并行执行多个搜索查询，聚合去重。

```bash
42plugin search "<query>" --type skill
```

**缓存机制**：搜索结果缓存 1 小时至 `.skill-searcher-cache/` 目录。

### Step 6: 匹配评分与差距分析

评估搜索结果与项目类型的匹配度：

| 维度 | 权重/说明 |
|------|----------|
| 关键词匹配 | 每个匹配 +8% |
| 分类匹配 | 每个匹配 +10% |
| 类型加分 | skill-repository +10% |
| 基础分 | 50% |

**匹配度等级**：
- 高 (≥75%)：核心关键词高度匹配
- 中 (50-74%)：部分匹配
- 低 (<50%)：匹配度较低

**质量评分**（基于下载量）：
| 等级 | 下载量 | 建议 |
|------|--------|------|
| 优秀 | >1000 | 推荐使用 |
| 良好 | >100 | 可放心使用 |
| 一般 | >10 | 建议先测试 |
| 新发布 | >0 | 谨慎使用 |

### Step 7: 批量安装

安装 Top 3 推荐技能：

```bash
42plugin install <skill-full-name>
```

### Step 8: 改写计划

基于项目类型和差距分析生成适应性改写建议。

## Features

- **通用项目类型** - 支持技能/笔记/代码/知识库等
- **类型化搜索** - 不同类型不同搜索策略
- **项目感知** - 基于现有资源生态推荐
- **自动探索** - `--auto` 自动检测项目类型
- **语义理解** - 中英文关键词扩展
- **多策略搜索** - 聚合多个查询结果
- **搜索缓存** - 1 小时 TTL 缓存
- **智能匹配** - 基于类型和特性评分
- **质量评估** - 基于下载量评分
- **批量安装** - 一键安装 Top 推荐
- **改写建议** - 提供类型适配方案

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/workflow.ts` | 完整工作流入口 |
| `scripts/search.ts` | 独立搜索脚本 |

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

1. **Explore Project** (Claude Code with --auto)
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

4. **Analyze & Recommend**
   - Output match report with match level (高/中/低)
   - Output quality score (优秀/良好/一般/新发布)
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

**Type Detection Guide**:
| Indicators | Project Type |
|------------|--------------|
| skills, plugins, prompts, workflows | skill-repository |
| notes, markdown, obsidian, logseq | note-repository |
| code, git, repository, development | code-repository |
| wiki, documentation, knowledge, KB | knowledge-base |
| mixed or unclear | other |

**Output**:
- Exploration report (JSON)
- Type-specific search queries
- Search results with match scores
- Quality scores (based on downloads)
- Gap analysis recommendation table
- Adaptation recommendations

**Opening**: "请探索项目并生成 JSON 探索报告，然后使用 skill-searcher 工作流查找相关资源。"

**Script Usage**:
```bash
# 完整工作流
bun ${SKILL_DIR}/scripts/workflow.ts --auto --search --install --adapt

# 技能仓库
bun ${SKILL_DIR}/scripts/workflow.ts '{\"projectName\":\"MySkills\",\"projectType\":\"skill-repository\",...}' --search --install

# 笔记仓库
bun ${SKILL_DIR}/scripts/workflow.ts '{\"projectName\":\"MyNotes\",\"projectType\":\"note-repository\",...}' --search --adapt

# 代码仓库
bun ${SKILL_DIR}/scripts/workflow.ts '{\"projectName\":\"MyCode\",\"projectType\":\"code-repository\",...}' --search
```
