"""PDF 处理模块"""
import os
import fitz  # PyMuPDF


def pdf_to_images(pdf_path, output_folder):
    """步骤 1: 将 PDF 转换为多张图片"""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    doc = fitz.open(pdf_path)
    image_paths = []

    print(f"📄 [1/5] 正在解析 PDF: {os.path.basename(pdf_path)} (共 {len(doc)} 页)...")

    for page_num, page in enumerate(doc):
        # 提高分辨率 (zoom=2 表示 2 倍清晰度，利于 AI 识别文字)
        mat = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=mat)

        image_filename = os.path.join(output_folder, f"page_{page_num + 1}.png")
        pix.save(image_filename)
        image_paths.append(image_filename)
        print(f"    -> 已提取第 {page_num + 1} 页")

    return image_paths
