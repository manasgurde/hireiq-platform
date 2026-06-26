import json
import urllib.request
import re
import os

screens = [
    {"id": "e735fa4050f146daaff053e206c5b4e1", "path": "frontend/app/candidate/dashboard/page.tsx", "title": "Job Seeker Dashboard"},
    {"id": "31bd8718549d49fcbcd1610686d4d0c2", "path": "frontend/app/candidate/applications/page.tsx", "title": "My Applications Page"},
    {"id": "abf173da258e4bf8b5e45a5afe266e39", "path": "frontend/app/candidate/history/page.tsx", "title": "Application History View"},
    {"id": "3af2cbc304a5412d98babf067730ea56", "path": "frontend/app/candidate/insights/page.tsx", "title": "AI Insights Page"},
    {"id": "c161ce29d7dc466fa1599448dc2d2332", "path": "frontend/app/candidate/profile/page.tsx", "title": "Profile Edit Page"},
    {"id": "83f1bdb005ce46f3995f1b4b567e54d2", "path": "frontend/app/candidate/resume/page.tsx", "title": "Resume Upload Page"},
    {"id": "df46303a3275479283c1c7232d8c832a", "path": "frontend/app/candidate/schedule/page.tsx", "title": "Interview Scheduler"},
    {"id": "d5b71b5187e34300b8d7675f90b4c049", "path": "frontend/app/messages/page.tsx", "title": "Messages Interface"}
]

with open(r"C:\Users\manas\.gemini\antigravity-ide\brain\ee32bca2-d2ef-4181-be4b-4bf15f57fcdb\.system_generated\steps\4055\output.txt", "r") as f:
    data = json.load(f)

screen_dict = {s['name'].split('/')[-1]: s for s in data['screens']}

def dash_to_camel(s):
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), s)

def style_repl(m):
    style_str = m.group(1)
    props = []
    for decl in style_str.split(';'):
        decl = decl.strip()
        if not decl: continue
        parts = decl.split(':', 1)
        if len(parts) == 2:
            key = dash_to_camel(parts[0].strip())
            val = parts[1].strip().replace('"', "'")
            props.append(f"{key}: \"{val}\"")
    if props:
        return 'style={{ ' + ', '.join(props) + ' }}'
    return m.group(0)

def convert_to_jsx(html):
    # Extract body content inside <body ...> ... </body>
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.IGNORECASE | re.DOTALL)
    if not body_match:
        return "export default function Page() { return <div>Error</div>; }"
    
    body = body_match.group(1)

    # Strip out script and style tags completely
    body = re.sub(r'<script.*?>.*?</script>', '', body, flags=re.IGNORECASE | re.DOTALL)
    body = re.sub(r'<style.*?>.*?</style>', '', body, flags=re.IGNORECASE | re.DOTALL)
    
    # Replace class= with className=
    body = body.replace('class="', 'className="')
    
    # Replace for= with htmlFor=
    body = body.replace('for="', 'htmlFor="')
    
    # Close self-closing tags
    tags_to_close = ['input', 'img', 'hr', 'br', 'source']
    for tag in tags_to_close:
        body = re.sub(rf'(<{tag}[^>]*)(?<!/)>', r'\1 />', body)
    
    # Fix inline styles using regex
    body = re.sub(r'style="([^"]*)"', style_repl, body)
    
    # Remove raw HTML comments
    body = re.sub(r'<!--.*?-->', '', body, flags=re.DOTALL)
    
    # Basic SVG fixes
    body = body.replace('stroke-width=', 'strokeWidth=')
    body = body.replace('stroke-linecap=', 'strokeLinecap=')
    body = body.replace('stroke-linejoin=', 'strokeLinejoin=')
    body = body.replace('stroke-dasharray=', 'strokeDasharray=')
    body = body.replace('stroke-dashoffset=', 'strokeDashoffset=')
    body = body.replace('viewbox=', 'viewBox=')
    
    jsx = f"""export default function Page() {{
  return (
    <div className="min-h-screen bg-surface-bright flex flex-col md:flex-row">
      {body}
    </div>
  );
}}
"""
    return jsx

for item in screens:
    s_id = item['id']
    if s_id in screen_dict:
        url = screen_dict[s_id]['htmlCode']['downloadUrl']
        print(f"Downloading {item['title']}...")
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            jsx = convert_to_jsx(html)
            
            out_path = os.path.join(r"d:\collage folder\coding\hiring sensie app making", item['path'])
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, "w", encoding="utf-8") as out_f:
                out_f.write(jsx)
            print(f"Written {out_path}")
    else:
        print(f"Screen {s_id} not found in output.")

print("Done!")
