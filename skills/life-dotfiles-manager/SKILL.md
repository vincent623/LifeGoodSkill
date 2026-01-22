---
name: life-dotfiles-manager
description: Deploy consistent development environment across machines with one command. Includes tool installation, version management, and mirror source configuration. Use when user needs to set up new machine, sync dotfiles, or manage development tools.
---

# Dotfiles Manager

Deploy and sync your development environment with one command.

## Usage

```bash
# Deploy development environment
/life-dotfiles-manager deploy

# Sync configurations from repository
/life-dotfiles-manager sync

# Check environment status
/life-dotfiles-manager status
```

## What It Does

| New Machine | Existing Machine |
|-------------|------------------|
| 无 → 完整开发环境 | 检测 → 增量安装 |
| Python/Node/Bun | 版本检测 |
| Starship/fzf/zoxide | 配置同步 |
| 镜像源已配置 | 保持配置一致 |

## One-Command Setup

```bash
# Fresh machine setup
git clone <dotfiles-repo> ~/dotfiles
cd ~/dotfiles
./scripts/bootstrap.sh

# Result: Complete dev environment in ~5 minutes
```

## Managed Tools

| Category | Tools |
|----------|-------|
| **Languages** | Python, Node.js, Bun, Rust |
| **Shell** | Starship, Zoxide, fzf, eza |
| **File Tools** | bat, fd, ripgrep, yazi |
| **Dev** | Git, Docker, Java, UV |

## Best For

- New machine setup
- Cross-machine sync
- Environment consistency
- Tool version management

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.sh`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/deploy.sh` | Deploy development environment |
| `scripts/sync.sh` | Sync configurations from repository |
| `scripts/status.sh` | Check environment status |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/life-dotfiles-manager/EXTEND.md` (project)
2. `~/.life-good-skill/life-dotfiles-manager/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
