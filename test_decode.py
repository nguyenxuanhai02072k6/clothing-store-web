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
        for tc in tc_list:
            name = tc.get("name", "")
            if name == "multi_replace_file_content":
                print(f"Step {obj.get('step_index')}:")
                args = tc.get("args", {})
                if isinstance(args, str):
                    args = json.loads(args, strict=False)
                chunks = args.get("ReplacementChunks", [])
                if isinstance(chunks, str):
                    chunks = json.loads(chunks, strict=False)
                
                if isinstance(chunks, list) and len(chunks) > 0:
                    c = chunks[0]
                    print("Chunk 0 TargetContent raw:")
                    print(repr(c.get("TargetContent", "")))
                    print("Chunk 0 ReplacementContent raw:")
                    print(repr(c.get("ReplacementContent", "")))
                print("=" * 40)
                break
