'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductFitFinderModalProps {
  showFitFinder: boolean;
  setShowFitFinder: (v: boolean) => void;
  handleCalculateSize: (e: React.FormEvent) => void;
  userHeight: string;
  setUserHeight: (h: string) => void;
  userWeight: string;
  setUserWeight: (w: string) => void;
  recommendedSize: string | null;
  setRecommendedSize: (s: string | null) => void;
  handleApplyRecommendedSize: () => void;
}

export default function ProductFitFinderModal({
  showFitFinder,
  setShowFitFinder,
  handleCalculateSize,
  userHeight,
  setUserHeight,
  userWeight,
  setUserWeight,
  recommendedSize,
  setRecommendedSize,
  handleApplyRecommendedSize
}: ProductFitFinderModalProps) {
  return (
    <AnimatePresence>
      {showFitFinder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFitFinder(false)}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs cursor-pointer"
          />
          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-border z-10 flex flex-col gap-6 overflow-hidden text-left"
          >
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block mb-0.5">
                  💡 Novyn Wear Smart Fit
                </span>
                <h3 className="text-lg font-bold text-brand-text uppercase tracking-tight">AI Fit Finder</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFitFinder(false)}
                className="w-8 h-8 rounded-xl border border-brand-border flex items-center justify-center text-brand-muted hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCalculateSize} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Chiều cao của bạn (cm) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  max={250}
                  placeholder="Ví dụ: 172"
                  value={userHeight}
                  onChange={(e) => {
                    setUserHeight(e.target.value);
                    setRecommendedSize(null);
                  }}
                  className="bg-white border border-brand-border rounded-xl px-4 py-3 text-xs text-brand-text focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Cân nặng của bạn (kg) *</label>
                <input
                  type="number"
                  required
                  min={30}
                  max={200}
                  placeholder="Ví dụ: 65"
                  value={userWeight}
                  onChange={(e) => {
                    setUserWeight(e.target.value);
                    setRecommendedSize(null);
                  }}
                  className="bg-white border border-brand-border rounded-xl px-4 py-3 text-xs text-brand-text focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full"
                />
              </div>

              <button
                type="submit"
                className="bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 mt-2"
              >
                <span>Tính toán kích cỡ gợi ý</span>
                <span>📐</span>
              </button>
            </form>

            {/* Suggestions Results Display */}
            <AnimatePresence>
              {recommendedSize && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-neutral-50 border border-brand-border rounded-2xl p-5 flex flex-col gap-4 overflow-hidden"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block mb-0.5">
                        Kích cỡ đề xuất AI
                      </span>
                      <span className="text-2xl font-black text-brand-text">Size {recommendedSize}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest shrink-0">
                      Vừa vặn 98%
                    </span>
                  </div>

                  <p className="text-xs text-brand-muted font-light leading-relaxed">
                    Dựa trên chiều cao <strong>{userHeight} cm</strong> và cân nặng <strong>{userWeight} kg</strong>, hệ thống khuyến nghị bạn mặc <strong>Size {recommendedSize}</strong> để có form dáng chuẩn đẹp và thoải mái nhất.
                  </p>

                  <button
                    type="button"
                    onClick={handleApplyRecommendedSize}
                    className="w-full bg-brand-accent hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>Áp dụng kích cỡ gợi ý</span>
                    <span>✓</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
