#!/usr/bin/env python3
"""
Analyze PDF to understand its text structure
"""

import pikepdf
from pikepdf import Pdf, Stream
import re

def analyze_pdf_content(pdf_path):
    """Deep dive into PDF content streams"""
    pdf = pikepdf.open(pdf_path)
    
    print(f"Analyzing: {pdf_path}")
    print(f"Number of pages: {len(pdf.pages)}")
    
    for page_num, page in enumerate(pdf.pages):
        print(f"\n{'='*60}")
        print(f"PAGE {page_num + 1}")
        print(f"{'='*60}")
        
        # Check for text content in different ways
        if '/Contents' in page:
            contents = page['/Contents']
            
            # Handle both single stream and array of streams
            if isinstance(contents, Stream):
                streams = [contents]
            elif isinstance(contents, pikepdf.Array):
                streams = list(contents)
            else:
                print("No readable content stream")
                continue
            
            for i, stream in enumerate(streams):
                if isinstance(stream, Stream):
                    print(f"\n--- Stream {i+1} ---")
                    
                    # Get raw bytes
                    raw_data = stream.read_bytes()
                    
                    # Try to decode as text
                    try:
                        # First try UTF-8
                        text_data = raw_data.decode('utf-8', errors='ignore')
                    except:
                        # Fall back to latin-1
                        text_data = raw_data.decode('latin-1', errors='ignore')
                    
                    # Look for text operations in PDF (BT...ET blocks, Tj/TJ operators)
                    text_blocks = re.findall(r'BT(.*?)ET', text_data, re.DOTALL)
                    
                    if text_blocks:
                        print(f"Found {len(text_blocks)} text blocks")
                        
                        for block_num, block in enumerate(text_blocks[:5]):  # Show first 5
                            print(f"\n  Text Block {block_num + 1}:")
                            # Extract strings from Tj and TJ operators
                            tj_strings = re.findall(r'\((.*?)\)\s*Tj', block)
                            for s in tj_strings:
                                if any(c.isalnum() for c in s):  # Has actual text
                                    print(f"    Tj: '{s}'")
                            
                            # TJ arrays (more complex)
                            tj_arrays = re.findall(r'\[(.*?)\]\s*TJ', block)
                            for arr in tj_arrays:
                                strings = re.findall(r'\((.*?)\)', arr)
                                if strings:
                                    combined = ''.join(strings)
                                    if any(c.isalnum() for c in combined):
                                        print(f"    TJ: '{combined}'")
                    
                    # Also show a sample of the raw stream (first 500 chars)
                    print(f"\nRaw stream sample (first 500 chars):")
                    print(text_data[:500])
                    
                    # Look for our target strings
                    print("\nSearching for target strings:")
                    targets = ["RXNIRD06-0002", "September 21, 2025", "€56.18 due September 21, 2025", "Sep 21 - Oct 21, 2025"]
                    for target in targets:
                        if target in text_data:
                            print(f"  ✓ Found: '{target}'")
                            # Show context
                            pos = text_data.find(target)
                            context_start = max(0, pos - 50)
                            context_end = min(len(text_data), pos + len(target) + 50)
                            print(f"    Context: ...{text_data[context_start:context_end]}...")
                        else:
                            print(f"  ✗ Not found: '{target}'")
    
    pdf.close()

# Run analysis
analyze_pdf_content("/home/svalbuena/.openclaw/workspace/LF_2025_09_0015.pdf")