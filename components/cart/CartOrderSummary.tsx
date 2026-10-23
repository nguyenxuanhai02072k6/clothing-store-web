import React from 'react';
import Link from 'next/link';
import { Tag, Info, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

interface CartOrderSummaryProps {
  cart: any[];
  cartSubtotal: number;
  cartShipping: number;
  cartDiscount: number;
  cartTotal: number;
  appliedPromo: any;
}

export function CartOrderSummary({
  cart,
  cartSubtotal,
  cartShipping,
  cartDiscount,
  cartTotal,
  appliedPromo,
}: CartOrderSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
      <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-4 border-b border-brand-border mb-5">
        Tóm tắt đơn hàng
      </h3>

      <div className="flex flex-col gap-4 text-xs sm:text-sm text-brand-muted mb-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span>Tạm tính ({cart.reduce((s, i) => s + i.quantity, 0)} món)</span>
          <span className="font-semibold text-brand-text">{formatPrice(cartSubtotal)}</span>
        </div>

        {/* Shipping fee */}
        <div className="flex justify-between items-center">
          <span>Phí vận chuyển</span>
          {cartShipping === 0 ? (
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 text-[10px] uppercase tracking-widest">Miễn phí</span>
          ) : (
            <span className="font-semibold text-brand-text">{formatPrice(cartShipping)}</span>
          )}
        </div>

        {/* Promo code discount */}
        {cartDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-800 font-bold">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Giảm giá {appliedPromo?.code ? `(${appliedPromo.code})` : ''}
            </span>
            <span>-{formatPrice(cartDiscount)}</span>
          </div>
        )}

        {/* Dynamic Free Shipping Threshold Notice with Progress Bar */}
        {appliedPromo?.code !== 'FREESHIP' && (
          <div className="bg-neutral-50 p-4 rounded-xl border border-brand-border mt-2">
            <div className="flex items-start gap-2 text-[10px] leading-relaxed text-brand-text mb-2.5">
              <Info className="w-3.5 h-3.5 text-brand-muted shrink-0 mt-0.5" />
              {cartSubtotal < 500000 ? (
                <span>Mua thêm <strong className="text-brand-text font-bold">{formatPrice(500000 - cartSubtotal)}</strong> nữa để được <strong className="text-brand-text font-bold">miễn phí vận chuyển</strong> toàn quốc!</span>
              ) : (
                <span className="text-emerald-800 font-bold">Đơn hàng của bạn đã đủ điều kiện được MIỄN PHÍ VẬN CHUYỂN!</span>
              )}
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${cartSubtotal >= 500000 ? 'bg-emerald-800' : 'bg-brand-accent'}`}
                style={{ width: `${Math.min(100, (cartSubtotal / 500000) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="flex justify-between items-end pt-5 border-t border-brand-border mb-6">
        <span className="text-xs uppercase font-bold text-brand-text">Tổng thanh toán</span>
        <span className="text-lg md:text-xl font-bold text-brand-text leading-none">
          {formatPrice(cartTotal)}
        </span>
      </div>

      {/* Checkout CTA */}
      <Link
        href="/checkout"
        className="w-full bg-brand-accent text-white text-xs md:text-sm font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
      >
        Tiến hành thanh toán
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
