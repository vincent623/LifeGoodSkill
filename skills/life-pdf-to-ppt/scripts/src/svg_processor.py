"""SVG 处理模块"""
import os
import re
import subprocess


def clean_and_save_svg(raw_text, page_num, output_folder):
    """步骤 3: 清洗代码并保存 SVG"""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # 清洗 Markdown 标记
    clean_text = re.sub(r"```xml|```svg|```", "", raw_text).strip()

    # 确保提取 <svg> 标签内容
    match = re.search(r"<svg.*?</svg>", clean_text, re.DOTALL)
    if match:
        svg_content = match.group(0)
    else:
        svg_content = clean_text  # 如果没找到标签，尝试直接写入，防止 AI 没写闭合标签

    filename = os.path.join(output_folder, f"page_{page_num}.svg")

    # 写入文件
    with open(filename, "w", encoding="utf-8") as f:
        f.write(svg_content)

    return filename


def convert_svg_to_emf(svg_path, output_folder):
    """步骤 4: 使用 Inkscape 将 SVG 转换为 EMF"""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # 提取文件名
    base_name = os.path.splitext(os.path.basename(svg_path))[0]
    emf_path = os.path.join(output_folder, f"{base_name}.emf")

    try:
        # Inkscape 命令行转换
        # macOS 上 Inkscape 的路径通常是 /Applications/Inkscape.app/Contents/MacOS/inkscape
        inkscape_cmd = "/Applications/Inkscape.app/Contents/MacOS/inkscape"

        # 检查 Inkscape 是否存在
        if not os.path.exists(inkscape_cmd):
            # 尝试从 PATH 中找
            result = subprocess.run(
                ["which", "inkscape"], capture_output=True, text=True
            )
            if result.returncode == 0:
                inkscape_cmd = result.stdout.strip()
            else:
                raise FileNotFoundError(
                    "Inkscape 未安装，请运行: brew install --cask inkscape"
                )

        # 转换命令
        subprocess.run(
            [
                inkscape_cmd,
                svg_path,
                "--export-type=emf",
                f"--export-filename={emf_path}",
            ],
            check=True,
            capture_output=True,
        )

        return emf_path
    except Exception as e:
        print(f"    ⚠️ SVG 转 EMF 失败: {e}")
        return None
