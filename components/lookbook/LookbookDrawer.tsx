import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ShoppingBag, AlertCircle } from 'lucide-react';
import { Product, ColorOption } from '../../types';
import { formatPrice } from '../../lib/utils';
import { LookbookItem } from './lookbookTypes';

interface LookbookDrawerProps {
  activeDrawerLook: LookbookItem | null;
  onClose: () => void;
  highlightedProductId: string | null;
  lookDrawerSummary: {
    originalTotal: number;
    discountedTotal: number;
    itemsCount: number;
    products: Product[];
  };
  selectedSizes: Record<string, string>;
  setSelectedSizes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedColors: Record<string, ColorOption>;
  setSelectedColors: React.Dispatch<React.SetStateAction<Record<string, ColorOption>>>;
  onAddSingleToCart: (product: Product) => void;
  onBuyFullLook: () => void;
}

export function LookbookDrawer({
  activeDrawerLook,
  onClose,
  highlightedProductId,
  lookDrawerSummary,
  selectedSizes,
  setSelectedSizes,
  selectedColors,
  setSelectedColors,
  onAddSingleToCart,
  onBuyFullLook,
}: LookbookDrawerProps) {
  return (
    <AnimatePresence>
      {activeDrawerLook && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 cursor-pointer"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto border-l border-brand-border flex flex-col rounded-l-3xl"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-brand-muted block mb-1">
                  SHOP THE LOOK
                </span>
                <h3 className="text-2xl font-normal uppercase text-brand-text tracking-widest">
                  {activeDrawerLook.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl border border-brand-border flex items-center justify-center text-brand-muted hover:bg-neutral-50 hover:text-brand-text transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Garments List */}
            <div className="p-6 flex-1 space-y-8 bg-neutral-50/30">
              {lookDrawerSummary.products.map((product) => {
                const isHighlighted = highlightedProductId === product.id;
                const selectedSize = selectedSizes[product.id] || product.sizes[0] || 'M';
                const selectedColor = selectedColors[product.id] || product.colors[0];

                return (
                  <div
                    key={product.id}
                    id={`drawer-product-${product.id}`}
                    className={`p-5 rounded-xl border transition-all duration-300 relative ${
                      isHighlighted
                        ? 'border-brand-accent bg-white shadow-md'
                        : 'border-brand-border bg-white shadow-sm'
                    }`}
                  >
                    {/* Highlighted Badge */}
                    {isHighlighted && (
                      <div className="absolute top-3 right-3 bg-brand-accent text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Mục đang xem</span>
                      </div>
                    )}

                    <div className="flex gap-5">
                      {/* Image */}
                      <div className="relative aspect-[4/5] w-20 rounded-xl overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-brand-muted font-bold block mb-0.5">
                            {product.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold uppercase text-brand-text tracking-wide mb-1">
                            {product.name}
                          </h4>
                          <p className="text-xs sm:text-sm font-bold text-brand-text">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Quick single-item add to cart */}
                        <div className="pt-2">
                          <button
                            onClick={() => onAddSingleToCart(product)}
                            className="py-2 px-3 bg-brand-accent hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Thêm món này</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Swatches Selection */}
                    <div className="mt-5 pt-4 border-t border-brand-border grid grid-cols-2 gap-4">
                      {/* Colors Swatches */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block mb-2">
                          Màu: <span className="text-brand-text lowercase font-normal">{selectedColor?.name}</span>
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {product.colors.map((color) => {
                            const isColorActive = selectedColor?.name === color.name;
                            return (
                              <button
                                key={color.name}
                                onClick={() =>
                                  setSelectedColors((prev) => ({
                                    ...prev,
                                    [product.id]: color
                                  }))
                                }
                                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                  isColorActive
                                    ? 'border-brand-text scale-110 shadow-sm'
                                    : 'border-transparent hover:scale-105'
                                }`}
                                title={color.name}
                              >
                                <span
                                  className="w-4 h-4 rounded-full border border-brand-border"
                                  style={{ backgroundColor: color.hex }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sizes Swatches */}
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block mb-2">
                          Size: <span className="text-brand-text font-normal">{selectedSize}</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map((size) => {
                            const isSizeActive = selectedSize === size;
                            return (
                              <button
                                key={size}
                                onClick={() =>
                                  setSelectedSizes((prev) => ({
                                    ...prev,
                                    [product.id]: size
                                  }))
                                }
                                className={`w-6 h-6 text-[9px] font-bold rounded-xl border transition-all ${
                                  isSizeActive
                                    ? 'bg-brand-text border-brand-text text-white'
                                    : 'bg-white border-brand-border text-brand-muted hover:border-brand-text hover:text-brand-text'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Bottom Checkout Bundle Area */}
            <div className="p-6 border-t border-brand-border bg-white sticky bottom-0 z-10 space-y-4">
              <div className="flex items-start gap-2 bg-neutral-50 border border-brand-border p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 text-brand-muted shrink-0 mt-0.5" />
                <p className="text-[10px] text-brand-muted font-light leading-relaxed">
                  Mua trọn bộ phối đồ để được tự động ưu đãi giảm ngay <strong className="text-brand-text">10%</strong> cho tổng giá trị bộ sản phẩm (mã áp dụng: <span className="font-bold uppercase tracking-wider text-brand-text">NOVYNLOOK</span>).
                </p>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">
                  Tổng cộng bộ ({lookDrawerSummary.itemsCount} món)
                </span>
                <div className="text-right">
                  <span className="text-xs line-through text-brand-muted mr-2">
                    {formatPrice(lookDrawerSummary.originalTotal)}
                  </span>
                  <span className="text-lg font-normal text-brand-text">
                    {formatPrice(lookDrawerSummary.discountedTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={onBuyFullLook}
                className="w-full py-4.5 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Mua trọn bộ phối đồ (-10%)</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
