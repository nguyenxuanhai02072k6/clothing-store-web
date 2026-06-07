import os

search_dir = "./.next"
term = "cskh-reviews"

print(f"Scanning {search_dir} for term '{term}'...")

matches = []
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith((".js", ".html", ".json", ".map")):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                if term in content:
                    print(f"Found in: {filepath} (size: {len(content)} chars)")
                    matches.append((filepath, len(content)))
            except Exception as e:
                pass

print(f"Total matches: {len(matches)}")
