'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    appliedPromo,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;

    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoInput('');
    } else {
      setPromoError('Mã giảm giá không chính xác hoặc đã hết hạn.');
    }
  };

  const clickQuickPromo = (code: string) => {
    setPromoInput(code);
    applyPromoCode(code);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="inline-flex p-5 bg-neutral-100 rounded-2xl border border-brand-border mb-6 text-brand-muted">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-brand-text mb-2 uppercase">Giỏ hàng của bạn đang trống</h2>
          <p className="text-xs text-brand-muted mb-8 leading-relaxed">
            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng của mình. Hãy quay lại khám phá những bộ sưu tập thời thượng của chúng tôi ngay!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-neutral-800 transition-colors active:scale-95 shadow-sm"
          >
            Tiếp tục mua sắm
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Page Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-text tracking-tight uppercase mb-2">
          Giỏ Hàng Của Bạn
        </h1>
        <p className="text-xs text-brand-muted">
          Quản lý các sản phẩm bạn đã chọn trước khi tiến hành thanh toán đơn hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            
            {/* Header table labels */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-neutral-50 border-b border-brand-border text-xs font-bold uppercase tracking-widest text-brand-muted">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Tổng tiền</div>
            </div>

            {/* Items row list */}
            <div className="divide-y divide-brand-border">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-center"
                  >
                    
                    {/* Item product basic details */}
                    <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                      {/* Product image link */}
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative w-20 aspect-[4/5] bg-brand-bg rounded-xl overflow-hidden border border-brand-border shrink-0"
                      >
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </Link>
                      
                      {/* Name and variation attributes */}
                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-brand-text hover:text-brand-muted transition-colors mb-1.5 uppercase">
                          <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                        </h3>
                        <div className="flex flex-wrap gap-2 text-[10px] text-brand-muted font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1">
                            Màu:
                            <span
                              style={{ backgroundColor: item.selectedColor.hex }}
                              className="w-2.5 h-2.5 rounded-full inline-block border border-brand-border"
                            />
                            <span className="text-brand-text lowercase">{item.selectedColor.name}</span>
                          </span>
                          <span>|</span>
                          <span>Size: <span className="text-brand-text">{item.selectedSize}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Unit price tag */}
                    <div className="col-span-4 md:col-span-2 text-left md:text-center">
                      <span className="text-xs text-brand-muted font-bold md:hidden block mb-0.5">Đơn giá:</span>
                      <span className="text-xs sm:text-sm font-semibold text-brand-text">
                        {formatPrice(item.product.price)}
                      </span>
                    </div>

                    {/* Quantity selectors */}
                    <div className="col-span-5 md:col-span-2 flex justify-start md:justify-center">
                      <div className="flex items-center border border-brand-border rounded-xl bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2.5 text-brand-muted hover:text-brand-text"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-brand-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2.5 text-brand-muted hover:text-brand-text"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Final item price summary and remove button */}
                    <div className="col-span-3 md:col-span-2 flex flex-col md:flex-row items-end md:items-center justify-between md:justify-end gap-3 text-right">
                      <div>
                        <span className="text-xs text-brand-muted font-bold md:hidden block mb-0.5">Tổng tiền:</span>
                        <span className="text-xs sm:text-sm font-bold text-brand-text">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-brand-muted hover:text-rose-600 rounded-xl hover:bg-rose-50/50 transition-colors ml-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Back button */}
          <Link
            href="/products"
            className="text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors self-start py-2 border-b border-brand-border"
          >
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {/* Right Column: Order Summary (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Billing breakdown */}
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

          {/* Promo code box */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-muted" />
              Mã giảm giá
            </h3>

            {appliedPromo ? (
              // Active coupon badge
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-medium">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold uppercase block">{appliedPromo.code}</span>
                    <span className="text-[10px] text-emerald-600">{appliedPromo.description}</span>
                  </div>
                </div>
                <button
                  onClick={removePromoCode}
                  className="p-1 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/50 transition-colors"
                  aria-label="Remove code"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Promo input form
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mã giảm giá..."
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    setPromoError('');
                  }}
                  className="bg-neutral-50 border border-brand-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-accent focus:bg-white w-full uppercase text-brand-text"
                />
                <button
                  type="submit"
                  disabled={!promoInput.trim()}
                  className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Áp dụng
                </button>
              </form>
            )}

            {promoError && (
              <p className="text-[10px] font-bold text-rose-600 mt-2">{promoError}</p>
            )}

            {/* Quick Demo Coupons Selector */}
            {!appliedPromo && (
              <div className="mt-4 pt-4 border-t border-brand-border">
                <span className="text-[10px] font-bold uppercase text-brand-muted block mb-2">Mã giảm giá có sẵn:</span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => clickQuickPromo('SALE10')}
                    className="text-left p-2.5 rounded-xl bg-neutral-50 hover:bg-brand-bg transition-colors border border-brand-border flex items-center justify-between text-[10px] text-brand-text font-bold"
                  >
                    <span>🎁 SALE10 (Giảm 10%)</span>
                    <span className="text-brand-muted hover:text-brand-text underline text-[9px] uppercase tracking-wider">Áp dụng nhanh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => clickQuickPromo('FREESHIP')}
                    className="text-left p-2.5 rounded-xl bg-neutral-50 hover:bg-brand-bg transition-colors border border-brand-border flex items-center justify-between text-[10px] text-brand-text font-bold"
                  >
                    <span>🚚 FREESHIP (Miễn ship)</span>
                    <span className="text-brand-muted hover:text-brand-text underline text-[9px] uppercase tracking-wider">Áp dụng nhanh</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
