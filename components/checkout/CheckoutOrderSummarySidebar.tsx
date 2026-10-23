import React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { ShippingOption } from '../../lib/services/smartShippingEngine';

interface CheckoutOrderSummarySidebarProps {
  cart: any[];
  cartSubtotal: number;
  effectiveShippingFee: number;
  activeShippingOption?: ShippingOption;
  memberDiscount: number;
  cartDiscount: number;
  appliedPromo: any;
  effectiveTotal: number;
  isSubmitting: boolean;
  onOrderSubmit: (e: React.FormEvent) => void;
}

export function CheckoutOrderSummarySidebar({
  cart,
  cartSubtotal,
  effectiveShippingFee,
  activeShippingOption,
  memberDiscount,
  cartDiscount,
  appliedPromo,
  effectiveTotal,
  isSubmitting,
  onOrderSubmit,
}: CheckoutOrderSummarySidebarProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
      <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-4 border-b border-brand-border mb-5">
        Tóm tắt đơn hàng
      </h3>

      {/* List of scrollable items */}
      <div className="flex flex-col gap-4 max-h-60 overflow-y-auto mb-6 divide-y divide-brand-border">
        {cart.map((item, idx) => (
          <div key={item.id} className={`flex gap-3 pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
            <div className="relative w-12 aspect-[4/5] bg-brand-bg rounded-xl overflow-hidden border border-brand-border shrink-0">
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-grow">
              <h4 className="text-xs font-medium uppercase text-brand-text hover:text-brand-muted line-clamp-1 mb-1">{item.product.name}</h4>
              <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">
                Màu: <span className="lowercase text-brand-text">{item.selectedColor.name}</span> | Size: <span className="text-brand-text">{item.selectedSize}</span>
              </p>
              <div className="flex justify-between items-end mt-1 text-[10px] tracking-wide">
                <span className="text-brand-muted">Số lượng: {item.quantity}</span>
                <span className="font-bold text-brand-text">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="flex flex-col gap-3 text-xs text-brand-muted border-t border-brand-border pt-5 mb-5 font-light">
        <div className="flex justify-between items-center">
          <span>Tạm tính</span>
          <span className="font-semibold text-brand-text">{formatPrice(cartSubtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <span>Phí vận chuyển</span>
            {activeShippingOption && (
              <span className="text-[10px] text-brand-muted font-normal">({activeShippingOption.name})</span>
            )}
          </span>
          {effectiveShippingFee === 0 ? (
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 border border-emerald-100 rounded-full text-[10px] uppercase tracking-widest">Miễn phí</span>
          ) : (
            <span className="font-semibold text-brand-text">{formatPrice(effectiveShippingFee)}</span>
          )}
        </div>
        {memberDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-800 font-bold">
            <span>Chiết khấu VIP member</span>
            <span>-{formatPrice(memberDiscount)}</span>
          </div>
        )}
        {cartDiscount - memberDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-800 font-bold">
            <span>Voucher giảm giá {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
            <span>-{formatPrice(cartDiscount - memberDiscount)}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex justify-between items-end border-t border-brand-border pt-5 mb-6">
        <span className="text-xs uppercase font-bold text-brand-text">Tổng thanh toán</span>
        <span className="text-lg md:text-xl font-normal text-brand-text leading-none">
          {formatPrice(effectiveTotal)}
        </span>
      </div>

      {/* Final Order CTA button */}
      <button
        onClick={onOrderSubmit}
        disabled={isSubmitting}
        className="w-full bg-brand-accent hover:bg-neutral-800 text-white text-xs md:text-sm font-bold uppercase tracking-widest py-4.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Đang xử lý đặt hàng...</span>
          </div>
        ) : (
          <>
            Đặt hàng an toàn
            <ShieldCheck className="w-4.5 h-4.5" />
          </>
        )}
      </button>

      <span className="text-[10px] text-brand-muted text-center block mt-4 font-light leading-relaxed">
        Thanh toán được xử lý qua phương thức bạn chọn. NOVYN WEAR không lưu thông tin thẻ ngân hàng trên website.
      </span>
    </div>
  );
}
