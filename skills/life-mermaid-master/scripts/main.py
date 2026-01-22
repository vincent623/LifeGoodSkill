#!/usr/bin/env python3
"""
Mermaid Diagram Master
Professional Mermaid diagram generator with validation, optimization, and HTML export.

Usage:
    python main.py "需求描述" -o output.html
    python main.py --type flowchart "流程图需求" --ratio 16:9 --scheme green -o output.html
    python main.py --template sequence -i input.txt -o output.html
    python main.py --sample

Options:
    -t, --type DIAGRAM_TYPE    Diagram type (flowchart, sequence, class, state, er, gantt, pie, mindmap)
    -r, --ratio RATIO          Aspect ratio (4:3, 3:4, 16:9, 1:1, 3:2, 2:3)
    -c, --scheme COLOR         Color scheme (blue, green, purple, orange)
    -i, --input FILE           Input file with requirements
    -o, --output FILE          Output file (auto-detect extension)
    -s, --sample               Generate sample diagrams
    --template TEMPLATE        Use built-in template
    --validate-only            Only validate, don't render
"""
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict

from templates import (
    generate_flowchart, generate_sequence, generate_class_diagram,
    generate_gantt, generate_pie, generate_mindmap, generate_er,
    DiagramType, COLOR_SCHEMES, ASPECT_RATIOS
)
from validator import validate_mermaid, fix_common_issues
from optimizer import generate_html_wrapper, get_optimal_config

SKILL_DIR = Path(__file__).parent.parent

# Diagram type mapping
DIAGRAM_TYPE_MAP = {
    "flowchart": DiagramType.FLOWCHART,
    "graph": DiagramType.FLOWCHART,
    "sequence": DiagramType.SEQUENCE,
    "class": DiagramType.CLASS,
    "classdiagram": DiagramType.CLASS,
    "state": DiagramType.STATE,
    "statediagram": DiagramType.STATE,
    "er": DiagramType.ER,
    "erd": DiagramType.ER,
    "gantt": DiagramType.GANTT,
    "pie": DiagramType.PIE,
    "mindmap": DiagramType.MINDMAP,
    "journey": DiagramType.JOURNEY,
}

# Built-in templates
TEMPLATES = {
    "flowchart-basic": {
        "type": "flowchart",
        "title": "基础流程图",
        "steps": ["开始", "处理步骤1", "条件判断", "处理步骤2", "结束"],
        "branches": {"是": ["分支处理A"], "否": ["分支处理B"]},
    },
    "flowchart-decision": {
        "type": "flowchart",
        "title": "决策流程",
        "steps": ["问题", "收集信息", "分析选项", "做出决策", "执行"],
        "branches": {"选项A": ["评估A"], "选项B": ["评估B"]},
    },
    "sequence-api": {
        "type": "sequence",
        "title": "API 调用时序",
        "participants": ["客户端", "API网关", "认证服务", "业务服务", "数据库"],
        "messages": [
            {"from": "客户端", "to": "API网关", "text": "HTTP请求", "arrow": "->>"},
            {"from": "API网关", "to": "认证服务", "text": "验证Token", "arrow": "->>"},
            {"from": "认证服务", "to": "API网关", "text": "验证结果", "arrow": "-->>"},
            {"from": "API网关", "to": "业务服务", "text": "转发请求", "arrow": "->>"},
            {"from": "业务服务", "to": "数据库", "text": "数据操作", "arrow": "->>"},
            {"from": "数据库", "to": "业务服务", "text": "查询结果", "arrow": "-->>"},
        ],
    },
    "class-simple": {
        "type": "class",
        "title": "简单类图",
        "classes": [
            {"name": "Animal", "attributes": ["- name: String", "- age: int"], "methods": ["+ speak(): void"]},
            {"name": "Dog", "attributes": ["- breed: String"], "methods": ["+ speak(): void"]},
            {"name": "Cat", "attributes": ["- color: String"], "methods": ["+ speak(): void"]},
        ],
        "relationships": [
            {"from": "Dog", "to": "Animal", "type": "--|>", "label": "继承"},
            {"from": "Cat", "to": "Animal", "type": "--|>", "label": "继承"},
        ],
    },
    "gantt-project": {
        "type": "gantt",
        "title": "项目计划",
        "tasks": [
            {"name": "需求分析", "section": "第一阶段", "start": "2024-01-01", "duration": "5d"},
            {"name": "设计阶段", "section": "第一阶段", "start": "after需求分析", "duration": "7d"},
            {"name": "开发实现", "section": "第二阶段", "start": "after设计阶段", "duration": "14d"},
            {"name": "测试验证", "section": "第二阶段", "start": "after开发实现", "duration": "7d"},
            {"name": "部署上线", "section": "第三阶段", "start": "after测试验证", "duration": "3d"},
        ],
    },
    "pie-distribution": {
        "type": "pie",
        "title": "资源分布",
        "data": {"核心功能": 40, "增强功能": 25, "维护更新": 20, "新特性": 15},
    },
}


def parse_args():
    """Parse command line arguments"""
    args = {
        "description": "",
        "type": "flowchart",
        "ratio": "4:3",
        "scheme": "blue",
        "input": None,
        "output": None,
        "sample": False,
        "template": None,
        "validate_only": False,
    }

    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg.startswith("-"):
            if arg in ["-t", "--type"]:
                args["type"] = sys.argv[i + 1].lower()
                i += 2
            elif arg in ["-r", "--ratio"]:
                args["ratio"] = sys.argv[i + 1]
                i += 2
            elif arg in ["-c", "--scheme"]:
                args["scheme"] = sys.argv[i + 1].lower()
                i += 2
            elif arg in ["-i", "--input"]:
                args["input"] = sys.argv[i + 1]
                i += 2
            elif arg in ["-o", "--output"]:
                args["output"] = sys.argv[i + 1]
                i += 2
            elif arg in ["-s", "--sample"]:
                args["sample"] = True
                i += 1
            elif arg == "--template":
                args["template"] = sys.argv[i + 1]
                i += 2
            elif arg == "--validate-only":
                args["validate_only"] = True
                i += 1
            else:
                i += 1
        else:
            if not args["description"]:
                args["description"] = arg
            i += 1

    return args


def generate_from_description(
    description: str,
    diagram_type: str,
    colors: Dict,
    direction: str = "LR"
) -> str:
    """Generate Mermaid diagram from text description"""
    # Simple parsing - split by common delimiters
    steps = []
    branches = {}

    # Clean description - only escape problematic characters
    desc = description.strip()

    # Split by arrows
    if "->" in desc or "→" in desc:
        # Flow-like description - split by arrows
        parts = desc.replace("->", "→").split("→")
        for part in parts:
            part = part.strip()
            if part and part not in ["和", "与", "and"]:
                if "如果" in part or "是否" in part or "?" in part:
                    branch_name = part.replace("如果", "").replace("是否", "").replace("?", "").strip()
                    branches[branch_name] = [f"处理{branch_name}", f"继续"]
                else:
                    steps.append(part)
    else:
        # Generic description - create basic structure
        words = desc.split()
        if len(words) >= 2:
            steps = words[:5]
        else:
            steps = [desc, "步骤1", "步骤2", "步骤3", "结束"]

    if not steps:
        steps = ["开始", "处理", "判断", "结束"]

    return generate_flowchart(
        title=steps[0] if steps else "流程图",
        steps=steps,
        branches=branches if branches else None,
        colors=colors,
        direction=direction
    )


def generate_sample_diagrams() -> Dict[str, str]:
    """Generate all sample diagrams"""
    samples = {}

    # Flowchart sample
    flowchart = generate_flowchart(
        title="订单处理流程",
        steps=["接收订单", "验证订单", "库存检查", "支付处理", "发货确认", "完成"],
        colors=COLOR_SCHEMES["blue"],
        direction="LR"
    )
    samples["sample-flowchart.html"] = generate_html_wrapper(
        flowchart,
        get_optimal_config(DiagramType.FLOWCHART, len("订单处理流程"), "low"),
        "订单处理流程图"
    )

    # Sequence sample
    sequence = generate_sequence(
        title="用户登录时序",
        participants=["用户", "前端", "后端", "数据库", "Redis"],
        messages=[
            {"from": "用户", "to": "前端", "text": "点击登录"},
            {"from": "前端", "to": "后端", "text": "发送登录请求", "arrow": "->>"},
            {"from": "后端", "to": "Redis", "text": "检查Token", "arrow": "->>"},
            {"from": "Redis", "to": "后端", "text": "返回结果", "arrow": "-->>"},
            {"from": "后端", "to": "数据库", "text": "验证凭据", "arrow": "->>"},
            {"from": "数据库", "to": "后端", "text": "返回用户信息", "arrow": "-->>"},
            {"from": "后端", "to": "前端", "text": "登录成功", "arrow": "-->>"},
        ]
    )
    samples["sample-sequence.html"] = generate_html_wrapper(
        sequence,
        get_optimal_config(DiagramType.SEQUENCE, 100, "medium"),
        "用户登录时序图"
    )

    # Gantt sample
    gantt = generate_gantt(
        title="产品发布计划",
        tasks=[
            {"name": "市场调研", "section": "准备", "start": "2024-01-01", "duration": "10d"},
            {"name": "需求分析", "section": "准备", "start": "after市场调研", "duration": "7d"},
            {"name": "UI设计", "section": "设计", "start": "after需求分析", "duration": "14d"},
            {"name": "后端开发", "section": "开发", "start": "afterUI设计", "duration": "21d"},
            {"name": "前端开发", "section": "开发", "start": "afterUI设计", "duration": "14d"},
            {"name": "测试阶段", "section": "测试", "start": "after后端开发", "duration": "10d"},
            {"name": "正式发布", "section": "发布", "start": "after测试阶段", "duration": "3d"},
        ]
    )
    samples["sample-gantt.html"] = generate_html_wrapper(
        gantt,
        get_optimal_config(DiagramType.GANTT, 200, "medium"),
        "产品发布甘特图"
    )

    # Pie sample
    pie = generate_pie(
        title="预算分配",
        data={"人力成本": 45, "技术投入": 25, "市场推广": 15, "运营支出": 10, "预留资金": 5}
    )
    samples["sample-pie.html"] = generate_html_wrapper(
        pie,
        get_optimal_config(DiagramType.PIE, 50, "low"),
        "预算分配饼图"
    )

    # Class sample
    class_diag = generate_class_diagram(
        title="电商系统类图",
        classes=[
            {"name": "User", "attributes": ["- id: int", "- name: String", "- email: String"], "methods": ["+ login()", "+ logout()"]},
            {"name": "Product", "attributes": ["- id: int", "- name: String", "- price: decimal"], "methods": ["+ getDetails()"]},
            {"name": "Order", "attributes": ["- id: int", "- userId: int", "- status: String"], "methods": ["+ calculateTotal()", "+ placeOrder()"]},
            {"name": "OrderItem", "attributes": ["- id: int", "- orderId: int", "- productId: int"], "methods": []},
        ],
        relationships=[
            {"from": "Order", "to": "User", "type": "1", "label": "下单"},
            {"from": "Order", "to": "OrderItem", "type": "1", "label": "包含"},
            {"from": "OrderItem", "to": "Product", "type": "*", "label": "关联"},
        ]
    )
    samples["sample-class.html"] = generate_html_wrapper(
        class_diag,
        get_optimal_config(DiagramType.CLASS, 150, "medium"),
        "电商系统类图"
    )

    return samples


def main():
    args = parse_args()

    # Show help if no arguments
    if len(sys.argv) == 1:
        print(__doc__)
        print("\n可用图表类型:", ", ".join(DIAGRAM_TYPE_MAP.keys()))
        print("可用比例:", ", ".join(ASPECT_RATIOS.keys()))
        print("可用配色:", ", ".join(COLOR_SCHEMES.keys()))
        return

    # Generate samples
    if args["sample"]:
        samples = generate_sample_diagrams()
        for filename, content in samples.items():
            output_path = Path(filename)
            output_path.write_text(content)
            print(f"已生成: {output_path}")
        return

    # Use template if specified
    if args["template"]:
        if args["template"] not in TEMPLATES:
            print(f"模板不存在: {args['template']}")
            print(f"可用模板: {', '.join(TEMPLATES.keys())}")
            return

        tmpl = TEMPLATES[args["template"]]
        diagram_type = DIAGRAM_TYPE_MAP.get(tmpl["type"], DiagramType.FLOWCHART)
        colors = COLOR_SCHEMES.get(args["scheme"], COLOR_SCHEMES["blue"])
        config = get_optimal_config(diagram_type, 100, "medium")
        config.aspect_ratio = args["ratio"]
        config.color_scheme = args["scheme"]

        if tmpl["type"] == "flowchart":
            code = generate_flowchart(tmpl["title"], tmpl["steps"], tmpl.get("branches"), colors)
        elif tmpl["type"] == "sequence":
            code = generate_sequence(tmpl["title"], tmpl["participants"], tmpl["messages"], colors)
        elif tmpl["type"] == "class":
            code = generate_class_diagram(tmpl["title"], tmpl["classes"], tmpl["relationships"], colors)
        elif tmpl["type"] == "gantt":
            code = generate_gantt(tmpl["title"], tmpl["tasks"], colors)
        elif tmpl["type"] == "pie":
            code = generate_pie(tmpl["title"], tmpl["data"], colors)
        else:
            print(f"模板类型不支持: {tmpl['type']}")
            return

        output = generate_html_wrapper(code, config, tmpl["title"])
        output_file = args["output"] or f"{args['template']}.html"
        Path(output_file).write_text(output)
        print(f"已生成: {output_file}")
        return

    # Get input from file or argument
    if args["input"]:
        description = Path(args["input"]).read_text(encoding="utf-8").strip()
    else:
        description = args["description"]

    if not description:
        print("请提供需求描述或输入文件")
        return

    # Determine diagram type
    diagram_type = DIAGRAM_TYPE_MAP.get(args["type"], DiagramType.FLOWCHART)
    colors = COLOR_SCHEMES.get(args["scheme"], COLOR_SCHEMES["blue"])
    config = get_optimal_config(diagram_type, len(description), "medium")
    config.aspect_ratio = args["ratio"]
    config.color_scheme = args["scheme"]

    # Generate diagram
    if diagram_type == DiagramType.FLOWCHART:
        code = generate_from_description(description, args["type"], colors)
    else:
        # For other types, use basic template
        print(f"描述类型 '{args['type']}' 已生成基础流程图")
        code = generate_from_description(description, args["type"], colors)

    # Validate and fix
    validation = validate_mermaid(code)
    if not validation.is_valid():
        print("验证警告:")
        for err in validation.errors:
            print(f"  - {err}")
        for warn in validation.warnings:
            print(f"  ~ {warn}")
        code, fixes = fix_common_issues(code)

    if args["validate_only"]:
        print("验证完成，代码已修复常见问题")
        print("\n生成的 Mermaid 代码:")
        print(code)
        return

    # Generate output
    output = generate_html_wrapper(code, config, description[:30] + "..." if len(description) > 30 else description)

    # Determine output file
    output_file = args["output"]
    if not output_file:
        output_file = f"mermaid-{args['type']}-{datetime.now().strftime('%Y%m%d%H%M%S')}.html"

    Path(output_file).write_text(output, encoding="utf-8")
    print(f"已生成: {output_file}")
    print(f"类型: {args['type']} | 比例: {args['ratio']} | 配色: {args['scheme']}")

    # Also output mermaid code
    print("\nMermaid 代码:")
    print("```mermaid")
    print(code)
    print("```")


if __name__ == "__main__":
    main()
