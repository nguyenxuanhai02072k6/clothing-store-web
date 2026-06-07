import json
import os

transcript_path = "/Users/apple/.gemini/antigravity/brain/9c199111-2597-413b-ac3e-42a9bf8dacf3/.system_generated/logs/transcript.jsonl"
original_path = "./app/account/page.tsx"
output_path = "./app/internal/page.tsx"

print("Starting reconstruction of app/internal/page.tsx...")

# Read the base content
with open(original_path, "r", encoding="utf-8") as f:
    content = f.read()

# Also, wait, let's see how the first copy happened:
# "mkdir -p app/internal && cp app/account/page.tsx app/internal/page.tsx"
# So the initial state is indeed the exact content of app/account/page.tsx!

print(f"Base file loaded. Length: {len(content)} chars.")

with open(transcript_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print(f"Read {len(lines)} lines from transcript.")

step_count = 0
for i, line in enumerate(lines):
    if "internal/page.tsx" not in line:
        continue
    try:
        obj = json.loads(line)
    except Exception:
        continue
    
    # Check if this is a model step with tool_calls
    tc_list = obj.get("tool_calls", [])
    if not tc_list:
        continue
        
    for tc in tc_list:
        name = tc.get("name", "")
        if name in ["replace_file_content", "multi_replace_file_content"]:
            args = tc.get("args", {})
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except:
                    pass
            target_file = args.get("TargetFile", "") or args.get("Target", "")
            if "internal/page.tsx" in target_file:
                # Wait, we need to verify if the tool call succeeded!
                # The next steps in transcript.jsonl should represent the tool outputs.
                # Let's search if the tool was successful.
                # In our transcript, since it's chronological, the tool output would be at some step after.
                # But actually, almost all of them in the main thread were successful except maybe some trailing ones.
                # Let's check if the target_content is present in our current reconstructed content.
                # If we are doing it chronologically, let's apply the edit.
                
                step_index = obj.get("step_index")
                if step_index > 2967:
                    print(f"Skipping step {step_index} to avoid corruption.")
                    continue
                
                if name == "replace_file_content":
                    target_content = args.get("TargetContent", "")
                    replacement_content = args.get("ReplacementContent", "")
                    allow_multiple = args.get("AllowMultiple", "false")
                    
                    if not target_content:
                        print(f"Step {step_index}: Empty target content, skipping.")
                        continue
                        
                    # Let's search for target_content in current content
                    occurrences = content.count(target_content)
                    if occurrences == 0:
                        # Maybe it is already replaced or this was a failed attempt. Let's see if we should skip or print a warning.
                        print(f"Step {step_index} ({name}): Target content not found in reconstructed file! Skipping.")
                        # print("Target Content snippet:", repr(target_content[:100]))
                        continue
                    
                    if occurrences > 1 and str(allow_multiple).lower() == "false":
                        print(f"Step {step_index} ({name}): Multiple occurrences ({occurrences}) found for unique replace! Replacing first one.")
                        content = content.replace(target_content, replacement_content, 1)
                    else:
                        print(f"Step {step_index} ({name}): Found {occurrences} occurrences. Replacing.")
                        content = content.replace(target_content, replacement_content)
                        
                    step_count += 1
                elif name == "multi_replace_file_content":
                    chunks = args.get("ReplacementChunks", [])
                    print(f"Step {step_index} ({name}): Applying {len(chunks)} chunks.")
                    for chunk in chunks:
                        tc = chunk.get("TargetContent", "")
                        rc = chunk.get("ReplacementContent", "")
                        am = chunk.get("AllowMultiple", False)
                        
                        occurrences = content.count(tc)
                        if occurrences == 0:
                            print(f"  Chunk target not found! Skipping chunk.")
                            continue
                        
                        if occurrences > 1 and not am:
                            content = content.replace(tc, rc, 1)
                        else:
                            content = content.replace(tc, rc)
                    step_count += 1

print(f"Reconstruction complete. Applied {step_count} edit steps.")
print(f"Final reconstructed content length: {len(content)} chars.")

# Save the reconstructed file
with open(output_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Reconstructed file written to {output_path}")
