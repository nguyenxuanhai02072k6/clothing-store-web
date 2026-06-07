import json

transcript_path = "/Users/apple/.gemini/antigravity/brain/9c199111-2597-413b-ac3e-42a9bf8dacf3/.system_generated/logs/transcript.jsonl"

with open(transcript_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "internal/page.tsx" not in line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            # Let's print if it's invalid JSON
            if "1456" in line or '"step_index":1456' in line:
                print(f"Line {i} is invalid JSON!")
                print(f"Length of line: {len(line)}")
                print("End of line:")
                print(repr(line[-100:]))
            continue
            
        step_index = obj.get("step_index")
        if step_index == 1456:
            print(f"Line {i}: index={step_index} is VALID JSON!")
            print(f"Length of line: {len(line)}")
            tc_list = obj.get("tool_calls", [])
            for tc in tc_list:
                name = tc.get("name", "")
                if name == "multi_replace_file_content":
                    args = tc.get("args", {})
                    if isinstance(args, str):
                        print("args is a string!")
                        print(f"args length: {len(args)}")
                        # Check if args is valid JSON
                        try:
                            json.loads(args)
                            print("args string is valid JSON!")
                        except Exception as e:
                            print(f"args string is INVALID JSON: {e}")
                            print("args string end:")
                            print(repr(args[-100:]))
                    else:
                        print("args is a dict!")
                        chunks = args.get("ReplacementChunks", [])
                        print(f"chunks type: {type(chunks)}")
                        if isinstance(chunks, str):
                            print(f"chunks length: {len(chunks)}")
                            try:
                                json.loads(chunks)
                                print("chunks string is valid JSON!")
                            except Exception as e:
                                print(f"chunks string is INVALID JSON: {e}")
                                print("chunks string end:")
                                print(repr(chunks[-100:]))
            break
