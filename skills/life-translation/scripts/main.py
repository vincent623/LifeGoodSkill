#!/usr/bin/env python3
"""
Translation Processor (Three-Step Method)
Usage: python main.py -i article.md -o translated.md [--mode translate|review]
"""
import sys
import re
from pathlib import Path

SKILL_DIR = Path(__file__).parent.parent

def translate_three_step(text):
    """三步翻译法"""
    # 步骤1: 直译
    literal = text  # 这里应该调用AI，实际使用Claude API

    # 步骤2: 问题识别
    problems = []
    if len(text) > 100:
        problems.append("部分句子可能不符合中文表达习惯")
        problems.append("专业术语需要确认准确性")

    # 步骤3: 意译（模拟）
    polished = f"""以下是基于三步翻译法生成的中文版本：

{text[:500]}...

（实际使用时会调用Claude API进行完整翻译）
"""

    return literal, problems, polished

def main():
    input_file = None
    output_file = None
    mode = "translate"

    for i, arg in enumerate(sys.argv[1:], 1):
        if arg == "-i" and i + 1 < len(sys.argv):
            input_file = sys.argv[i + 1]
        elif arg == "-o" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
        elif arg == "--mode" and i + 1 < len(sys.argv):
            mode = sys.argv[i + 1]

    if input_file:
        content = Path(input_file).read_text()
    else:
        content = sys.stdin.read() if not input_file else ""

    if not content.strip():
        print("请提供需要翻译的英文内容")
        return

    if mode == "review":
        output = f"""## 翻译质量审查

### 原文
{content}

### 审查结果

#### 问题列表
1. [待检查] 术语一致性
2. [待检查] 句式流畅度
3. [待检查] 格式规范性
4. [待检查] 术语准确性

#### 改进建议
- 建议1: [建议内容]
- 建议2: [建议内容]
"""
    else:
        literal, problems, polished = translate_three_step(content)

        output = f"""## 三步翻译结果

### 直译
```
{literal[:500]}...
```
（保留原文格式和术语）

***

### 问题
1. 部分句子可能不符合中文表达习惯
2. 专业术语需要确认首次出现时添加英文
3. 标点符号需要调整

***

### 意译
{polished}

---

## 翻译规则说明

- 首次出现的专业术语: "术语 (Term)"
- 保持 Markdown 格式
- Figure/Table 标签翻译为 "图 X:" / "表 X:"
- 人名和公司名保持原文
"""

    if output_file:
        Path(output_file).write_text(output)
        print(f"输出文件: {output_file}")
    print(output)

if __name__ == "__main__":
    main()
