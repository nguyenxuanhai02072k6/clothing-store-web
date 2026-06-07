filepath = "./.next/dev/server/chunks/ssr/app_internal_page_tsx_0dzu7lf._.js"

print(f"Reading compiled JS: {filepath}...")
with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's search for "[project]/app/internal/page.tsx" module definition
search_str = '"[project]/app/internal/page.tsx ('
idx = content.find(search_str)
if idx == -1:
    search_str = '"[project]/app/internal/page.tsx"'
    idx = content.find(search_str)

if idx != -1:
    print(f"Found module header '{search_str}' at index {idx}!")
    # Let's print the next 2000 characters
    print(content[idx:idx+4000])
else:
    print("Could not find module header in compiled JS!")
