# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

LifeGoodSkill - Claude Code 技能市场插件，提供提升日常生活效率的工具。

## 项目结构

技能位于 `skills/<skill-name>/` 目录下：

```
skills/<skill-name>/
├── SKILL.md              # YAML front matter + 文档
├── scripts/              # 实现代码 (TypeScript/JavaScript 或 Python)
├── prompts/              # AI 生成指南 (可选)
├── references/           # 补充文档 (可选)
└── assets/               # 资源文件 (可选)
```

所有技能在 `.claude-plugin/marketplace.json` 的 `life-skills` 插件下注册。

## 运行技能

```bash
# TypeScript/JavaScript 技能
npx -y bun skills/<skill>/scripts/main.js [选项]

# Python 技能
npx -y bun skills/<skill>/scripts/main.py [选项]

# Claude Code 命令
/<skill-name> [选项]
```

## 核心依赖

- **Bun**: TypeScript/JavaScript 运行时 (无需构建)
- **Python 3**: Python 技能必需
- **无 npm 包**: 脚本仅使用内置模块

## 扩展支持

技能支持通过 `EXTEND.md` 自定义，查找路径（优先级顺序）：

1. `.life-good-skill/<skill-name>/EXTEND.md` (项目级)
2. `~/.life-good-skill/<skill-name>/EXTEND.md` (用户级)

扩展内容在技能执行前加载，覆盖默认配置。

## 发布流程

用户请求发布/发布/push 时：

1. 更新 `CHANGELOG.md` + `CHANGELOG.zh.md`
2. 递增 `marketplace.json` 中的版本号
3. 如需要，更新 `README.md` + `README.zh.md`
4. 所有文件一起提交后再打标签

## 代码风格

- TypeScript/JavaScript 或 Python
- Async/await 模式
- 短变量名
- 类型安全接口 (TypeScript)
