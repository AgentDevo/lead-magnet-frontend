#!/usr/bin/env python3
"""
Modify PDF with exact text replacements while preserving all formatting
"""

import pikepdf
import sys
from pathlib import Path

def replace_text_in_pdf(input_path, output_path, replacements):
    """
    Replace text in a PDF while preserving formatting
    
    Args:
        input_path: Path to input PDF
        output_path: Path to save modified PDF
        replacements: Dict of {old_text: new_text}
    """
    # Open the PDF
    pdf = pikepdf.open(input_path)
    
    # Track if any replacements were made
    replacements_made = {}
    
    # Iterate through all pages
    for page_num, page in enumerate(pdf.pages):
        # Get the content stream
        if '/Contents' in page:
            contents = page['/Contents']
            
            # Handle both single stream and array of streams
            if isinstance(contents, pikepdf.Stream):
                streams = [contents]
            elif isinstance(contents, pikepdf.Array):
                streams = [s for s in contents if isinstance(s, pikepdf.Stream)]
            else:
                continue
            
            # Process each stream
            for stream in streams:
                # Get the stream data
                stream_data = stream.read_bytes().decode('latin-1', errors='ignore')
                original_data = stream_data
                
                # Apply replacements
                for old_text, new_text in replacements.items():
                    if old_text in stream_data:
                        count = stream_data.count(old_text)
                        stream_data = stream_data.replace(old_text, new_text)
                        replacements_made[old_text] = replacements_made.get(old_text, 0) + count
                        print(f"Page {page_num + 1}: Replaced '{old_text}' with '{new_text}' ({count} occurrences)")
                
                # If data changed, write it back
                if stream_data != original_data:
                    stream.write(stream_data.encode('latin-1', errors='ignore'))
    
    # Save the modified PDF
    pdf.save(output_path)
    pdf.close()
    
    return replacements_made

def extract_text_for_verification(pdf_path):
    """Extract text from PDF for verification"""
    pdf = pikepdf.open(pdf_path)
    text = ""
    
    for page_num, page in enumerate(pdf.pages):
        # Extract text from page
        page_text = ""
        if '/Contents' in page:
            contents = page['/Contents']
            
            if isinstance(contents, pikepdf.Stream):
                streams = [contents]
            elif isinstance(contents, pikepdf.Array):
                streams = [s for s in contents if isinstance(s, pikepdf.Stream)]
            else:
                continue
            
            for stream in streams:
                stream_data = stream.read_bytes().decode('latin-1', errors='ignore')
                page_text += stream_data
        
        text += f"\n--- Page {page_num + 1} ---\n{page_text}"
    
    pdf.close()
    return text

def main():
    # Define paths
    input_pdf = "/home/svalbuena/.openclaw/workspace/LF_2025_09_0015.pdf"
    output_pdf = "/home/svalbuena/.openclaw/workspace/RXNIRD06-0007_invoice.pdf"
    
    # Define exact replacements
    replacements = {
        "RXNIRD06-0002": "RXNIRD06-0007",
        "September 21, 2025": "January 21, 2026",
        "€56.18 due September 21, 2025": "€56.18 due January 21, 2026",
        "Sep 21 - Oct 21, 2025": "Jan 21 - Feb 21, 2026"
    }
    
    print("Starting PDF modification...")
    print(f"Input: {input_pdf}")
    print(f"Output: {output_pdf}")
    print("\nReplacements to make:")
    for old, new in replacements.items():
        print(f"  '{old}' → '{new}'")
    
    try:
        # Perform replacements
        print("\nProcessing PDF...")
        results = replace_text_in_pdf(input_pdf, output_pdf, replacements)
        
        # Report results
        print("\nReplacement summary:")
        for text, count in results.items():
            print(f"  '{text}': {count} replacements made")
        
        # Verify replacements
        print("\nVerifying output PDF...")
        output_text = extract_text_for_verification(output_pdf)
        
        # Check for new values
        verification_checks = [
            ("RXNIRD06-0007", "Invoice number"),
            ("January 21, 2026", "Date replacements"),
            ("€56.18 due January 21, 2026", "Due date text"),
            ("Jan 21 - Feb 21, 2026", "Period text")
        ]
        
        print("\nVerification results:")
        all_found = True
        for check_text, description in verification_checks:
            if check_text in output_text:
                print(f"  ✓ Found: {description} ('{check_text}')")
            else:
                print(f"  ✗ NOT FOUND: {description} ('{check_text}')")
                all_found = False
        
        # Check that old values are gone
        old_values = ["RXNIRD06-0002", "September 21, 2025", "Sep 21 - Oct 21, 2025"]
        print("\nChecking old values are replaced:")
        for old_val in old_values:
            if old_val not in output_text:
                print(f"  ✓ Removed: '{old_val}'")
            else:
                print(f"  ✗ Still present: '{old_val}'")
                all_found = False
        
        if all_found and results:
            print(f"\n✓ SUCCESS: PDF modified and saved to {output_pdf}")
        else:
            print(f"\n⚠ WARNING: Some replacements may not have been successful")
            
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()