#!/usr/bin/env python3
"""
Deep analysis of PDF including XObjects and embedded content
"""

import pikepdf
from pikepdf import Pdf

def analyze_xobjects(pdf_path):
    """Analyze XObjects and forms in PDF"""
    pdf = pikepdf.open(pdf_path)
    
    print(f"Deep analysis of: {pdf_path}\n")
    
    for page_num, page in enumerate(pdf.pages):
        print(f"Page {page_num + 1}:")
        
        # Check resources
        if '/Resources' in page:
            resources = page['/Resources']
            
            # Check for XObjects
            if '/XObject' in resources:
                xobjects = resources['/XObject']
                print(f"  Found {len(xobjects)} XObjects")
                
                for name, xobj in xobjects.items():
                    print(f"\n  XObject '{name}':")
                    xobj_dict = xobj
                    
                    # Get XObject properties
                    subtype = xobj_dict.get('/Subtype', 'Unknown')
                    print(f"    Subtype: {subtype}")
                    
                    if subtype == '/Form':
                        print("    This is a Form XObject (could contain text)")
                        
                        # Check if it has resources with fonts
                        if '/Resources' in xobj_dict:
                            form_resources = xobj_dict['/Resources']
                            if '/Font' in form_resources:
                                print(f"    Has fonts: {list(form_resources['/Font'].keys())}")
                        
                        # Try to get its content
                        if hasattr(xobj_dict, 'read_bytes'):
                            content = xobj_dict.read_bytes()
                            decoded = content.decode('latin-1', errors='ignore')
                            
                            # Look for text
                            import re
                            text_ops = re.findall(r'\((.*?)\)\s*Tj', decoded)
                            if text_ops:
                                print("    Found text operations:")
                                for i, text in enumerate(text_ops[:10]):  # First 10
                                    if any(c.isalnum() for c in text):
                                        print(f"      {i+1}: '{text}'")
                            
                            # Check for our target strings
                            targets = ["RXNIRD06-0002", "September 21, 2025", "€56.18", "Sep 21 - Oct 21, 2025"]
                            found_any = False
                            for target in targets:
                                if target in decoded:
                                    print(f"    ✓ Contains: '{target}'")
                                    found_any = True
                            
                            if found_any:
                                print("\n    Content sample:")
                                print(decoded[:1000])
                    
                    elif subtype == '/Image':
                        width = xobj_dict.get('/Width', 'Unknown')
                        height = xobj_dict.get('/Height', 'Unknown')
                        print(f"    Image: {width}x{height}")
        
        # Check for annotations (forms)
        if '/Annots' in page:
            annots = page['/Annots']
            print(f"\n  Found {len(annots)} annotations")
            for i, annot_ref in enumerate(annots):
                annot = annot_ref
                if '/T' in annot:  # Field name
                    field_name = annot['/T']
                    field_value = annot.get('/V', 'No value')
                    print(f"    Field '{field_name}': {field_value}")
    
    # Check if it's a scanned PDF (image-based)
    print("\n" + "="*60)
    print("PDF Type Analysis:")
    
    # Get first page
    page = pdf.pages[0]
    has_text = False
    has_images = False
    
    if '/Resources' in page:
        if '/Font' in page['/Resources']:
            has_text = True
            print("  ✓ Contains font resources (likely has real text)")
        
        if '/XObject' in page['/Resources']:
            for name, xobj in page['/Resources']['/XObject'].items():
                if xobj.get('/Subtype') == '/Image':
                    has_images = True
    
    if has_images and not has_text:
        print("  ⚠ This appears to be a scanned/image-based PDF")
    elif has_text:
        print("  ✓ This appears to be a text-based PDF")
    
    pdf.close()

# Run analysis
analyze_xobjects("/home/svalbuena/.openclaw/workspace/LF_2025_09_0015.pdf")