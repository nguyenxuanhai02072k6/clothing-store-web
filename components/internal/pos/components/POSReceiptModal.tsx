'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download } from 'lucide-react';
import { formatPrice } from '../../../../lib/utils';

interface POSReceiptModalProps {
  printedReceipt: any | null;
  setPrintedReceipt: (receipt: any | null) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function POSReceiptModal({
  printedReceipt,
  setPrintedReceipt,
  showToast
}: POSReceiptModalProps) {
  const [receiptMail, setReceiptMail] = useState('');

  return (
    <AnimatePresence>
      {printedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl border shadow-2xl p-6 w-full max-w-sm overflow-hidden text-neutral-800"
          >
            {/* K80 Thermal Receipt Body */}
            <div className="border-b-2 border-dashed pb-3 text-center space-y-1">
              <h2 className="text-lg font-black tracking-widest text-neutral-900 uppercase">
                NOVYN WEAR
              </h2>
              <p className="text-[10px] text-neutral-500 font-medium">Quiet Luxury Minimalist Apparel</p>
              <p className="text-[9px] font-mono text-neutral-400 mt-1">{printedReceipt.branch}</p>
              <p className="text-[8px] text-neutral-400 font-mono">
                HĐ: {printedReceipt.id} • {printedReceipt.date}
              </p>
            </div>

            <div className="py-3 border-b-2 border-dashed space-y-2 text-xs max-h-52 overflow-y-auto">
              {printedReceipt.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start font-medium">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-neutral-900 block truncate">{item.productName}</span>
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
              <div className="flex justify-between font-medium text-neutral-600">
                <span>Cộng tiền hàng</span>
                <span className="font-mono">{formatPrice(printedReceipt.subtotal)}</span>
              </div>
              {printedReceipt.vipDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Chiết khấu VIP</span>
                  <span className="font-mono">-{formatPrice(printedReceipt.vipDiscount)}</span>
                </div>
              )}
              {printedReceipt.promoDiscount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Giảm giá Voucher</span>
                  <span className="font-mono">-{formatPrice(printedReceipt.promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-neutral-900 text-sm pt-1.5 border-t">
                <span>TỔNG THANH TOÁN</span>
                <span className="font-mono text-rose-600">{formatPrice(printedReceipt.total)}</span>
              </div>
              {printedReceipt.paymentMethod === 'cash' && (
                <div className="pt-1 text-[11px] space-y-0.5 text-neutral-500">
                  <div className="flex justify-between">
                    <span>Tiền khách đưa:</span>
                    <span className="font-mono font-bold">{formatPrice(printedReceipt.cashTendered)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>Tiền thừa trả:</span>
                    <span className="font-mono">{formatPrice(printedReceipt.changeDue)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="py-3 text-center text-[10px] text-neutral-500 font-medium space-y-0.5">
              <p>
                Hình thức: <span className="font-bold uppercase text-neutral-800">{printedReceipt.paymentMethod}</span>
              </p>
              <p>
                Khách hàng: <span className="font-bold text-neutral-800">{printedReceipt.customerName}</span> (
                {printedReceipt.customerPhone})
              </p>
              <p>
                Thu ngân: <span className="font-bold text-neutral-800">{printedReceipt.cashierName}</span>
              </p>
              <p className="mt-2 text-[8.5px] italic text-neutral-400">
                * Đổi hàng trong 7 ngày kèm hóa đơn còn nguyên mác *
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                    showToast('✓ Đang in hóa đơn nhiệt K80...', 'success');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In hóa đơn
                </button>
                <button
                  onClick={() => {
                    showToast('✓ Đã tải file PDF hóa đơn điện tử!', 'success');
                  }}
                  className="px-3 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  title="Tải PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Email E-Bill */}
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder="Nhập email khách để gửi E-Bill..."
                  value={receiptMail}
                  onChange={(e) => setReceiptMail(e.target.value)}
                  className="flex-1 px-3 py-1.5 border rounded-xl text-xs bg-white text-neutral-800 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!receiptMail.trim()) return;
                    showToast(`✓ Đã gửi hóa đơn điện tử tới ${receiptMail}!`, 'success');
                    setReceiptMail('');
                  }}
                  className="bg-neutral-950 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl hover:bg-neutral-800 cursor-pointer"
                >
                  Gửi
                </button>
              </div>

              <button
                onClick={() => setPrintedReceipt(null)}
                className="w-full py-2 bg-neutral-100 text-neutral-700 text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer mt-1"
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
