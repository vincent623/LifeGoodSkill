#!/usr/bin/env python3
"""
Mermaid Diagram Optimizer
Handles aspect ratios, color schemes, and layout optimization.
"""
from dataclasses import dataclass, field
from typing import Dict, Optional, List, Tuple
from enum import Enum

from templates import COLOR_SCHEMES, ASPECT_RATIOS, DiagramType


class LayoutStyle(Enum):
    COMPACT = "compact"
    COMFORTABLE = "comfortable"
    SPACIOUS = "spacious"


class FlowDirection(Enum):
    TB = "TB"  # Top to Bottom
    BT = "BT"  # Bottom to Top
    LR = "LR"  # Left to Right
    RL = "RL"  # Right to Left


@dataclass
class SubgraphBlock:
    """Represents a subgraph block in the layout"""
    name: str
    label: str
    nodes: List[str]
    edges: List[str] = field(default_factory=list)
    direction: FlowDirection = FlowDirection.TB


@dataclass
class LayoutConfig:
    """Layout configuration for diagrams"""
    aspect_ratio: str = "4:3"
    color_scheme: str = "blue"
    layout_style: LayoutStyle = LayoutStyle.COMFORTABLE
    font_size: str = "14px"
    node_padding: int = 20
    show_legend: bool = True
    dark_mode: bool = False
    flow_direction: FlowDirection = FlowDirection.TB
    rank_spacing: int = 30
    node_spacing: int = 20
    min_width: int = 800  # Minimum diagram width for complex charts


def calculate_optimal_ratio(subgraph_count: int) -> str:
    """Calculate optimal aspect ratio based on subgraph count"""
    # Common layouts: 2x3=6, 3x2=6, 2x4=8, 4x2=8, 3x3=9
    if subgraph_count <= 4:
        return "4:3"  # Portrait-friendly
    elif subgraph_count <= 6:
        return "4:3"  # 2x3 grid
    elif subgraph_count <= 8:
        return "16:9"  # Wide layout for 7-8 subgraphs (FIX: was 3:2)
    elif subgraph_count <= 12:
        return "16:9"  # 3x4 or 4x3 grid
    else:
        return "16:9"  # Large diagrams


def suggest_flow_direction(subgraph_count: int, total_nodes: int) -> FlowDirection:
    """Suggest flow direction based on content"""
    if subgraph_count >= 6 and total_nodes > 20:
        return FlowDirection.TB  # Vertical flow for many subgraphs
    elif subgraph_count >= 4 and total_nodes <= 15:
        return FlowDirection.LR  # Horizontal flow for simpler content
    else:
        return FlowDirection.TB  # Default to vertical


def balance_subgraph_nodes(blocks: List[SubgraphBlock], max_nodes: int = 6) -> List[SubgraphBlock]:
    """Split subgraphs that have too many nodes"""
    balanced = []
    for block in blocks:
        if len(block.nodes) <= max_nodes:
            balanced.append(block)
        else:
            # Split into multiple blocks
            parts = len(block.nodes) // max_nodes + (1 if len(block.nodes) % max_nodes else 0)
            nodes_per_part = (len(block.nodes) + parts - 1) // parts

            for i in range(parts):
                start = i * nodes_per_part
                end = min((i + 1) * nodes_per_part, len(block.nodes))
                part_nodes = block.nodes[start:end]

                new_block = SubgraphBlock(
                    name=f"{block.name}_p{i + 1}",
                    label=f"{block.label} ({i + 1}/{parts})",
                    nodes=part_nodes,
                    edges=[],  # Simplified: no internal edges for split blocks
                    direction=block.direction
                )
                balanced.append(new_block)

    return balanced


def build_layout_from_blocks(
    blocks: List[SubgraphBlock],
    flow_direction: FlowDirection = FlowDirection.TB
) -> str:
    """Build Mermaid flowchart code from layout blocks"""
    lines = [f"flowchart {flow_direction.value}"]

    for i, block in enumerate(blocks):
        # Subgraph header
        lines.append(f"    subgraph {block.name}[{block.label}]")
        lines.append(f"        direction {block.direction.value}")

        # Nodes
        for j, node in enumerate(block.nodes):
            node_id = f"{block.name.upper()[0]}{i + 1}{j}"
            lines.append(f"        {node_id}({node})")

        # Internal edges (chain them)
        for j in range(len(block.nodes) - 1):
            curr = f"{block.name.upper()[0]}{i + 1}{j}"
            next_ = f"{block.name.upper()[0]}{i + 1}{j + 1}"
            lines.append(f"        {curr} --> {next_}")

        lines.append(f"    end")

    # Inter-block connections
    for i in range(len(blocks) - 1):
        curr_last = f"{blocks[i].name.upper()[0]}{i + 1}{len(blocks[i].nodes) - 1}"
        next_first = f"{blocks[i + 1].name.upper()[0]}{i + 2}0"
        lines.append(f"    {curr_last} --> {next_first}")

    return "\n    ".join(lines)


def create_subgraph_layout(
    content_blocks: List[Dict],
    aspect_ratio: Optional[str] = None,
    color_scheme: str = "blue",
    flow_direction: Optional[FlowDirection] = None
) -> Tuple[str, LayoutConfig]:
    """
    Create optimized layout from content blocks.

    Args:
        content_blocks: List of dicts with 'name', 'label', 'nodes' keys
        aspect_ratio: Optional specific ratio, auto-calculated if None
        color_scheme: Color scheme name
        flow_direction: Optional specific direction, auto-calculated if None

    Returns:
        Tuple of (mermaid_code, config)
    """
    # Build subgraph blocks
    blocks = []
    for block_data in content_blocks:
        block = SubgraphBlock(
            name=block_data["name"],
            label=block_data["label"],
            nodes=block_data["nodes"],
            direction=FlowDirection.TB
        )
        blocks.append(block)

    # Calculate optimal parameters
    subgraph_count = len(blocks)
    total_nodes = sum(len(b.nodes) for b in blocks)

    if aspect_ratio is None:
        aspect_ratio = calculate_optimal_ratio(subgraph_count)

    if flow_direction is None:
        flow_direction = suggest_flow_direction(subgraph_count, total_nodes)

    # Balance nodes if needed
    balanced = balance_subgraph_nodes(blocks)

    # Build layout
    mermaid_code = build_layout_from_blocks(balanced, flow_direction)

    # Create config
    config = LayoutConfig(
        aspect_ratio=aspect_ratio,
        color_scheme=color_scheme,
        flow_direction=flow_direction,
        rank_spacing=25 if flow_direction == FlowDirection.TB else 35,
        node_spacing=15 if flow_direction == FlowDirection.TB else 25,
    )

    return mermaid_code, config


def get_optimal_config(
    diagram_type: DiagramType,
    content_size: int,
    complexity: str = "medium"
) -> LayoutConfig:
    """Get optimal configuration based on diagram type and content"""
    config = LayoutConfig()

    # Aspect ratio recommendations by type
    ratio_map = {
        DiagramType.FLOWCHART: "4:3",
        DiagramType.SEQUENCE: "16:9",
        DiagramType.CLASS: "4:3",
        DiagramType.STATE: "4:3",
        DiagramType.ER: "4:3",
        DiagramType.GANTT: "16:9",
        DiagramType.PIE: "1:1",
        DiagramType.MINDMAP: "3:4",
        DiagramType.JOURNEY: "3:2",
    }
    config.aspect_ratio = ratio_map.get(diagram_type, "4:3")

    # Color scheme by type
    scheme_map = {
        DiagramType.FLOWCHART: "blue",
        DiagramType.SEQUENCE: "blue",
        DiagramType.CLASS: "purple",
        DiagramType.STATE: "orange",
        DiagramType.ER: "blue",
        DiagramType.GANTT: "green",
        DiagramType.PIE: "blue",
        DiagramType.MINDMAP: "orange",
        DiagramType.JOURNEY: "purple",
    }
    config.color_scheme = scheme_map.get(diagram_type, "blue")

    # Layout style by complexity
    if complexity == "high":
        config.layout_style = LayoutStyle.COMPACT
        config.font_size = "12px"
        config.node_padding = 10
        config.rank_spacing = 20
        config.node_spacing = 12
        config.min_width = 600
    elif complexity == "low":
        config.layout_style = LayoutStyle.SPACIOUS
        config.font_size = "16px"
        config.node_padding = 30
        config.rank_spacing = 45
        config.node_spacing = 35
        config.min_width = 950  # FIX: was missing, diagrams appeared too small
    else:
        config.layout_style = LayoutStyle.COMFORTABLE
        config.font_size = "14px"
        config.node_padding = 20
        config.rank_spacing = 30
        config.node_spacing = 20
        config.min_width = 800

    return config


def generate_html_wrapper(
    mermaid_code: str,
    config: LayoutConfig,
    title: str = "Mermaid Diagram"
) -> str:
    """Generate HTML wrapper with embedded Mermaid renderer"""
    colors = COLOR_SCHEMES.get(config.color_scheme, COLOR_SCHEMES["blue"])
    dims = ASPECT_RATIOS.get(config.aspect_ratio, ASPECT_RATIOS["4:3"])

    bg_color = colors["bg_light"] if not config.dark_mode else colors["bg_dark"]
    text_color = "#333" if not config.dark_mode else "#f0f0f0"

    html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: {bg_color};
        min-height: 100vh;
        display: flex;
        justify-content: center;
        padding: 20px;
    }}
    .container {{
        width: {dims["width"]}px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        overflow: hidden;
    }}
    .header {{
        background: linear-gradient(135deg, {colors["primary"]}, {colors["secondary"]});
        color: #fff;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }}
    .header h1 {{
        font-size: 16px;
        font-weight: 600;
    }}
    .meta {{
        font-size: 11px;
        opacity: 0.9;
    }}
    .diagram-container {{
        padding: 15px;
        background: #fff;
    }}
    .code-section {{
        border-top: 1px solid #eee;
        padding: 16px;
        background: #f8f9fa;
    }}
    .code-header h3 {{
        font-size: 13px;
        color: {text_color};
        margin-bottom: 10px;
    }}
    pre {{
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
    }}
    .footer {{
        padding: 12px 16px;
        text-align: center;
        font-size: 11px;
        color: #888;
        border-top: 1px solid #eee;
    }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{title}</h1>
            <span class="meta">{config.aspect_ratio} | {config.color_scheme}</span>
        </div>
        <div class="diagram-container">
            <div class="mermaid">
{mermaid_code}
            </div>
        </div>
        <div class="code-section">
            <div class="code-header">
                <h3>Mermaid 代码</h3>
            </div>
            <pre><code>{mermaid_code}</code></pre>
        </div>
        <div class="footer">
            Generated with Mermaid Diagram Master | {config.aspect_ratio}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'base',
            themeVariables: {{
                primaryColor: '{colors["primary"]}',
                primaryTextColor: '#fff',
                primaryBorderColor: '{colors["secondary"]}',
                lineColor: '{colors["primary"]}',
                secondaryColor: '{colors["accent"]}',
                tertiaryColor: '{colors["bg_light"]}',
            }},
            flowchart: {{
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
                rankSpacing: {config.rank_spacing},
                nodeSpacing: {config.node_spacing},
            }},
        }});
    </script>
</body>
</html>'''
    return html


def optimize_for_presentation(
    mermaid_code: str,
    diagram_type: DiagramType,
    presentation_size: str = "slide"
) -> str:
    """Optimize diagram for presentation use"""
    size_configs = {
        "slide": {"width": "100%", "scale": 1.2},
        "document": {"width": "800px", "scale": 1.0},
        "poster": {"width": "1200px", "scale": 1.5},
        "thumbnail": {"width": "400px", "scale": 0.5},
    }

    config = size_configs.get(presentation_size, size_configs["document"])

    if diagram_type in [DiagramType.FLOWCHART, DiagramType.CLASS]:
        mermaid_code = f'%%{{init: {{"themeVariables": {{"fontSize": "16px"}}}}}}%%\n{mermaid_code}'

    return mermaid_code


def generate_complex_html_wrapper(
    mermaid_code: str,
    config: LayoutConfig,
    title: str = "Mermaid Diagram",
    custom_styles: Optional[Dict] = None
) -> str:
    """Generate HTML wrapper for complex diagrams with classDef support.

    This wrapper handles:
    - Complex diagrams with 7+ subgraphs
    - Diagrams using classDef for styling
    - Diagrams requiring larger display area
    """
    colors = COLOR_SCHEMES.get(config.color_scheme, COLOR_SCHEMES["blue"])
    dims = ASPECT_RATIOS.get(config.aspect_ratio, ASPECT_RATIOS["4:3"])

    # Use custom width if provided, otherwise use config min_width
    width = max(dims["width"], config.min_width)

    bg_color = colors["bg_light"] if not config.dark_mode else colors["bg_dark"]
    text_color = "#333" if not config.dark_mode else "#f0f0f0"

    # Custom CSS for complex diagrams
    custom_css = ""
    if custom_styles:
        custom_css = f"""
    .{custom_styles.get('container_class', 'mermaid-container')} {{
        min-width: {config.min_width}px;
        overflow-x: auto;
    }}"""

    html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
        background: {bg_color};
        min-height: 100vh;
        display: flex;
        justify-content: center;
        padding: 20px;
    }}
    .container {{
        width: 100%;
        max-width: {width}px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        overflow: hidden;
    }}
    .header {{
        background: linear-gradient(135deg, {colors["primary"]}, {colors["secondary"]});
        color: #fff;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }}
    .header h1 {{
        font-size: 16px;
        font-weight: 600;
    }}
    .meta {{
        font-size: 11px;
        opacity: 0.9;
    }}
    .diagram-container {{
        padding: 15px;
        background: #fff;
        min-width: {config.min_width}px;{custom_css}
    }}
    .mermaid {{
        display: flex;
        justify-content: center;
    }}
    .code-section {{
        border-top: 1px solid #eee;
        padding: 16px;
        background: #f8f9fa;
    }}
    .code-header h3 {{
        font-size: 13px;
        color: {text_color};
        margin-bottom: 10px;
    }}
    pre {{
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
    }}
    .footer {{
        padding: 12px 16px;
        text-align: center;
        font-size: 11px;
        color: #888;
        border-top: 1px solid #eee;
    }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{title}</h1>
            <span class="meta">{config.aspect_ratio} | {config.color_scheme}</span>
        </div>
        <div class="diagram-container">
            <div class="mermaid">
{mermaid_code}
            </div>
        </div>
        <div class="code-section">
            <div class="code-header">
                <h3>Mermaid 代码</h3>
            </div>
            <pre><code>{mermaid_code}</code></pre>
        </div>
        <div class="footer">
            Generated with Mermaid Diagram Master | {config.aspect_ratio}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'base',
            themeVariables: {{
                primaryColor: '{colors["primary"]}',
                primaryTextColor: '#fff',
                primaryBorderColor: '{colors["secondary"]}',
                lineColor: '{colors["primary"]}',
                secondaryColor: '{colors["accent"]}',
                tertiaryColor: '{colors["bg_light"]}',
            }},
            flowchart: {{
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
                rankSpacing: {config.rank_spacing},
                nodeSpacing: {config.node_spacing},
            }},
            securityLevel: 'loose'  # Required for classDef in some cases
        }});
    </script>
</body>
</html>'''
    return html
