import json

transcript_path = "/Users/apple/.gemini/antigravity/brain/9c199111-2597-413b-ac3e-42a9bf8dacf3/.system_generated/logs/transcript.jsonl"

print("Reading transcript...")
with open(transcript_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Total lines read: {len(lines)}")

# Let's search for "internal/page.tsx" anywhere in the line
count = 0
for i, line in enumerate(lines):
    if "internal/page.tsx" in line:
        count += 1
        print(f"Line {i} matches!")
        try:
            obj = json.loads(line)
            print(f"Keys: {list(obj.keys())}")
            if "type" in obj:
                print(f"Type: {obj['type']}")
            if "status" in obj:
                print(f"Status: {obj['status']}")
            # Look at tool_calls
            if "tool_calls" in obj:
                tc_list = obj["tool_calls"]
                print(f"Tool calls count: {len(tc_list)}")
                for tc in tc_list:
                    print(f"  Name: {tc.get('name')}")
            # If there are arguments or response content
            # Let's print the first 300 chars of the line
            print(line[:300])
        except Exception as e:
            print(f"Error parsing line {i}: {e}")
            print(line[:300])
        print("-" * 50)
        if count >= 10:
            print("Showing first 10 matches...")
            break
