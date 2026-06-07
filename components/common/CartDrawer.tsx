'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    updateQuantity,
    removeFromCart
  } = useCart();

  const router = useRouter();

  const handleCheckoutClick = () => {
    onClose();
    router.push('/checkout');
  };

  const handleCartPageClick = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col justify-between border-l border-brand-border"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg/20">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-850" />
                Giỏ hàng của bạn ({cartCount})
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Đóng giỏ hàng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-3">
                  <ShoppingBag className="w-10 h-10 text-neutral-200" />
                  <p className="text-xs text-neutral-400 font-bold">Giỏ hàng của bạn đang trống.</p>
                  <button
                    onClick={() => {
                      onClose();
                      router.push('/products');
                    }}
                    className="mt-4 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-neutral-850 transition-colors cursor-pointer"
                  >
                    Khám phá sản phẩm
                  </button>
                </div>
              ) : (
                <>
                  {/* Dynamic Free Shipping Threshold Notice */}
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-150 mb-6">
                    <div className="flex items-start gap-2 text-[10px] leading-relaxed text-neutral-800 mb-2 font-medium">
                      <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                      {cartSubtotal < 500000 ? (
                        <span>Mua thêm <strong className="text-neutral-900 font-bold">{formatPrice(500000 - cartSubtotal)}</strong> để được <strong className="text-neutral-900 font-bold">miễn phí vận chuyển</strong>!</span>
                      ) : (
                        <span className="text-[#10B981] font-bold">Đơn hàng đã được MIỄN PHÍ VẬN CHUYỂN!</span>
                      )}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${cartSubtotal >= 500000 ? 'bg-[#10B981]' : 'bg-neutral-400'}`}
                        style={{ width: `${Math.min(100, (cartSubtotal / 500000) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="flex flex-col gap-4 divide-y divide-neutral-100">
                    {cart.map((item, idx) => (
                      <div key={item.id} className={`flex gap-3 pt-4 ${idx === 0 ? 'pt-0 border-t-0' : ''} justify-between`}>
                        <div className="flex gap-3 min-w-0">
                          {/* Image */}
                          <div className="relative w-16 aspect-[4/5] bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200 shrink-0">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <h4 className="text-xs font-bold text-neutral-850 line-clamp-1 hover:text-neutral-550 transition-colors">
                                <Link href={`/products/${item.product.slug}`} onClick={onClose}>
                                  {item.product.name}
                                </Link>
                              </h4>
                              <p className="text-[9px] text-neutral-450 font-bold uppercase tracking-wider mt-0.5">
                                Màu: {item.selectedColor.name} | Size: {item.selectedSize}
                              </p>
                            </div>

                            {/* Quantity buttons */}
                            <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50/50 w-fit mt-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-700"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-7 text-center text-[10px] font-bold text-neutral-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-700"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Price & Trash */}
                        <div className="flex flex-col items-end justify-between text-right shrink-0">
                          <span className="text-xs font-bold text-neutral-900">{formatPrice(item.product.price * item.quantity)}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-neutral-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer Calculation Area */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-brand-border bg-white space-y-4">
                <div className="space-y-2 text-xs text-neutral-500 font-medium">
                  <div className="flex justify-between items-center">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-neutral-800">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Phí vận chuyển</span>
                    {cartShipping === 0 ? (
                      <span className="font-bold text-[#10B981] text-[10px] uppercase">Miễn phí</span>
                    ) : (
                      <span className="font-semibold text-neutral-800">{formatPrice(cartShipping)}</span>
                    )}
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between items-center text-[#10B981] font-bold">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(cartDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-3 border-t border-neutral-100 text-sm">
                    <span className="font-bold text-neutral-900 uppercase text-xs">Tổng thanh toán</span>
                    <span className="text-base font-black text-neutral-950">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleCartPageClick}
                    className="w-full text-center bg-white border border-brand-accent text-brand-accent text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl hover:bg-neutral-50 transition-all active:scale-95 cursor-pointer"
                  >
                    Xem giỏ hàng
                  </button>
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full text-center bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl hover:bg-neutral-850 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md"
                  >
                    Thanh toán
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
