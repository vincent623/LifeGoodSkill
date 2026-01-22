# Vincent 的 Dotfiles 仓库

个人开发环境的配置管理项目。使用 GNU Stow 进行符号链接管理，确保环境的可移植性和可复现性。

## 📦 结构

```
dotfiles/
├── zsh/              # Zsh 配置
│   └── home/
│       ├── .zshrc
│       ├── .zprofile
│       └── .zfunc/
├── shell/            # Bash 配置
│   └── home/
│       ├── .bashrc
│       └── .bash_profile
├── git/              # Git 配置
│   └── home/
│       └── .gitconfig
├── scripts/          # 启动脚本
│   └── bootstrap.sh
├── Brewfile          # Homebrew 包列表
└── README.md
```

## 🚀 快速开始

### 一键自动化部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/vincent/dotfiles.git ~/dotfiles
cd ~/dotfiles

# 2. 运行智能 Bootstrap 脚本
./scripts/bootstrap.sh
```

**脚本功能：**
- ✅ 自动检测当前环境（OS、架构、已安装工具）
- ✅ 扫描 Brewfile 并显示工具安装状态和版本
- ✅ **新电脑**：自动安装所有缺失的工具
- ✅ **已有环境**：只检测并提示，不重复安装
- ✅ 智能备份现有配置文件
- ✅ 部署 dotfiles 符号链接
- ✅ 生成详细的环境配置报告

**特点：**
- 幂等性：重复运行安全，已安装的工具不会重复安装
- 智能检测：自动识别环境状态，按需安装
- 完整报告：显示已安装、新安装、跳过的工具统计

### 手动逐步部署（高级用户）

```bash
# 安装 stow（如果没有）
brew install stow

# 部署 Zsh 配置
stow -t ~ zsh

# 部署 Bash 配置
stow -t ~ shell

# 部署 Git 配置
stow -t ~ git

# 安装所有 Homebrew 包
brew bundle

# 验证符号链接
ls -la ~ | grep zshrc
```

## 📝 包含的工具链

### Python
- UV 0.8.5 - 现代 Python 包管理器
- Python 3.13.4

### JavaScript
- Node.js v24.2.0 (via NVM，懒加载优化)
- Bun 1.2.10

### Shell 增强
- Starship - 现代化跨 Shell 提示符
- zsh-autosuggestions - 命令自动建议
- Zoxide - 智能目录跳转（替代 cd）
- Eza - 现代化 ls 替代

### 数据分析
- VisiData (vd) - 终端数据查看器（通过 uv tool 安装）
- Marimo - 交互式 Python 笔记本（项目级依赖）

### 开发工具
- Git 2.50.1
- Java OpenJDK 17
- Rust (cargo)
- LaTeX (mactex-no-gui)
- Docker (orbstack)

### 编辑器/终端
- Ghostty - 终端模拟器
- Zed - 代码编辑器

### 镜像源配置
- Homebrew - 清华镜像源
  - brew.git: https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git
  - Bottles: https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles
  - API: https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api
- PyPI - 清华镜像源: https://pypi.tuna.tsinghua.edu.cn/simple

## 🔧 常用命令

### Shell 增强功能

```bash
# Zoxide - 智能跳转
z ~/Documents          # 跳转到目录
zi                     # 交互式选择
z foo                  # 跳转到最常访问的包含 'foo' 的目录

# Eza - 现代化列表
ls                     # 带图标的彩色列表
ll                     # 详细列表 + git 状态
la                     # 包含隐藏文件
lt                     # 树形视图（2层）

# Zsh Autosuggestions
# 输入时自动显示灰色建议，按 → 接受
```

### 数据分析工具

**VisiData - 终端数据查看器**
```bash
# 安装（通过 uv tool）
uv tool install visidata

# 使用
vd data.csv            # 查看 CSV 文件
vd data.json           # 查看 JSON 文件
vd data.xlsx           # 查看 Excel 文件
```

**Marimo - 交互式 Python 笔记本**
```bash
# 在项目中安装（项目级依赖，不建议全局安装）
cd your-project
uv add marimo

# 使用
uv run marimo edit notebook.py    # 编辑笔记本
uv run marimo run notebook.py     # 运行笔记本
```

### 更新配置

```bash
# 编辑配置
vi ~/.zshrc

# 更新仓库（会自动符号链接）
cd ~/dotfiles
git add .
git commit -m "Update zsh config"
git push
```

### 在新电脑上同步

```bash
cd ~/dotfiles
git pull
# 配置自动更新（因为用的是符号链接）
```

### 备份 Homebrew 包

```bash
cd ~/dotfiles
brew bundle dump --file=Brewfile --force
git add Brewfile
git commit -m "Update Brewfile"
```

### 验证镜像源配置

```bash
# 查看当前 Homebrew 镜像源配置
cd $(brew --repo)
git remote -v

# 查看环境变量
echo $HOMEBREW_BOTTLE_DOMAIN
echo $HOMEBREW_API_DOMAIN

# 测试更新（使用清华源）
brew update
```

### 环境健康检查

定期运行健康检查脚本，确保环境处于最佳状态：

```bash
cd ~/dotfiles
./scripts/check_health.sh
```

**检查内容：**
- ✅ 符号链接是否正确配置
- ✅ 工具版本是否最新
- ✅ Brewfile 更新时间
- ✅ Git 仓库状态
- ✅ 环境变量配置
- ✅ Shell 增强工具
- ✅ 数据分析工具

**健康评分系统：**
- 90%+ : 优秀 ⭐⭐⭐
- 75-89%: 良好 ⭐⭐
- 60-74%: 中等 ⭐
- <60%  : 需要维护 ⚠️

脚本会提供具体的改进建议，帮助你保持环境最佳状态。

## 📚 相关文档

- [开发环境配置报告.md](../开发环境配置报告.md) - 完整的环境配置说明
- [技术决策归档.md](../技术决策归档.md) - 所有技术决策的记录和思考

## 🌐 镜像源说明

本项目默认使用**清华大学开源镜像站**加速 Homebrew 下载：

### 已配置的镜像

1. **Homebrew brew.git**
   - 源地址: https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git
   - 用途: Homebrew 核心仓库

2. **Homebrew Bottles**
   - 源地址: https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles
   - 用途: 预编译二进制包下载

3. **Homebrew API**
   - 源地址: https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api
   - 用途: Homebrew 新版 API 接口

4. **PyPI**
   - 源地址: https://pypi.tuna.tsinghua.edu.cn/simple
   - 用途: Python 包下载加速

### 镜像源配置位置

所有镜像源配置在 `zsh/home/.zprofile` 中：
```bash
export HOMEBREW_API_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api
export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles
export HOMEBREW_BREW_GIT_REMOTE=https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git
export HOMEBREW_PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
```

### 切换回官方源（可选）

如果需要切换回 Homebrew 官方源：
```bash
# 重置 brew.git
cd $(brew --repo)
git remote set-url origin https://github.com/Homebrew/brew

# 取消环境变量（编辑 .zprofile 注释掉镜像源配置）
unset HOMEBREW_API_DOMAIN
unset HOMEBREW_BOTTLE_DOMAIN
unset HOMEBREW_BREW_GIT_REMOTE
```

### 参考文档

- [清华镜像 - Homebrew](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew/)
- [清华镜像 - Homebrew Bottles](https://mirrors.tuna.tsinghua.edu.cn/help/homebrew-bottles/)

## 🎯 最佳实践

### 1. 环境检测和更新

```bash
# 随时检查环境状态
cd ~/dotfiles
./scripts/bootstrap.sh

# 脚本会自动：
# - 检测所有工具的安装状态
# - 显示已安装工具的版本号
# - 提示缺失的工具
# - 询问是否安装（不会强制安装）
```

### 2. 符号链接验证

```bash
# 检查所有符号链接
find ~ -maxdepth 1 -type l -ls

# 确保 .zshrc 指向 dotfiles
ls -la ~/.zshrc
# 输出应该是：~/.zshrc -> ~/dotfiles/zsh/home/.zshrc
```

### 3. 跨机器同步

```bash
# 设备 A 更新配置
vim ~/.zshrc
cd ~/dotfiles
git add .
git commit -m "Update config"
git push

# 设备 B 同步
cd ~/dotfiles
git pull
./scripts/bootstrap.sh  # 自动检测并安装缺失工具
```

## 🔐 隐私和安全

**不要提交以下文件：**
- `.ssh` 和 SSH 密钥
- `.gnupg` 和 GPG 密钥
- 包含 API 密钥的配置文件

这些通常通过 `.gitignore` 排除，或在本地维护。

## 🚨 故障排除

### Bootstrap 脚本相关

**问题：首次运行提示缺少工具**
```bash
# 正常情况：脚本会自动安装
# 如果跳过了安装，可以随时重新运行
./scripts/bootstrap.sh
```

**问题：想要重新检测所有工具**
```bash
# 直接重新运行脚本即可（幂等性保证）
cd ~/dotfiles
./scripts/bootstrap.sh
```

### Stow 符号链接相关

**问题：Stow 无法创建符号链接**
```bash
# 问题：文件已存在
# 解决方案：bootstrap 脚本会自动备份并处理
# 如需手动处理：
mv ~/.zshrc ~/.zshrc.bak
stow -t ~ zsh
```

**问题：符号链接损坏**
```bash
# 重新运行 bootstrap 或手动重建
stow -D -t ~ zsh  # 删除
stow -t ~ zsh     # 重新创建
```

### 配置相关

**问题：新配置不生效**
```bash
# 重新加载 Shell
source ~/.zshrc
# 或打开新终端
exec zsh
```

## 📈 维护和更新

### 月度
- [ ] 运行 `brewup` 更新所有包
- [ ] 检查 Shell 启动时间

### 季度
- [ ] 审查并更新 Brewfile
- [ ] 评估新工具

### 年度
- [ ] 完整的配置审查
- [ ] 更新技术决策文档

## 🤝 关于 Stow

Stow 是一个用于管理符号链接的工具。它将源文件目录中的文件符号链接到目标目录，非常适合管理 dotfiles。

**优点：**
- ✅ 简单易用
- ✅ 无外部依赖
- ✅ 与 Git 无缝集成
- ✅ 易于理解和维护

**官方文档：** https://www.gnu.org/software/stow/manual/

## 📞 反馈和改进

如有任何改进建议，欢迎提出！

---

**最后更新：** 2024 年 12 月 1 日
**维护者：** vincent
