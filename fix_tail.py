import os

filepath = "./app/internal/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find where cskh-reviews tab starts
idx = content.find("activeTab === 'cskh-reviews'")
if idx == -1:
    print("Could not find cskh-reviews in file!")
    exit(1)

# Back up until the comment before it
comment_idx = content.rfind("{/* --- CSKH REVIEWS --- */}", 0, idx)
if comment_idx == -1:
    comment_idx = content.rfind("// --- CSKH REVIEWS ---", 0, idx)
if comment_idx == -1:
    comment_idx = idx

# Everything before this comment is good
good_content = content[:comment_idx]

# Let's append the correct, clean cskh-reviews tab and the closing tags for the page
new_tail = """{/* --- CSKH REVIEWS --- */}
              {activeTab === 'cskh-reviews' && currentUser.role === 'cskh' && (
                <div>
                  <h3 className="text-lg font-black text-neutral-950 tracking-tight mb-2 uppercase">Ý kiến & Phản hồi Khách hàng</h3>
                  <p className="text-xs text-neutral-400 mb-8">Theo dõi đánh giá chất lượng sản phẩm và phản hồi của người mua thực tế để cải tiến chất lượng dịch vụ.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'rev-1', user: 'Lâm Khánh Vy', rating: 5, date: '2026-05-28', product: 'Áo Sơ Mi Linen Cao Cấp', content: 'Vải mặc cực kỳ mát, thấm hút mồ hôi tốt. Phom dáng rộng rãi thoải mái cực kỳ sang trọng!', status: 'verified' },
                      { id: 'rev-2', user: 'Trần Văn Mỹ', rating: 5, date: '2026-05-27', product: 'Áo Khoác Blazer Relaxed Fit', content: 'Blazer phom đẹp, đứng dáng. Đường may tỉ mỉ, chất lượng Quiet Luxury đúng nghĩa.', status: 'verified' },
                      { id: 'rev-3', user: 'Nguyễn Thị Lan', rating: 4, date: '2026-05-26', product: 'Quần tây nam Linen', content: 'Chất vải linen dệt thô mộc đẹp, mặc nhẹ tênh. Màu sắc nhã nhặn dễ phối đồ.', status: 'verified' },
                      { id: 'rev-4', user: 'Đỗ Hoàng Anh', rating: 5, date: '2026-05-25', product: 'Đầm lụa Premium Silk', content: 'Đầm mặc lên tôn dáng lắm ạ, lụa mềm mại cực mát mẻ. Thích hợp đi tiệc nhẹ.', status: 'verified' }
                    ].map((rev) => (
                      <div key={rev.id} className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-xs font-black text-neutral-900">{rev.user}</h4>
                              <p className="text-[9px] text-neutral-400 font-semibold">{rev.date} • {rev.product}</p>
                            </div>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">Đã mua hàng</span>
                          </div>
                          
                          <div className="flex gap-0.5 mb-2.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-xs italic text-neutral-600 leading-relaxed font-medium bg-neutral-50/50 p-3 rounded-2xl border border-neutral-50">&ldquo;{rev.content}&rdquo;</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
"""

with open(filepath, "w", encoding="utf-8") as f:
    f.write(good_content + new_tail)

print("Successfully fixed the tail of the page!")
