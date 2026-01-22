#!/usr/bin/env python3
"""
Transcription Organizer
Usage: python main.py -i transcript.txt [-o organized.md]
"""
import sys
import re
from pathlib import Path
from datetime import datetime

SKILL_DIR = Path(__file__).parent.parent

def clean_transcript(text):
    # 移除时间戳
    text = re.sub(r"\[\d{2}:\d{2}\]", "", text)
    text = re.sub(r"\d{2}:\d{2}:\d{2}", "", text)

    # 移除说话人标识
    text = re.sub(r"Speaker \d+:", "", text)
    text = re.sub(r"发言者\d+:", "", text)
    text = re.sub(r"\[\w+\]:", "", text)

    # 移除重复词
    text = re.sub(r"(\b\w+)\s+\1\b", r"\1", text)

    # 转换口语为书面语
   口语替换 = {
        "就是说": "即",
        "然后": "接着",
        "其实吧": "实际上",
        "怎么说呢": "总体而言",
        "这个": "该",
    }

    for spoken, written in 口语替换.items():
        text = text.replace(spoken, written)

    return text.strip()

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
        print("请提供转录内容")
        return

    cleaned = clean_transcript(content)

    # 简单分段
    paragraphs = [p.strip() for p in cleaned.split("\n\n") if p.strip()]

    output = f"""# 转录整理结果

**整理日期**: {datetime.now().strftime('%Y-%m-%d')}

---

## 概要

本文档基于原始转录内容整理而成，已完成：
- 时间戳和说话人标识移除
- 口语表达转换为书面语
- 重复内容清理
- 格式规范化

---

## 结构化内容

"""

    for i, para in enumerate(paragraphs[:10], 1):  # 限制前10段
        output += f"### 第{i}部分\n\n{para}\n\n"

    if len(paragraphs) > 10:
        output += f"\n*(共 {len(paragraphs)} 段，此处显示前10段)*\n"

    output += f"""

---

## 关键要点

- 要点1: [待提取]
- 要点2: [待提取]
- 要点3: [待提取]

## 行动项

- [ ] 待识别

---

**原始长度**: {len(content)} 字符
**整理后长度**: {len(cleaned)} 字符
"""

    if output_file:
        Path(output_file).write_text(output)
        print(f"输出文件: {output_file}")
    print(output)

if __name__ == "__main__":
    main()
