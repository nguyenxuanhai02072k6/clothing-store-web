filepath = "./.next/dev/server/chunks/ssr/app_internal_page_tsx_0dzu7lf._.js"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

indices = []
idx = content.find("submitShiftRequest")
while idx != -1:
    indices.append(idx)
    idx = content.find("submitShiftRequest", idx + 1)

print(f"Total occurrences of 'submitShiftRequest': {len(indices)}")
for pos in indices:
    print(f"Position: {pos}")
    print(content[pos-100:pos+300])
    print("-" * 50)
