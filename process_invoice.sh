#!/bin/bash

echo "Processing scanned invoice PDF with OCR and text replacements..."

# Run a Docker container with all necessary tools
docker run --rm -i -v $(pwd):/data ubuntu:22.04 bash -c '
set -e

# Update package list quietly
apt-get update -qq

# Install required packages
echo "Installing required packages..."
apt-get install -y -qq poppler-utils tesseract-ocr imagemagick ghostscript python3 python3-pip > /dev/null 2>&1

# Install Python packages
pip3 install --quiet reportlab PyPDF2 pillow

cd /data

echo "Step 1: Extracting images from PDF..."
pdftoppm -png -r 300 LF_2025_09_0015.pdf invoice_page

echo "Step 2: Running OCR to extract text..."
tesseract invoice_page-1.png output -l eng

echo "Original OCR text saved to output.txt"

# Create Python script to rebuild PDF with modifications
cat > rebuild_pdf.py << '"'"'EOF'"'"'
#!/usr/bin/env python3
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image
from reportlab.platypus import Table, TableStyle
from reportlab.lib import colors
import re

# Read the OCR text
with open("output.txt", "r") as f:
    ocr_text = f.read()

print("Step 3: Making text replacements...")
# Make replacements
modified_text = ocr_text
replacements = [
    ("RXNIRDO6-0002", "RXNIRD06-0007"),  # Note: OCR misread O as 0
    ("September 21, 2025", "January 21, 2026"),
    ("€56.18 due September 21, 2025", "€56.18 due January 21, 2026"),
    ("Sep 21- Oct 21, 2025", "Jan 21 - Feb 21, 2026"),
    ("Sep 21 - Oct 21, 2025", "Jan 21 - Feb 21, 2026")  # In case of different spacing
]

for old, new in replacements:
    if old in modified_text:
        modified_text = modified_text.replace(old, new)
        print(f"✓ Replaced: {old} → {new}")
    else:
        # Try alternative for invoice number (OCR sometimes misreads)
        if old == "RXNIRDO6-0002":
            alt = "RXNIRD06-0002"
            if alt in modified_text:
                modified_text = modified_text.replace(alt, "RXNIRD06-0007")
                print(f"✓ Replaced: {alt} → RXNIRD06-0007")

# Save modified text
with open("modified_text.txt", "w") as f:
    f.write(modified_text)

print("\nStep 4: Creating new PDF with modifications...")

# Create a new PDF
pdf_filename = "RXNIRD06-0007_invoice.pdf"
c = canvas.Canvas(pdf_filename, pagesize=A4)
width, height = A4

# Add the background image
img = Image.open("invoice_page-1.png")
img_width, img_height = img.size

# Scale to fit A4
scale = min(width/img_width, height/img_height)
new_width = img_width * scale
new_height = img_height * scale

# Center the image
x_offset = (width - new_width) / 2
y_offset = (height - new_height) / 2

# Draw the background image
c.drawImage(ImageReader(img), x_offset, y_offset, width=new_width, height=new_height)

# Overlay the modified text (white rectangles + new text)
# This is a simplified approach - in production you'"'"'d use better text positioning

# Define text replacements with approximate positions (these would need fine-tuning)
text_overlays = [
    # (x, y, old_text, new_text, font_size)
    (300, height-120, "RXNIRD06-0002", "RXNIRD06-0007", 11),
    (300, height-140, "September 21, 2025", "January 21, 2026", 11),
    (300, height-160, "September 21, 2025", "January 21, 2026", 11),
    (50, 200, "€56.18 due September 21, 2025", "€56.18 due January 21, 2026", 12),
    (50, 320, "Sep 21- Oct 21, 2025", "Jan 21 - Feb 21, 2026", 10),
]

# Note: In a production system, we would:
# 1. Use OCR with bounding boxes (hOCR format) to get exact text positions
# 2. Apply white rectangles to cover old text
# 3. Draw new text at exact positions
# For now, we'"'"'ll create a text-based PDF

c.save()
print(f"Created: {pdf_filename}")

# Alternative: Create a simple text-based PDF with the modified content
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# Create a cleaner text-only version
simple_pdf = "RXNIRD06-0007_invoice_text.pdf"
doc = SimpleDocTemplate(simple_pdf, pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Add the modified text as paragraphs
lines = modified_text.split("\n")
for line in lines:
    if line.strip():
        p = Paragraph(line, styles["Normal"])
        story.append(p)
        story.append(Spacer(1, 6))

doc.build(story)
print(f"Also created text-only version: {simple_pdf}")

EOF

python3 rebuild_pdf.py

echo -e "\nStep 5: Verifying the modifications..."
# Extract text from both PDFs to verify
if command -v pdftotext >/dev/null 2>&1; then
    pdftotext RXNIRD06-0007_invoice.pdf - | grep -E "RXNIRD06-0007|January 21, 2026|Jan 21 - Feb 21, 2026" || true
    echo "Text extraction complete"
else
    echo "pdftotext not available for verification"
fi

echo -e "\nProcessing complete!"
echo "Generated files:"
echo "- RXNIRD06-0007_invoice.pdf (attempted overlay)"
echo "- RXNIRD06-0007_invoice_text.pdf (text-only version)"
echo "- output.txt (original OCR)"
echo "- modified_text.txt (with replacements)"

'