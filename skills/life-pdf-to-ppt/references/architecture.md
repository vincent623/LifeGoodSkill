# PDF to PPT 架构说明

## 代码结构

```
scripts/
├── src/
│   ├── config.py            # 配置管理（环境变量、API 密钥）
│   ├── pdf_processor.py     # PDF 转图片模块
│   ├── ai_vectorizer.py     # AI 矢量化模块（OpenRouter API 调用）
│   ├── svg_processor.py     # SVG 清洗和 EMF 转换模块
│   ├── ppt_generator.py     # PPT 生成模块
│   └── batch_processor.py   # 批处理协调模块（并发控制）
└── main.py                  # 程序入口
```

## 处理流程

工具通过 5 个顺序阶段处理每个 PDF：

1. **PDF 转图片** (`pdf_processor.py:pdf_to_images`)
   - 使用 PyMuPDF (fitz) 以 2 倍分辨率渲染每一页
   - 输出 PNG 文件到 `temp/{pdf_name}/images/`

2. **AI 矢量化** (`ai_vectorizer.py:convert_image_to_svg`)
   - 对 PNG 图片进行 Base64 编码
   - 发送到 OpenRouter API（默认：google/gemini-3-pro-preview）
   - 提示词："转换成SVG，要求一模一样，不用解释，直接输出SVG代码"
   - 实现指数退避重试机制（2秒、4秒、8秒），最多重试 3 次

3. **SVG 清洗** (`svg_processor.py:clean_and_save_svg`)
   - 去除 markdown 代码块标记
   - 使用正则表达式提取 SVG 标签
   - 保存到 `temp/{pdf_name}/svgs/`

4. **SVG 转 EMF** (`svg_processor.py:convert_svg_to_emf`)
   - 需要 Inkscape CLI
   - 转换为 EMF 格式（PPT 形状编辑所需）
   - 输出到 `temp/{pdf_name}/emf/`

5. **生成 PPT** (`ppt_generator.py:generate_ppt`)
   - 创建 16:9 宽屏演示文稿（13.33" × 7.5"）
   - 使用空白幻灯片布局
   - 插入 EMF 文件，边距为 0.5 英寸

## 并发处理

使用 ThreadPoolExecutor 并行化 AI API 调用，同时通过索引 futures 保持页面顺序。并发数由 MAX_WORKERS 环境变量控制（推荐 3-10）。

## 错误处理

- AI API 失败触发指数退避重试
- 失败的页面会被跳过，但处理会继续
- Inkscape 转换失败会被记录但不会阻塞流程
- 最终报告显示成功/失败计数
