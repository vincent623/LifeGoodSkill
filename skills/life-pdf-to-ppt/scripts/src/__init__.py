"""src 包初始化"""
from .config import API_KEY, MODEL_NAME, MAX_WORKERS
from .pdf_processor import pdf_to_images
from .ai_vectorizer import convert_image_to_svg
from .svg_processor import clean_and_save_svg, convert_svg_to_emf
from .ppt_generator import generate_ppt
from .batch_processor import process_single_pdf

__all__ = [
    "API_KEY",
    "MODEL_NAME",
    "MAX_WORKERS",
    "pdf_to_images",
    "convert_image_to_svg",
    "clean_and_save_svg",
    "convert_svg_to_emf",
    "generate_ppt",
    "process_single_pdf",
]
