'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../../lib/utils';
import { Product } from '../../../types';

interface ProductStickyBuyBarProps {
  showStickyBar: boolean;
  product: Product;
  displayedImages: string[];
  activeImageIdx: number;
  selectedSize: string;
  setSelectedSize: (s: string) => void;
  handleAddToCart: () => void;
}

export default function ProductStickyBuyBar({
  showStickyBar,
  product,
  displayedImages,
  activeImageIdx,
  selectedSize,
  setSelectedSize,
  handleAddToCart
}: ProductStickyBuyBarProps) {
  return (
    <AnimatePresence>
      {showStickyBar && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-brand-border p-4 shadow-xl flex items-center justify-between gap-4"
        >
          {/* Left: Thumbnail & Size Quick Select */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-12 bg-brand-bg rounded-xl overflow-hidden shrink-0 border border-brand-border">
              <Image
                src={displayedImages[activeImageIdx] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] font-bold text-brand-text truncate uppercase tracking-tight">
                {product.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-bold text-brand-text">{formatPrice(product.price)}</span>
                <span className="text-[9px] text-brand-border font-bold">|</span>

                {/* Quick Size Dropdown */}
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="bg-transparent border-0 text-[9px] font-bold text-brand-text focus:outline-none uppercase p-0"
                >
                  {product.sizes.map((s) => (
                    <option key={s} value={s}>
                      Size {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Right: Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest px-5 py-3.5 rounded-xl hover:bg-neutral-800 active:scale-95 transition-all shadow-none shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Hết hàng' : 'Thêm giỏ'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
