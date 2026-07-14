import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os
from typing import List, Optional
from app.core.config import settings

class OCRService:
    def __init__(self, tesseract_cmd: Optional[str] = None):
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        elif settings.tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = settings.tesseract_path

    async def extract_text_from_image(self, image_path: str, lang: str = "por") -> str:
        """
        Extracts text from a single image file.
        """
        print(f"Extracting text from image: {image_path}")
        try:
            text = pytesseract.image_to_string(Image.open(image_path), lang=lang)
            return text
        except Exception as e:
            print(f"OCR Error in image {image_path}: {e}")
            return ""

class PDFProcessor:
    def __init__(self, ocr_service: OCRService):
        self.ocr_service = ocr_service

    async def process_pdf(self, pdf_path: str, output_dir: str, lang: str = "por") -> str:
        """
        Converts PDF to images and extracts text from all pages.
        """
        print(f"Processing PDF for OCR: {pdf_path}")
        os.makedirs(output_dir, exist_ok=True)
        
        full_text = []
        try:
            # Convert PDF to list of PIL Images
            # Note: poppler must be installed and in PATH for this to work on Windows
            pages = convert_from_path(pdf_path, dpi=300)
            
            for i, page in enumerate(pages):
                image_filename = f"page_{i+1}.jpg"
                image_path = os.path.join(output_dir, image_filename)
                
                # Save page as image
                page.save(image_path, "JPEG")
                
                # Extract text
                text = await self.ocr_service.extract_text_from_image(image_path, lang=lang)
                full_text.append(f"--- PAGE {i+1} ---\n{text}")
                
            combined_text = "\n\n".join(full_text)
            
            # Save extracted text to file
            text_output_path = os.path.join(output_dir, "extracted_text.txt")
            with open(text_output_path, "w", encoding="utf-8") as f:
                f.write(combined_text)
                
            return combined_text
        except Exception as e:
            print(f"PDF OCR Error in {pdf_path}: {e}")
            return ""
