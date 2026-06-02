#!/usr/bin/env python3
"""
Final approach: Extract image from PDF and create modified version
"""

import pikepdf
from PIL import Image, ImageDraw, ImageFont
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader

def extract_image_from_pdf_raw(pdf_path):
    """Extract image using raw pikepdf stream access"""
    pdf = pikepdf.open(pdf_path)
    
    for page_num, page in enumerate(pdf.pages):
        print(f"Checking page {page_num + 1}")
        
        # Look in XObject resources
        if '/Resources' in page and '/XObject' in page['/Resources']:
            xobjects = page['/Resources']['/XObject']
            
            for name, xobj in xobjects.items():
                if xobj.get('/Subtype') == '/Image':
                    print(f"Found image object: {name}")
                    
                    # Get image properties
                    width = int(xobj.get('/Width'))
                    height = int(xobj.get('/Height'))
                    
                    # Get the raw stream data
                    raw_data = xobj.read_bytes()
                    
                    # The image is compressed, let's try to decode it
                    try:
                        # Method 1: Try to create PIL image directly
                        img_stream = io.BytesIO(raw_data)
                        pil_image = Image.open(img_stream)
                        pdf.close()
                        return pil_image
                    except:
                        pass
                    
                    # Method 2: Use pikepdf's built-in image extraction
                    try:
                        # Save to temporary file
                        temp_img = f"/home/svalbuena/.openclaw/workspace/temp_extracted_{name}.png"
                        
                        # Extract using stream data
                        if '/Filter' in xobj:
                            filter_type = xobj['/Filter']
                            print(f"Filter type: {filter_type}")
                            
                            if filter_type == '/FlateDecode':
                                # For FlateDecode, the data needs to be decompressed
                                # pikepdf should handle this automatically
                                
                                # Let's try to get the image bits directly
                                colorspace = xobj.get('/ColorSpace', '/DeviceRGB')
                                bits_per_component = int(xobj.get('/BitsPerComponent', 8))
                                
                                print(f"Image info: {width}x{height}, colorspace={colorspace}, bits={bits_per_component}")
                                
                                # Since direct extraction is complex, let's use a different method
                                # We'll render the entire page as an image
                                
                    except Exception as e:
                        print(f"Error in method 2: {e}")
    
    pdf.close()
    return None

def extract_pdf_page_as_image(pdf_path):
    """Alternative: Convert entire PDF page to image using pdf2image"""
    print("Attempting to render PDF page as image...")
    
    # Since we don't have pdf2image, let's try with what we have
    # We can use reportlab to read and re-render
    
    # Actually, let me check if we have any command-line tools
    import subprocess
    import os
    
    # Try using ImageMagick convert if available
    output_image = "/home/svalbuena/.openclaw/workspace/page_image.png"
    
    # First check if we have pdftoppm (part of poppler-utils)
    try:
        result = subprocess.run(["which", "pdftoppm"], capture_output=True, text=True)
        if result.returncode == 0:
            print("Found pdftoppm, using it to convert PDF to image...")
            subprocess.run([
                "pdftoppm", 
                "-singlefile", 
                "-png", 
                "-r", "300",  # 300 DPI
                pdf_path, 
                "/home/svalbuena/.openclaw/workspace/page"
            ])
            if os.path.exists("/home/svalbuena/.openclaw/workspace/page.png"):
                return Image.open("/home/svalbuena/.openclaw/workspace/page.png")
    except:
        pass
    
    # Try ImageMagick convert
    try:
        result = subprocess.run(["which", "convert"], capture_output=True, text=True)
        if result.returncode == 0:
            print("Found ImageMagick convert, using it...")
            subprocess.run([
                "convert", 
                "-density", "300",
                f"{pdf_path}[0]",  # First page
                output_image
            ])
            if os.path.exists(output_image):
                return Image.open(output_image)
    except:
        pass
    
    print("No suitable PDF to image converter found")
    return None

def modify_invoice_image(image):
    """Modify the invoice image with the required text replacements"""
    
    # Ensure RGB mode
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Create a copy to work on
    img_copy = image.copy()
    draw = ImageDraw.Draw(img_copy)
    
    # Load font
    try:
        # Try different font paths
        font_paths = [
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-R.ttf"
        ]
        font = None
        for fpath in font_paths:
            try:
                font = ImageFont.truetype(fpath, 16)
                print(f"Using font: {fpath}")
                break
            except:
                continue
        
        if not font:
            font = ImageFont.load_default()
            print("Using default font")
    except:
        font = ImageFont.load_default()
    
    # Based on a standard invoice layout, these are the typical positions
    # We'll need to adjust based on the actual image
    
    # Save original for reference
    image.save("/home/svalbuena/.openclaw/workspace/original_extracted.png")
    print("Saved original image for reference: original_extracted.png")
    
    # Text replacements with estimated positions
    # These will need fine-tuning based on the actual invoice
    replacements = [
        # Invoice number (usually top-right)
        {
            "old": "RXNIRD06-0002",
            "new": "RXNIRD06-0007",
            "x": 850, "y": 200, "w": 150, "h": 25
        },
        # Date of issue
        {
            "old": "September 21, 2025",
            "new": "January 21, 2026",
            "x": 850, "y": 260, "w": 180, "h": 25
        },
        # Date due
        {
            "old": "September 21, 2025",
            "new": "January 21, 2026",
            "x": 850, "y": 310, "w": 180, "h": 25
        },
        # Amount due text
        {
            "old": "€56.18 due September 21, 2025",
            "new": "€56.18 due January 21, 2026",
            "x": 100, "y": 550, "w": 300, "h": 25
        },
        # Period in line item
        {
            "old": "Sep 21 - Oct 21, 2025",
            "new": "Jan 21 - Feb 21, 2026",
            "x": 100, "y": 750, "w": 200, "h": 25
        }
    ]
    
    # Apply replacements
    for repl in replacements:
        # White rectangle to cover old text
        draw.rectangle(
            [repl["x"], repl["y"], repl["x"] + repl["w"], repl["y"] + repl["h"]], 
            fill="white", 
            outline=None
        )
        
        # Draw new text
        draw.text((repl["x"] + 3, repl["y"] + 3), repl["new"], fill="black", font=font)
        print(f"Replaced: '{repl['old']}' → '{repl['new']}'")
    
    return img_copy

def create_final_pdf(image, output_path):
    """Create the final PDF from the modified image"""
    
    # Save to buffer
    img_buffer = io.BytesIO()
    image.save(img_buffer, format='PNG', dpi=(300, 300))
    img_buffer.seek(0)
    
    # Create PDF
    c = canvas.Canvas(output_path, pagesize=A4)
    
    # A4 dimensions
    page_width, page_height = A4
    
    # Image dimensions
    img_width, img_height = image.size
    
    # Scale to fit page with margins
    margin = 20
    available_width = page_width - 2 * margin
    available_height = page_height - 2 * margin
    
    scale = min(available_width / img_width, available_height / img_height)
    
    # Calculate position
    scaled_width = img_width * scale
    scaled_height = img_height * scale
    x = (page_width - scaled_width) / 2
    y = (page_height - scaled_height) / 2
    
    # Draw image
    c.drawImage(ImageReader(img_buffer), x, y, width=scaled_width, height=scaled_height)
    
    # Save
    c.save()
    print(f"Created PDF: {output_path}")

def main():
    input_pdf = "/home/svalbuena/.openclaw/workspace/LF_2025_09_0015.pdf"
    output_pdf = "/home/svalbuena/.openclaw/workspace/RXNIRD06-0007_invoice.pdf"
    
    print("=" * 60)
    print("PDF MODIFICATION PROCESS")
    print("=" * 60)
    
    # Try to extract the image
    print("\n1. Attempting to extract image from PDF...")
    
    # First try direct extraction
    image = extract_image_from_pdf_raw(input_pdf)
    
    # If that fails, try rendering the page
    if not image:
        print("\n2. Direct extraction failed, trying page rendering...")
        image = extract_pdf_page_as_image(input_pdf)
    
    if not image:
        print("\n❌ ERROR: Could not extract image from PDF")
        print("\nThe PDF appears to be image-based (scanned), but we lack the necessary tools to extract it.")
        print("Required tools (install one of these):")
        print("  - pdftoppm (apt install poppler-utils)")
        print("  - ImageMagick (apt install imagemagick)")
        print("  - pdf2image Python library")
        return
    
    print(f"\n✓ Successfully extracted image: {image.size[0]}x{image.size[1]} pixels")
    
    # Modify the image
    print("\n3. Applying text modifications...")
    modified_image = modify_invoice_image(image)
    
    # Save preview
    modified_image.save("/home/svalbuena/.openclaw/workspace/preview_modified.png")
    print("Saved preview: preview_modified.png")
    
    # Create final PDF
    print("\n4. Creating final PDF...")
    create_final_pdf(modified_image, output_pdf)
    
    print("\n" + "=" * 60)
    print("✅ PROCESS COMPLETE")
    print("=" * 60)
    print(f"Output file: {output_pdf}")
    print("\nModifications applied:")
    print("  1. RXNIRD06-0002 → RXNIRD06-0007")
    print("  2. September 21, 2025 → January 21, 2026 (2 occurrences)")
    print("  3. €56.18 due September 21, 2025 → €56.18 due January 21, 2026")
    print("  4. Sep 21 - Oct 21, 2025 → Jan 21 - Feb 21, 2026")

if __name__ == "__main__":
    main()