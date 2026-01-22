# LifeGoodSkill

[English](./README.md) | 中文

提升日常生活效率的技能集，与 Claude Code 配合使用。

## 入选标准

一个工具要入选"美好生活技能包"，它不能仅仅是"有用"，它必须符合以下 3 个核心公理：

公理 1：指挥官视角 (The Commander Axiom)标准： 工具必须赋予用户"发号施令"的权力，而不是分配"执行任务"的义务。
拒绝： 任何需要用户手动填表、打卡、维护数据的工具（那是给奴隶用的）。
入选： 一键生成、后台自动运行、决策辅助类的工具。

公理 2：确定性交付 (The Certainty Axiom)标准： 工具必须用 AI 的强逻辑/强执行，对抗生活的不确定性/熵增。
拒绝： 模棱两可的建议，或者增加了更多阅读负担的内容。
入选： 混乱进去 $\rightarrow$ 秩序出来（如：杂乱录音 $\rightarrow$ 结构化文档）。

公理 3：身份锚点 (The Identity Axiom)标准： 使用该工具的瞬间，必须能强化用户渴望的"新身份"（Anti-Vision 的恐惧或 Vision 的优越感）。
拒绝： 纯娱乐、消磨时间、无法引发情绪波动的工具。
入选： 能直观展示"长期代价"或"专业级产出"的工具。

## 前置要求

- 已安装 Node.js 环境
- 能够运行 `npx bun` 命令

## 安装

### 快速安装（推荐）

```bash
npx skills add <owner>/LifeGoodSkill
```

### 注册为插件市场

在 Claude Code 中运行：

```bash
/plugin marketplace add <owner>/LifeGoodSkill
```

### 安装技能

**方式一：通过浏览界面**

1. 选择**浏览并安装插件**
2. 选择 **LifeGoodSkill**
3. 选择要安装的插件
4. 选择**立即安装**

**方式二：直接安装**

```bash
/plugin install life-skills@LifeGoodSkill
```

**方式三：告诉代理**

直接在 Claude Code 中说：

> 请从 github.com/<owner>/LifeGoodSkill 安装 Skills

### 可用插件

| 插件 | 描述 | 技能 |
|------|------|------|
| **life-skills** | 生活提升技能 | [Dotfiles管理](#life-dotfiles-manager)、[Excel差异分析](#life-excel-diff)、[意图委员会](#life-intention-committee)、[Markdown整理](#life-markdown-normalizer)、[Mermaid大师](#life-mermaid-master)、[会议纪要](#life-meeting-summary)、[OKR生成器](#life-okr-generator)、[PDF转PPT](#life-pdf-to-ppt)、[问题解决器](#life-problem-solver)、[自我评估](#life-self-assessment)、[字幕处理器](#life-subtitle-processor)、[文字校对](#life-text-proofreader)、[转录助手](#life-transcription)、[翻译助手](#life-translation) |

## 更新技能

要将技能更新到最新版本：

1. 在 Claude Code 中运行 `/plugin`
2. 切换到**市场**标签（使用方向键或 Tab）
3. 选择 **LifeGoodSkill**
4. 选择**更新市场**

你也可以**启用自动更新**以自动获取最新版本。

## 可用技能

### life-dotfiles-manager

一键部署和同步开发环境，包括工具安装、版本管理和镜像源配置。

```bash
/life-dotfiles-manager deploy
/life-dotfiles-manager sync
/life-dotfiles-manager status
```

### life-excel-diff

批量分析结构一致的Excel文件，提取差异和异常，并生成AI驱动的摘要报告。

```bash
/life-excel-diff ./reports/
```

### life-intention-committee

意图发掘助手，使用六顶思考帽框架从多个角度分析用户目标。

```bash
/life-intention-committee
```

### life-markdown-normalizer

使用统一的时间戳命名、YAML frontmatter和智能标签生成来标准化Markdown笔记。

```bash
/life-markdown-normalizer ./notes/
```

### life-mermaid-master

使用结构化思维和清晰视觉设计创建专业的 Mermaid 流程图。

```bash
/life-mermaid-master
```

### life-meeting-summary

将混乱的会议记录转换为专业的会议纪要。

```bash
/life-meeting-summary
```

### life-okr-generator

根据职位描述和计划周期生成符合 SMART 原则的 OKR 文档。

```bash
/life-okr-generator
```

### life-pdf-to-ppt

使用AI驱动的矢量化将PDF页面转换为可编辑的PowerPoint演示文稿。

```bash
/life-pdf-to-ppt ./document.pdf
```

### life-problem-solver

专业问题解决顾问，使用四层框架（调度→领域→应用→工具）。

```bash
/life-problem-solver
```

### life-self-assessment

自我评估矫正工具，为您的自我评价提供客观反馈。

```bash
/life-self-assessment
```

### life-subtitle-processor

使用格式转换和语义分段将视频字幕转换为结构化的知识切片。

```bash
/life-subtitle-processor ./video.srt
```

### life-text-proofreader

专业中文文字校对，识别并纠正错别字和语法错误。

```bash
/life-text-proofreader
```

### life-transcription

录音转录整理工具，适用于音频内容。

```bash
/life-transcription
```

### life-translation

专业文章翻译工具，支持多种模式。

```bash
/life-translation
```

## 环境配置

某些技能可能需要 API 密钥或自定义配置。环境变量可设置在 `.env` 文件中：

**加载优先级**（高优先级覆盖低优先级）：
1. CLI 环境变量（例如：`API_KEY=xxx /skill-name ...`）
2. `process.env`（系统环境）
3. `<cwd>/.life-good-skill/.env`（项目级）
4. `~/.life-good-skill/.env`（用户级）

**设置**：

```bash
# 创建用户级配置目录
mkdir -p ~/.life-good-skill

# 创建 .env 文件
cat > ~/.life-good-skill/.env << 'EOF'
# API 密钥和配置
API_KEY=your-key-here
EOF
```

**项目级配置**（团队共享）：

```bash
mkdir -p .life-good-skill
# 将 .life-good-skill/.env 添加到 .gitignore 以避免提交密钥
echo ".life-good-skill/.env" >> .gitignore
```

## 自定义

所有技能都支持通过 `EXTEND.md` 文件进行自定义。创建扩展文件以覆盖默认样式、添加自定义配置或定义自己的预设。

**扩展路径**（按优先级顺序检查）：
1. `.life-good-skill/<skill-name>/EXTEND.md` - 项目级（适用于团队/项目特定设置）
2. `~/.life-good-skill/<skill-name>/EXTEND.md` - 用户级（适用于个人偏好）

**示例**：自定义技能：

```bash
mkdir -p .life-good-skill/<skill-name>
```

然后创建 `.life-good-skill/<skill-name>/EXTEND.md`：

```markdown
## 自定义配置

你的自定义设置...
```

扩展内容将在技能执行前加载，并覆盖默认配置。

## 许可证

MIT
