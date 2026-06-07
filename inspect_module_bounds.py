filepath = "./.next/dev/server/chunks/ssr/app_internal_page_tsx_0dzu7lf._.js"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's find all occurrences of "[project]/app/internal/page.tsx"
pos = 0
while True:
    pos = content.find("[project]/app/internal/page.tsx", pos)
    if pos == -1:
        break
    print(f"Found match at {pos}:")
    print(content[pos:pos+300])
    print("-" * 50)
    pos += 1
