import json

transcript_path = "/Users/apple/.gemini/antigravity/brain/9c199111-2597-413b-ac3e-42a9bf8dacf3/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "internal/page.tsx" not in line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            continue
        
        tc_list = obj.get("tool_calls", [])
        if not tc_list:
            continue
            
        for tc in tc_list:
            name = tc.get("name", "")
            if name == "replace_file_content":
                args = tc.get("args", {})
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except:
                        pass
                target_file = args.get("TargetFile", "")
                if "internal/page.tsx" in target_file:
                    print(f"Step {obj.get('step_index')}:")
                    print("TargetContent:")
                    print(repr(args.get("TargetContent", "")))
                    print("=" * 40)
                    break
        # Only show first 3
        if i > 1050:
            break
