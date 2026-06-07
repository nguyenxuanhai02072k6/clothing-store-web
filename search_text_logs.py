import json
import re

transcript_path = "/Users/apple/.gemini/antigravity/brain/9c199111-2597-413b-ac3e-42a9bf8dacf3/.system_generated/logs/transcript.jsonl"

print("Searching text logs...")
with open(transcript_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "InternalDashboardPage" not in line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            continue
            
        step_index = obj.get("step_index")
        source = obj.get("source")
        type_ = obj.get("type")
        
        # Check thinking and content
        thinking = obj.get("thinking", "")
        content = obj.get("content", "")
        
        # Look for code blocks starting with ```tsx or ```typescript
        for field_name, text in [("thinking", thinking), ("content", content)]:
            if not text:
                continue
            
            # Find all tsx code blocks
            blocks = re.findall(r"```[tT]sx(.*?)```", text, re.DOTALL)
            for idx, block in enumerate(blocks):
                # If the block contains InternalDashboardPage
                if "InternalDashboardPage" in block:
                    print(f"Line {i}: index={step_index}, source={source}, type={type_}, field={field_name}, block {idx} length: {len(block)}")
                    print("Block snippet:")
                    print(block[:300])
                    print("...")
                    print(block[-300:])
                    print("-" * 50)
                    
                    # Let's save this block to a file
                    out_path = f"./app/internal/page.tsx.block_{step_index}_{idx}"
                    with open(out_path, "w", encoding="utf-8") as out_f:
                        out_f.write(block.strip())
                    print(f"Saved block to {out_path}")
