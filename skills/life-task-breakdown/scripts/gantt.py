#!/usr/bin/env python3
"""
Gantt Chart Renderer
"""
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime, timedelta

@dataclass
class GanttTask:
    id: str
    name: str
    start_day: float
    duration_days: float
    priority: int
    dependencies: List[str]
    phase: str

def render_gantt_html(tasks: List[GanttTask], phases: List) -> str:
    """渲染甘特图HTML"""

    # 计算总天数
    max_day = max(t.start_day + t.duration_days for t in tasks)
    total_days = max(14, int(max_day) + 3)  # 至少14天

    # 按阶段分组任务
    phase_tasks = {}
    for phase in phases:
        phase_tasks[phase.name] = [t for t in tasks if t.phase == phase.name]

    # 生成时间轴头部
    timeline_header = ""
    for d in range(total_days):
        style = "border-left:1px solid #ddd;"
        if d % 7 == 0:
            style = "border-left:2px solid #333;background:#f5f5f5;"
        timeline_header += f'<div class="gantt-day" style="flex:1;min-width:30px;height:30px;font-size:10px;text-align:center;{style}">D{d+1}</div>'

    # 生成甘特条形
    gantt_rows = ""
    row_colors = {
        "分析": "#4facfe",
        "诊断": "#4facfe",
        "调研": "#4facfe",
        "方案": "#f093fb",
        "设计": "#f093fb",
        "规划": "#f093fb",
        "实施": "#43e97b",
        "执行": "#43e97b",
        "开发": "#43e97b",
        "验证": "#fa709a",
        "评估": "#fa709a",
        "收尾": "#fa709a",
        "运维": "#fee140",
        "运营": "#fee140"
    }

    phase_order = {}
    for i, phase in enumerate(phases):
        phase_order[phase.name] = i

    # 按阶段排序
    sorted_tasks = sorted(tasks, key=lambda t: (phase_order.get(t.phase, 0), t.start_day))

    for task in sorted_tasks:
        color = row_colors.get(task.phase, "#667eea")
        bar_width = task.duration_days * 30  # 每天30px
        bar_left = task.start_day * 30
        dep_markers = ""

        for dep in task.dependencies:
            dep_markers += f'<span class="dep-marker">{dep}</span>'

        risk_class = f"risk-{task.priority}" if task.priority <= 2 else ""

        gantt_rows += f'''
        <div class="gantt-row">
            <div class="gantt-task-info">
                <span class="task-id">{task.id}</span>
                <span class="task-name">{task.name}</span>
                <span class="task-duration">{task.duration_days:.1f}天</span>
            </div>
            <div class="gantt-timeline">
                <div class="gantt-bar" style="left:{bar_left}px;width:{bar_width}px;background:{color};{risk_class}">
                    <span class="bar-label">{task.duration_days:.1f}d</span>
                </div>
                <div class="dep-indicators">{dep_markers}</div>
            </div>
        </div>'''

    # 生成阶段汇总行
    phase_rows = ""
    for phase in phases:
        if phase.name in phase_tasks:
            tasks_in_phase = phase_tasks[phase.name]
            start = min(t.start_day for t in tasks_in_phase)
            end = max(t.start_day + t.duration_days for t in tasks_in_phase)
            phase_width = (end - start) * 30
            phase_left = start * 30
            color = row_colors.get(phase.name, "#667eea")

            phase_rows += f'''
            <div class="phase-summary">
                <div class="phase-label">{phase.name}</div>
                <div class="phase-bar" style="left:{phase_left}px;width:{phase_width}px;background:{color}80"></div>
            </div>'''

    html = f'''
    <style>
    .gantt-container {{
        background: #fff;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        overflow-x: auto;
    }}
    .gantt-header {{
        display: flex;
        border-bottom: 2px solid #333;
        margin-bottom: 10px;
        min-width: {total_days * 30}px;
    }}
    .gantt-row {{
        display: flex;
        align-items: center;
        min-width: {total_days * 30}px;
        border-bottom: 1px solid #eee;
        height: 36px;
    }}
    .gantt-task-info {{
        width: 250px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding-right: 10px;
        font-size: 12px;
    }}
    .task-id {{
        font-weight: bold;
        color: #667eea;
        width: 40px;
    }}
    .task-name {{
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }}
    .task-duration {{
        color: #888;
        width: 50px;
        text-align: right;
    }}
    .gantt-timeline {{
        flex: 1;
        position: relative;
        height: 36px;
        background: repeating-linear-gradient(90deg, #f9f9f9 0px, #f9f9f9 29px, #eee 30px);
    }}
    .gantt-bar {{
        position: absolute;
        height: 24px;
        top: 6px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #fff;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }}
    .gantt-bar.risk-high {{
        animation: pulse 1s infinite;
    }}
    @keyframes pulse {{
        0% {{ box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }}
        70% {{ box-shadow: 0 0 0 6px rgba(239,68,68,0); }}
        100% {{ box-shadow: 0 0 0 0 rgba(239,68,68,0); }}
    }}
    .dep-markers {{
        position: absolute;
        right: -20px;
        top: 0;
    }}
    .dep-marker {{
        display: inline-block;
        width: 18px;
        height: 18px;
        background: #fbbf24;
        border-radius: 50%;
        font-size: 10px;
        text-align: center;
        line-height: 18px;
        color: #333;
    }}
    .phase-summary {{
        display: flex;
        align-items: center;
        height: 30px;
        margin-top: 15px;
        position: relative;
    }}
    .phase-label {{
        width: 100px;
        font-size: 12px;
        font-weight: bold;
        color: #555;
    }}
    .phase-bar {{
        position: absolute;
        height: 8px;
        border-radius: 4px;
        top: 10px;
    }}
    .gantt-legend {{
        display: flex;
        gap: 20px;
        margin-top: 15px;
        font-size: 12px;
        justify-content: center;
    }}
    .legend-item {{
        display: flex;
        align-items: center;
        gap: 5px;
    }}
    .legend-color {{
        width: 20px;
        height: 12px;
        border-radius: 3px;
    }}
    </style>

    <div class="gantt-container">
        <div class="gantt-header">
            <div style="width:250px;flex-shrink:0;font-weight:bold;color:#555;padding-right:10px;">任务</div>
            <div style="flex:1;">时间线（天）</div>
        </div>
        {gantt_rows}
        <div style="margin-top:20px;border-top:2px solid #eee;padding-top:15px;">
            <div style="font-size:12px;font-weight:bold;color:#555;margin-bottom:10px;">阶段概览</div>
            {phase_rows}
        </div>
        <div class="gantt-legend">
            <div class="legend-item"><span class="legend-color" style="background:#4facfe"></span>分析阶段</div>
            <div class="legend-item"><span class="legend-color" style="background:#f093fb"></span>方案阶段</div>
            <div class="legend-item"><span class="legend-color" style="background:#43e97b"></span>实施阶段</div>
            <div class="legend-item"><span class="legend-color" style="background:#fa709a"></span>验证阶段</div>
        </div>
    </div>'''

    return html
