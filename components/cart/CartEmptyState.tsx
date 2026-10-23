import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export function CartEmptyState() {
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
