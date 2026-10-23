'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';

interface HomeBestSellersSectionProps {
  products: Product[];
}

export const HomeBestSellersSection: React.FC<HomeBestSellersSectionProps> = ({
  products,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
        <div className="max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 tracking-tight uppercase">
            Sản phẩm bán chạy nhất
          </h2>
          <p className="text-xs md:text-sm text-brand-muted font-normal leading-relaxed">
            Những thiết kế best-seller đình đám nhận được hàng trăm đánh giá 5 sao từ khách hàng ưu tú.
          </p>
        </div>
        <motion.div
          whileHover={{ x: 6 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Link
            href="/products"
            className="text-xs font-bold uppercase tracking-widest text-brand-text hover:text-brand-muted transition-colors flex items-center gap-2 border-b border-brand-text pb-1.5"
          >
            Tất cả sản phẩm
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
