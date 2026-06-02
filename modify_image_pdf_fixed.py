#!/usr/bin/env python3
"""
Extract and modify image-based PDF
"""

import pikepdf
from PIL import Image, ImageDraw, ImageFont
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
import numpy as np

def extract_image_from_pdf(pdf_path):
    """Extract the image from the PDF using pikepdf"""
    pdf = pikepdf.open(pdf_path)
    page = pdf.pages[0]
    
    # Get images from page
    images = []
    for image_obj in page.images.values():
        try:
            # Extract image using pikepdf's method
            pil_image = image_obj.extract_to(stream=None)
            images.append(pil_image)
            print(f"Extracted image: {pil_image.size}")
        except Exception as e:
            print(f"Error extracting image: {e}")
    
    pdf.close()
    
    if images:
        return images[0]  # Return first image
    return None

def modify_image_with_text(image):
    """Modify the image by overlaying new text on white rectangles"""
    
    # Convert to RGB if needed
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Create drawing context
    draw = ImageDraw.Draw(image)
    
    # Try to load a good font
    font_size = 14
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    # Since we can't OCR to find exact positions, I'll first save the image
    # so we can see it and estimate positions
    temp_path = "/home/svalbuena/.openclaw/workspace/temp_original.png"
    image.save(temp_path)
    print(f"Saved original image to {temp_path} for position reference")
    
    # These positions are estimates based on typical invoice layout
    # Adjustments may be needed based on the actual image
    
    # Define modifications with approximate positions
    # Format: (new_text, x, y, width, height)
    modifications = [
        # Invoice number (top right area)
        ("RXNIRD06-0007", 900, 180, 140, 20),
        
        # Date replacements (two occurrences)
        ("January 21, 2026", 900, 240, 150, 20),  # Date of issue
        ("January 21, 2026", 900, 290, 150, 20),  # Date due
        
        # Amount due text (middle area)
        ("€56.18 due January 21, 2026", 150, 500, 250, 20),
        
        # Period text (in line items)
        ("Jan 21 - Feb 21, 2026", 150, 680, 180, 20)
    ]
    
    # Apply each modification
    for new_text, x, y, w, h in modifications:
        # Draw white rectangle to cover old text
        draw.rectangle([x, y, x + w, y + h], fill="white", outline="white")
        
        # Draw new text
        draw.text((x + 2, y + 2), new_text, font=font, fill="black")
        print(f"Added: '{new_text}' at position ({x}, {y})")
    
    return image

def create_pdf_from_modified_image(image, output_path):
    """Create a new PDF from the modified image"""
    
    # Create a new PDF with ReportLab
    c = canvas.Canvas(output_path, pagesize=A4)
    
    # Get page dimensions
    page_width, page_height = A4
    
    # Get image dimensions
    img_width, img_height = image.size
    
    # Calculate scaling to fit page
    scale = min(page_width / img_width, page_height / img_height) * 0.95  # 95% to add margins
    
    # Calculate position to center image
    scaled_width = img_width * scale
    scaled_height = img_height * scale
    x = (page_width - scaled_width) / 2
    y = (page_height - scaled_height) / 2
    
    # Convert PIL image to format suitable for ReportLab
    img_buffer = io.BytesIO()
    image.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    # Draw the image
    c.drawImage(ImageReader(img_buffer), x, y, width=scaled_width, height=scaled_height)
    
    # Save the PDF
    c.save()
    print(f"Created PDF: {output_path}")

def main():
    input_pdf = "/home/svalbuena/.openclaw/workspace/LF_2025_09_0015.pdf"
    output_pdf = "/home/svalbuena/.openclaw/workspace/RXNIRD06-0007_invoice.pdf"
    
    print("Step 1: Extracting image from PDF...")
    image = extract_image_from_pdf(input_pdf)
    
    if not image:
        print("Failed to extract image from PDF")
        return
    
    print(f"\nStep 2: Image extracted successfully ({image.size[0]}x{image.size[1]} pixels)")
    
    print("\nStep 3: Modifying image with text replacements...")
    modified_image = modify_image_with_text(image)
    
    # Save modified image for inspection
    modified_image.save("/home/svalbuena/.openclaw/workspace/modified_preview.png")
    print("Saved modified image preview to modified_preview.png")
    
    print("\nStep 4: Creating new PDF from modified image...")
    create_pdf_from_modified_image(modified_image, output_pdf)
    
    print(f"\n✅ COMPLETED: Modified PDF saved as {output_pdf}")
    print("\nIMPORTANT NOTES:")
    print("1. The original PDF was image-based (scanned), not text-based")
    print("2. Text positions are estimates - please check the output")
    print("3. If positions need adjustment, I can modify them")
    print("\nText replacements applied:")
    print("  • RXNIRD06-0002 → RXNIRD06-0007")
    print("  • September 21, 2025 → January 21, 2026")
    print("  • €56.18 due September 21, 2025 → €56.18 due January 21, 2026")
    print("  • Sep 21 - Oct 21, 2025 → Jan 21 - Feb 21, 2026")

if __name__ == "__main__":
    main()