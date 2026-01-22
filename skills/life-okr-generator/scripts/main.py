#!/usr/bin/env python3
"""
OKR Generator
Usage: python main.py -j "岗位描述" -c "周期" [-o okrs.md]
"""
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).parent.parent

def main():
    job_desc = None
    cycle = None
    output_file = None

    for i, arg in enumerate(sys.argv[1:], 1):
        if arg == "-j" and i + 1 < len(sys.argv):
            job_desc = sys.argv[i + 1]
        elif arg == "-c" and i + 1 < len(sys.argv):
            cycle = sys.argv[i + 1]
        elif arg == "-o" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]

    if not job_desc:
        print("请提供岗位描述: -j '高级产品经理'")
        return

    cycle = cycle or "2026年Q1"

    output = f"""# OKR - {job_desc}

**周期**: {cycle}

---

## Objective 1: 提升产品核心指标

**Rationale**: 通过聚焦核心指标，推动产品增长

**Key Results:**
- [ ] KR1: 核心指标提升 20%
- [ ] KR2: 用户留存率提升 15%
- [ ] KR3: 关键功能使用率提升 30%

## Objective 2: 优化用户体验

**Rationale**: 提升用户满意度和产品口碑

**Key Results:**
- [ ] KR1: NPS 分数提升 10 分
- [ ] KR2: 用户反馈处理时效提升 50%
- [ ] KR3: 核心流程转化率提升 25%

## Objective 3: 加强团队协作

**Rationale**: 提升团队效率和交付质量

**Key Results:**
- [ ] KR1: 迭代交付准时率提升到 90%
- [ ] KR2: 跨部门协作项目满意度提升 20%
- [ ] KR3: 文档完善度达到 100%

---

**岗位**: {job_desc}
**周期**: {cycle}
"""

    if output_file:
        Path(output_file).write_text(output)
        print(f"输出文件: {output_file}")
    print(output)

if __name__ == "__main__":
    main()
