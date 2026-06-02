#!/usr/bin/env python3
"""
Since this is an image-based PDF, we need a different approach:
1. Extract the image from the PDF
2. Create a new PDF with text overlay at the correct positions
"""

import pikepdf
from PIL import Image
import io

def extract_image_from_pdf(pdf_path):
    """Extract the main image from the PDF"""
    pdf = pikepdf.open(pdf_path)
    
    # Get the first page
    page = pdf.pages[0]
    
    # Find the image XObject
    if '/Resources' in page and '/XObject' in page['/Resources']:
        xobjects = page['/Resources']['/XObject']
        
        for name, xobj in xobjects.items():
            if xobj.get('/Subtype') == '/Image':
                # This is our image
                width = int(xobj['/Width'])
                height = int(xobj['/Height'])
                
                print(f"Found image: {width}x{height}")
                
                # Get image data
                if '/Filter' in xobj:
                    filter_type = xobj['/Filter']
                    print(f"Image filter: {filter_type}")
                
                # For now, let's save the whole PDF page as is
                # We'll create an overlay approach
                
                return pdf, width, height
    
    pdf.close()
    return None, 0, 0

def create_text_overlay_pdf(replacements, output_path):
    """
    Since it's an image PDF, we'll use reportlab to create an overlay
    But first let's check what we have available
    """
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import inch, mm
        print("✓ reportlab is available")
        
        # Create an overlay PDF with white rectangles and new text
        # This requires knowing the exact positions
        
        # Standard A4 in points
        width, height = A4
        
        c = canvas.Canvas(output_path, pagesize=A4)
        
        # Based on typical invoice layout, these are approximate positions
        # We'll need to adjust based on the actual PDF
        
        # White out old text and add new text
        # This is a workaround since we can't modify the image directly
        
        replacements_positions = [
            # (old_text, new_text, x, y, width, height)
            ("RXNIRD06-0002", "RXNIRD06-0007", 400, 700, 100, 20),
            ("September 21, 2025", "January 21, 2026", 100, 650, 120, 20),
            ("September 21, 2025", "January 21, 2026", 400, 650, 120, 20),
            ("€56.18 due September 21, 2025", "€56.18 due January 21, 2026", 200, 500, 200, 20),
            ("Sep 21 - Oct 21, 2025", "Jan 21 - Feb 21, 2026", 100, 400, 150, 20),
        ]
        
        for old, new, x, y, w, h in replacements_positions:
            # White rectangle to cover old text
            c.setFillColorRGB(1, 1, 1)  # White
            c.rect(x, y, w, h, fill=1, stroke=0)
            
            # New text
            c.setFillColorRGB(0, 0, 0)  # Black
            c.drawString(x, y + 5, new)
        
        c.save()
        print(f"Created overlay PDF: {output_path}")
        
    except ImportError:
        print("✗ reportlab not available")
        return False
    
    return True

# Since this is an image-based PDF, the best approach without additional tools
# is to inform that the task requirements don't match the PDF type

print("Analysis Results:")
print("-" * 50)
print("The PDF file is IMAGE-BASED (scanned), not text-based as stated in the task.")
print("The invoice appears to be a scanned image embedded in the PDF.")
print("\nTo properly modify this PDF while preserving formatting, we would need:")
print("1. OCR tools (like Tesseract) to find text positions")
print("2. Image editing libraries to modify the image")
print("3. Or PDF annotation tools to overlay corrections")
print("\nThe current tools available (pikepdf) work with text-based PDFs,")
print("not scanned/image PDFs.")

# Try to find if we have any other tools
import subprocess
import shutil

print("\nChecking for available tools:")
tools = ["tesseract", "convert", "gs", "pdftk", "qpdf"]
for tool in tools:
    if shutil.which(tool):
        print(f"  ✓ {tool} is available")
    else:
        print(f"  ✗ {tool} not found")

# Extract basic info about the PDF
input_pdf = "/home/svalbuena/.openclaw/workspace/LF_2025_09_0015.pdf"
pdf, img_width, img_height = extract_image_from_pdf(input_pdf)