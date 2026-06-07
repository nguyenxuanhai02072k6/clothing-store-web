import re

filepath = "./app/internal/page.tsx"

print(f"Reading {filepath}...")
with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Try simple pattern first
pattern_simple = r'</div>\s+</div>\s+</div>.*?n P\&L sản phẩm\.</p>\s+/\* METRICS WIDGETS \*/.*?TỔNG DOANH THU TOÀN HỆ THỐNG.*?DOANH THU THẢO ĐIỀN.*?</div>\s+</div>\s+</div>'

match = re.search(pattern_simple, content, re.DOTALL)
if match:
    print("Found match!")
    replacement = "</div>\n                        </div>\n                      </div>\n                    </div>"
    new_content = content.replace(match.group(0), replacement)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully replaced and saved!")
else:
    print("Could not find match with pattern_simple. Trying fallback...")
    taxes_idx = content.find("/* TAXES WIDGET */")
    td_idx = content.find("DOANH THU THẢO ĐIỀN", content.find("director-global-finance"))
    
    if taxes_idx != -1 and td_idx != -1:
        print(f"Found td_idx: {td_idx}, taxes_idx: {taxes_idx}")
        start_replace = content.rfind("<div", 0, td_idx)
        end_replace = content.rfind("</div>", 0, taxes_idx) + 6
        
        snippet = content[start_replace:end_replace]
        print("Snippet length to replace:", len(snippet))
        
        clean_td_card = """<div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-black text-neutral-400 block mb-1">DOANH THU THẢO ĐIỀN</span>
                          <h4 className="text-base font-black tracking-tight text-neutral-955">{formatPrice(tdRevenue)}</h4>
                        </div>
                        <div className="w-full bg-neutral-100 h-1 rounded-full mt-3 overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(tdRevenue / (totalRevenue || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>"""
        
        new_content = content[:start_replace] + clean_td_card + content[end_replace:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully replaced with fallback!")
