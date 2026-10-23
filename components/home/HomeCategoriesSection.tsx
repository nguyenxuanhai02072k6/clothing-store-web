'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HOME_CATEGORIES, CategoryItem } from './homeData';

interface HomeCategoriesSectionProps {
  categories?: CategoryItem[];
}

export const HomeCategoriesSection: React.FC<HomeCategoriesSectionProps> = ({
  categories = HOME_CATEGORIES,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-lg mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 tracking-tight uppercase">
          Danh Mục Nổi Bật
        </h2>
        <p className="text-xs md:text-sm text-brand-muted font-normal leading-relaxed">
          Tuyển chọn những sản phẩm thuộc phong cách sống tối giản tinh tế được ưa chuộng nhất.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[160px] md:auto-rows-[320px]">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={`${cat.gridArea} group relative rounded-3xl overflow-hidden border border-brand-border`}
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="(max-w-7xl) 33vw, 100vw"
              className="object-cover transition-transform duration-1000 scale-100 group-hover:scale-[1.02]"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/25 to-transparent flex flex-col justify-end p-6 md:p-8" />
            
            {/* Category Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex items-end justify-between text-white z-10">
              <div className="max-w-[75%]">
                <h3 className="text-base md:text-lg font-bold tracking-tight mb-1 uppercase">{cat.name}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed mb-2.5 line-clamp-2">{cat.description}</p>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 block font-bold">
                  {cat.count}
                </span>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg group-hover:bg-brand-accent group-hover:text-white transition-all duration-300"
                  aria-label={`Xem danh mục ${cat.name}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
