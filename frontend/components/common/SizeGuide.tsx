'use client';

import React, { useState } from 'react';
import { X, Ruler, HelpCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuide: React.FC<SizeGuideProps> = ({ isOpen, onClose, category = 'Tops' }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'estimator' | 'measure'>('chart');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null);

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setEstimatedSize(null);
      return;
    }

    let size = 'M'; // Default fallback
    if (category.toLowerCase() === 'bottoms') {
      if (h < 162) {
        if (w < 48) size = '28 (XS)';
        else if (w < 55) size = '29 (S)';
        else size = '30 (M)';
      } else if (h < 170) {
        if (w < 56) size = '29 (S)';
        else if (w < 64) size = '30 (M)';
        else size = '31 (L)';
      } else if (h < 177) {
        if (w < 64) size = '30 (M)';
        else if (w < 74) size = '32 (XL)';
        else size = '33 (XXL)';
      } else {
        if (w < 75) size = '32 (XL)';
        else size = '33 (XXL)';
      }
    } else {
      // Tops, Dresses, Outerwear
      if (h < 162) {
        if (w < 50) size = 'S';
        else if (w < 58) size = 'M';
        else size = 'L';
      } else if (h < 170) {
        if (w < 58) size = 'S';
        else if (w < 66) size = 'M';
        else size = 'L';
      } else if (h < 177) {
        if (w < 66) size = 'M';
        else if (w < 75) size = 'L';
        else size = 'XL';
      } else {
        if (w < 76) size = 'L';
        else size = 'XL';
      }
    }

    setEstimatedSize(size);
  };

  const handleResetEstimator = () => {
    setHeight('');
    setWeight('');
    setEstimatedSize(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-brand-card w-full max-w-lg rounded-3xl border border-brand-border z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
              <div className="flex items-center gap-2 text-brand-text">
                <Ruler className="w-5 h-5 text-neutral-800" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-sans">
                  Hướng dẫn chọn size
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-neutral-450 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                aria-label="Đóng bảng hướng dẫn size"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-brand-border text-xs bg-white">
              <button
                onClick={() => setActiveTab('chart')}
                className={`flex-1 text-center py-3 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === 'chart'
                    ? 'border-brand-accent text-brand-accent bg-neutral-50/30'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Bảng quy đổi
              </button>
              <button
                onClick={() => setActiveTab('estimator')}
                className={`flex-1 text-center py-3 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === 'estimator'
                    ? 'border-brand-accent text-brand-accent bg-neutral-50/30'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Tính size nhanh
              </button>
              <button
                onClick={() => setActiveTab('measure')}
                className={`flex-1 text-center py-3 font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === 'measure'
                    ? 'border-brand-accent text-brand-accent bg-neutral-50/30'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                Cách đo cơ thể
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 font-sans text-xs sm:text-sm text-neutral-600">
              {activeTab === 'chart' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-2 uppercase text-[10px] tracking-wider">
                      Phân hạng phom dáng (Fit Profile)
                    </h4>
                    <p className="text-neutral-500 leading-relaxed">
                      Sản phẩm được thiết kế theo phom **Relaxed Fit** phóng khoáng, thoải mái. Vai hơi trễ nhẹ, độ rộng thân áo vừa vặn tạo cảm giác cử động tự nhiên nhất.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-brand-border">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-brand-bg text-neutral-500 font-bold uppercase tracking-wider text-[9px] border-b border-brand-border">
                          <th className="p-3">Kích cỡ</th>
                          <th className="p-3">Chiều cao (cm)</th>
                          <th className="p-3">Cân nặng (kg)</th>
                          <th className="p-3">Rộng vai (cm)</th>
                          <th className="p-3">Vòng ngực (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {[
                          { size: 'S', h: '150 - 162', w: '45 - 55', shoulder: '42', chest: '84 - 88' },
                          { size: 'M', h: '162 - 170', w: '55 - 65', shoulder: '44', chest: '88 - 92' },
                          { size: 'L', h: '170 - 177', w: '65 - 75', shoulder: '46', chest: '92 - 96' },
                          { size: 'XL', h: '177 - 185', w: '75 - 85', shoulder: '48', chest: '96 - 100' },
                        ].map((row) => (
                          <tr key={row.size} className="hover:bg-neutral-50/50">
                            <td className="p-3 font-bold text-neutral-900">{row.size}</td>
                            <td className="p-3">{row.h}</td>
                            <td className="p-3">{row.w}</td>
                            <td className="p-3">{row.shoulder}</td>
                            <td className="p-3">{row.chest}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-neutral-50 border border-brand-border p-4 rounded-2xl flex gap-3">
                    <HelpCircle className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-900 text-[10px] uppercase block tracking-wider mb-1">
                        Lưu ý chọn cỡ
                      </span>
                      <p className="text-neutral-500 leading-relaxed text-xs">
                        Nếu bạn phân vân giữa hai kích thước, hãy ưu tiên chọn size lớn hơn để có cảm giác thoải mái bay rủ tốt nhất đặc biệt với dòng sản phẩm vải Linen.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'estimator' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-2 uppercase text-[10px] tracking-wider">
                      Công cụ ước lượng size tự động (Fit Finder)
                    </h4>
                    <p className="text-neutral-500 leading-relaxed text-xs mb-4">
                      Vui lòng nhập chiều cao và cân nặng thực tế để hệ thống đưa ra đề xuất phù hợp nhất cho dòng sản phẩm **{category}**.
                    </p>
                  </div>

                  {!estimatedSize ? (
                    <form onSubmit={handleEstimate} className="space-y-4 max-w-sm mx-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-neutral-400">Chiều cao (cm)</label>
                          <input
                            type="number"
                            required
                            placeholder="Ví dụ: 168"
                            min="100"
                            max="250"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs text-neutral-850 focus:outline-none focus:border-neutral-950 focus:bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase text-neutral-400">Cân nặng (kg)</label>
                          <input
                            type="number"
                            required
                            placeholder="Ví dụ: 58"
                            min="30"
                            max="200"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs text-neutral-850 focus:outline-none focus:border-neutral-950 focus:bg-white"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-850 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 rounded-xl shadow-md"
                      >
                        <User className="w-4 h-4" />
                        Đề xuất kích cỡ phù hợp
                      </button>
                    </form>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8 bg-neutral-50 border border-brand-border max-w-sm mx-auto flex flex-col items-center rounded-2xl"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Kích cỡ đề xuất của bạn là:</span>
                      <h4 className="text-4xl font-black text-neutral-950 font-sans tracking-tight mb-4">{estimatedSize}</h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleResetEstimator}
                          className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 active:scale-95 cursor-pointer bg-white rounded-xl"
                        >
                          Nhập lại
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'measure' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-2 uppercase text-[10px] tracking-wider">
                      Hướng dẫn tự đo các thông số cơ thể
                    </h4>
                    <p className="text-neutral-500 leading-relaxed text-xs">
                      Để có số đo chuẩn nhất, bạn nên dùng thước dây mềm và đứng thả lỏng cơ thể.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-800 shrink-0">1</span>
                      <div>
                        <h5 className="text-xs font-bold text-neutral-900 mb-0.5">Vòng ngực</h5>
                        <p className="text-xs text-neutral-500 leading-relaxed">Đo vòng quanh điểm lớn nhất của ngực, giữ thước song song với mặt sàn.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-800 shrink-0">2</span>
                      <div>
                        <h5 className="text-xs font-bold text-neutral-900 mb-0.5">Vòng eo</h5>
                        <p className="text-xs text-neutral-500 leading-relaxed">Đo quanh phần hẹp nhất của eo (thường là ngay trên rốn).</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-800 shrink-0">3</span>
                      <div>
                        <h5 className="text-xs font-bold text-neutral-900 mb-0.5">Vòng mông</h5>
                        <p className="text-xs text-neutral-500 leading-relaxed">Khép hai chân lại và đo xung quanh phần nở nhất của mông.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-brand-border bg-brand-bg/30 text-center">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                Cần tư vấn trực tiếp? Liên hệ Hotline 1900 8899
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
