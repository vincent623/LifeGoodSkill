#!/usr/bin/env python3
"""
Meeting Minutes Generator
Usage: python main.py -i notes.txt [-o minutes.md]
"""
import sys
from pathlib import Path
from datetime import datetime

SKILL_DIR = Path(__file__).parent.parent

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
        print("请提供会议记录内容")
        return

    output = f"""# Meeting Minutes

**Date**: {datetime.now().strftime('%Y-%m-%d')}
**Attendees**: [待填写]
**Absent**: [待填写]
**Chair**: [待填写]

## Agenda Items

### 1. [议题名称]
- 讨论要点...
- **Decision**: [明确决定]
- **Action**: [负责人] - [任务] - [截止日期]

### 2. [议题名称]
- 讨论要点...
- **Decision**: [明确决定]
- **Action**: [负责人] - [任务] - [截止日期]

## Summary

### Key Takeaways
- 要点1
- 要点2

### Next Steps
- [ ] 下一步行动1
- [ ] 下一步行动2

---

**原始内容**：
{content[:500]}...
"""

    if output_file:
        Path(output_file).write_text(output)
        print(f"输出文件: {output_file}")
    print(output)

if __name__ == "__main__":
    main()
