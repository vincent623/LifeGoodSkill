#!/bin/bash
# Vincent's Dotfiles Bootstrap Script
# 智能检测并按需安装开发环境

set -e

# ===== 颜色定义 =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# ===== 日志函数 =====
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_section() {
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ===== 全局变量 =====
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOTFILES_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$HOME/.dotfiles_backup_$(date +%Y%m%d_%H%M%S)"

# 统计数组
declare -a INSTALLED_TOOLS
declare -a MISSING_TOOLS
declare -a SKIPPED_TOOLS

# ===== 工具检测函数 =====
check_tool() {
    local tool=$1
    local type=${2:-"formula"}  # formula 或 cask

    if [ "$type" = "formula" ]; then
        if brew list --formula "$tool" &>/dev/null; then
            return 0
        fi
    else
        if brew list --cask "$tool" &>/dev/null; then
            return 0
        fi
    fi
    return 1
}

get_tool_version() {
    local tool=$1
    case $tool in
        python@3.13)
            python3 --version 2>&1 | awk '{print $2}'
            ;;
        node)
            node --version 2>&1 | sed 's/v//'
            ;;
        git)
            git --version 2>&1 | awk '{print $3}'
            ;;
        uv)
            uv --version 2>&1 | awk '{print $2}'
            ;;
        starship)
            starship --version 2>&1 | awk '{print $2}'
            ;;
        zoxide)
            zoxide --version 2>&1 | awk '{print $2}'
            ;;
        eza)
            eza --version 2>&1 | head -1 | awk '{print $2}'
            ;;
        rustc)
            rustc --version 2>&1 | awk '{print $2}'
            ;;
        *)
            echo "installed"
            ;;
    esac
}

# ===== 环境检测 =====
detect_environment() {
    log_section "🔍 检测当前环境"

    log_info "操作系统: $(uname -s)"
    log_info "架构: $(uname -m)"
    log_info "Dotfiles 目录: $DOTFILES_DIR"

    # 检查 Homebrew
    if ! command -v brew &> /dev/null; then
        log_warn "Homebrew 未安装"
        read -p "是否现在安装 Homebrew? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "安装 Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            log_success "Homebrew 安装完成"
        else
            log_error "Homebrew 是必需的，退出安装"
            exit 1
        fi
    else
        log_success "Homebrew 已安装: $(brew --version | head -1)"
    fi

    # 检查 Stow
    if ! command -v stow &> /dev/null; then
        log_info "安装 GNU Stow..."
        brew install stow
        log_success "GNU Stow 安装完成"
    else
        log_success "GNU Stow 已安装"
    fi
}

# ===== 扫描 Brewfile 并检测工具 =====
scan_brewfile() {
    log_section "📦 扫描 Brewfile 并检测已安装工具"

    if [ ! -f "$DOTFILES_DIR/Brewfile" ]; then
        log_error "Brewfile 不存在"
        return
    fi

    local total_formulas=0
    local installed_formulas=0
    local total_casks=0
    local installed_casks=0

    echo ""
    log_info "Formula 包检测:"
    echo ""

    # 读取 formula
    while IFS= read -r line; do
        if [[ $line =~ ^brew[[:space:]]\"([^\"]+)\" ]]; then
            tool="${BASH_REMATCH[1]}"
            total_formulas=$((total_formulas + 1))

            if check_tool "$tool" "formula"; then
                version=$(get_tool_version "$tool")
                printf "  ${GREEN}✓${NC} %-30s %s\n" "$tool" "${CYAN}$version${NC}"
                INSTALLED_TOOLS+=("$tool")
                installed_formulas=$((installed_formulas + 1))
            else
                printf "  ${RED}✗${NC} %-30s %s\n" "$tool" "${YELLOW}未安装${NC}"
                MISSING_TOOLS+=("formula:$tool")
            fi
        fi
    done < "$DOTFILES_DIR/Brewfile"

    echo ""
    log_info "Cask 应用检测:"
    echo ""

    # 读取 cask
    while IFS= read -r line; do
        if [[ $line =~ ^cask[[:space:]]\"([^\"]+)\" ]]; then
            tool="${BASH_REMATCH[1]}"
            total_casks=$((total_casks + 1))

            if check_tool "$tool" "cask"; then
                printf "  ${GREEN}✓${NC} %-30s %s\n" "$tool" "${CYAN}已安装${NC}"
                INSTALLED_TOOLS+=("$tool")
                installed_casks=$((installed_casks + 1))
            else
                printf "  ${RED}✗${NC} %-30s %s\n" "$tool" "${YELLOW}未安装${NC}"
                MISSING_TOOLS+=("cask:$tool")
            fi
        fi
    done < "$DOTFILES_DIR/Brewfile"

    echo ""
    log_info "统计结果:"
    echo "  Formula: $installed_formulas/$total_formulas 已安装"
    echo "  Cask:    $installed_casks/$total_casks 已安装"
}

# ===== 安装缺失的工具 =====
install_missing_tools() {
    if [ ${#MISSING_TOOLS[@]} -eq 0 ]; then
        log_section "✅ 所有工具已安装完毕"
        log_success "环境已完整配置，无需安装新工具"
        return
    fi

    log_section "📥 发现 ${#MISSING_TOOLS[@]} 个缺失的工具"

    echo ""
    log_info "缺失的工具列表:"
    for tool_entry in "${MISSING_TOOLS[@]}"; do
        IFS=':' read -r type tool <<< "$tool_entry"
        echo "  • $tool ($type)"
    done

    echo ""
    read -p "是否安装所有缺失的工具? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warn "跳过工具安装"
        SKIPPED_TOOLS=("${MISSING_TOOLS[@]}")
        return
    fi

    log_info "使用 brew bundle 安装..."
    brew bundle --file="$DOTFILES_DIR/Brewfile"
    log_success "工具安装完成"
}

# ===== 备份现有配置 =====
backup_configs() {
    log_section "💾 备份现有配置文件"

    BACKUP_FILES=(
        ".zshrc"
        ".zprofile"
        ".bashrc"
        ".bash_profile"
        ".gitconfig"
    )

    mkdir -p "$BACKUP_DIR"
    local backed_up=0

    for file in "${BACKUP_FILES[@]}"; do
        if [ -f "$HOME/$file" ] && [ ! -L "$HOME/$file" ]; then
            cp "$HOME/$file" "$BACKUP_DIR/"
            log_warn "已备份: $file"
            backed_up=$((backed_up + 1))
        fi
    done

    if [ $backed_up -eq 0 ]; then
        log_info "没有需要备份的文件"
        rmdir "$BACKUP_DIR" 2>/dev/null || true
    else
        log_success "备份目录: $BACKUP_DIR"
    fi
}

# ===== 部署 Dotfiles =====
deploy_dotfiles() {
    log_section "🔗 部署 Dotfiles 符号链接"

    cd "$DOTFILES_DIR"

    STOW_PACKAGES=(
        "zsh"
        "shell"
        "git"
    )

    for package in "${STOW_PACKAGES[@]}"; do
        if [ -d "$package/home" ]; then
            log_info "部署 $package..."

            # 删除旧的符号链接（如果存在）
            stow -D -t ~ "$package" 2>/dev/null || true

            # 创建新的符号链接
            stow -t ~ "$package" --verbose 2>&1 | grep -v "^LINK" || true
            log_success "$package 部署完成"
        else
            log_warn "未找到: $package/home"
        fi
    done
}

# ===== 验证部署 =====
verify_deployment() {
    log_section "🔍 验证符号链接部署"

    VERIFY_FILES=(
        ".zshrc"
        ".zprofile"
        ".bashrc"
        ".bash_profile"
    )

    for file in "${VERIFY_FILES[@]}"; do
        if [ -L "$HOME/$file" ]; then
            target=$(readlink "$HOME/$file")
            log_success "$file → $target"
        elif [ -f "$HOME/$file" ]; then
            log_warn "$file 存在但不是符号链接"
        else
            log_info "$file 不存在"
        fi
    done
}

# ===== 生成最终报告 =====
generate_report() {
    log_section "📊 环境配置报告"

    echo ""
    echo "✅ 已安装工具: ${#INSTALLED_TOOLS[@]}"
    echo "📥 新安装工具: $((${#MISSING_TOOLS[@]} - ${#SKIPPED_TOOLS[@]}))"
    echo "⏭️  跳过工具: ${#SKIPPED_TOOLS[@]}"

    if [ ${#SKIPPED_TOOLS[@]} -gt 0 ]; then
        echo ""
        log_warn "以下工具被跳过，可稍后手动安装:"
        for tool_entry in "${SKIPPED_TOOLS[@]}"; do
            IFS=':' read -r type tool <<< "$tool_entry"
            echo "  • brew install ${type:+--$type }$tool"
        done
    fi

    echo ""
    log_section "🎉 Bootstrap 完成！"

    echo ""
    log_info "下一步操作:"
    echo "  1. 重新加载 Shell 配置:"
    echo "     ${CYAN}source ~/.zshrc${NC}"
    echo ""
    echo "  2. 或者重启终端"
    echo ""
    echo "  3. 检查工具版本:"
    echo "     ${CYAN}python3 --version${NC}"
    echo "     ${CYAN}node --version${NC}"
    echo "     ${CYAN}starship --version${NC}"
    echo ""

    if [ -d "$BACKUP_DIR" ]; then
        log_warn "原配置文件已备份到: $BACKUP_DIR"
    fi
}

# ===== 主流程 =====
main() {
    clear
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   Vincent's Dotfiles Bootstrap Script     ║"
    echo "║   智能环境检测与自动化部署                 ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"

    detect_environment
    scan_brewfile
    backup_configs
    install_missing_tools
    deploy_dotfiles
    verify_deployment
    generate_report
}

# 运行主流程
main
