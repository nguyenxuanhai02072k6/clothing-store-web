'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const HomePromoSaleBanner: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-neutral-950 rounded-3xl overflow-hidden py-16 px-8 md:p-24 border border-neutral-850 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12"
      >
        {/* Background shapes */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-neutral-900 filter blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-neutral-800 filter blur-3xl animate-float-slow" />
        </div>

        <div className="relative z-10 max-w-xl text-left">
          <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20 mb-8 inline-block font-mono">
            Ưu đãi đặc biệt giới hạn
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-6 uppercase">
            Giảm ngay 10%<br />
            toàn bộ hóa đơn
          </h2>
          <p className="text-sm text-neutral-400 mb-10 max-w-md leading-relaxed font-normal">
            Nhập mã <span className="font-bold text-white px-2.5 py-1.5 bg-neutral-900 border border-neutral-750 rounded-lg font-mono">SALE10</span> tại trang giỏ hàng. Chương trình khuyến mãi áp dụng cho cả hàng mới về.
          </p>
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 450, damping: 15 }}
          >
            <Link
              href="/products"
              className="bg-white text-neutral-950 text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-full hover:bg-neutral-100 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 shadow-lg shadow-white/5"
            >
              Mua Ngay
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Banner Promo Image - Floating Anti-Gravity */}
        <div className="relative z-10 w-full md:w-80 lg:w-[420px] aspect-[4/3] rounded-3xl overflow-hidden border border-neutral-850 shrink-0 animate-anti-gravity-1">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80"
            alt="Promotion Sale Model"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </motion.div>
    </section>
  );
};
