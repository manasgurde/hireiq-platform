import os
import re

pages = [
    "dashboard/page.tsx",
    "applications/page.tsx",
    "history/page.tsx",
    "insights/page.tsx",
    "profile/page.tsx",
    "resume/page.tsx",
    "schedule/page.tsx"
]

base_dir = r"d:\collage folder\coding\hiring sensie app making\frontend\app\candidate"

for page in pages:
    path = os.path.join(base_dir, page)
    if not os.path.exists(path):
        continue
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract everything inside <main ...> ... </main>
    # Note: we need to handle nested tags so regex might be tricky,
    # but since <main> is the main wrapper, we can match <main[^>]*> (.*?) </main>
    
    main_match = re.search(r'<main[^>]*>(.*?)</main>', content, re.IGNORECASE | re.DOTALL)
    if main_match:
        inner_content = main_match.group(1).strip()
        
        # Determine the class string from the main tag if we want to keep it
        main_tag_match = re.search(r'<main([^>]*)>', content, re.IGNORECASE)
        classes = ""
        if main_tag_match:
            class_match = re.search(r'className="([^"]*)"', main_tag_match.group(1))
            if class_match:
                # We want to keep padding classes and flex-1 etc, but remove mt-16 since layout handles it
                cls_str = class_match.group(1)
                cls_str = cls_str.replace("flex-1 mt-16 overflow-y-auto", "").strip()
                if cls_str:
                    classes = f' className="{cls_str}"'
        
        # Check if the page is currently static. If so, rewrite it to be a clean component
        # For dashboard, we might want to manually edit, but for now we'll just strip the layout
        # and wrap it in a fragment or div.
        
        new_content = f"""export default function Page() {{
  return (
    <div{classes}>
      {inner_content}
    </div>
  );
}}
"""
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Stripped layout for {page}")
    else:
        print(f"Could not find <main> in {page}")
