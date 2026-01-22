# 更新日志

[English](./CHANGELOG.md) | 中文

## 1.2.1 - 2026-01-22

### 更新

- **life-daily-starter**: 基于 zw (Zed Work) 工作流完全重写 - Apple Reminders 集成、僵尸工作区检测、Obsidian 双向链接
- **life-file-organizer**: 新增质量评估模式，支持命名问题检测、MD5 哈希重复文件查找、中文危险字符检测

### 技术

- 两个技能现在都使用 Bun/JS 而非 Python
- 新增危险字符检测表（【】@：——空格等）
- 新增 --mode=assess 和 --mode=duplicates 模式

## 1.2.0 - 2026-01-22

### 新增

- **life-daily-starter**: 晨间仪式助手，包含习惯打卡和日记生成
- **life-file-organizer**: 自动按类型和日期整理文件，检测重复文件
- **life-knowledge-sync**: 跨平台笔记同步，生成知识图谱

### 更改

- 所有新脚本使用 Bun/JS 而非 Python，以获得更好的 CLI 集成
- 按照 CLAUDE.md 规范为所有技能添加了 Script Directory 章节

### 技术

- 版本升级至 v1.2.0
- 新增 3 个技能覆盖三个核心方向

## 1.1.0 - 2026-01-22

### 新增

- **life-decision-analysis**: 使用六顶思考帽的多角度决策分析器
- **life-generating-mermaid-diagrams**: 将文本转换为 Mermaid 图表的命令行工具
- **life-interview-guide**: 面试准备分析器，生成优先级排序的问题列表
- **life-self-awareness**: 自我评估文档的认知偏见分析器
- **life-task-breakdown**: 带有甘特图可视化的任务分解工具

### 更改

- **life-mermaid-master**: 改进了图表生成和布局优化
- **life-transcription**: 增强了语音识别清理算法
- **life-text-proofreader**: 添加了更多语法纠正模式
- **marketplace.json**: 更新了技能注册格式

### 移除

- **life-intention-committee**: 已弃用，功能合并到 life-decision-analysis
- **life-problem-solver**: 已弃用，功能合并到 life-task-breakdown
- **life-self-assessment**: 已弃用，功能合并到 life-self-awareness

## 1.0.0 - 2026-01-22

### 初始发布

- LifeGoodSkill 初始发布
- 基于 essay-skills 模板的项目结构
- 准备好添加生活提升技能
