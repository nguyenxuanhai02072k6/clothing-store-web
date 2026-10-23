'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

interface POSHotkeysModalProps {
  showHotkeysGuide: boolean;
  setShowHotkeysGuide: (v: boolean) => void;
}

export default function POSHotkeysModal({
  showHotkeysGuide,
  setShowHotkeysGuide
}: POSHotkeysModalProps) {
  return (
    <AnimatePresence>
      {showHotkeysGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl border shadow-xl p-6 w-full max-w-md text-neutral-800 space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-500" />
                Bảng Phím Tắt Quầy POS (KiotViet / Sapo Standard)
              </h3>
              <button
                onClick={() => setShowHotkeysGuide(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'F1', desc: 'Đưa con trỏ vào ô Tìm kiếm sản phẩm hoặc ô Barcode' },
                { key: 'F2', desc: 'Đưa con trỏ vào ô Tìm kiếm Khách hàng VIP Loyalty' },
                { key: 'F3', desc: 'Đưa con trỏ vào ô Nhập mã giảm giá / Voucher' },
                { key: 'F9', desc: 'Thực hiện Chốt đơn và in hóa đơn thanh toán tức thì' },
                { key: 'F10', desc: 'Mở lại và in hóa đơn khách hàng gần nhất' },
                { key: 'Ctrl + 1..5', desc: 'Chuyển đổi tức thì giữa tối đa 5 đơn hàng tạm thời (Cart Hold)' },
                { key: 'Esc', desc: 'Đóng hộp thoại / Hủy cửa sổ in bill' }
              ].map((hk) => (
                <div key={hk.key} className="flex items-center justify-between py-1 border-b border-neutral-100">
                  <kbd className="px-2.5 py-1 rounded-md bg-neutral-900 text-white font-mono font-bold text-[10px]">
                    {hk.key}
                  </kbd>
                  <span className="text-neutral-600 text-right">{hk.desc}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHotkeysGuide(false)}
              className="w-full py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 cursor-pointer"
            >
              Đã hiểu
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
