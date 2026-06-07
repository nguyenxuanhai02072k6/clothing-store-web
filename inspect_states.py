filepath = "./app_internal_page_tsx.compiled.backup"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

import re
pos = 0
found = []
while True:
    pos = content.find("useState", pos)
    if pos == -1:
        break
    found.append(pos)
    pos += 1

print(f"Total 'useState' matches: {len(found)}")
for p in found:
    print(f"Match at {p}:")
    print(content[p-50:p+150].replace('\n', ' '))
    print("-" * 50)
