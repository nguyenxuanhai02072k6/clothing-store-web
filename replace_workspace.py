import re

file_path = "/Users/apple/.gemini/antigravity/scratch/modern-fashion-ecommerce/app/internal/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find the starting marker for the digital-workspace tab
start_marker = "activeTab === 'digital-workspace' && ("
start_idx = content.find(start_marker)

if start_idx == -1:
    print("Could not find start marker!")
    exit(1)

# Now, let's count braces to find the matching closing parenthesis and brace
# The block looks like: {activeTab === 'digital-workspace' && (\n  <div>... \n  </div>\n)}
# We start counting braces right before activeTab, i.e., at '{'
open_brace_idx = content.rfind("{", 0, start_idx)
if open_brace_idx == -1:
    print("Could not find opening brace before start marker!")
    exit(1)

brace_count = 0
close_brace_idx = -1

for i in range(open_brace_idx, len(content)):
    char = content[i]
    if char == '{':
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0:
            close_brace_idx = i
            break

if close_brace_idx == -1:
    print("Could not find matching closing brace!")
    exit(1)

# The content to replace
target_block = content[open_brace_idx : close_brace_idx + 1]

replacement_content = """{/* --- AI MARKETING CAMPAIGN COPILOT & DISPATCH DESK --- */}
              {activeTab === 'campaigns' && (
                <CampaignCopilot currentUser={currentUser} usersList={usersList} />
              )}

              {/* --- PRODUCT CUSTOM DESIGNER STUDIO --- */}
              {activeTab === 'custom-designer' && (
                <ProductDesigner addGlobalProduct={addGlobalProduct} />
              )}"""

new_content = content[:open_brace_idx] + replacement_content + content[close_brace_idx + 1:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully replaced digital-workspace block!")
