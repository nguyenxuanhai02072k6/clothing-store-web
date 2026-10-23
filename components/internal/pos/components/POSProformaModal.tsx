'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer } from 'lucide-react';
import { formatPrice } from '../../../../lib/utils';
import { CartTab } from '../posTypes';

interface POSProformaModalProps {
  showProformaModal: boolean;
  setShowProformaModal: (v: boolean) => void;
  activeTab: CartTab;
  currentUser: any;
  subtotal: number;
  vipDiscountAmt: number;
  promoDiscountAmt: number;
  finalTotal: number;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function POSProformaModal({
  showProformaModal,
  setShowProformaModal,
  activeTab,
  currentUser,
  subtotal,
  vipDiscountAmt,
  promoDiscountAmt,
  finalTotal,
  showToast
}: POSProformaModalProps) {
  return (
    <AnimatePresence>
      {showProformaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl border shadow-xl p-6 w-full max-w-sm text-neutral-800"
          >
            <div className="border-b-2 border-dashed pb-3 text-center space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                Phiếu Tạm Tính (Chưa thanh toán)
              </span>
              <h2 className="text-base font-black tracking-widest text-neutral-900 uppercase mt-1">
                NOVYN WEAR
              </h2>
              <p className="text-[10px] text-neutral-500">Đối chiếu hàng hóa tại quầy</p>
              <p className="text-[9px] font-mono text-neutral-400">
                {currentUser?.branch || 'Chi nhánh Quận 1'} • {new Date().toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="py-3 border-b-2 border-dashed space-y-2 text-xs max-h-56 overflow-y-auto">
              {activeTab.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-neutral-900 block truncate">{item.product.name}</span>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      Size {item.size} • SKU: {item.sku}
                    </span>
                  </div>
                  <span className="font-mono text-neutral-500 shrink-0">{item.quantity} x</span>
                  <span className="font-bold font-mono text-neutral-900 shrink-0 text-right w-20">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="py-3 border-b-2 border-dashed space-y-1 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Cộng tiền hàng</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>
              {vipDiscountAmt > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Chiết khấu VIP</span>
                  <span className="font-mono">-{formatPrice(vipDiscountAmt)}</span>
                </div>
              )}
              {promoDiscountAmt > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Voucher ({activeTab.promoCode})</span>
                  <span className="font-mono">-{formatPrice(promoDiscountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-neutral-900 text-sm pt-1">
                <span>TỔNG TẠM TÍNH</span>
                <span className="font-mono text-rose-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  showToast('✓ Đã gửi lệnh in phiếu tạm tính ra máy in nhiệt K80!', 'success');
                  setShowProformaModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                In phiếu
              </button>
              <button
                type="button"
                onClick={() => setShowProformaModal(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-bold transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
