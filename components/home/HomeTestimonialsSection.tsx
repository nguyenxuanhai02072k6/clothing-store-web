'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { HOME_TESTIMONIALS, TestimonialItem } from './homeData';

interface HomeTestimonialsSectionProps {
  testimonials?: TestimonialItem[];
}

export const HomeTestimonialsSection: React.FC<HomeTestimonialsSectionProps> = ({
  testimonials = HOME_TESTIMONIALS,
}) => {
  return (
    <section className="bg-neutral-50/40 py-24 px-4 sm:px-6 lg:px-8 border-y border-brand-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-lg mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 tracking-tight uppercase">
            Khách hàng nói gì về Novyn Wear
          </h2>
          <p className="text-xs md:text-sm text-brand-muted font-normal leading-relaxed">
            Hàng ngàn phản hồi hạnh phúc là động lực thúc đẩy chúng tôi hoàn thiện sản phẩm mỗi ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`p-9 rounded-3xl glass-card shadow-sm flex flex-col justify-between ${
                idx === 0 ? 'animate-anti-gravity-3' :
                idx === 1 ? 'animate-anti-gravity-1' : 'animate-anti-gravity-2'
              }`}
            >
              {/* Quote Text */}
              <div>
                {/* Rating Stars */}
                <div className="flex items-center text-amber-500 gap-0.5 mb-8">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs md:text-sm italic text-brand-muted leading-relaxed mb-10 font-normal">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-brand-border/60">
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-50 border shadow-inner">
                  <Image
                    src={t.avatar}
                    alt={t.author}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-brand-text">{t.author}</h4>
                  <span className="text-[10px] text-brand-muted uppercase tracking-widest block font-semibold mt-0.5">
                    {t.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
