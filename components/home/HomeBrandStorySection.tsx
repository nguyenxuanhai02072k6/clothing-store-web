'use client';

import React from 'react';
import Link from 'next/image';
import NextLink from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const HomeBrandStorySection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Story Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col items-start text-left"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted mb-4 bg-white px-3.5 py-1.5 rounded-full border border-brand-border shadow-xs">
            Triết lý thương hiệu
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide text-brand-text leading-[1.2] mb-6 uppercase">
            Sự tinh tế của<br />
            <span className="text-brand-muted font-light italic lowercase">thời trang thầm lặng.</span>
          </h2>
          <p className="text-sm text-brand-muted leading-relaxed mb-6 font-normal font-sans">
            Tại Novyn Wear, chúng tôi tin rằng phong cách sống thực thụ không cần phô trương. Nó ẩn mình trong nét thô mộc đặc trưng của sợi Linen tự nhiên, độ đanh mịn của bông Supima Cotton và những đường kim mũi chỉ tỉ mỉ được chế tác hoàn toàn thủ công.
          </p>
          <p className="text-sm text-brand-muted leading-relaxed mb-8 font-normal font-sans">
            Mỗi thiết kế là một tác phẩm bền vững trường tồn cùng thời gian. Chúng tôi loại bỏ các chi tiết thừa thãi để tập trung vào cảm giác mặc: nhẹ tênh, tự do và giải phóng hoàn toàn cơ thể bạn khỏi những gò bó thường nhật.
          </p>
          <NextLink
            href="/about"
            className="text-xs font-bold uppercase tracking-widest text-brand-text hover:text-brand-muted transition-colors flex items-center gap-2 border-b border-brand-text hover:border-brand-muted pb-1.5"
          >
            Tìm hiểu câu chuyện của chúng tôi
            <ArrowRight className="w-4 h-4" />
          </NextLink>
        </motion.div>

        {/* Floating Editorial Photo Collage */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative aspect-[4/3] w-full flex items-center justify-center mt-8 lg:mt-0"
        >
          {/* Background decorative glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-neutral-200/30 filter blur-3xl pointer-events-none" />

          {/* Back image - Slow float */}
          <div className="absolute left-4 w-[60%] aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-white/60 animate-anti-gravity-2 z-10">
            <Image
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80"
              alt="Chất liệu Linen mộc"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Front image - Hover overlay */}
          <div className="absolute right-4 bottom-0 w-[55%] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/60 animate-anti-gravity-1 z-20">
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80"
              alt="Craftsmanship tinh xảo"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
