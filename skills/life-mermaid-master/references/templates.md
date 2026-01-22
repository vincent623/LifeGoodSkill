# Mermaid Templates Reference

## Template List

| Template | Type | Description |
|----------|------|-------------|
| `flowchart-basic` | flowchart | Basic flowchart with branches |
| `flowchart-decision` | flowchart | Decision flowchart |
| `sequence-api` | sequence | API call sequence diagram |
| `class-simple` | class | Simple class diagram |
| `gantt-project` | gantt | Project timeline |
| `pie-distribution` | pie | Data distribution |

## Flowchart Templates

### flowchart-basic
```python
{
    "type": "flowchart",
    "title": "基础流程图",
    "steps": ["开始", "处理步骤1", "条件判断", "处理步骤2", "结束"],
    "branches": {"是": ["分支处理A"], "否": ["分支处理B"]},
}
```

### flowchart-decision
```python
{
    "type": "flowchart",
    "title": "决策流程",
    "steps": ["问题", "收集信息", "分析选项", "做出决策", "执行"],
    "branches": {"选项A": ["评估A"], "选项B": ["评估B"]},
}
```

## Sequence Templates

### sequence-api
```python
{
    "type": "sequence",
    "title": "API 调用时序",
    "participants": ["客户端", "API网关", "认证服务", "业务服务", "数据库"],
    "messages": [
        {"from": "客户端", "to": "API网关", "text": "HTTP请求", "arrow": "->>"},
        {"from": "API网关", "to": "认证服务", "text": "验证Token", "arrow": "->>"},
        {"from": "认证服务", "to": "API网关", "text": "验证结果", "arrow": "-->>"},
        {"from": "API网关", "to": "业务服务", "text": "转发请求", "arrow": "->>"},
        {"from": "业务服务", "to": "数据库", "text": "数据操作", "arrow": "->>"},
        {"from": "数据库", "to": "业务服务", "text": "查询结果", "arrow": "-->>"},
    ],
}
```

## Class Templates

### class-simple
```python
{
    "type": "class",
    "title": "简单类图",
    "classes": [
        {"name": "Animal", "attributes": ["- name: String", "- age: int"], "methods": ["+ speak(): void"]},
        {"name": "Dog", "attributes": ["- breed: String"], "methods": ["+ speak(): void"]},
        {"name": "Cat", "attributes": ["- color: String"], "methods": ["+ speak(): void"]},
    ],
    "relationships": [
        {"from": "Dog", "to": "Animal", "type": "--|>", "label": "继承"},
        {"from": "Cat", "to": "Animal", "type": "--|>", "label": "继承"},
    ],
}
```

## Gantt Templates

### gantt-project
```python
{
    "type": "gantt",
    "title": "项目计划",
    "tasks": [
        {"name": "需求分析", "section": "第一阶段", "start": "2024-01-01", "duration": "5d"},
        {"name": "设计阶段", "section": "第一阶段", "start": "after需求分析", "duration": "7d"},
        {"name": "开发实现", "section": "第二阶段", "start": "after设计阶段", "duration": "14d"},
        {"name": "测试验证", "section": "第二阶段", "start": "after开发实现", "duration": "7d"},
        {"name": "部署上线", "section": "第三阶段", "start": "after测试验证", "duration": "3d"},
    ],
}
```

## Pie Templates

### pie-distribution
```python
{
    "type": "pie",
    "title": "资源分布",
    "data": {"核心功能": 40, "增强功能": 25, "维护更新": 20, "新特性": 15},
}
```

## Diagram Types Quick Reference

| Type | Keyword | Best For |
|------|---------|----------|
| Flowchart | `graph LR/TB` | Process flows, decisions |
| Sequence | `sequenceDiagram` | API calls, interactions |
| Class | `classDiagram` | OOP design, architecture |
| State | `stateDiagram-v2` | State machines |
| ER | `er` | Database schema |
| Gantt | `gantt` | Project timeline |
| Pie | `pie` | Data distribution |
| Mindmap | `mindmap` | Brainstorming |
| Journey | `journey` | User journeys |

## Aspect Ratio Guide

| Ratio | Use Case |
|-------|----------|
| 4:3 | General flowcharts |
| 16:9 | Wide diagrams, sequences |
| 1:1 | Pie charts, mindmaps |
| 3:4 | Tall hierarchies |
| 3:2 | Gantt charts |
| 2:3 | User journeys |

## Color Scheme Preview

| Scheme | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| blue | #3b82f6 | #1d4ed8 | #60a5fa |
| green | #10b981 | #059669 | #34d399 |
| purple | #8b5cf6 | #7c3aed | #a78bfa |
| orange | #f97316 | #ea580c | #fb923c |

## Custom Extension Example

Create `EXTEND.md` to override defaults:

```markdown
# Extension Config

## Default Color Scheme
scheme: purple

## Default Aspect Ratio
ratio: 16:9

## Custom Templates
[templates.md](templates.md)
```
