# LifeGoodSkill 技能库提升建议

> 评估日期：2026-01-23
> 参考标准：[systematic-knowledge-method](https://github.com/openmind/systematic-knowledge-method)

---

## 评估框架

基于 LifeGoodSkill 三大公理：

| 公理 | 标准 | 拒绝 | 入选 |
|------|------|------|------|
| **指挥官视角** | 赋予用户"发号施令"的权力 | 手动填表、打卡、维护数据 | 一键生成、后台自动运行 |
| **确定性交付** | 用强逻辑对抗不确定性 | 模棱两可、增加阅读负担 | 混乱进去 → 秩序出来 |
| **身份锚点** | 强化用户渴望的新身份 | 纯娱乐、消磨时间 | 展示长期代价或专业级产出 |

---

## systematic-knowledge-method 技能评估

| 技能 | 指挥官 | 确定性 | 身份锚点 | 总分 |
|------|:---:|:---:|:---:|:---:|
| **km-wechat-downloader** | ✅ 一键批量 | ✅ 混乱→有序文件 | ✅ 知识采集者 | **8/10** |
| **km-wechat-to-markdown** | ✅ 自动化 | ✅ 结构化MD | ✅ 系统化管理者 | **8/10** |
| **km-init-personal-structure** | ✅ 一键创建 | ✅ 无序→体系 | ✅ 知识架构师 | **8/10** |
| **km-organize-messy-knowledge-base** | ✅ 诊断执行 | ✅ 混乱→计划 | ✅ 知识整理专家 | **8/10** |
| **km-knowledge-literacy-assessment** | ✅ 自动扫描 | ✅ 量化报告 | ✅ 自评改进者 | **7/10** |
| **km-export-mac-notes** | ✅ 批量导出 | ✅ 备忘录→MD | ✅ 内容迁移者 | **7/10** |
| **km-wechat-html-to-clean-markdown** | ✅ 流程处理 | ✅ 脏HTML→纯净 | ✅ 内容净化者 | **7/10** |
| **km-wechat-markdown-add-frontmatter** | ✅ 脚本添加 | ✅ 有元数据 | ✅ 专业出版者 | **7/10** |

### 工具链优势

```
km-wechat-downloader → km-wechat-html-to-clean-markdown → km-wechat-markdown-add-frontmatter
```

完整工作流：采集 → 清洗 → 结构化 → 验证

---

## 核心差距分析

### 1. 工作流完整性

| 你的技能 | 问题 |
|----------|------|
| `life-translation` | 独立工作，无上下游 |
| `life-meeting-summary` | 独立工作，无交付验证 |
| 整体 | 缺乏"采集→清洗→结构化"的工具链 |

### 2. 违反公理的技能

| 技能 | 违反公理 | 问题 |
|------|----------|------|
| `life-daily-starter` | 指挥官视角 | 包含"习惯打卡"，需手动维护 |
| `life-evening-review` | 指挥官视角 | 需主动填写，偏向任务而非命令 |

### 3. 确定性交付不足

| 你的技能 | 问题 |
|----------|------|
| `life-translation` | 仅"翻译完成"，无量化交付 |
| `life-meeting-summary` | 无交付物验证：决议/待办/责任人是否齐全 |
| `life-text-proofreader` | 无修正统计：错别字N个、语法问题M个 |

---

## 提升建议

### P0 - 立即处理

| 行动 | 说明 |
|------|------|
| 删除/重构 `life-daily-starter` | 违反指挥官视角，改为被动记录 |
| 删除/重构 `life-evening-review` | 改为基于数据的自动洞察 |

### P1 - 高优先级

| 新技能 | 描述 |
|--------|------|
| **life-wechat-collector** | 工具链：下载→转换→添加元数据→分类 |
| **life-auto-journal** | 基于日历/日程自动生成日报 |
| **life-inbox-zero** | 自动分类收件箱：需处理/归档/委派 |

### P2 - 中优先级

| 行动 | 说明 |
|------|------|
| 交付物验证 | 为 meeting-summary、text-proofreader 增加验证输出 |
| 文档结构 | 统一为 SKILL-zh.md 结构，增加依赖关系图 |

### P3 - 长期考虑

| 新技能 | 公理符合 | 描述 |
|--------|:---:|------|
| **life-auto-time-audit** | 1+2 | 自动统计屏幕时间，混乱→秩序 |
| **life-decision-autopilot** | 1+2+3 | 基于历史决策，主动建议当前选择 |
| **life-password-audit** | 2 | 检测弱密码/重复密码 |
| **life-calendar-insights** | 2 | 从日历提取时间黑洞、高价值时段 |

---

## 文档结构优化

参考 systematic-knowledge-method 的 `SKILL-zh.md` 结构：

```
1. YAML元数据（name、description、author）
2. 概述（30字内）
3. 适用场景（何时用 + 何时不用）
4. 快速参考（表格形式）
5. 工作流程（步骤1、步骤2...）
6. 常见错误（问题+解决方案）
```

### 建议增加

- 技能间的依赖关系图
- "不适用于"的明确说明
- 与其他技能的配合示例

---

## 一句话总结

> **从"辅助工具"升级为"自动驾驶舱"：让用户从"做选择"变成"确认执行"。**

最大的差距不是技能数量，而是**是否减少了用户的认知负担和决策负担**。

---

*报告生成时间：2026-01-23*
