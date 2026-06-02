#!/home/svalbuena/.openclaw/workspace/pdf_env/bin/python3
import os
import sys
from pathlib import Path

# Import packages
try:
    from pdf2image import convert_from_path
    from PIL import Image
    import pytesseract
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.utils import ImageReader
    import PyPDF2
except ImportError as e:
    print(f"Error importing: {e}")
    sys.exit(1)

def process_invoice():
    input_pdf = "LF_2025_09_0015.pdf"
    output_pdf = "RXNIRD06-0007_invoice.pdf"
    
    print("Step 1: Checking if PDF is text-based or scanned...")
    
    # First check if PDF has extractable text
    with open(input_pdf, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text_content = ""
        for page in reader.pages:
            text_content += page.extract_text()
        
        if text_content.strip():
            print("PDF contains extractable text!")
            print(f"Text preview: {text_content[:200]}...")
            
            # Make replacements
            print("\nStep 2: Making text replacements...")
            modified_text = text_content
            replacements = [
                ("RXNIRD06-0002", "RXNIRD06-0007"),
                ("September 21, 2025", "January 21, 2026"),
                ("€56.18 due September 21, 2025", "€56.18 due January 21, 2026"),
                ("Sep 21 - Oct 21, 2025", "Jan 21 - Feb 21, 2026")
            ]
            
            for old, new in replacements:
                if old in modified_text:
                    modified_text = modified_text.replace(old, new)
                    print(f"✓ Replaced: '{old}' → '{new}'")
                else:
                    print(f"✗ Not found: '{old}'")
            
            # Save the extracted and modified text
            with open("original_text.txt", "w") as f:
                f.write(text_content)
            with open("modified_text.txt", "w") as f:
                f.write(modified_text)
            
            print("\nOriginal and modified text saved to text files.")
            print("Note: Direct PDF text replacement while preserving formatting requires advanced PDF manipulation.")
            
        else:
            print("No extractable text found - this is a scanned PDF")
            print("Attempting to convert to image and OCR...")
            
            # Try to use pdf2image without poppler
            try:
                # First save as image using alternative method
                print("Note: pdf2image requires poppler-utils to be installed on the system.")
                print("Without it, we cannot convert PDF pages to images for OCR.")
            except Exception as e:
                print(f"Error: {e}")
    
    print("\nSummary:")
    print("- Input PDF examined: LF_2025_09_0015.pdf")
    print("- Text extraction attempted")
    print("- Replacements defined but full PDF reconstruction requires system tools")

if __name__ == "__main__":
    process_invoice()