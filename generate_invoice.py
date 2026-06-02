#!/usr/bin/env python3
"""
Generate an OpenAI-style invoice PDF with updated invoice number and dates.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_LEFT, TA_CENTER
from datetime import datetime

def generate_invoice():
    """Generate the invoice PDF."""
    
    pdf_filename = "/home/svalbuena/.openclaw/workspace/RXNIRD06-0007_invoice.pdf"
    
    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    # Container for PDF elements
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom style for heading
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.black,
        spaceAfter=6,
        alignment=TA_LEFT
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=colors.black,
        alignment=TA_LEFT
    )
    
    small_style = ParagraphStyle(
        'CustomSmall',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.black,
        alignment=TA_LEFT
    )
    
    right_style = ParagraphStyle(
        'RightAlign',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        textColor=colors.black,
        alignment=TA_RIGHT
    )
    
    # Header - Company name
    elements.append(Paragraph("OpenAI", heading_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # Invoice details table
    invoice_details = [
        ["Invoice number", "RXNIRD06-0007"],
        ["Date of issue", "January 21, 2026"],
        ["Date due", "January 21, 2026"],
    ]
    
    invoice_table = Table(
        invoice_details,
        colWidths=[1.5*inch, 2*inch],
        rowHeights=[0.25*inch, 0.25*inch, 0.25*inch]
    )
    
    invoice_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    
    elements.append(invoice_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Services table
    services_data = [
        ["Description", "Amount"],
        ["ChatGPT Business Subscription Jan 21 - Feb 21, 2026", "€56.18"],
    ]
    
    services_table = Table(
        services_data,
        colWidths=[4*inch, 1.5*inch],
        rowHeights=[0.3*inch, 0.3*inch]
    )
    
    services_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, 0), 1.5, colors.black),
        ('LINEBELOW', (0, -1), (-1, -1), 1.5, colors.black),
    ]))
    
    elements.append(services_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Total amount due
    due_data = [
        ["", "€56.18 due January 21, 2026"],
    ]
    
    due_table = Table(
        due_data,
        colWidths=[4*inch, 1.5*inch],
        rowHeights=[0.3*inch]
    )
    
    due_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(due_table)
    
    # Build PDF
    doc.build(elements)
    print(f"✓ Invoice PDF generated: {pdf_filename}")
    return pdf_filename

if __name__ == "__main__":
    generate_invoice()
