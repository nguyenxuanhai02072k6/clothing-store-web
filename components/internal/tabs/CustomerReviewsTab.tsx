'use client';

import React, { useState } from 'react';
import { Star, Search, MessageSquare } from 'lucide-react';

export interface CustomerReviewsTabProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CustomerReviewsTab({ showToast }: CustomerReviewsTabProps) {
  const [reviewRatingFilter, setReviewRatingFilter] = useState<'all' | '5' | '4' | 'low'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewReplies, setReviewReplies] = useState<Record<string, string>>({
    'rev-1': 'Dạ NOVYN chân thành cảm ơn chị Vy đã tin chọn dòng sơ mi linen tự nhiên ạ! Chúc chị có những trải nghiệm thật tuyệt vời ạ. 🌿',
    'rev-2': 'NOVYN rất vui khi anh Mỹ hài lòng với đường may và phom dáng blazer. Sự hài lòng của anh là động lực để NOVYN hoàn thiện hơn mỗi ngày ạ!',
  });
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  const allReviews = [
    { id: 'rev-1', user: 'Lâm Khánh Vy', rating: 5, date: '2026-05-28', product: 'Áo Sơ Mi Linen Cao Cấp', content: 'Vải mặc cực kỳ mát, thấm hút mồ hôi tốt. Phom dáng rộng rãi thoải mái cực kỳ sang trọng!', status: 'verified', branch: 'Chi nhánh Quận 1' },
    { id: 'rev-2', user: 'Trần Văn Mỹ', rating: 5, date: '2026-05-27', product: 'Áo Khoác Blazer Relaxed Fit', content: 'Blazer phom đẹp, đứng dáng. Đường may tỉ mỉ, chất lượng Quiet Luxury đúng nghĩa.', status: 'verified', branch: 'Chi nhánh Thảo Điền' },
    { id: 'rev-3', user: 'Nguyễn Thị Lan', rating: 4, date: '2026-05-26', product: 'Quần tây nam Linen', content: 'Chất vải linen dệt thô mộc đẹp, mặc nhẹ tênh. Màu sắc nhã nhặn dễ phối đồ.', status: 'verified', branch: 'Chi nhánh Quận 1' },
    { id: 'rev-4', user: 'Đỗ Hoàng Anh', rating: 5, date: '2026-05-25', product: 'Đầm lụa Premium Silk', content: 'Đầm mặc lên tôn dáng lắm ạ, lụa mềm mại cực mát mẻ. Thích hợp đi tiệc nhẹ.', status: 'verified', branch: 'Chi nhánh Thảo Điền' },
    { id: 'rev-5', user: 'Hoàng Minh Quân', rating: 4, date: '2026-05-24', product: 'Áo Polo Dệt Kim Silk Knit', content: 'Chất vải mát, dệt knit mịn đẹp. Giao hàng nhanh, đóng gói hộp cứng rất sang trọng.', status: 'verified', branch: 'Chi nhánh Quận 1' },
    { id: 'rev-6', user: 'Phạm Phương Thảo', rating: 5, date: '2026-05-23', product: 'Chân váy Midi Lụa Xếp Ly', content: 'Váy bay bổng nhẹ nhàng, màu be pastel cực kỳ dễ phối cùng blazer hoặc sơ mi.', status: 'verified', branch: 'Chi nhánh Thảo Điền' }
  ];

  const filtered = allReviews.filter(r => {
    if (reviewRatingFilter === '5' && r.rating !== 5) return false;
    if (reviewRatingFilter === '4' && r.rating !== 4) return false;
    if (reviewRatingFilter === 'low' && r.rating > 3) return false;
    if (reviewSearchQuery.trim()) {
      const q = reviewSearchQuery.toLowerCase();
      return r.user.toLowerCase().includes(q) || r.product.toLowerCase().includes(q) || r.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-1 uppercase">Ý kiến & Phản hồi Khách hàng</h3>
          <p className="text-xs text-neutral-400">Theo dõi đánh giá chất lượng sản phẩm và phản hồi của người mua thực tế để cải tiến chất lượng dịch vụ.</p>
        </div>

        {/* Overall Metrics Pill */}
        <div className="flex items-center gap-3 bg-amber-50/60 border border-amber-200/80 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-base font-black text-neutral-900">4.8</span>
            <span className="text-xs text-neutral-400 font-bold">/ 5.0</span>
          </div>
          <div className="h-6 w-px bg-amber-200" />
          <span className="text-xs font-bold text-neutral-700">98.2% Hài lòng</span>
        </div>
      </div>

      {/* Summary Bento Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Tổng lượt đánh giá</span>
          <span className="text-xl font-black text-neutral-900">248</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Đánh giá 5 sao</span>
          <span className="text-xl font-black text-emerald-600">216 <span className="text-xs font-normal text-neutral-400">(87%)</span></span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Đã phản hồi CSKH</span>
          <span className="text-xl font-black text-sky-600">100%</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Tỷ lệ khiếu nại</span>
          <span className="text-xl font-black text-rose-500">0.8%</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tất cả (248)' },
            { id: '5', label: '5 Sao ★★★★★' },
            { id: '4', label: '4 Sao ★★★★' },
            { id: 'low', label: '≤ 3 Sao' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setReviewRatingFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                reviewRatingFilter === f.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white text-neutral-500 border border-neutral-200 hover:text-neutral-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên khách, sản phẩm..."
            value={reviewSearchQuery}
            onChange={(e) => setReviewSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white text-neutral-800 focus:outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-neutral-50 rounded-3xl p-10 text-center text-neutral-400">
            <Star className="w-8 h-8 text-neutral-300 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold">Không tìm thấy đánh giá nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          filtered.map((rev) => {
            const reply = reviewReplies[rev.id];
            const isReplying = activeReplyId === rev.id;

            return (
              <div key={rev.id} className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between gap-4 hover:border-neutral-200 transition-all">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-black text-neutral-900">{rev.user}</h4>
                      <p className="text-[9px] text-neutral-400 font-semibold mt-0.5">{rev.date} • {rev.product} • <span className="text-neutral-500 font-medium">{rev.branch}</span></p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-650 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">Đã mua hàng</span>
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

                  <p className="text-xs italic text-neutral-700 leading-relaxed font-medium bg-neutral-50/60 p-3 rounded-2xl border border-neutral-100">&ldquo;{rev.content}&rdquo;</p>

                  {/* Official CSKH Reply Box */}
                  {reply && (
                    <div className="mt-3 bg-sky-50/60 border border-sky-100 p-3 rounded-2xl text-[11px] text-sky-950 font-medium flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] text-sky-700 uppercase tracking-wider block mb-0.5">Phản hồi từ CSKH NOVYN:</span>
                        <span>{reply}</span>
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  {isReplying && (
                    <div className="mt-3 space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Nhập nội dung phản hồi chính thức từ CSKH..."
                        value={replyInput[rev.id] || ''}
                        onChange={(e) => setReplyInput(prev => ({ ...prev, [rev.id]: e.target.value }))}
                        className="w-full p-2.5 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 bg-neutral-50 text-neutral-900"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveReplyId(null)}
                          className="px-2.5 py-1 text-[10px] font-bold text-neutral-500 hover:text-neutral-800"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (replyInput[rev.id]?.trim()) {
                              setReviewReplies(prev => ({ ...prev, [rev.id]: replyInput[rev.id].trim() }));
                              setActiveReplyId(null);
                              showToast('Đã gửi phản hồi CSKH tới khách hàng!', 'success');
                            }
                          }}
                          className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-[10px] font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          Gửi phản hồi
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!isReplying && (
                  <div className="pt-2 border-t border-neutral-50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReplyId(rev.id);
                        if (reply && !replyInput[rev.id]) {
                          setReplyInput(prev => ({ ...prev, [rev.id]: reply }));
                        }
                      }}
                      className="text-[10px] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{reply ? 'Sửa phản hồi CSKH' : 'Viết phản hồi CSKH'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
