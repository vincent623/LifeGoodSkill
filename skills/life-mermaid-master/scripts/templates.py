#!/usr/bin/env python3
"""
Mermaid Diagram Templates
Professional templates for different diagram types with validated syntax.
"""
from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

class DiagramType(Enum):
    FLOWCHART = "flowchart"
    SEQUENCE = "sequenceDiagram"
    CLASS = "classDiagram"
    STATE = "stateDiagram-v2"
    ER = "er"
    GANTT = "gantt"
    PIE = "pie"
    MINDMAP = "mindmap"
    JOURNEY = "journey"

@dataclass
class NodeStyle:
    fill: str
    stroke: str
    stroke_width: int = 2
    rx: int = 5
    ry: int = 5

@dataclass
class DiagramTemplate:
    diagram_type: DiagramType
    nodes: List[str]
    edges: List[str]
    subgraphs: Dict[str, List[str]]
    styles: Dict[str, NodeStyle]
    direction: str = "LR"

# Professional color schemes
COLOR_SCHEMES = {
    "blue": {
        "primary": "#3b82f6",
        "secondary": "#1d4ed8",
        "accent": "#60a5fa",
        "bg_light": "#eff6ff",
        "bg_dark": "#1e3a8a",
        "success": "#10b981",
        "warning": "#f59e0b",
        "danger": "#ef4444",
    },
    "green": {
        "primary": "#10b981",
        "secondary": "#059669",
        "accent": "#34d399",
        "bg_light": "#ecfdf5",
        "bg_dark": "#064e3b",
        "success": "#10b981",
        "warning": "#f59e0b",
        "danger": "#ef4444",
    },
    "purple": {
        "primary": "#8b5cf6",
        "secondary": "#7c3aed",
        "accent": "#a78bfa",
        "bg_light": "#f5f3ff",
        "bg_dark": "#4c1d95",
        "success": "#10b981",
        "warning": "#f59e0b",
        "danger": "#ef4444",
    },
    "orange": {
        "primary": "#f97316",
        "secondary": "#ea580c",
        "accent": "#fb923c",
        "bg_light": "#fff7ed",
        "bg_dark": "#7c2d12",
        "success": "#10b981",
        "warning": "#f59e0b",
        "danger": "#ef4444",
    },
}

ASPECT_RATIOS = {
    "4:3": {"width": 800, "height": 600},
    "3:4": {"width": 600, "height": 800},
    "16:9": {"width": 960, "height": 540},
    "9:16": {"width": 540, "height": 960},
    "1:1": {"width": 600, "height": 600},
    "3:2": {"width": 750, "height": 500},
    "2:3": {"width": 500, "height": 750},
}

def generate_flowchart(
    title: str,
    steps: List[str],
    branches: Optional[Dict[str, List[str]]] = None,
    colors: Optional[Dict] = None,
    direction: str = "LR"
) -> str:
    """Generate flowchart Mermaid code"""
    if colors is None:
        colors = COLOR_SCHEMES["blue"]

    lines = [f"graph {direction}"]

    for i, step in enumerate(steps):
        node_id = chr(65 + i)
        lines.append(f"{node_id}[{step}]")

    # Connections
    for i in range(len(steps) - 1):
        lines.append(f"{chr(65 + i)} --> {chr(66 + i)}")

    # Branches
    if branches:
        branch_num = 0
        for step_idx, (condition, branch_steps) in enumerate(branches.items()):
            lines.append(f"{chr(65 + step_idx)} -->|{condition}| B{branch_num}[分支]")
            for j, bstep in enumerate(branch_steps):
                lines.append(f"B{branch_num}{chr(97 + j)}[{bstep}]")
            lines.append(f"B{branch_num} --> B{branch_num + 1}[汇聚]")
            branch_num += 1

    # Styles
    for i, step in enumerate(steps):
        node_id = chr(65 + i)
        fill = colors["accent"] if i == 0 else (colors["bg_light"] if i % 2 == 0 else colors["bg_light"])
        stroke = colors["secondary"]
        lines.append(f'style {node_id} fill:{fill},stroke:{stroke},stroke-width:2px')

    lines.append(f'linkStyle default stroke:{colors["primary"]},stroke-width:2px')

    return "\n    ".join(lines)

def generate_sequence(
    title: str,
    participants: List[str],
    messages: List[Dict],
    colors: Optional[Dict] = None
) -> str:
    """Generate sequence diagram Mermaid code"""
    if colors is None:
        colors = COLOR_SCHEMES["blue"]

    lines = [f"title {title}", ""]

    for p in participants:
        lines.append(f"participant {p}")

    lines.append("")
    for msg in messages:
        from_p = msg.get("from", "")
        to_p = msg.get("to", "")
        text = msg.get("text", "")
        arrow = msg.get("arrow", "-->")
        note = msg.get("note", "")

        if note:
            lines.append(f"Note over {from_p}: {note}")
        lines.append(f"{from_p} {arrow} {to_p}: {text}")

    return "sequenceDiagram\n    " + "\n    ".join(lines)

def generate_class_diagram(
    title: str,
    classes: List[Dict],
    relationships: List[Dict],
    colors: Optional[Dict] = None
) -> str:
    """Generate class diagram Mermaid code"""
    if colors is None:
        colors = COLOR_SCHEMES["purple"]

    lines = [f"title {title}", ""]

    for cls in classes:
        name = cls["name"]
        attrs = cls.get("attributes", [])
        methods = cls.get("methods", [])

        lines.append(f"class {name} {{")
        for attr in attrs:
            lines.append(f"    {attr}")
        for method in methods:
            lines.append(f"    {method}")
        lines.append("}")
        lines.append(f'style {name} fill:{colors["bg_light"]},stroke:{colors["primary"]},stroke-width:2px')

    lines.append("")
    for rel in relationships:
        from_cls = rel["from"]
        to_cls = rel["to"]
        type_ = rel.get("type", "--")
        label = rel.get("label", "")
        lines.append(f"{from_cls} {type_} {to_cls} : {label}")

    return "classDiagram\n    " + "\n    ".join(lines)

def generate_gantt(
    title: str,
    tasks: List[Dict],
    colors: Optional[Dict] = None
) -> str:
    """Generate gantt chart Mermaid code"""
    if colors is None:
        colors = COLOR_SCHEMES["green"]

    lines = [f"title {title}", ""]
    lines.append("dateFormat YYYY-MM-DD")
    lines.append("axisFormat %m-%d")

    sections = {}
    for task in tasks:
        section = task.get("section", "默认")
        if section not in sections:
            sections[section] = []
        sections[section].append(task)

    for section, task_list in sections.items():
        lines.append(f"section {section}")
        for task in task_list:
            name = task["name"]
            start = task.get("start", "")
            end = task.get("end", "")
            duration = task.get("duration", "")
            status = task.get("status", "active")

            if duration:
                lines.append(f"{name} :{status}, {start}, {duration}")
            else:
                lines.append(f"{name} :{status}, {start}, {end}")

    return "gantt\n    " + "\n    ".join(lines)

def generate_pie(
    title: str,
    data: Dict[str, float],
    colors: Optional[Dict] = None
) -> str:
    """Generate pie chart Mermaid code"""
    lines = [f'title {title}', ""]
    lines.append("show data")

    for label, value in data.items():
        # Escape special characters in labels
        safe_label = label.replace('"', '\\"')
        lines.append(f'    "{safe_label}" : {value}')

    return "pie\n    " + "\n    ".join(lines)

def generate_mindmap(
    title: str,
    nodes: List[str],
    children: Optional[Dict[str, List[str]]] = None,
    colors: Optional[Dict] = None
) -> str:
    """Generate mindmap Mermaid code"""
    if colors is None:
        colors = COLOR_SCHEMES["orange"]

    lines = [f"mindmap", f"  root(({title}))"]

    for node in nodes:
        lines.append(f"    {node}")

    if children:
        for parent, child_list in children.items():
            for child in child_list:
                lines.append(f"      {parent}")
                lines.append(f"        {child}")

    return "\n".join(lines)

def generate_er(
    title: str,
    entities: List[Dict],
    relationships: List[Dict],
    colors: Optional[Dict] = None
) -> str:
    """Generate ER diagram Mermaid code"""
    if colors is None:
        colors = COLOR_SCHEMES["blue"]

    lines = [f"er", f"    title {title}", ""]

    for entity in entities:
        name = entity["name"]
        attrs = entity.get("attributes", [])
        lines.append(f"    {name} {{")
        for attr in attrs:
            attr_type = attr.get("type", "int")
            attr_name = attr.get("name", "")
            lines.append(f"        {attr_type} {attr_name}")
        lines.append("    }")

    lines.append("")
    for rel in relationships:
        from_ent = rel["from"]
        to_ent = rel["to"]
        type_ = rel.get("type", "}")
        label = rel.get("label", "")
        lines.append(f"    {from_ent} {type_}--{to_ent} \"{label}\"")

    return "\n".join(lines)
