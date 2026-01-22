---
name: life-file-organizer
description: Automatically organize messy directories by type, date, and custom rules. Detects duplicates, cleans desktop/downloads, and generates organized folder structures. Use when user needs to clean up cluttered directories, organize downloads, or maintain file order.
---

# Life File Organizer

自动整理文件混乱，支持分类、去重、质量评估。

## Usage

```bash
# 完整整理流程
npx -y bun skills/life-file-organizer/scripts/main.js ./downloads

# 仅评估质量
npx -y bun skills/life-file-organizer/scripts/main.js ./folder --mode assess

# 仅查找重复
npx -y bun skills/life-file-organizer/scripts/main.js ./folder --mode duplicates

# 预览不执行
npx -y bun skills/life-file-organizer/scripts/main.js ./folder --dry-run
```

## What It Does

| 混乱状态 | 整理后 |
|----------|--------|
| 桌面混乱 | 按类型分类 |
| 下载堆积 | 日期归档 |
| 混合格式 | 有序结构 |
| 重复文件 | 去重检测 |
| 命名问题 | 风险提示 |

## 评估维度

| 维度 | 问题 |
|------|------|
| 命名规范 | 特殊字符、空格、编码问题 |
| 目录深度 | 嵌套过深、查找困难 |
| 文件分类 | 类型混杂、无序堆放 |
| 重复文件 | 冗余占用空间 |
| 自动化 | 缺少 source/scripts/.git |

## 危险字符

| 字符 | 问题 | 示例 |
|------|------|------|
| `【】` | Shell需转义 | `【主持稿】.md` |
| `@` | Shell特殊含义 | `数据@来源.xlsx` |
| `：` | Windows非法 | `方案：终稿.md` |
| `、` | 非标准分隔符 | `1、任务.md` |
| `——` | 搜索困难 | `————分隔————.md` |
| 空格 | 需引号包裹 | `my file.doc` |
| 全角符号 | 跨平台问题 | `（讨论）.txt` |

**安全字符:** `a-z`, `A-Z`, `0-9`, `-`, `_`, `.`

## 整理策略

### 按类型
```
folder/
├── Documents/
├── Images/
├── Videos/
├── Archives/
└── Other/
```

### 按日期
```
folder/
├── 2024/
│   ├── 01-January/
│   └── 02-February/
└── 2025/
    └── 01-January/
```

## 功能

- 自动分类 - 检测并按类型排序
- 重复检测 - MD5哈希查找相同文件
- 桌面清理 - 特殊处理桌面目录
- 下载管理 - 日期归档
- 预览模式 - 先预览再执行
- 质量评估 - 命名/结构/自动化检测
- 报告生成 - 保存整理报告

## Best For

- 桌面清理
- 下载文件夹管理
- 项目文件夹整理
- 文档归档
- 重复文件清理

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/main.js`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.js` | 主入口，组织流程 |
| `scripts/classifier.js` | 文件类型检测分类 |
| `scripts/duplicates.js` | 重复文件查找 |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-file-organizer/EXTEND.md` (project)
2. `~/.life-good-skill/life-file-organizer/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: File Organization Expert

**Context**:
- User provides a messy directory that needs organization
- Goal: Automatically sort files by type, detect issues, generate report
- Output: Organized directory with assessment report

**Task**:
1. Scan directory for all files
2. Assess quality (naming, structure, automation)
3. Classify files by extension/type
4. Find duplicates by hash
5. Apply organizing strategy
6. Generate report

**Output**:
- 分类子目录
- 整理报告 (file-organization-report.md)
- 重复文件列表
- 命名问题清单

**Opening**: "请提供需要整理的目录，我将自动分类文件、检测问题并生成整理报告。"

**Script Usage**:
```bash
npx -y bun ${SKILL_DIR}/scripts/main.js ./downloads --dry-run
npx -y bun ${SKILL_DIR}/scripts/main.js ./folder --mode assess
npx -y bun ${SKILL_DIR}/scripts/main.js ./folder --mode duplicates
```
