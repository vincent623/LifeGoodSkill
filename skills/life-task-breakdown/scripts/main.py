#!/usr/bin/env python3
"""
Task Breakdown Generator - Main Entry
Usage: python main.py "复杂问题描述" [-o output.html]
"""
import sys
from pathlib import Path
from datetime import datetime
from decomposer import decompose_problem, extract_context, Task, Phase
from estimator import estimate_effort, format_duration, summarize_efforts
from gantt import render_gantt_html, GanttTask

SKILL_DIR = Path(__file__).parent.parent

def generate_html_report(problem: str, phases: List[Phase], output_path: str):
    """生成HTML任务分解报告"""

    # 汇总工时
    all_tasks = []
    for phase in phases:
        all_tasks.extend(phase.tasks)

    effort_summary = summarize_efforts([
        type('E', (), {'realistic': t.effort_hours})()
        for t in all_tasks
    ])

    # 转换任务为Gantt格式
    gantt_tasks = []
    current_day = 0
    for phase in phases:
        for task in phase.tasks:
            # 考虑依赖关系调整开始时间
            if task.dependencies:
                max_dep_end = 0
                for dep_id in task.dependencies:
                    for t in all_tasks:
                        if t.id == dep_id:
                            dep_end = t.start_day + t.effort_hours / 8
                            if dep_end > max_dep_end:
                                max_dep_end = dep_end
                task.start_day = max(current_day, max_dep_end)
            else:
                task.start_day = current_day

            gantt_tasks.append(GanttTask(
                id=task.id,
                name=task.name,
                start_day=task.start_day,
                duration_days=task.effort_hours / 8,
                priority=task.priority,
                dependencies=task.dependencies,
                phase=task.phase
            ))

        # 阶段内任务串行，下一阶段开始
        phase_max_end = max(t.start_day + t.effort_hours / 8 for t in phase.tasks)
        current_day = phase_max_end

    # 渲染甘特图
    gantt_html = render_gantt_html(gantt_tasks, phases)

    # 生成任务列表HTML
    task_items = ""
    for phase in phases:
        phase_tasks = ""
        for task in phase.tasks:
            priority_class = f"priority-{task.priority}"
            risk_badge = f'<span class="risk-badge risk-{task.risk_level}">{task.risk_level}</span>' if task.risk_level != "low" else ""

            deps = ",".join(task.dependencies) if task.dependencies else "-"

            phase_tasks += f'''
            <div class="task-item">
                <div class="task-id">{task.id}</div>
                <div class="task-name">{task.name}</div>
                <div class="task-meta">
                    <span class="{priority_class}">P{task.priority}</span>
                    <span class="effort">{format_duration(task.effort_hours)}</span>
                    <span class="deps">依赖:{deps}</span>
                    {risk_badge}
                </div>
            </div>'''

        task_items += f'''
        <div class="phase-section">
            <div class="phase-header">
                <span class="phase-name">{phase.name}</span>
                <span class="phase-duration">{format_duration(sum(t.effort_hours for t in phase.tasks))}</span>
            </div>
            <div class="phase-tasks">
                {phase_tasks}
            </div>
        </div>'''

    # 问题分解树
    tree_html = ""
    for i, phase in enumerate(phases, 1):
        tree_html += f'''
        <div class="tree-node">
            <div class="tree-phase">
                <span class="tree-icon">📁</span>
                <span class="tree-name">{i}. {phase.name}</span>
                <span class="tree-count">{len(phase.tasks)}个任务</span>
            </div>
            <div class="tree-children">'''

        for j, task in enumerate(phase.tasks, 1):
            priority_label = ["关键", "重要", "普通", "次要", "可选"][task.priority - 1]
            tree_html += f'''
                <div class="tree-task">
                    <span class="tree-connector">├─</span>
                    <span class="task-name">{i}.{j} {task.name}</span>
                    <span class="task-prio priority-label-{task.priority}">{priority_label}</span>
                </div>'''

        tree_html += '''
            </div>
        </div>'''

    # 风险提示
    risk_tasks = [t for t in all_tasks if t.risk_level == "high"]
    risk_html = ""
    if risk_tasks:
        risk_html = f'''
        <div class="risk-section">
            <h3>⚠️ 高风险任务</h3>
            <ul>
                {''.join(f'<li>{t.id} {t.name}</li>' for t in risk_tasks)}
            </ul>
        </div>'''

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>任务分解报告</title>
    <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; padding: 20px; line-height: 1.6; }}
    .container {{ max-width: 1100px; margin: 0 auto; }}
    h1 {{ text-align: center; color: #333; margin-bottom: 10px; }}
    .meta {{ text-align: center; color: #888; font-size: 14px; margin-bottom: 30px; }}
    .problem-statement {{ background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #667eea; }}
    .problem-statement h2 {{ font-size: 16px; color: #555; margin-bottom: 10px; }}
    .problem-statement p {{ font-size: 15px; color: #333; }}
    .card {{ background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
    .card h2 {{ color: #444; font-size: 18px; margin-bottom: 16px; border-left: 4px solid #10b981; padding-left: 12px; }}
    .summary-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }}
    .summary-item {{ text-align: center; padding: 15px; background: #f8f9fa; border-radius: 10px; }}
    .summary-num {{ font-size: 28px; font-weight: bold; color: #667eea; }}
    .summary-label {{ font-size: 12px; color: #888; }}
    .phase-section {{ margin: 20px 0; }}
    .phase-header {{ display: flex; align-items: center; gap: 12px; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border-radius: 8px; margin-bottom: 10px; }}
    .phase-name {{ font-weight: bold; font-size: 16px; }}
    .phase-duration {{ margin-left: auto; font-size: 14px; opacity: 0.9; }}
    .task-item {{ display: flex; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; margin: 8px 0; }}
    .task-id {{ font-weight: bold; color: #667eea; width: 40px; }}
    .task-name {{ flex: 1; font-size: 14px; }}
    .task-meta {{ display: flex; gap: 10px; align-items: center; font-size: 12px; }}
    .priority-1, .priority-2 {{ background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; }}
    .priority-3 {{ background: #f59e0b; color: #fff; padding: 2px 8px; border-radius: 4px; }}
    .priority-4, .priority-5 {{ background: #10b981; color: #fff; padding: 2px 8px; border-radius: 4px; }}
    .effort {{ color: #888; }}
    .deps {{ color: #666; }}
    .risk-badge {{ padding: 2px 6px; border-radius: 4px; font-size: 10px; }}
    .risk-high {{ background: #ef4444; color: #fff; }}
    .risk-medium {{ background: #f59e0b; color: #fff; }}
    .risk-section {{ background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin-top: 15px; }}
    .risk-section h3 {{ color: #dc2626; font-size: 14px; margin-bottom: 10px; }}
    .risk-section ul {{ padding-left: 20px; color: #991b1b; font-size: 14px; }}
    .tree-node {{ margin: 10px 0; }}
    .tree-phase {{ display: flex; align-items: center; gap: 8px; padding: 10px; background: #e0e7ff; border-radius: 8px; font-weight: bold; }}
    .tree-children {{ margin-left: 30px; padding: 10px 0; }}
    .tree-task {{ display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 14px; }}
    .tree-connector {{ color: #a5b4fc; }}
    .priority-label-1, .priority-label-2 {{ background: #ef4444; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 10px; }}
    .priority-label-3 {{ background: #f59e0b; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 10px; }}
    .priority-label-4, .priority-label-5 {{ background: #10b981; color: #fff; padding: 1px 6px; border-radius: 3px; font-size: 10px; }}
    .timeline {{ display: flex; gap: 8px; flex-wrap: wrap; margin-top: 15px; }}
    .timeline-item {{ flex: 1; min-width: 120px; text-align: center; padding: 12px; background: #f0f9ff; border-radius: 8px; }}
    .timeline-phase {{ font-weight: bold; color: #0369a1; font-size: 14px; }}
    .timeline-duration {{ font-size: 12px; color: #888; margin-top: 5px; }}
    @media (max-width: 600px) {{ .summary-grid {{ grid-template-columns: repeat(2, 1fr); }} }}
    </style>
</head>
<body>
    <div class="container">
        <h1>任务分解报告</h1>
        <p class="meta">生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>

        <div class="problem-statement">
            <h2>问题陈述</h2>
            <p>{problem}</p>
        </div>

        <div class="card">
            <h2>概览</h2>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-num">{len(phases)}</div>
                    <div class="summary-label">执行阶段</div>
                </div>
                <div class="summary-item">
                    <div class="summary-num">{len(all_tasks)}</div>
                    <div class="summary-label">任务总数</div>
                </div>
                <div class="summary-item">
                    <div class="summary-num">{effort_summary['total_days']:.1f}</div>
                    <div class="summary-label">预计工期</div>
                </div>
                <div class="summary-item">
                    <div class="summary-num">{effort_summary['optimistic_days']:.1f}-{effort_summary['pessimistic_days']:.1f}</div>
                    <div class="summary-label">乐观-悲观</div>
                </div>
            </div>

            <h3>时间线</h3>
            <div class="timeline">
                {''.join(f'<div class="timeline-item"><div class="timeline-phase">{p.name}</div><div class="timeline-duration">{format_duration(sum(t.effort_hours for t in p.tasks))}</div></div>' for p in phases)}
            </div>
        </div>

        <div class="card">
            <h2>问题分解树</h2>
            {tree_html}
        </div>

        <div class="card">
            <h2>任务清单</h2>
            {task_items}
            {risk_html}
        </div>

        <div class="card">
            <h2>甘特图</h2>
            {gantt_html}
        </div>
    </div>
</body>
</html>"""

    Path(output_path).write_text(html)

def main():
    if len(sys.argv) < 2:
        print("请提供问题描述")
        print("示例: python main.py \"用户增长停滞\" -o plan.html")
        print("     python main.py -i problem.txt -o plan.html")
        return

    problem = sys.argv[1]
    output_file = "task-breakdown.html"

    for i, arg in enumerate(sys.argv[2:], 2):
        if arg == "-i" and i + 1 < len(sys.argv):
            problem = Path(sys.argv[i + 1]).read_text()
        elif arg == "-o" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
        elif arg == "--sample":
            problem = "公司核心产品的用户增长停滞，月活从100万下降到80万，需要分析原因并制定恢复计划"
            Path("sample-problem.txt").write_text(problem)
            phases = decompose_problem(problem)
            generate_html_report(problem, phases, "sample-breakdown.html")
            print(f"示例报告: sample-breakdown.html")
            return

    if not problem.strip():
        print("问题描述不能为空")
        return

    # 分解问题
    phases = decompose_problem(problem)

    # 生成报告
    generate_html_report(problem, phases, output_file)
    print(f"报告已生成: {output_file}")

if __name__ == "__main__":
    main()
