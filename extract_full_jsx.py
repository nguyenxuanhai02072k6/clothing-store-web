filepath = "./.next/dev/server/chunks/ssr/app_internal_page_tsx_0dzu7lf._.js"

with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's find the start of the "[project]/app/internal/page.tsx" module
start_tag = '"[project]/app/internal/page.tsx": ('
start_idx = content.find(start_tag)
if start_idx == -1:
    start_tag = '"[project]/app/internal/page.tsx"'
    start_idx = content.find(start_tag)

if start_idx != -1:
    print(f"Found start tag at {start_idx}!")
    # Let's find the end of the module.
    # Typically, it ends with a closing bracket, followed by a comma and the next module definition.
    # In Turbopack, it looks like:
    # "[project]/app/internal/page.tsx": (function(...) { ... }),
    # Or similar.
    # Let's search for the next module header like '"[project]/...' or similar.
    # Let's search for the string '"[project]/' after start_idx
    next_mod_idx = content.find('"[project]/', start_idx + 100)
    if next_mod_idx != -1:
        print(f"Found next module at {next_mod_idx}!")
        module_code = content[start_idx:next_mod_idx]
    else:
        module_code = content[start_idx:]
        
    print(f"Module code length: {len(module_code)} chars.")
    # Save the compiled module code to a file
    with open("./app/internal/page.tsx.compiled", "w", encoding="utf-8") as out_f:
        out_f.write(module_code)
    print("Saved to ./app/internal/page.tsx.compiled")
else:
    print("Could not find the module in compiled JS!")
