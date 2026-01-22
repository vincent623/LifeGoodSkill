#!/usr/bin/env python3
"""
Decision Analysis Generator - Main Entry
Usage: python main.py "决策问题" [-c "背景信息"] [-o output.html]
"""
import sys
from pathlib import Path
from datetime import datetime
from debate import run_three_round_debate, Hat, DecisionAnalysis
from scorer import calculate_weighted_score, generate_recommendation

SKILL_DIR = Path(__file__).parent.parent

def render_perspective_card(perspective, scores: dict) -> str:
    """渲染视角卡片"""
    hat_name = perspective.hat.value.split()[1]
    emoji = perspective.hat.value.split()[0]

    # 颜色
    colors = {
        "白帽": "#e0e7ff",
        "红帽": "#fee2e2",
        "黑帽": "#374151",
        "黄帽": "#fef3c7",
        "绿帽": "#d1fae5",
        "蓝帽": "#dbeafe"
    }
    text_colors = {
        "白帽": "#3730a3",
        "红帽": "#991b1b",
        "黑帽": "#f3f4f6",
        "黄帽": "#92400e",
        "绿帽": "#065f46",
        "蓝帽": "#1e40af"
    }

    return f'''
    <div class="perspective-card" style="background:{colors.get(hat_name, '#fff')};border-left:4px solid {text_colors.get(hat_name, '#666')}">
        <div class="card-header">
            <span class="card-emoji">{emoji}</span>
            <span class="card-name">{hat_name}</span>
            <span class="card-score">{scores.get(perspective.hat, 5):.1f}</span>
        </div>
        <div class="card-content">
            <ul class="key-points">
                {''.join(f'<li>{p}</li>' for p in perspective.key_points[:3])}
            </ul>
        </div>
    </div>'''

def render_debate_rounds(analysis: DecisionAnalysis) -> str:
    """渲染辩论轮次"""
    html = ""

    for round_num, round_data in enumerate(analysis.rounds, 1):
        round_title = ["初始观点", "辩论交锋", "收敛结论"][round_num - 1]

        # 获取本轮分数
        scores = {p.hat: p.score for p in round_data.perspectives}

        # 对抗/结盟标记
        tags = ""
        if round_data.confrontations:
            tags += '<div class="round-tags confrontation">⚔️ 对抗: ' + ", ".join([f"{c[0].value.split()[1]}<->{c[1].value.split()[1]}" for c in round_data.confrontations[:2]]) + '</div>'
        if round_data.alliances:
            tags += '<div class="round-tags alliance">🤝 结盟: ' + ", ".join([f"{a[0].value.split()[1]}+{a[1].value.split()[1]}" for a in round_data.alliances[:2]]) + '</div>'

        html += f'''
        <div class="debate-round">
            <h3>第{round_num}轮：{round_title}</h3>
            {tags}
            <div class="perspectives-grid">
                {''.join(render_perspective_card(p, scores) for p in round_data.perspectives)}
            </div>
        </div>'''

    return html

def render_score_matrix(scores: dict, breakdown) -> str:
    """渲染评分矩阵"""
    rows = ""
    for bd in breakdown:
        bar_width = bd.adjusted_score * 10
        rows += f'''
        <div class="score-row">
            <div class="score-label">{bd.perspective}</div>
            <div class="score-bar-wrap">
                <div class="score-bar" style="width:{bar_width}%"></div>
            </div>
            <div class="score-value">{bd.adjusted_score:.1f}</div>
            <div class="score-weight">×{bd.weight}</div>
        </div>'''

    return f'''
    <div class="score-matrix">
        <div class="score-header">
            <span>视角</span>
            <span>基础分</span>
            <span>权重</span>
            <span>调整分</span>
        </div>
        {rows}
    </div>'''

def render_alliance_graph(rounds) -> str:
    """渲染对抗/结盟关系图"""
    # 简化：显示六顶帽子的位置关系
    positions = {
        "白帽": (50, 30),
        "红帽": (80, 50),
        "黑帽": (50, 70),
        "黄帽": (20, 50),
        "绿帽": (50, 50),
        "蓝帽": (50, 10)
    }

    nodes = ""
    for name, (x, y) in positions.items():
        color = {
            "白帽": "#6366f1", "红帽": "#ef4444", "黑帽": "#1f2937",
            "黄帽": "#f59e0b", "绿帽": "#10b981", "蓝帽": "#3b82f6"
        }[name]
        nodes += f'<div class="graph-node" style="left:{x}%;top:{y}%;background:{color}">{name[0]}</div>'

    return f'''
    <div class="alliance-graph">
        <div class="graph-container">
            {nodes}
            <svg class="graph-lines" style="position:absolute;width:100%;height:100%;top:0;left:0">
                <!-- 连接线 -->
                <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#10b981" stroke-width="2" stroke-dasharray="5,5"/>
                <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="#ef4444" stroke-width="2"/>
            </svg>
        </div>
        <div class="graph-legend">
            <span>🟢 绿线=结盟</span>
            <span>🔴 红线=对抗</span>
        </div>
    </div>'''

def generate_html_report(analysis: DecisionAnalysis, output_path: str):
    """生成HTML报告"""

    # 计算分数
    scores = {p.hat: p.score for r in analysis.rounds for p in r.perspectives}
    avg_scores = {hat: sum(r.perspectives[i].score for r in analysis.rounds) / 3 for i, hat in enumerate(Hat)}

    final_score, breakdown = calculate_weighted_score(avg_scores)
    recommendation = generate_recommendation(avg_scores, final_score)

    # 格式化分数
    score_display = final_score
    if final_score >= 70:
        score_color = "#10b981"
        score_label = "建议执行"
    elif final_score >= 50:
        score_color = "#f59e0b"
        score_label = "谨慎评估"
    else:
        score_color = "#ef4444"
        score_label = "建议暂缓"

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>决策分析报告</title>
    <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; padding: 20px; line-height: 1.6; }}
    .container {{ max-width: 1100px; margin: 0 auto; }}
    h1 {{ text-align: center; color: #333; margin-bottom: 10px; }}
    .meta {{ text-align: center; color: #888; font-size: 14px; margin-bottom: 30px; }}
    .card {{ background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
    .question-box {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }}
    .question-box h2 {{ color: #fff; border-left-color: #fff; font-size: 18px; }}
    .question-box p {{ font-size: 18px; font-weight: 500; }}
    .summary {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }}
    .summary-card {{ text-align: center; padding: 20px; background: #f8f9fa; border-radius: 12px; }}
    .summary-score {{ font-size: 48px; font-weight: bold; color: {score_color}; }}
    .summary-label {{ font-size: 14px; color: #888; }}
    .summary-action {{ font-size: 20px; font-weight: bold; color: {score_color}; margin-top: 10px; }}
    .perspectives-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; }}
    @media (max-width: 768px) {{ .perspectives-grid {{ grid-template-columns: repeat(2, 1fr); }} }}
    .perspective-card {{ padding: 15px; border-radius: 10px; }}
    .card-header {{ display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }}
    .card-emoji {{ font-size: 20px; }}
    .card-name {{ flex: 1; font-weight: bold; }}
    .card-score {{ font-weight: bold; font-size: 16px; }}
    .key-points {{ padding-left: 18px; font-size: 13px; }}
    .key-points li {{ margin: 4px 0; }}
    .debate-round {{ margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; }}
    .debate-round h3 {{ margin-bottom: 15px; color: #333; }}
    .round-tags {{ display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-right: 10px; margin-bottom: 15px; }}
    .round-tags.confrontation {{ background: #fee2e2; color: #991b1b; }}
    .round-tags.alliance {{ background: #d1fae5; color: #065f46; }}
    .score-matrix {{ margin-top: 20px; }}
    .score-header {{ display: grid; grid-template-columns: 120px 80px 60px 80px; gap: 10px; font-weight: bold; font-size: 13px; color: #666; margin-bottom: 10px; }}
    .score-row {{ display: grid; grid-template-columns: 120px 1fr 60px; gap: 10px; align-items: center; margin: 8px 0; }}
    .score-label {{ font-size: 13px; }}
    .score-bar-wrap {{ height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden; }}
    .score-bar {{ height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 10px; }}
    .score-value {{ font-weight: bold; text-align: center; }}
    .score-weight {{ font-size: 12px; color: #888; text-align: center; }}
    .recommendation {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; }}
    .recommendation h2 {{ color: #fff; border-left-color: #fff; }}
    .insights {{ display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px; }}
    .insight-tag {{ padding: 6px 12px; background: rgba(255,255,255,0.2); border-radius: 20px; font-size: 13px; }}
    .alliance-graph {{ margin: 20px 0; text-align: center; }}
    .graph-container {{ position: relative; width: 300px; height: 200px; margin: 0 auto; background: #f8f9fa; border-radius: 12px; }}
    .graph-node {{ position: absolute; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 16px; transform: translate(-50%, -50%); }}
    .graph-legend {{ margin-top: 10px; font-size: 12px; color: #888; display: flex; gap: 20px; justify-content: center; }}
    .final-recommendation {{ text-align: center; padding: 30px; }}
    .action-badge {{ display: inline-block; padding: 12px 30px; border-radius: 30px; font-size: 18px; font-weight: bold; color: #fff; background: {score_color}; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎩 六顶思考帽决策分析</h1>
        <p class="meta">生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')} | 3轮深度分析</p>

        <div class="card question-box">
            <h2>决策问题</h2>
            <p>{analysis.question}</p>
            {f'<p style="font-size:14px;opacity:0.9;margin-top:10px">背景: {analysis.context}</p>' if analysis.context else ''}
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="summary-score">{final_score:.0f}</div>
                <div class="summary-label">综合评分</div>
            </div>
            <div class="summary-card">
                <div class="summary-action">{score_label}</div>
                <div class="summary-label">决策建议</div>
            </div>
        </div>

        {render_alliance_graph(analysis.rounds)}

        <div class="card">
            <h2>三轮辩论过程</h2>
            {render_debate_rounds(analysis)}
        </div>

        <div class="card">
            <h2>评分矩阵</h2>
            {render_score_matrix(scores, breakdown)}
        </div>

        <div class="card recommendation">
            <h2>💡 最终建议</h2>
            <div class="final-recommendation">
                <div class="action-badge">{recommendation['action']}</div>
                <p style="margin-top:15px;font-size:14px;opacity:0.9">置信度: {recommendation['confidence']}</p>
                <p style="margin-top:10px">{recommendation['summary']}</p>
            </div>
            <div class="insights">
                {''.join(f'<span class="insight-tag">{i}</span>' for i in analysis.key_insights)}
            </div>
        </div>
    </div>
</body>
</html>"""

    Path(output_path).write_text(html)

def main():
    if len(sys.argv) < 2:
        print("请提供决策问题")
        print("示例: python main.py \"是否应该跳槽\" -c \"当前薪资...\" -o analysis.html")
        return

    question = sys.argv[1]
    context = ""
    output_file = "decision-analysis.html"

    for i, arg in enumerate(sys.argv[2:], 2):
        if arg == "-c" and i + 1 < len(sys.argv):
            context = sys.argv[i + 1]
        elif arg == "-o" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
        elif arg == "--sample":
            question = "是否应该从大厂跳槽到创业公司"
            context = "当前薪资50万，创业公司给30万+股权，工作强度可能增加50%，但成长空间更大"
            Path("sample-question.txt").write_text(question)
            analysis = run_three_round_debate(question, context)
            generate_html_report(analysis, "sample-decision-analysis.html")
            print(f"示例报告: sample-decision-analysis.html")
            return

    if not question.strip():
        print("决策问题不能为空")
        return

    # 运行三轮辩论
    analysis = run_three_round_debate(question, context)

    # 生成报告
    generate_html_report(analysis, output_file)
    print(f"报告已生成: {output_file}")

if __name__ == "__main__":
    main()
