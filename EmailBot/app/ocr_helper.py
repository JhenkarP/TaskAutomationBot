# TaskAutomationBots/EmailBot/app/ocr_helper.py
import pytesseract
from PIL import Image
import io
from app.logger_setup import get_logger

logger = get_logger("ocr_helper")

def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Takes image bytes, converts to PIL Image, and runs Tesseract OCR.
    Returns extracted text.
    """
    try:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        if text.strip():
            logger.info("Tesseract OCR used: text extracted from image")
        else:
            logger.info("Tesseract OCR used: no text found in image")
        return text
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        return ""
