'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star } from 'lucide-react';
import { Product } from '../../../types';
import { getMaterialText, getCareInstructions, renderSizeTable } from './productDetailHelpers';

interface ProductAccordionSectionProps {
  product: Product;
  activeAccordion: string | null;
  toggleAccordion: (tab: string) => void;
  dynamicRating: number;
  dynamicReviewsCount: number;
  ratingDistribution: Array<{ stars: number; pct: number; count: number }>;
  reviewsData: any[];
  showWriteReview: boolean;
  setShowWriteReview: (v: boolean) => void;
  handleSubmitReview: (e: React.FormEvent) => void;
  newReviewName: string;
  setNewReviewName: (v: string) => void;
  newReviewRating: number;
  setNewReviewRating: (v: number) => void;
  newReviewComment: string;
  setNewReviewComment: (v: string) => void;
}

export default function ProductAccordionSection({
  product,
  activeAccordion,
  toggleAccordion,
  dynamicRating,
  dynamicReviewsCount,
  ratingDistribution,
  reviewsData,
  showWriteReview,
  setShowWriteReview,
  handleSubmitReview,
  newReviewName,
  setNewReviewName,
  newReviewRating,
  setNewReviewRating,
  newReviewComment,
  setNewReviewComment
}: ProductAccordionSectionProps) {
  return (
    <section className="mb-24 border-t border-brand-border pt-10">
      <div className="max-w-3xl">
        {/* Tab 1: Mô tả chi tiết */}
        <div className="border-b border-brand-border py-4">
          <button
            onClick={() => toggleAccordion('desc')}
            className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
          >
            <span>Mô tả sản phẩm</span>
            <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'desc' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === 'desc' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed pt-2 pb-4 font-medium">
                  {product.description} Cửa hàng cam kết tất cả sợi dệt và vật liệu đều được kiểm định an toàn nghiêm ngặt theo tiêu chuẩn quốc tế. Từng sản phẩm của NOVYN WEAR đều chứa đựng sự chăm chút tỉ mỉ từ tay nghề nghệ nhân Việt để đem đến sự hài lòng tối đa khi tới tay khách hàng.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab 2: Chất liệu & form dáng */}
        <div className="border-b border-brand-border py-4">
          <button
            onClick={() => toggleAccordion('material')}
            className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
          >
            <span>Chất liệu & phom dáng</span>
            <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'material' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === 'material' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="text-sm text-brand-muted leading-relaxed pt-2 pb-4 font-normal">
                  {getMaterialText(product)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab 3: Hướng dẫn chọn size */}
        <div className="border-b border-brand-border py-4">
          <button
            onClick={() => toggleAccordion('size-guide')}
            className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
          >
            <span>Hướng dẫn chọn size</span>
            <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'size-guide' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === 'size-guide' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-4 text-sm text-brand-muted leading-relaxed font-normal space-y-2">
                  <p className="font-bold text-brand-text uppercase tracking-widest text-[9px] mb-1">📐 BẢNG THÔNG SỐ KÍCH THƯỚC (SIZE CHART)</p>
                  {renderSizeTable(product.category)}

                  <div className="mt-3 pt-3 border-t border-brand-border">
                    <p>• <strong>Size S:</strong> Chiều cao 1m50 - 1m62, Cân nặng 45kg - 55kg.</p>
                    <p>• <strong>Size M:</strong> Chiều cao 1m62 - 1m70, Cân nặng 55kg - 65kg.</p>
                    <p>• <strong>Size L:</strong> Chiều cao 1m70 - 1m77, Cân nặng 65kg - 75kg.</p>
                    <p>• <strong>Size XL:</strong> Chiều cao 1m77 - 1m85, Cân nặng 75kg - 85kg.</p>
                  </div>
                  <p className="text-xs text-brand-text bg-neutral-50 p-4 rounded-xl border border-brand-border mt-3 font-normal leading-normal">
                    💡 Mẹo nhỏ: Novyn Wear hỗ trợ tư vấn chọn size hoàn toàn miễn phí trực tiếp qua Hotline 1900 8899 hoặc Chatbox để giúp bạn tìm thấy phom dáng vừa vặn nhất.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab 4: Hướng dẫn bảo quản */}
        <div className="border-b border-brand-border py-4">
          <button
            onClick={() => toggleAccordion('care')}
            className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
          >
            <span>Hướng dẫn bảo quản</span>
            <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'care' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === 'care' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-4 text-sm text-brand-muted leading-relaxed font-normal space-y-1">
                  {getCareInstructions(product).map((inst, index) => (
                    <p key={index}>• {inst}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab 5: Chính sách đổi trả */}
        <div className="border-b border-brand-border py-4">
          <button
            onClick={() => toggleAccordion('return')}
            className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
          >
            <span>Chính sách đổi trả</span>
            <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'return' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === 'return' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-4 text-sm text-brand-muted leading-relaxed font-normal space-y-1.5">
                  <p>• Hỗ trợ đổi size hoặc màu sắc miễn phí trong vòng 7 ngày kể từ khi nhận hàng.</p>
                  <p>• Sản phẩm gửi đổi cần giữ nguyên tem tag nhãn hiệu, hóa đơn mua lẻ và chưa qua sử dụng hay giặt là.</p>
                  <p>• Áp dụng đổi size hoặc đổi sang mẫu mới có giá trị tương đương hoặc cao hơn.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab 6: Đánh giá */}
        <div className="border-b border-brand-border py-4">
          <button
            onClick={() => toggleAccordion('reviews')}
            className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
          >
            <span>Đánh giá từ khách hàng ({dynamicReviewsCount})</span>
            <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'reviews' ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {activeAccordion === 'reviews' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-6">
                  {/* Review Overview Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-brand-border mb-10 items-center">
                    {/* Large Score Column */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center text-center md:border-r border-brand-border/60 md:pr-8 py-2">
                      <span className="text-5xl font-bold text-brand-text tracking-tight mb-2">
                        {dynamicRating}
                      </span>
                      <div className="flex items-center text-amber-500 gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 fill-current ${
                              i < Math.floor(dynamicRating) ? 'text-amber-500' : 'text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-brand-muted font-bold">
                        {dynamicReviewsCount} đánh giá thực tế
                      </p>
                      <p className="text-[10px] text-brand-muted mt-1">
                        100% người mua hài lòng với sản phẩm
                      </p>
                    </div>

                    {/* Star Distribution Column */}
                    <div className="md:col-span-8 flex flex-col gap-2.5">
                      {ratingDistribution.map((row) => (
                        <div key={row.stars} className="flex items-center gap-3 text-xs">
                          <span className="w-3 font-bold text-brand-text">{row.stars}</span>
                          <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                          <div className="flex-1 h-2 bg-neutral-100 border border-brand-border rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${row.pct}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-brand-accent"
                            />
                          </div>
                          <span className="w-8 text-right text-brand-muted font-bold">{row.pct}%</span>
                          <span className="w-10 text-right text-brand-muted font-medium text-[10px]">({row.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Filter Tags (aesthetic only) */}
                  <div className="flex flex-wrap gap-2 mb-8 justify-between items-center w-full">
                    <div className="flex flex-wrap gap-2">
                      {['Tất cả', `Hình ảnh/Video (${Math.round(dynamicReviewsCount * 0.4)})`, `5 Sao (${reviewsData.filter((r) => r.rating === 5).length})`, 'Có phản hồi từ NOVYN WEAR'].map((tag, idx) => (
                        <span
                          key={tag}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            idx === 0
                              ? 'bg-brand-accent text-white border border-brand-accent shadow-none'
                              : 'bg-white text-brand-muted border border-brand-border hover:bg-brand-bg'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowWriteReview(!showWriteReview)}
                      className="bg-brand-accent text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-850 active:scale-95 transition-all cursor-pointer shadow-sm"
                    >
                      {showWriteReview ? 'Đóng form' : 'Viết đánh giá'}
                    </button>
                  </div>

                  {/* Review Form */}
                  <AnimatePresence>
                    {showWriteReview && (
                      <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleSubmitReview}
                        className="bg-neutral-50 p-5 rounded-2xl border border-brand-border mb-8 flex flex-col gap-4 overflow-hidden"
                      >
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">Gửi nhận xét của bạn</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Tên của bạn *</label>
                            <input
                              type="text"
                              required
                              value={newReviewName}
                              onChange={(e) => setNewReviewName(e.target.value)}
                              placeholder="Nhập tên của bạn..."
                              className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent focus:bg-neutral-50"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Đánh giá số sao *</label>
                            <div className="flex items-center gap-1.5 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewReviewRating(star)}
                                  className="text-amber-500 hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none"
                                >
                                  <Star className={`w-5 h-5 ${star <= newReviewRating ? 'fill-current' : 'text-neutral-200'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-brand-muted uppercase">Nhận xét chi tiết *</label>
                          <textarea
                            rows={3}
                            required
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                            placeholder="Nhập nhận xét của bạn về sản phẩm (chất liệu, đường may, form dáng...)"
                            className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent focus:bg-neutral-50 resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-brand-accent text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer w-fit px-6 shadow-sm active:scale-95"
                        >
                          Gửi đánh giá
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Detailed Review List */}
                  <div className="space-y-6">
                    {reviewsData.map((review, idx) => (
                      <div
                        key={idx}
                        className="pb-6 border-b border-brand-border last:border-0 last:pb-0 flex flex-col gap-3"
                      >
                        {/* Reviewer Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-full ${review.avatarColor || 'bg-neutral-100 text-neutral-500 border border-neutral-200'} font-bold flex items-center justify-center text-xs shrink-0 shadow-sm uppercase`}>
                              {review.name.split(' ').map((n: string) => n[0]).join('').slice(-2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-brand-text">{review.name}</span>
                                {review.verified && (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                                    Đã mua hàng
                                  </span>
                                )}
                              </div>
                              <div className="flex text-amber-500 gap-0.5 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 fill-current ${
                                      i < review.rating ? 'text-amber-500' : 'text-neutral-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-brand-muted font-normal block">
                                {review.variant}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-brand-muted font-normal">{review.date}</span>
                        </div>

                        {/* Comment Text */}
                        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-normal">
                          {review.comment}
                        </p>

                        {/* Action / Feedback row */}
                        <div className="flex items-center gap-4 text-[10px] text-brand-muted font-normal">
                          <button className="hover:text-brand-text transition-colors flex items-center gap-1 active:scale-95 cursor-pointer">
                            <span>Hữu ích ({review.helpfulCount})</span>
                          </button>
                          <span>•</span>
                          <button className="hover:text-brand-text transition-colors active:scale-95 cursor-pointer">
                            Báo cáo vi phạm
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
