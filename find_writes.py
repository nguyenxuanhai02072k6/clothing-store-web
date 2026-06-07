import json

transcript_path = "/Users/apple/.gemini/antigravity/brain/9c199111-2597-413b-ac3e-42a9bf8dacf3/.system_generated/logs/transcript.jsonl"

print("Scanning for file modifications on app/internal/page.tsx...")
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
            if name in ["write_to_file", "replace_file_content", "multi_replace_file_content"]:
                args = tc.get("args", {})
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except:
                        pass
                target = args.get("TargetFile", "") or args.get("Target", "")
                if "internal/page.tsx" in target:
                    print(f"Line {i}: index={obj.get('step_index')}, tool={name}, keys={list(args.keys())}")
                    if "AllowMultiple" in args:
                        print(f"  AllowMultiple: {args['AllowMultiple']}")
                    if "StartLine" in args:
                        print(f"  Lines: {args.get('StartLine')} - {args.get('EndLine')}")
                    # If it's a write_to_file, we print content length
                    if "CodeContent" in args:
                        print(f"  CodeContent length: {len(args['CodeContent'])}")
                    if "ReplacementContent" in args:
                        print(f"  ReplacementContent length: {len(args['ReplacementContent'])}")
                    print("-" * 50)
