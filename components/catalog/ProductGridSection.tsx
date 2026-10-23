import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../../components/product/ProductCard';
import { Product } from '../../types';

interface ProductGridSectionProps {
  products: Product[];
  isLoading: boolean;
  onResetFilters: () => void;
}

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[3/4] w-full bg-neutral-200 rounded-3xl" />
      <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
      <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
      <div className="flex justify-between items-center mt-2">
        <div className="h-4 bg-neutral-200 rounded-md w-1/3" />
        <div className="h-8 bg-neutral-200 rounded-xl w-8" />
      </div>
    </div>
  );
}

export function ProductGridSection({
  products,
  isLoading,
  onResetFilters,
}: ProductGridSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <ProductSkeleton key={n} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-neutral-50 rounded-3xl border border-brand-border p-8">
        <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-2">
          Không tìm thấy sản phẩm phù hợp
        </h3>
        <p className="text-xs text-brand-muted max-w-sm mb-6 leading-relaxed">
          Rất tiếc, không có sản phẩm nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.
        </p>
        <button
          onClick={onResetFilters}
          className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
        >
          Xóa toàn bộ bộ lọc
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
      <AnimatePresence>
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
