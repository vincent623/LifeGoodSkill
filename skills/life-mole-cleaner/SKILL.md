---
name: life-mole-cleaner
description: 使用 Mole 安全清理 Mac 电脑。仅执行预览分析，让用户确认后再清理，确保零风险。
---

# Mac 清理助手

使用 [Mole](https://github.com/tw93/mole) 安全清理 Mac，遵循预览→确认→执行流程。

## 使用原则

**核心安全规则**：
1. 始终先使用 `--dry-run` 预览要清理的内容
2. 清理前必须获得用户明确确认
3. 只清理系统缓存、临时文件等安全项目
4. 不触碰用户个人数据、配置文件、应用设置

## 命令

```bash
# 预览清理（安全模式）
node ${SKILL_DIR}/scripts/main.ts preview

# 查看系统状态
node ${SKILL_DIR}/scripts/main.ts status

# 分析磁盘使用
node ${SKILL_DIR}/scripts/main.ts analyze

# 执行清理（需用户确认）
node ${SKILL_DIR}/scripts/main.ts clean
```

## 工作流程

1. **preview** - 运行 `mo clean --dry-run` 展示将清理的内容
2. **status** - 运行 `mo status` 显示系统健康状态
3. **analyze** - 运行 `mo analyze` 分析磁盘占用
4. **clean** - 先预览，再确认，最后执行 `mo clean`

## 安全边界

**会清理的**：
- 系统缓存文件
- 应用临时文件
- 日志文件
- 损坏的缓存

**不会触碰的**：
- 用户文档、下载文件
- 个人配置文件
- 已安装的应用
- 用户数据目录

## 示例

```
> 帮我清理电脑
→ 先运行预览让你查看清理内容
→ 你确认后再执行清理
```
