'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HomeEditorialLookbookBanner: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="bg-neutral-50 rounded-3xl p-8 md:p-14 border border-brand-border relative overflow-hidden flex flex-col lg:flex-row items-center gap-10 md:gap-16 shadow-sm"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-neutral-200/20 filter blur-3xl pointer-events-none" />
        
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left relative z-10">
          <span className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-[0.2em] mb-4 bg-white px-3 py-1.5 rounded-full border border-brand-border">
            Summer Weightless &apos;26
          </span>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-brand-text uppercase tracking-tight mb-6 leading-tight">
            Khám phá tủ đồ<br />
            <span className="text-brand-muted font-light italic lowercase">phối đồ thông minh AI.</span>
          </h3>
          <p className="text-sm text-brand-muted leading-relaxed mb-6 font-normal">
            Trải nghiệm phòng thử đồ kỹ thuật số độc quyền tại Novyn Wear. AI Outfit Lounge sẽ giúp bạn ghép các mảnh trang phục linen thô mộc, áo khoác blazer relaxed-fit và đầm lụa satin rủ tôn dáng thành những set đồ đồng điệu lý tưởng nhất.
          </p>
          
          <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-brand-border shadow-xs mb-8 max-w-md">
            <Sparkles className="w-5 h-5 text-brand-accent shrink-0 animate-pulse" />
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              <strong>Novyn AI Fitting Lounge:</strong> Tự động phối đồ theo Dịp sử dụng (công sở, đi biển, dạo phố) và tặng mã giảm giá độc quyền <strong className="text-brand-text font-medium">10% NOVYNLOOK</strong> khi mua trọn bộ.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/lookbook"
              className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-full hover:bg-neutral-850 transition-all shadow-sm flex items-center gap-2 active:scale-95 animate-pulse-slow"
            >
              Thử phối đồ AI ngay
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/lookbook"
              className="bg-white border border-brand-border text-brand-text text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-full hover:bg-neutral-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
            >
              Xem lookbook tạp chí
            </Link>
          </div>
        </div>
        
        {/* Interactive lookbook preview column */}
        <div className="w-full lg:w-1/2 aspect-[4/3] md:aspect-[16/11] relative rounded-3xl overflow-hidden border border-brand-border z-10 shrink-0 group shadow-sm">
          <Image
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
            alt="Summer Weightless Lookbook Promo"
            fill
            className="object-cover transition-transform duration-[1200ms] group-hover:scale-[1.02]"
            unoptimized
          />
          {/* Interactive Mock Hotspots */}
          <div className="absolute top-[35%] left-[45%] z-20">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white border border-brand-text"></span>
            </span>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-xs border border-brand-border text-[9px] font-bold uppercase tracking-wider text-brand-text px-2.5 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Áo khoác Blazer (01)
            </div>
          </div>
          <div className="absolute top-[68%] left-[53%] z-20">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white border border-brand-text"></span>
            </span>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-xs border border-brand-border text-[9px] font-bold uppercase tracking-wider text-brand-text px-2.5 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              Quần Tây Xếp Ly (02)
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
