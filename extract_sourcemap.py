import json

map_path = "./.next/dev/static/chunks/app_internal_page_tsx_06f4ecr._.js.map"

print(f"Loading source map: {map_path}...")
with open(map_path, "r", encoding="utf-8") as f:
    data = json.load(f)

sources = data.get("sources", [])
print(f"Total sources in map: {len(sources)}")
for idx, src in enumerate(sources):
    print(f"Source {idx}: {src}")

sources_content = data.get("sourcesContent", [])
print(f"Total sourcesContent in map: {len(sources_content)}")

# Let's search if any source name matches internal/page.tsx
for idx, src in enumerate(sources):
    if "internal/page.tsx" in src or "internal/page" in src:
        print(f"MATCH FOUND at index {idx}!")
        content = sources_content[idx] if idx < len(sources_content) else None
        if content:
            print(f"Content length: {len(content)} characters.")
            print("First 200 chars:")
            print(content[:200])
            print("Last 200 chars:")
            print(content[-200:])
            
            # Save the original file!
            out_path = "./app/internal/page.tsx.restored"
            with open(out_path, "w", encoding="utf-8") as out_f:
                out_f.write(content)
            print(f"SUCCESSFULLY RESTORED ORIGINAL FILE TO {out_path}!")
        else:
            print("No content found at this index in sourcesContent.")
