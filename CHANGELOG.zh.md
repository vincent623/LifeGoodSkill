## 未发布

### 新增

- **skill-searcher**: 增强多策略搜索和中文关键词扩展
  - 修复 spawn bug，添加 JSON 输出解析
  - 为 life-mole-cleaner 添加 Homebrew 自动安装检测
  - 多策略搜索，中文关键词扩展 (效率→productivity, task, organize...)
  - 结果去重和显示优化

- **life-mole-cleaner**: 新增 Mac 清理技能，使用 Mole
  - 安全预览 → 确认 → 执行工作流
  - 自动通过 Homebrew 安装 Mole（如果未安装）
  - 白名单保护关键目录
  - 安全释放 ~4-6GB 磁盘空间

### 技术

- 在 marketplace.json 中添加 `./skills/life-mole-cleaner`

🤖 使用 [Claude Code](https://claude.com/claude-code) 生成

Co-Authored-By: Claude <noreply@anthropic.com>

---

[English](./CHANGELOG.md) | 中文

## 1.4.0 - 2026-01-24

### 新增

- **skill-searcher**: 增强多策略搜索和中文关键词扩展
  - 修复 spawn bug，添加 JSON 输出解析
  - 为 life-mole-cleaner 添加 Homebrew 自动安装检测
  - 多策略搜索，中文关键词扩展 (效率→productivity, task, organize...)
  - 结果去重和显示优化

- **life-mole-cleaner**: 新增 Mac 清理技能，使用 Mole
  - 安全预览 → 确认 → 执行工作流
  - 自动通过 Homebrew 安装 Mole（如果未安装）
  - 白名单保护关键目录
  - 安全释放 ~4-6GB 磁盘空间

### 技术

- 在 marketplace.json 中添加 `./skills/life-mole-cleaner`
- 更新 marketplace 版本至 1.4.0

## 1.3.0 - 2026-01-22

### 新增

- **life-vision-protocol**: 基于"一天改善人生协议 Part 1"的 Anti-Vision 与愿景发现引导
- **life-interrupt-prompts**: 日间打断提示生成器，打破自动巡航模式 (Part 2)
- **life-evening-review**: 晚间复盘协议，整合洞察、设定次日行动 (Part 3)
- **life-compass**: 6要素人生罗盘导航系统 (终极综合)

### 更改

- 为 6 个技能添加了 Prompt Content 章节

### 技术

- 所有新技能使用 Bun/JS 而非 Python
- 遵循 skill-builder 最佳实践，完整的 YAML 前言
- 包含 Script Directory 和 Extension Support 章节
