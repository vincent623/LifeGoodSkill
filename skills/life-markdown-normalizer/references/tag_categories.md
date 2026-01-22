# Tag Generation Categories

## Overview

This document defines the keyword-to-tag mapping rules for intelligent tag generation.

## Tag Categories

### AI & Machine Learning
**Tag**: `AI`

**Keywords**:
- AI, LLM, Claude, GPT
- 大模型, 人工智能, 机器学习
- Transformer, Neural Network
- Deep Learning, NLP

**Example notes**:
- "Claude Code设计机制"
- "RAG分块评价指标"
- "推理模型提示词框架"

### Cognitive Science
**Tag**: `认知科学`

**Keywords**:
- 认知, 学习, 记忆
- 注意力, 思维, 心理
- 大脑, 神经, 认知负荷

**Example notes**:
- "认知负荷测量方法"
- "人类认知能力变迁"
- "知识的诅咒"

### Product Design
**Tag**: `产品设计`

**Keywords**:
- 产品, 设计, UX, UI
- 用户体验, 交互
- 原型, 界面

**Example notes**:
- "最小可供故事的产品"
- "杂志设计风格汇总"

### Business
**Tag**: `商业`

**Keywords**:
- 商业, 经济, 市场
- 营销, 销售, 增长
- GDP, 商业模式

**Example notes**:
- "AI猪八戒网"
- "商业模式创新"

### Management
**Tag**: `管理`

**Keywords**:
- 管理, 组织, 团队
- 领导, 项目, 协作
- 流程, 效率

**Example notes**:
- "团队协作方法"
- "项目管理实践"

### Technology
**Tag**: `技术`

**Keywords**:
- 编程, 代码, 开发
- 工程, 架构
- Python, JavaScript, API
- 软件, 系统

**Example notes**:
- "API设计原则"
- "代码重构技巧"

### Data
**Tag**: `数据`

**Keywords**:
- 数据, 分析, 可视化
- 统计, 指标
- 数据库, 数据科学

**Example notes**:
- "蒙特卡洛分析"
- "数据可视化方法"

### Education
**Tag**: `教育`

**Keywords**:
- 教育, 教学, 培训
- 学校, 老师, 学生
- 课程, 学习方法

**Example notes**:
- "教学设计原则"
- "学习效果评估"

### Society
**Tag**: `社会`

**Keywords**:
- 社会, 文化, 历史
- 政治, 人文
- 社会现象, 趋势

**Example notes**:
- "社会变迁分析"
- "文化现象观察"

### Philosophy
**Tag**: `哲学`

**Keywords**:
- 哲学, 思考, 观点
- 理论, 方法论
- 认识论, 价值观

**Example notes**:
- "知识的本质"
- "思维方法论"

### Tools
**Tag**: `工具`

**Keywords**:
- 工具, 软件, 应用
- 平台, App
- 效率工具, 生产力

**Example notes**:
- "笔记工具对比"
- "效率工具推荐"

### Writing
**Tag**: `写作`

**Keywords**:
- 写作, 文章, 笔记
- 文档, 内容
- 表达, 沟通

**Example notes**:
- "写作技巧总结"
- "内容创作方法"

## Tag Generation Logic

### Priority Rules

1. **Content-based matching**: Scan title + first 500 characters for keywords
2. **First match wins**: Once a tag is matched, it's added to the list
3. **Maximum 3 tags**: Stop after finding 3 matching tags
4. **Default fallback**: If fewer than 3 tags found, use default tags

### Default Tags

When content-based matching finds fewer than 3 tags, these defaults are used in order:
- 笔记
- 知识管理
- 思考
- 学习
- 总结

### Example Generation Process

**Input note**:
```markdown
# AI猪八戒网

探讨AI如何改变服务外包市场的商业模式...
```

**Generation steps**:
1. Scan "AI猪八戒网 探讨AI如何改变服务外包市场的商业模式..."
2. Match "AI" → Add tag `AI`
3. Match "商业模式" → Add tag `商业`
4. Match "市场" → Add tag `商业` (already exists, skip)
5. Match "服务" → No direct match, continue
6. Reach 3 tags limit → Stop
7. **Result**: `[AI, 商业, 产品设计]`

