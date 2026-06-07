filepath = "./.next/dev/server/chunks/ssr/app_internal_page_tsx_0dzu7lf._.js"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

import re
pattern = r'"\[project\]/[^"]+\s*(\[[^\]]+\])?\s*\(ecmascript\)"'
matches = list(re.finditer(pattern, content))

print(f"Total modules: {len(matches)}")
for idx, m in enumerate(matches):
    print(f"Module {idx} at position {m.start()}-{m.end()}: {m.group(0)}")
