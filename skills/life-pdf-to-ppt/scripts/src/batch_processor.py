"""批处理协调模块"""
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from .pdf_processor import pdf_to_images
from .ai_vectorizer import convert_image_to_svg
from .svg_processor import clean_and_save_svg, convert_svg_to_emf
from .ppt_generator import generate_ppt
from .config import MAX_WORKERS


def process_single_page(img_path, page_num, svg_folder):
    """并发处理单个页面：图片 -> AI -> SVG"""
    try:
        # 调用 AI
        raw_svg = convert_image_to_svg(img_path, page_num)

        if raw_svg:
            # 保存 SVG
            svg_path = clean_and_save_svg(raw_svg, page_num, svg_folder)
            return (page_num, svg_path)
        else:
            print(f"    ⚠️ 跳过第 {page_num} 页 (AI 返回为空)")
            return (page_num, None)
    except Exception as e:
        print(f"    ❌ 第 {page_num} 页处理异常: {e}")
        return (page_num, None)


def process_single_pdf(pdf_path, output_dir):
    """处理单个 PDF 文件的完整流程"""
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]

    # 创建临时文件夹结构：temp/{pdf_name}/
    temp_base = os.path.join("temp", pdf_name)
    temp_images = os.path.join(temp_base, "images")
    temp_svgs = os.path.join(temp_base, "svgs")
    temp_emf = os.path.join(temp_base, "emf")

    # 输出 PPT 路径
    output_ppt = os.path.join(output_dir, f"{pdf_name}_Editable.pptx")

    print(f"\n{'=' * 60}")
    print(f"📄 正在处理: {os.path.basename(pdf_path)}")
    print(f"{'=' * 60}")

    start_time = time.time()

    # 1. PDF 转图片
    image_paths = pdf_to_images(pdf_path, temp_images)

    svg_file_paths = [None] * len(image_paths)  # 初始化结果列表
    emf_file_paths = []

    # 2. 并发处理：图片 -> AI -> SVG
    print(f"\n🤖 [2/5] 正在 AI 矢量化处理 (并发数: {MAX_WORKERS})...")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # 提交所有任务
        futures = {
            executor.submit(process_single_page, img_path, i + 1, temp_svgs): i
            for i, img_path in enumerate(image_paths)
        }

        # 收集完成的结果
        completed = 0
        total = len(image_paths)

        for future in as_completed(futures):
            page_num, svg_path = future.result()
            svg_file_paths[page_num - 1] = svg_path  # 保持页面顺序

            completed += 1
            print(f"    -> 进度: {completed}/{total} 页完成")

    print(
        f"    ✅ AI 矢量化处理完成！成功: {sum(1 for x in svg_file_paths if x)} / {total}"
    )

    # 3. SVG 转 EMF
    print(f"\n🔄 [3/5] 正在将 SVG 转换为 EMF (使用 Inkscape)...")
    for i, svg_path in enumerate(svg_file_paths):
        page_num = i + 1
        if svg_path:
            emf_path = convert_svg_to_emf(svg_path, temp_emf)
            if emf_path:
                print(f"    -> ✅ 第 {page_num} 页 EMF 已生成")
                emf_file_paths.append(emf_path)
            else:
                print(f"    ⚠️ 第 {page_num} 页 EMF 转换失败")
                emf_file_paths.append(None)
        else:
            emf_file_paths.append(None)

    # 4. 生成 PPT
    if any(emf_file_paths):
        count = generate_ppt(emf_file_paths, output_ppt)

        # 5. 输出报告
        duration = time.time() - start_time
        print(f"\n✅ [5/5] 处理完成！")
        print(f"   - 总耗时: {duration:.2f} 秒 ({duration/60:.1f} 分钟)")
        print(f"   - 输入页数: {len(image_paths)}")
        print(f"   - 成功转换: {count}")
        print(f"   - 输出文件: {output_ppt}")

        return True
    else:
        print(f"❌ 未生成任何有效的 EMF，{pdf_name} 处理失败。")
        return False
