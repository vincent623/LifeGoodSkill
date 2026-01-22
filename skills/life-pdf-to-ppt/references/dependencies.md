# 依赖和环境配置

## Python 依赖

项目需要以下 Python 包：

- `pymupdf>=1.23.0` - PDF 渲染为高 DPI 图片
- `openai>=1.0.0` - OpenRouter API 客户端（OpenAI 兼容接口）
- `python-pptx>=0.6.23` - PowerPoint 文件生成
- `python-dotenv>=1.0.0` - 环境变量管理

## 外部依赖

- **Inkscape**: SVG→EMF 转换所需
  - macOS: `brew install --cask inkscape`
  - 标准路径: `/Applications/Inkscape.app/Contents/MacOS/inkscape`

## 环境变量配置

创建 `.env` 文件（参考 assets/.env.example）：

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
MODEL_NAME=google/gemini-3-pro-preview
MAX_WORKERS=3  # 并发 AI 请求数（推荐 3-10）
```

### 获取 API Key

访问 [OpenRouter](https://openrouter.ai/keys) 获取 API 密钥。

### 模型选择

默认使用 `google/gemini-3-pro-preview`，因其视觉理解能力强。可选模型：
- `anthropic/claude-3-opus`
- `openai/gpt-4-vision-preview`

查看 [OpenRouter 模型列表](https://openrouter.ai/models) 获取最新可用模型。

## 安装步骤

1. 安装 Python 依赖：
   ```bash
   pip install pymupdf openai python-pptx python-dotenv
   ```

2. 安装 Inkscape（macOS）：
   ```bash
   brew install --cask inkscape
   ```

3. 配置环境变量：
   - 复制 `assets/.env.example` 为 `.env`
   - 填入 OpenRouter API 密钥
