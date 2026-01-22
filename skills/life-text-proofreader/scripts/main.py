#!/usr/bin/env python3
"""
Chinese Text Proofreader
Usage: python main.py -i text.txt [-o corrected.md]
"""
import sys
import re
from pathlib import Path

SKILL_DIR = Path(__file__).parent.parent

# 常见错误模式
ERROR_PATTERNS = [
    (r"的\s+地", "的", "的地得混用 - 助词错误"),
    (r"的地得", "的", "的地得混用 - 助词错误"),
    (r"\s+", " ", "多余空格"),
    (r"，。", "，", "标点错误"),
    (r"。。", "。", "多余句号"),
    (r"？。", "？", "标点错误"),
]

def proofread(text):
    corrections = []
    original = text

    # 检测常见错误
    if "的地得" in text:
        corrections.append(("的地得混用", "请检查的/地/得使用是否正确", "助词错误"))

    if "。。" in text:
        corrections.append(("。。", "。", "多余句号"))

    if "，， " in text:
        corrections.append(("，，", "，", "多余逗号"))

    # 常见错别字示例
    typos = {
        "高性的": "高兴的",
        "象形": "想象",
        "即然": "既然",
        "蜜切": "密切",
    }

    for wrong, correct in typos.items():
        if wrong in text:
            corrections.append((wrong, correct, "错别字"))
            text = text.replace(wrong, correct)

    return corrections, text

def main():
    input_file = None
    output_file = None

    for i, arg in enumerate(sys.argv[1:], 1):
        if arg == "-i" and i + 1 < len(sys.argv):
            input_file = sys.argv[i + 1]
        elif arg == "-o" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]

    if input_file:
        content = Path(input_file).read_text()
    else:
        content = sys.stdin.read() if not input_file else ""

    if not content.strip():
        print("请提供需要校对的中文文本")
        return

    corrections, corrected = proofread(content)

    output = f"""## 校对结果

### 原文
{content}

### 改后
{corrected}

---

## 修改统计

| 原文 | 改后 | 修改理由 |
|------|------|----------|
"""

    if corrections:
        for orig, fixed, reason in corrections:
            output += f"| {orig} | {fixed} | {reason} |\n"
    else:
        output += "| - | - | 未发现明显错误 |\n"

    output += f"""

## 建议

- 建议使用"的地得"检查工具进一步验证
- 建议朗读文章检查语句通顺度
- 建议请他人校对以发现遗漏

**总修改数**: {len(corrections)} 处
"""

    if output_file:
        Path(output_file).write_text(output)
        print(f"输出文件: {output_file}")
    print(output)

if __name__ == "__main__":
    main()
