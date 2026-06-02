#!/usr/bin/env python3
"""
Modify PDF using PyPDF2 with text layer approach
"""

import PyPDF2
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import sys

def create_text_overlay(replacements, page_width, page_height):
    """Create a PDF with text replacements positioned correctly"""
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=(page_width, page_height))
    
    # Text replacement positions (these would need to be calibrated for the specific PDF)
    # For now, let's try to extract and analyze the original first
    
    c.save()
    packet.seek(0)
    return packet

def extract_text_with_positions(pdf_path):
    """Extract text with positions to understand layout"""
    reader = PdfReader(pdf_path)
    
    for page_num, page in enumerate(reader.pages):
        print(f"\n--- Page {page_num + 1} ---")
        text = page.extract_text()
        print(text)
        print("\n" + "="*50)
    
    return reader

def modify_pdf_with_overlay(input_path, output_path, replacements):
    """Different approach: analyze the PDF structure first"""
    # First, let's understand what we're dealing with
    print("Analyzing PDF structure...")
    
    reader = PdfReader(input_path)
    writer = PdfWriter()
    
    # Check if it's a form-based PDF
    if reader.is_form_pdf:
        print("This is a form-based PDF")
        
        # Try to modify form fields
        for page in reader.pages:
            if '/Annots' in page:
                for annot_ref in page['/Annots']:
                    annotation = annot_ref.get_object()
                    if annotation.get('/FT') == '/Tx':  # Text field
                        field_value = annotation.get('/V')
                        if field_value:
                            print(f"Found field value: {field_value}")
                            
                            # Check if it matches any of our replacement keys
                            for old_text, new_text in replacements.items():
                                if old_text in str(field_value):
                                    annotation['/V'] = field_value.replace(old_text, new_text)
                                    print(f"Replaced in form field: {old_text} -> {new_text}")
    
    # Copy all pages
    for page in reader.pages:
        writer.add_page(page)
    
    # Save the result
    with open(output_path, 'wb') as output_file:
        writer.write(output_file)

# Let me first check what libraries we have available
print("Checking available libraries...")
try:
    import PyPDF2
    print("✓ PyPDF2 available")
except:
    print("✗ PyPDF2 not available")

try:
    import reportlab
    print("✓ reportlab available")
except:
    print("✗ reportlab not available")

# Extract and analyze the PDF first
input_pdf = "/home/svalbuena/.openclaw/workspace/LF_2025_09_0015.pdf"
print(f"\nAnalyzing: {input_pdf}")

try:
    reader = extract_text_with_positions(input_pdf)
    
    # Check PDF metadata
    if reader.metadata:
        print("\nPDF Metadata:")
        for key, value in reader.metadata.items():
            print(f"  {key}: {value}")
    
    # Check for forms
    print(f"\nIs Form PDF: {reader.is_form_pdf}")
    
    # Check page properties
    page = reader.pages[0]
    print(f"\nPage 1 properties:")
    print(f"  Media Box: {page.mediabox}")
    print(f"  Crop Box: {page.cropbox if hasattr(page, 'cropbox') else 'None'}")
    
except Exception as e:
    print(f"Error analyzing PDF: {e}")