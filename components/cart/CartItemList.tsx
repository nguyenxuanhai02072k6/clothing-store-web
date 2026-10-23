import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

interface CartItemListProps {
  cart: any[];
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
}

export function CartItemList({ cart, updateQuantity, removeFromCart }: CartItemListProps) {
  return (
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
              >
                {/* Mobile Layout */}
                <div className="flex gap-4 p-4 items-start md:hidden border-b border-brand-border last:border-b-0 bg-white">
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
                  
                  {/* Details & controls */}
                  <div className="flex-grow flex flex-col gap-2 min-w-0">
                    {/* Title and delete */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xs font-semibold text-brand-text hover:text-brand-muted transition-colors uppercase truncate">
                        <Link href={`/products/${item.product.slug}`}>{item.product.name}</Link>
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-brand-muted hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {/* Variation attributes */}
                    <div className="flex items-center gap-2 text-[9px] text-brand-muted font-bold uppercase tracking-widest">
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

                    {/* Price information */}
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs font-bold text-brand-text">{formatPrice(item.product.price)}</span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-brand-muted font-medium">x{item.quantity}</span>
                      )}
                    </div>

                    {/* Quantity controls & Total price row */}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-brand-border/60">
                      {/* Quantity selectors */}
                      <div className="flex items-center border border-brand-border rounded-xl bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-brand-muted hover:text-brand-text cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-8 text-center text-[10px] font-bold text-brand-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-brand-muted hover:text-brand-text cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <span className="text-xs font-bold text-brand-text">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid grid-cols-12 gap-4 p-5 items-center bg-white border-b border-brand-border last:border-b-0">
                  {/* Item product basic details */}
                  <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
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
                        className="p-2.5 text-brand-muted hover:text-brand-text cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-brand-text">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2.5 text-brand-muted hover:text-brand-text cursor-pointer"
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
                      className="p-2 text-brand-muted hover:text-rose-600 rounded-xl hover:bg-rose-50/50 transition-colors ml-2 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
  );
}
