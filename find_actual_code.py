filepath = "./.next/dev/server/chunks/ssr/app_internal_page_tsx_0dzu7lf._.js"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's search for keys containing "[project]/app/internal/page.tsx" in the Turbopack chunk
# Typically:
# "[project]/app/internal/page.tsx (ecmascript)" or similar.
import re
pattern = r'"\[project\]/app/internal/page\.tsx\s*(\[[^\]]+\])?\s*\(ecmascript\)"'
matches = list(re.finditer(pattern, content))

print(f"Total module declaration matches: {len(matches)}")
for idx, m in enumerate(matches):
    start = m.start()
    end = m.end()
    print(f"Match {idx} at position {start}-{end}: {m.group(0)}")
    # Print the next 500 characters
    print(content[start:start+1000])
    print("=" * 60)
