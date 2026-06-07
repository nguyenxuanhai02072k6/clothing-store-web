filepath = "./.next/dev/server/chunks/ssr/app_internal_page_tsx_0dzu7lf._.js"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

pos = 0
matches = []
while True:
    pos = content.find("[project]/app/internal/page.tsx", pos)
    if pos == -1:
        break
    matches.append(pos)
    pos += 1

print(f"Total matches found: {len(matches)}")
for idx, pos in enumerate(matches):
    print(f"Match {idx} at position {pos}:")
    print(content[pos:pos+200])
    print("=" * 40)
