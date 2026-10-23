import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

interface CheckoutSuccessModalProps {
  show: boolean;
  orderId: string;
  fullName: string;
  address: string;
  effectiveTotal: number;
  onFinish: () => void;
}

export function CheckoutSuccessModal({
  show,
  orderId,
  fullName,
  address,
  effectiveTotal,
  onFinish,
}: CheckoutSuccessModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onFinish}
            className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm"
          />

          {/* Success Card Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-brand-border z-10 flex flex-col items-center text-center overflow-hidden"
          >
            {/* Success Badge */}
            <div className="p-4 bg-neutral-100 rounded-2xl border border-brand-border text-emerald-800 mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>

            {/* Lời Cảm Ơn */}
            <h2 className="text-xl sm:text-2xl font-normal text-brand-text uppercase tracking-widest mb-2">
              Đặt hàng thành công!
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-6 max-w-sm font-light">
              Cảm ơn bạn đã lựa chọn mua sắm tại <strong className="text-brand-text font-normal uppercase">NOVYN WEAR</strong>. Đơn hàng của bạn đã được tiếp nhận thành công.
            </p>

            {/* Order Invoice info block */}
            <div className="bg-neutral-50 w-full p-5 rounded-2xl border border-brand-border flex flex-col gap-3 text-xs sm:text-sm text-brand-muted mb-8 max-w-md text-left font-light">
              <div className="grid grid-cols-3 pb-2.5 border-b border-brand-border">
                <span className="font-bold text-brand-text/70 uppercase text-[10px] tracking-wider">Mã đơn hàng</span>
                <span className="col-span-2 text-brand-text font-bold select-all font-mono">{orderId}</span>
              </div>
              <div className="grid grid-cols-3 pb-2.5 border-b border-brand-border">
                <span className="font-bold text-brand-text/70 uppercase text-[10px] tracking-wider">Người nhận</span>
                <span className="col-span-2 text-brand-text font-normal">{fullName}</span>
              </div>
              <div className="grid grid-cols-3 pb-2.5 border-b border-brand-border">
                <span className="font-bold text-brand-text/70 uppercase text-[10px] tracking-wider">Địa chỉ giao</span>
                <span className="col-span-2 text-brand-text leading-tight">{address}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="font-bold text-brand-text/70 uppercase text-[10px] tracking-wider">Tổng tiền</span>
                <span className="col-span-2 text-brand-text font-bold">{formatPrice(effectiveTotal)}</span>
              </div>
            </div>

            {/* CTA buttons */}
            <button
              onClick={onFinish}
              className="w-full max-w-md bg-brand-accent hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold uppercase tracking-widest py-4.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              Tiếp tục mua sắm
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
