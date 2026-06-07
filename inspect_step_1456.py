import json

transcript_path = "/Users/apple/.gemini/antigravity/brain/9c199111-2597-413b-ac3e-42a9bf8dacf3/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "1456" in line or '"step_index":1456' in line:
            print(f"Line {i}: length {len(line)}")
            # Let's print the entire raw line as a string so we see exactly how it looks
            print("RAW LINE:")
            print(line[:2000])
            print("...")
            print(line[-2000:])
            break
