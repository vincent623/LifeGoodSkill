---
name: life-network-troubleshooter
description: Generic network troubleshooting tool. Tests ping, DNS, and TCP ports. Auto-generates markdown diagnostic reports with solutions.
---

# Life Network Troubleshooter

通用网络故障排查工具。自动测试连通性、DNS 解析、TCP 端口，生成 Markdown 诊断报告。

## Usage

```bash
# 默认诊断 (ping + 常见端口)
bun ${SKILL_DIR}/scripts/main.ts

# 诊断指定目标
bun ${SKILL_DIR}/scripts/main.ts --target=192.168.1.100

# 指定输出文件
bun ${SKILL_DIR}/scripts/main.ts --target=8.8.8.8 --output=network-report.md

# 指定测试端口
bun ${SKILL_DIR}/scripts/main.ts --target=example.com --ports=22,80,443,3389
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--target` | 目标 IP 或域名 | 8.8.8.8 |
| `--output` | 输出报告文件名 | network-diagnosis-report.md |
| `--ports` | 要测试的端口列表 | 22,80,443 |

## Features

- **Ping 测试** - 检测网络层连通性、延迟、丢包率
- **DNS 解析** - 验证域名解析是否正常
- **端口检测** - 测试 TCP 端口开放状态
- **自动报告** - 生成 Markdown 格式诊断报告
- **通用方案** - 提供跨平台排查建议

## Common Use Cases

| 场景 | 命令 |
|------|------|
| 直连网络 Ping 不通 | `--target=172.25.25.1` |
| 远程服务器连通性 | `--target=<server-ip> --ports=22,443` |
| 网站访问问题 | `--target=example.com --ports=80,443` |
| RDP 连接测试 | `--target=<win-pc-ip> --ports=3389` |

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.ts`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/main.ts` | Main entry point |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-network-troubleshooter/EXTEND.md` (project)
2. `~/.life-good-skill/life-network-troubleshooter/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Network Troubleshooting Assistant

**Context**:
- User experiences network connectivity issues
- Skill runs automated diagnostics and generates reports
- Provides cross-platform solutions (Mac/Windows/Linux)

**Task**:
1. **Run Diagnostics**
   - Execute ping tests
   - Check TCP port connectivity
   - Verify DNS resolution

2. **Generate Report**
   - Create markdown diagnostic report
   - Include solutions for common issues
   - Provide follow-up recommendations

**Output**:
- Console summary (ping, ports)
- Markdown report file
- Actionable recommendations

**Opening**: "请描述您的网络问题，我将自动诊断并生成报告。"
