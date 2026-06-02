#!/usr/bin/env python3
import subprocess
import os
import sys
from pathlib import Path

def check_and_install_packages():
    """Check and install required Python packages"""
    required_packages = ['pdf2image', 'pytesseract', 'reportlab', 'Pillow', 'PyPDF2']
    
    for package in required_packages:
        try:
            __import__(package.lower().replace('-', '_'))
            print(f"{package} is already installed")
        except ImportError:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", package])

def main():
    # Check dependencies
    check_and_install_packages()
    
    # Import after installing
    from pdf2image import convert_from_path
    import pytesseract
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib.utils import ImageReader
    from PIL import Image
    import PyPDF2
    
    input_pdf = "LF_2025_09_0015.pdf"
    output_pdf = "RXNIRD06-0007_invoice.pdf"
    
    print("Step 1: Converting PDF to images...")
    try:
        # Try to convert PDF to images
        images = convert_from_path(input_pdf, dpi=300)
        print(f"Extracted {len(images)} page(s)")
        
        # Save the first page as image for processing
        if images:
            images[0].save("invoice_page.png", "PNG")
            print("Saved page as invoice_page.png")
    except Exception as e:
        print(f"Error converting PDF: {e}")
        print("Trying alternative method with PyPDF2...")
        
        # If pdf2image fails, try to extract text directly
        with open(input_pdf, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            print(f"Extracted text (first 500 chars): {text[:500]}")
            
            if not text.strip():
                print("No text found - this appears to be a scanned PDF")
                # We need actual image extraction tools
                return
    
    # Step 2: Run OCR
    print("\nStep 2: Running OCR...")
    try:
        # Check if we have an image to OCR
        if os.path.exists("invoice_page.png"):
            ocr_text = pytesseract.image_to_string(Image.open("invoice_page.png"))
            print(f"OCR completed. Text length: {len(ocr_text)}")
            
            # Save OCR text for inspection
            with open("ocr_output.txt", "w") as f:
                f.write(ocr_text)
            print("Saved OCR output to ocr_output.txt")
            
            # Step 3: Make text replacements
            print("\nStep 3: Making text replacements...")
            modified_text = ocr_text
            replacements = [
                ("RXNIRD06-0002", "RXNIRD06-0007"),
                ("September 21, 2025", "January 21, 2026"),
                ("€56.18 due September 21, 2025", "€56.18 due January 21, 2026"),
                ("Sep 21 - Oct 21, 2025", "Jan 21 - Feb 21, 2026")
            ]
            
            for old, new in replacements:
                if old in modified_text:
                    modified_text = modified_text.replace(old, new)
                    print(f"Replaced: '{old}' → '{new}'")
                else:
                    print(f"Warning: '{old}' not found in text")
            
            # Save modified text
            with open("modified_text.txt", "w") as f:
                f.write(modified_text)
            print("Saved modified text to modified_text.txt")
            
            print("\nFor now, the modified text has been saved. A full PDF rebuild would require:")
            print("1. OCR with position data (using tesseract's hOCR output)")
            print("2. Recreating the layout with reportlab or similar")
            print("3. Preserving fonts, colors, and exact positioning")
            
    except Exception as e:
        print(f"Error during OCR: {e}")
        print("Tesseract might not be installed on the system")

if __name__ == "__main__":
    main()