# 完整工作流程指南

## 目录

1. [准备阶段](#准备阶段)
2. [第一步：格式转换](#第一步格式转换)
3. [第二步：选择切片方案](#第二步选择切片方案)
4. [第三步：执行切片](#第三步执行切片)
5. [第四步：验证输出](#第四步验证输出)
6. [常见场景](#常见场景)

## 准备阶段

### 1. 环境检查

```bash
# 检查Python版本
python3 --version  # 需要3.7+

# 检查必要的库
python3 -c "import json; import re; from pathlib import Path"

# 如果使用LLM切片，检查API密钥
echo $MINIMAX_API_KEY  # 应该显示密钥值
```

### 2. 输入文件准备

确保准备好以下文件：
- ✅ 原始SRT字幕文件或已转换的MD文件
- ✅ 字幕文件编码为UTF-8
- ✅ 字幕包含有效的时间戳

### 3. 输出目录准备

```bash
# 创建输出目录
mkdir -p slices_output_final

# 确保有写入权限
touch slices_output_final/.test && rm slices_output_final/.test
```

## 第一步：格式转换

### 场景：从SRT转换到MD格式

**何时需要：**
- 处理新的SRT字幕文件
- 需要标准化字幕格式
- 为后续切片准备数据

**命令：**
```bash
python3 scripts/convert_srt_to_md.py \
  --input "source_subtitle.srt" \
  --output "source_subtitle.md" \
  --keep-timestamps  # 保留时间戳
```

**验证转换结果：**
```bash
# 检查输出文件
ls -lh source_subtitle.md

# 查看前几行（应该包含时间戳）
head -20 source_subtitle.md
```

### 预期格式

```markdown
## 1
00:00:00,290 --> 00:00:00,850
这是第一个字幕段落

## 2
00:00:00,850 --> 00:00:02,010
这是第二个字幕段落
```

## 第二步：选择切片方案

### 决策树

```
是否有API密钥？
├── 否 → 使用规则引擎（推荐）
│   └── 进行第三步：执行规则切片
│
└── 是 → 选择优先级
    ├── 稳定性优先 → 使用规则引擎
    └── 质量优先 → 使用LLM语义切片
```

### 方案对比

| 维度 | 规则引擎 | LLM语义 |
|------|--------|--------|
| 速度 | ⚡⚡⚡ 快 | ⚡ 慢 |
| 稳定性 | ✅ 100% | ⚠️ 95% |
| 质量 | ✅ 良好 | ✅✅ 优秀 |
| 成本 | ✅ 免费 | ⚠️ 按量计费 |
| API依赖 | ❌ 无 | ✅ 需要 |

**推荐选择：**
- **生产环境** → 规则引擎
- **小规模试验** → LLM语义
- **大规模处理** → 规则引擎
- **质量关键** → LLM语义

## 第三步：执行切片

### 方案A：规则引擎切片

#### 配置参数

编辑 `scripts/batch_slicer.py` 中的配置：

```python
# 切片参数
target_duration = 600        # 目标时长：10分钟
min_duration = 180          # 最小时长：3分钟
max_duration = 1200         # 最大时长：20分钟

# 输出参数
output_dir = "slices_output_final"
timestamp_format = "%Y%m%d_%H%M%S"
```

#### 执行命令

```bash
# 批量处理所有MD文件
python3 scripts/batch_slicer.py

# 处理指定文件
python3 scripts/batch_slicer.py --file "specific_subtitle.md"

# 自定义输出目录
python3 scripts/batch_slicer.py --output "my_output_dir"
```

#### 输出示例

```
============================================================
Batch Subtitle Slicer
Processing All Files
============================================================

正在处理：2025年案例分析真题解析-第一题.md
  总时长：2100秒 (35分钟)
  生成切片数：6个
  ✅ 成功生成：slices_output_final/...json

处理完成！
总处理：10个文件
成功：10个
失败：0个
```

### 方案B：LLM语义切片

#### 配置API

```bash
# 配置MiniMax API（推荐）
export MINIMAX_API_KEY="your_key_here"

# 或配置OpenAI API
export OPENAI_API_KEY="your_key_here"
```

#### 执行命令

```bash
# 使用LLM进行语义切片
python3 scripts/semantic_slicer.py

# 处理指定文件
python3 scripts/semantic_slicer.py --file "subtitle.md"

# 自定义模型
python3 scripts/semantic_slicer.py --model "minimax-m2"
```

#### 配置提示词

参考 `references/prompt_template.md` 中的提示词，根据需要调整：

```python
# 在semantic_slicer.py中修改
PROMPT_TEMPLATE = """
你是专业的视频编辑...
[自定义提示词内容]
"""
```

## 第四步：验证输出

### 1. 检查文件完整性

```bash
# 列出生成的所有JSON文件
ls -lh slices_output_final/*.json

# 检查文件大小（正常大小30KB-100KB）
du -sh slices_output_final/

# 统计文件数量（应该等于输入文件数）
ls slices_output_final/*.json | wc -l
```

### 2. 验证JSON格式

```bash
# 验证JSON语法
for f in slices_output_final/*.json; do
  python3 -m json.tool "$f" > /dev/null && echo "✅ $f" || echo "❌ $f"
done
```

### 3. 检查JSON内容

```bash
# 查看第一个JSON文件的结构
python3 << 'EOF'
import json
with open('slices_output_final/example.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    print(f"文件：{data['source_file']}")
    print(f"切片数：{data['slice_count']}")
    for slice in data['slices']:
        print(f"  - [{slice['slice_id']}] {slice['slice_name']}")
EOF
```

### 4. 应用格式规范检查

使用 `references/json_format_spec.md` 中的验证规则：

```python
# 验证脚本示例
import json
from datetime import timedelta

def validate_slice_json(file_path):
    """验证JSON文件是否符合格式规范"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    errors = []

    # 检查根级字段
    required_fields = ['source_file', 'video_title', 'total_duration_seconds', 'slice_count', 'slices']
    for field in required_fields:
        if field not in data:
            errors.append(f"缺少必需字段：{field}")

    # 检查每个切片
    for slice_obj in data.get('slices', []):
        # slice_id应该是数字
        if not isinstance(slice_obj['slice_id'], int):
            errors.append(f"slice_id不是数字：{slice_obj['slice_id']}")

        # knowledge_type应该是有效值
        valid_types = ['概论', '概念', '计算', '案例', '操作', '总结']
        if slice_obj['knowledge_type'] not in valid_types:
            errors.append(f"无效的knowledge_type：{slice_obj['knowledge_type']}")

        # key_keywords应该是3-5个
        if not 3 <= len(slice_obj['key_keywords']) <= 5:
            errors.append(f"关键词数量不符：{len(slice_obj['key_keywords'])}")

    if errors:
        print(f"❌ {file_path} 验证失败：")
        for err in errors:
            print(f"   - {err}")
        return False
    else:
        print(f"✅ {file_path} 验证通过")
        return True

# 验证所有文件
import glob
for file_path in glob.glob('slices_output_final/*.json'):
    validate_slice_json(file_path)
```

## 常见场景

### 场景1：处理新的教学视频字幕集

**步骤：**
1. 准备SRT文件
2. 使用规则引擎批量转换和切片
3. 生成JSON结果供系统导入

```bash
# 一键完成
python3 scripts/batch_slicer.py
```

### 场景2：提高切片质量

**步骤：**
1. 使用LLM语义切片
2. 审查输出质量
3. 调整提示词后重新处理

```bash
# 首先验证API密钥
echo $MINIMAX_API_KEY

# 执行LLM切片
python3 scripts/semantic_slicer.py --file "critical_subtitle.md"

# 检查输出
python3 -m json.tool slices_output_final/output.json | head -50
```

### 场景3：批量导入学习管理系统

**步骤：**
1. 处理所有字幕文件
2. 验证所有JSON文件
3. 按系统要求导入

```bash
# 处理所有文件
python3 scripts/batch_slicer.py

# 验证所有JSON
python3 << 'VALIDATE'
import glob, json
for f in glob.glob('slices_output_final/*.json'):
    with open(f) as file:
        json.load(file)  # 会抛出异常如果JSON无效
    print(f"✅ {f}")
VALIDATE

# 压缩为ZIP便于上传
zip -r slices_output.zip slices_output_final/*.json
```

### 场景4：单个文件的细粒度控制

**步骤：**
1. 编辑脚本配置
2. 处理特定文件
3. 逐一审查调整

```bash
# 编辑脚本配置
vim scripts/batch_slicer.py  # 修改时长参数

# 处理单个文件
python3 scripts/batch_slicer.py --file "target.md"

# 查看结果
jq '.slices | length' slices_output_final/*.json
```

## 故障排除

### 问题：JSON解析失败

```
错误：json.decoder.JSONDecodeError
```

**解决：**
```bash
# 检查文件内容
cat slices_output_final/failing_file.json

# 重新生成该文件
python3 scripts/batch_slicer.py --file "source.md"
```

### 问题：时间戳不一致

**解决：**
```bash
# 检查源文件时间戳
grep "00:" source.md | head -5

# 验证转换脚本
python3 -c "
start_s = 3725
h = start_s // 3600
m = (start_s % 3600) // 60
s = start_s % 60
print(f'{h:02d}:{m:02d}:{s:02d}')
"
```

### 问题：切片数量过多或过少

**解决：**
```python
# 调整配置
target_duration = 900  # 改为15分钟
```

## 性能优化

### 大规模批处理

```bash
# 使用并行处理
parallel python3 scripts/batch_slicer.py --file ::: *.md

# 监控进度
watch -n 1 'ls slices_output_final/*.json | wc -l'
```

### 内存管理

```python
# 在脚本中添加内存管理
import gc
gc.collect()  # 每处理完一个文件后清理内存
```

## 最佳实践总结

1. ✅ 使用规则引擎作为默认方案
2. ✅ 定期备份原始字幕文件
3. ✅ 在处理前验证所有输入
4. ✅ 生成JSON后立即验证格式
5. ✅ 保留处理日志便于追踪
6. ✅ 文档更新保持同步
