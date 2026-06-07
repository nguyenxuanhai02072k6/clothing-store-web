import json

transcript_path = "/Users/apple/.gemini/antigravity/brain/9c199111-2597-413b-ac3e-42a9bf8dacf3/.system_generated/logs/transcript.jsonl"

print("Scanning for VIEW_FILE outputs of app/internal/page.tsx...")
with open(transcript_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "internal/page.tsx" not in line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            continue
        
        type_ = obj.get("type", "")
        if type_ == "VIEW_FILE" and obj.get("status") == "DONE":
            content = obj.get("content", "")
            print(f"Line {i}: index={obj.get('step_index')}, type={type_}, content length={len(content)}")
            # print first 100 characters of content
            print(content[:150].replace('\n', ' '))
            print("-" * 50)
