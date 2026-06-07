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
# Let's print the first 25 matches in detail
for idx, p in enumerate(found[:25]):
    print(f"Match {idx} at position {p}:")
    print(content[p-60:p+120].replace('\n', ' '))
    print("-" * 50)
