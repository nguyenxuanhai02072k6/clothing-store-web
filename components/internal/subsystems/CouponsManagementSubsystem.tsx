'use client';

import React, { useState } from 'react';
import { Tag, QrCode } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { VoucherQrViewModal } from '../../common/VoucherQrViewModal';
import { VoucherQrScannerModal } from '../../common/VoucherQrScannerModal';

export interface CouponsManagementSubsystemProps {
  currentUser: any;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CouponsManagementSubsystem: React.FC<CouponsManagementSubsystemProps> = ({
  currentUser,
  showToast,
}) => {
  const { dynamicPromos, addDynamicPromoCode, deleteDynamicPromoCode } = useCart();
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState<'percent' | 'fixed'>('percent');
  const [cpValue, setCpValue] = useState(0);
  const [cpDesc, setCpDesc] = useState('');
  const [selectedQrVoucher, setSelectedQrVoucher] = useState<any | null>(null);
  const [showErpVoucherScanner, setShowErpVoucherScanner] = useState(false);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpCode) return;
    if (addDynamicPromoCode) {
      addDynamicPromoCode(cpCode.toUpperCase(), cpType, cpValue, cpDesc);
      showToast(`✓ Đã tạo thành công mã giảm giá ${cpCode.toUpperCase()}`, 'success');
      setCpCode('');
      setCpValue(0);
      setCpDesc('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-neutral-800" />
            Quản lý mã giảm giá (Coupons & Voucher QR)
          </h3>
          <p className="text-xs text-neutral-450 mt-1">
            Phát hành mã giảm giá động cho các chiến dịch tiếp thị, in tem mã QR và quản lý mã coupon hiện hành.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowErpVoucherScanner(true)}
          className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-rose-400" />
          <span>Quét kiểm tra mã QR</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coupon Create Form */}
        {currentUser.role === 'director' && (
          <div className="lg:col-span-4 bg-white border rounded-3xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">
              Tạo mã giảm giá mới
            </h4>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-1">
                  Mã Coupon (Viết liền không dấu) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: LUKY2026, NOVYN10"
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white focus:outline-none font-bold uppercase text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Loại giảm giá</label>
                  <select
                    value={cpType}
                    onChange={(e) => setCpType(e.target.value as any)}
                    className="w-full px-3 py-2.5 border bg-white rounded-xl focus:outline-none font-bold text-neutral-850"
                  >
                    <option value="percent">Giảm (%)</option>
                    <option value="fixed">Giảm tiền (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-neutral-450 block mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    value={cpValue || ''}
                    onChange={(e) => setCpValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-xl bg-white focus:outline-none font-bold text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-450 block mb-1">
                  Mô tả / Điều kiện áp dụng *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Giảm 10% tổng giá trị đơn hàng..."
                  value={cpDesc}
                  onChange={(e) => setCpDesc(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl bg-white focus:outline-none font-semibold text-neutral-750"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 mt-2"
              >
                Tạo mã khuyến mãi
              </button>
            </form>
          </div>
        )}

        {/* Coupons List */}
        <div
          className={`${
            currentUser.role === 'director' ? 'lg:col-span-8' : 'lg:col-span-12'
          } bg-white border rounded-3xl p-5 shadow-sm space-y-4`}
        >
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-850">
            Danh sách mã giảm giá hiện có trên hệ thống
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(dynamicPromos || {}).map((promo: any) => (
              <div
                key={promo.code}
                className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/50 flex flex-col justify-between gap-3 relative overflow-hidden group"
              >
                <Tag className="w-16 h-16 text-neutral-100 absolute -right-3 -bottom-3 rotate-12 shrink-0 pointer-events-none group-hover:text-neutral-200/40 transition-colors" />

                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-neutral-900 text-white font-mono font-black text-xs uppercase tracking-wide">
                      {promo.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-rose-50 text-rose-650 border border-rose-100">
                      {promo.type === 'percent' ? `Giảm ${promo.value}%` : `Giảm ${formatPrice(promo.value)}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-semibold pt-1 leading-snug">
                    {promo.description}
                  </p>
                </div>

                <div className="relative z-10 flex justify-between items-center border-t border-neutral-200/40 pt-2.5 mt-1">
                  <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">
                    Trạng thái: Active
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedQrVoucher(promo)}
                      className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                      title="Xem và in mã QR Voucher"
                    >
                      <QrCode className="w-3 h-3 text-rose-400" />
                      <span>Mã QR</span>
                    </button>

                    {currentUser.role === 'director' &&
                      deleteDynamicPromoCode &&
                      promo.code !== 'FREESHIP' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${promo.code}"?`)) {
                              deleteDynamicPromoCode(promo.code);
                              showToast(`✓ Đã xóa mã giảm giá ${promo.code}`, 'info');
                            }
                          }}
                          className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg bg-rose-50 text-rose-650 border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer active:scale-95"
                        >
                          Xóa
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(dynamicPromos || {}).length === 0 && (
              <p className="col-span-2 text-center py-12 text-neutral-450 italic text-xs">
                Chưa có mã giảm giá động nào được phát hành.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* QR View & Scanner Modals */}
      <VoucherQrViewModal
        isOpen={!!selectedQrVoucher}
        onClose={() => setSelectedQrVoucher(null)}
        voucher={selectedQrVoucher}
      />
      <VoucherQrScannerModal
        isOpen={showErpVoucherScanner}
        onClose={() => setShowErpVoucherScanner(false)}
        onScanSuccess={(code) => {
          showToast(`✓ Đã nhận diện mã QR Voucher: ${code}`, 'success');
          if (dynamicPromos && dynamicPromos[code]) {
            setSelectedQrVoucher(dynamicPromos[code]);
          } else {
            setSelectedQrVoucher({ code, description: 'Mã voucher đã nhận diện từ máy quét QR' });
          }
        }}
        title="Quét kiểm tra mã QR Voucher"
        subtitle="Kiểm tra thông tin chiết khấu của voucher khách hàng"
      />
    </div>
  );
};
