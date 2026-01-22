#!/usr/bin/env python3
"""
Self-Awareness Analyzer - Main Entry
Usage: python main.py -i <file|dir> [-i <file>...] [-o output.html]
"""
import sys
import json
from pathlib import Path
from datetime import datetime
from analyzer import analyze_text, analyze_dimensions, read_files

SKILL_DIR = Path(__file__).parent.parent
TEMPLATE_DIR = SKILL_DIR / "assets" / "templates"

def generate_html_report(files: Dict[str, str], output_path: str):
    """生成HTML可视化报告"""

    # 聚合所有文本
    all_text = "\n".join(files.values())

    # 分析偏差
    bias_results = analyze_text(all_text)
    dimensions = analyze_dimensions(all_text)

    # 准备饼图数据
    pie_data = []
    for key, result in bias_results.items():
        pie_data.append(f'["{result.bias_type}", {result.count}]')

    # 准备雷达图数据
    radar_labels = [d.dimension for d in dimensions]
    radar_scores = [d.self_score for d in dimensions]
    radar_confidence = [d.confidence for d in dimensions]

    # 生成偏差详情HTML
    bias_details = ""
    for key, result in bias_results.items():
        severity_color = {"high": "#ff4444", "medium": "#ffaa00", "low": "#44aa44"}[result.severity]
        bias_details += f"""
        <div class="bias-item">
            <div class="bias-header">
                <span class="bias-name">{result.bias_type}</span>
                <span class="bias-count">{result.count}处</span>
                <span class="bias-severity" style="background:{severity_color}">{result.severity}</span>
            </div>
        </div>"""

    # 维度详情HTML
    dim_details = ""
    for d in dimensions:
        bar_width = d.self_score * 10
        conf_width = d.confidence * 10
        dim_details += f"""
        <div class="dim-item">
            <div class="dim-name">{d.dimension}</div>
            <div class="dim-bar-container">
                <div class="dim-bar dim-score" style="width:{bar_width}%"></div>
                <span class="dim-value">{d.self_score}/10</span>
            </div>
            <div class="dim-bar-container">
                <div class="dim-bar dim-conf" style="width:{conf_width}%"></div>
                <span class="dim-value">{d.confidence}/10</span>
            </div>
        </div>"""

    # CSS图表（不用外部库）
    pie_css = ""
    radar_css = ""

    # 生成CSS饼图
    if pie_data:
        colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
        total = sum(r.count for r in bias_results.values())
        current_angle = 0
        pie_slices = ""

        for i, (key, result) in enumerate(bias_results.items()):
            percentage = result.count / total * 100
            angle = percentage * 3.6
            pie_slices += f"""
            .pie-slice-{i} {{ transform: rotate({current_angle}deg); background: {colors[i % len(colors)]}; }}
            .pie-slice-{i}::after {{ transform: rotate({angle}deg); content: ''; display: block; width: 100%; height: 100%; }}
"""
            current_angle += angle

        pie_legend = "".join([f'<div class="legend-item"><span class="legend-color" style="background:{colors[i % len(colors)]}"></span>{r.bias_type}</div>' for i, r in enumerate(bias_results.values())])

        pie_css = f"""
        <style>
        .pie-container {{ width: 200px; height: 200px; border-radius: 50%; background: conic-gradient({', '.join([f'{colors[i % len(colors)]} 0deg {r.count/total*360:.1f}deg' for i, r in enumerate(bias_results.values())])}); margin: 0 auto; }}
        .pie-legend {{ display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 15px; }}
        .legend-item {{ display: flex; align-items: center; gap: 5px; font-size: 12px; }}
        .legend-color {{ width: 12px; height: 12px; border-radius: 3px; }}
        </style>
        <div class="pie-chart">
            <div class="pie-container"></div>
            <div class="pie-legend">{pie_legend}</div>
        </div>"""

    # 生成CSS雷达图（简化版：使用条形图模拟）
    radar_css = ""
    if radar_labels:
        radar_items = "".join([f'''
        <div class="radar-item">
            <div class="radar-label">{radar_labels[i]}</div>
            <div class="radar-bar-wrap">
                <div class="radar-bar" style="width:{radar_scores[i]*10}%"></div>
            </div>
            <div class="radar-value">{radar_scores[i]}</div>
        </div>''' for i in range(len(radar_labels))])

        radar_css = f"""
        <style>
        .radar-item {{ display: flex; align-items: center; gap: 10px; margin: 8px 0; }}
        .radar-label {{ width: 80px; font-size: 12px; text-align: right; }}
        .radar-bar-wrap {{ flex: 1; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden; }}
        .radar-bar {{ height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 10px; }}
        .radar-value {{ width: 30px; font-size: 12px; }}
        </style>
        <div class="radar-chart">{radar_items}</div>"""

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>认知偏差分析报告</title>
    <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; padding: 20px; line-height: 1.6; }}
    .container {{ max-width: 900px; margin: 0 auto; }}
    h1 {{ text-align: center; color: #333; margin-bottom: 10px; }}
    .meta {{ text-align: center; color: #888; font-size: 14px; margin-bottom: 30px; }}
    .card {{ background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
    .card h2 {{ color: #444; font-size: 18px; margin-bottom: 16px; border-left: 4px solid #667eea; padding-left: 12px; }}
    .bias-item {{ padding: 12px; background: #f8f9fa; border-radius: 8px; margin: 8px 0; }}
    .bias-header {{ display: flex; align-items: center; gap: 12px; }}
    .bias-name {{ font-weight: 600; color: #333; flex: 1; }}
    .bias-count {{ color: #888; font-size: 14px; }}
    .bias-severity {{ padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #fff; text-transform: uppercase; }}
    .dim-item {{ margin: 12px 0; }}
    .dim-name {{ font-size: 14px; color: #555; margin-bottom: 6px; }}
    .dim-bar-container {{ display: flex; align-items: center; gap: 10px; }}
    .dim-bar {{ height: 16px; border-radius: 8px; position: relative; }}
    .dim-score {{ background: linear-gradient(90deg, #4facfe, #00f2fe); }}
    .dim-conf {{ background: linear-gradient(90deg, #fa709a, #fee140); height: 10px; }}
    .dim-value {{ font-size: 12px; color: #888; width: 40px; }}
    .chart-section {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
    @media (max-width: 600px) {{ .chart-section {{ grid-template-columns: 1fr; }} }}
    .summary {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; }}
    .summary h2 {{ color: #fff; border-left-color: #fff; }}
    .summary p {{ font-size: 14px; opacity: 0.9; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>认知偏差分析报告</h1>
        <p class="meta">生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')} | 分析文件数: {len(files)}</p>

        <div class="card summary">
            <h2>分析摘要</h2>
            <p>检测到 {len(bias_results)} 种认知偏差模式，共 {sum(r.count for r in bias_results.values())} 处。</p>
        </div>

        <div class="chart-section">
            <div class="card">
                <h2>偏差类型分布</h2>
                {pie_css}
            </div>
            <div class="card">
                <h2>能力自评雷达</h2>
                <p style="font-size:12px;color:#888;margin-bottom:10px;">蓝色=自评分 | 黄色=自信度</p>
                {radar_css}
            </div>
        </div>

        <div class="card">
            <h2>偏差详情</h2>
            {bias_details if bias_details else '<p style="color:#888">未检测到明显偏差模式</p>'}
        </div>

        <div class="card">
            <h2>维度分析</h2>
            {dim_details if dim_details else '<p style="color:#888">未识别到能力维度关键词</p>'}
        </div>

        <div class="card">
            <h2>改进建议</h2>
            <ul style="padding-left: 20px; color: #555;">
                <li>对于检测到的偏差，尝试从第三方视角审视自己的评价</li>
                <li>使用具体案例而非笼统描述来支持自评</li>
                <li>定期回顾自评，记录变化趋势</li>
            </ul>
        </div>
    </div>
</body>
</html>"""

    Path(output_path).write_text(html)

def main():
    input_files = []
    output_file = "cognitive-bias-report.html"

    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == "-i" and i + 1 < len(sys.argv):
            input_files.append(sys.argv[i + 1])
        elif sys.argv[i] == "-o" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
        elif sys.argv[i] == "--sample":
            # 生成示例报告
            sample_files = {
                "季度自评.md": "我觉得自己的沟通能力非常强，在团队中总是能够很好地表达想法，技术能力方面我很有信心，肯定能解决任何问题。",
                "年度总结.md": "可能我的领导力还有不足，不太确定是否能带领团队完成目标，只是运气好才拿到这个项目。"
            }
            for name, content in sample_files.items():
                Path(name).write_text(content)
            generate_html_report(sample_files, "sample-report.html")
            print(f"示例报告: sample-report.html")
            return
        i += 1

    if not input_files:
        print("请指定输入文件或目录: -i <file|dir>")
        print("示例: python main.py -i ./assessments/ -o report.html")
        return

    # 读取所有文件
    all_files = {}
    for input_path in input_files:
        files = read_files(input_path)
        all_files.update(files)

    if not all_files:
        print("未找到可读的文件")
        return

    # 生成报告
    generate_html_report(all_files, output_file)
    print(f"报告已生成: {output_file}")

if __name__ == "__main__":
    main()
