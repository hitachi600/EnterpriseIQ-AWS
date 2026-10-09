"""
EnterpriseIQ - Professional PDF Study Guide & HR Playbook Generator
Converts markdown/HTML documentation into a high-fidelity, styled PDF document.
"""

import os
import subprocess
from pathlib import Path

def generate_pdf():
    workspace_root = Path(__file__).resolve().parents[1]
    md_file = workspace_root / "docs" / "ENTERPRISEIQ_COMPLETE_26_MODULE_HR_DEMO_GUIDE.md"
    html_output = workspace_root / "docs" / "EnterpriseIQ_26_Modules_Guide.html"
    pdf_output = workspace_root / "docs" / "EnterpriseIQ_26_Modules_Complete_Study_Guide.pdf"

    if not md_file.exists():
        print(f"Error: {md_file} not found!")
        return False

    with open(md_file, "r", encoding="utf-8") as f:
        md_text = f.read()

    # Simple Markdown to HTML converter with luxury dark-mode / print-ready styling
    import re

    html_body = md_text

    # Convert headers
    html_body = re.sub(r'^# (.*?)$', r'<h1 class="doc-title">\1</h1>', html_body, flags=re.MULTILINE)
    html_body = re.sub(r'^## (.*?)$', r'<h2 class="section-title">\1</h2>', html_body, flags=re.MULTILINE)
    html_body = re.sub(r'^### (.*?)$', r'<h3 class="sub-title">\1</h3>', html_body, flags=re.MULTILINE)

    # Convert bold & italic
    html_body = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_body)
    html_body = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html_body)
    html_body = re.sub(r'`(.*?)`', r'<code>\1</code>', html_body)

    # Convert Blockquotes
    html_body = re.sub(r'^> (.*?)$', r'<div class="callout">\1</div>', html_body, flags=re.MULTILINE)

    # Convert Lists
    html_body = re.sub(r'^- (.*?)$', r'<li>\1</li>', html_body, flags=re.MULTILINE)
    html_body = re.sub(r'^\d+\. (.*?)$', r'<li>\1</li>', html_body, flags=re.MULTILINE)

    # Convert Tables
    def format_table(match):
        lines = [l.strip() for l in match.group(0).strip().split('\n') if l.strip()]
        if len(lines) < 2:
            return match.group(0)
        headers = [c.strip() for c in lines[0].split('|')[1:-1]]
        html = '<table class="styled-table"><thead><tr>'
        for h in headers:
            html += f'<th>{h}</th>'
        html += '</tr></thead><tbody>'
        for row in lines[2:]:
            cells = [c.strip() for c in row.split('|')[1:-1]]
            html += '<tr>'
            for c in cells:
                html += f'<td>{c}</td>'
            html += '</tr>'
        html += '</tbody></table>'
        return html

    html_body = re.sub(r'(\|.*?\|\n\|[-:| ]+\|\n(?:\|.*?\|\n?)+)', format_table, html_body)

    # Format Paragraphs
    paragraphs = html_body.split('\n\n')
    formatted_paras = []
    for p in paragraphs:
        p_clean = p.strip()
        if not p_clean:
            continue
        if p_clean.startswith('<h') or p_clean.startswith('<table') or p_clean.startswith('<div') or p_clean.startswith('<li'):
            formatted_paras.append(p_clean)
        else:
            formatted_paras.append(f'<p>{p_clean.replace(chr(10), "<br/>")}</p>')

    final_content = '\n'.join(formatted_paras)

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>EnterpriseIQ — 26 Modules Complete Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  
  @page {{
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
  }}
  
  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #1e293b;
    background: #ffffff;
    font-size: 11.5pt;
    margin: 0;
    padding: 20px;
  }}

  .doc-title {{
    font-size: 24pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 3px solid #6366f1;
    padding-bottom: 10px;
    margin-bottom: 18px;
    letter-spacing: -0.5px;
  }}

  .section-title {{
    font-size: 15pt;
    font-weight: 800;
    color: #1e1b4b;
    background: #f1f5f9;
    padding: 8px 14px;
    border-left: 5px solid #6366f1;
    border-radius: 4px;
    margin-top: 26px;
    margin-bottom: 12px;
    page-break-after: avoid;
  }}

  .sub-title {{
    font-size: 12.5pt;
    font-weight: 700;
    color: #334155;
    margin-top: 14px;
    margin-bottom: 6px;
  }}

  p, li {{
    font-size: 10.5pt;
    color: #334155;
  }}

  li {{
    margin-bottom: 5px;
  }}

  code {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5pt;
    background: #f1f5f9;
    color: #4338ca;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }}

  .callout {{
    background: #eef2ff;
    border-left: 4px solid #6366f1;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 14px 0;
    font-size: 10.5pt;
    color: #312e81;
  }}

  .styled-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 9.5pt;
  }}

  .styled-table th {{
    background: #1e293b;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #334155;
  }}

  .styled-table td {{
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    color: #334155;
  }}

  .styled-table tr:nth-child(even) {{
    background: #f8fafc;
  }}

  .page-break {{
    page-break-before: always;
  }}
</style>
</head>
<body>
{final_content}
</body>
</html>
"""

    with open(html_output, "w", encoding="utf-8") as f:
        f.write(full_html)

    print(f"[OK] HTML formatted version generated at: {html_output}")

    # Use Headless Edge on Windows to render PDF
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    edge_exe = None
    for p in edge_paths:
        if os.path.exists(p):
            edge_exe = p
            break

    if edge_exe:
        cmd = [
            edge_exe,
            "--headless",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={str(pdf_output)}",
            str(html_output)
        ]
        print("Rendering PDF via Microsoft Edge Headless...")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if pdf_output.exists() and pdf_output.stat().st_size > 0:
            print(f"[SUCCESS] PDF successfully generated at: {pdf_output} ({pdf_output.stat().st_size / 1024:.1f} KB)")
            return True
        else:
            print(f"Edge PDF generation warning: {res.stderr}")
    
    # Fallback to ReportLab if Edge was unavailable
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        
        doc = SimpleDocTemplate(str(pdf_output), pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        for line in md_text.split("\n"):
            if line.strip():
                story.append(Paragraph(line, styles['Normal']))
                story.append(Spacer(1, 4))
        doc.build(story)
        print(f"[SUCCESS] PDF generated via ReportLab fallback at: {pdf_output}")
        return True
    except Exception as e:
        print(f"ReportLab fallback error: {e}")
        return False

if __name__ == "__main__":
    generate_pdf()
