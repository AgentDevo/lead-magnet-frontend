#!/usr/bin/env python3
"""
Modify an image-based PDF by extracting the image, editing it, and creating a new PDF
"""

import pikepdf
from PIL import Image, ImageDraw, ImageFont
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
import numpy as np
import cv2

def extract_image_from_pdf(pdf_path):
    """Extract the image from the PDF"""
    pdf = pikepdf.open(pdf_path)
    page = pdf.pages[0]
    
    # Find the image in resources
    if '/Resources' in page and '/XObject' in page['/Resources']:
        xobjects = page['/Resources']['/XObject']
        
        for name, xobj in xobjects.items():
            if xobj.get('/Subtype') == '/Image':
                # Extract image
                pil_image = None
                
                try:
                    # Try direct extraction with pikepdf
                    pil_image = xobj.as_pil_image()
                except Exception as e:
                    print(f"Could not extract image directly: {e}")
                    
                    # Alternative: extract raw data
                    width = int(xobj['/Width'])
                    height = int(xobj['/Height'])
                    
                    if '/ColorSpace' in xobj:
                        colorspace = xobj['/ColorSpace']
                        print(f"ColorSpace: {colorspace}")
                    
                    # Get the stream data
                    stream_data = xobj.get_filtered_stream_data()
                    
                    # Try to create PIL image from raw data
                    # Assuming RGB for now
                    try:
                        if len(stream_data) == width * height * 3:
                            # RGB image
                            pil_image = Image.frombytes('RGB', (width, height), stream_data)
                        elif len(stream_data) == width * height:
                            # Grayscale
                            pil_image = Image.frombytes('L', (width, height), stream_data)
                        else:
                            print(f"Unexpected data size: {len(stream_data)} for {width}x{height}")
                    except Exception as e2:
                        print(f"Could not create image from raw data: {e2}")
                
                pdf.close()
                return pil_image
    
    pdf.close()
    return None

def find_and_replace_text_in_image(image, replacements):
    """
    Find and replace text in image using template matching
    Since we don't have OCR, we'll use a different approach:
    We'll manually specify regions to white out and add new text
    """
    
    # Convert PIL to numpy array for OpenCV
    img_array = np.array(image)
    
    # If grayscale, convert to RGB for editing
    if len(img_array.shape) == 2:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
    
    # Convert back to PIL for text drawing
    img_pil = Image.fromarray(img_array)
    draw = ImageDraw.Draw(img_pil)
    
    # Try to find a suitable font
    font_size = 12
    try:
        # Try common font paths
        font_paths = [
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "Arial.ttf"
        ]
        font = None
        for path in font_paths:
            try:
                font = ImageFont.truetype(path, font_size)
                print(f"Using font: {path}")
                break
            except:
                continue
        
        if not font:
            font = ImageFont.load_default()
            print("Using default font")
    except:
        font = ImageFont.load_default()
    
    # Manual positions based on typical invoice layout
    # These are approximate and may need adjustment
    # Format: (old_text, new_text, x, y, width, height)
    modifications = [
        # Invoice number (usually top right)
        {
            "old": "RXNIRD06-0002",
            "new": "RXNIRD06-0007",
            "x": 850, "y": 250, "w": 150, "h": 25
        },
        # Date of issue (first occurrence)
        {
            "old": "September 21, 2025",
            "new": "January 21, 2026",
            "x": 850, "y": 320, "w": 180, "h": 25
        },
        # Date due (second occurrence)
        {
            "old": "September 21, 2025",
            "new": "January 21, 2026",
            "x": 850, "y": 380, "w": 180, "h": 25
        },
        # Due amount text
        {
            "old": "€56.18 due September 21, 2025",
            "new": "€56.18 due January 21, 2026",
            "x": 100, "y": 600, "w": 300, "h": 25
        },
        # Period in line item
        {
            "old": "Sep 21 - Oct 21, 2025",
            "new": "Jan 21 - Feb 21, 2026",
            "x": 100, "y": 800, "w": 200, "h": 25
        }
    ]
    
    # Apply modifications
    for mod in modifications:
        # White rectangle to cover old text
        draw.rectangle([mod["x"], mod["y"], mod["x"] + mod["w"], mod["y"] + mod["h"]], 
                      fill="white", outline="white")
        
        # Draw new text
        draw.text((mod["x"] + 2, mod["y"] + 2), mod["new"], font=font, fill="black")
        
        print(f"Replaced '{mod['old']}' with '{mod['new']}' at ({mod['x']}, {mod['y']})")
    
    return img_pil

def create_pdf_from_image(image, output_path):
    """Create a PDF from the modified image"""
    # Save image to bytes buffer
    img_buffer = io.BytesIO()
    image.save(img_buffer, format='PNG')
    img_buffer.seek(0)
    
    # Create PDF with ReportLab
    c = canvas.Canvas(output_path, pagesize=A4)
    
    # Get A4 dimensions
    a4_width, a4_height = A4
    
    # Get image dimensions
    img_width, img_height = image.size
    
    # Calculate scaling to fit A4
    scale_x = a4_width / img_width
    scale_y = a4_height / img_height
    scale = min(scale_x, scale_y)
    
    # Calculate centered position
    scaled_width = img_width * scale
    scaled_height = img_height * scale
    x = (a4_width - scaled_width) / 2
    y = (a4_height - scaled_height) / 2
    
    # Draw image
    c.drawImage(ImageReader(img_buffer), x, y, width=scaled_width, height=scaled_height)
    
    # Save PDF
    c.save()
    print(f"Created PDF: {output_path}")

def main():
    input_pdf = "/home/svalbuena/.openclaw/workspace/LF_2025_09_0015.pdf"
    output_pdf = "/home/svalbuena/.openclaw/workspace/RXNIRD06-0007_invoice.pdf"
    
    print("Extracting image from PDF...")
    image = extract_image_from_pdf(input_pdf)
    
    if image:
        print(f"Extracted image: {image.size[0]}x{image.size[1]} pixels")
        
        # Save original for debugging
        image.save("/home/svalbuena/.openclaw/workspace/original_image.png")
        print("Saved original image as original_image.png")
        
        print("\nModifying image...")
        replacements = {
            "RXNIRD06-0002": "RXNIRD06-0007",
            "September 21, 2025": "January 21, 2026",
            "€56.18 due September 21, 2025": "€56.18 due January 21, 2026",
            "Sep 21 - Oct 21, 2025": "Jan 21 - Feb 21, 2026"
        }
        
        modified_image = find_and_replace_text_in_image(image, replacements)
        
        # Save modified for debugging
        modified_image.save("/home/svalbuena/.openclaw/workspace/modified_image.png")
        print("Saved modified image as modified_image.png")
        
        print("\nCreating new PDF...")
        create_pdf_from_image(modified_image, output_pdf)
        
        print(f"\n✓ Successfully created: {output_pdf}")
        print("\nNote: Since the original PDF was image-based, text positions are approximate.")
        print("Please check the output and let me know if any positions need adjustment.")
    else:
        print("✗ Failed to extract image from PDF")

if __name__ == "__main__":
    main()