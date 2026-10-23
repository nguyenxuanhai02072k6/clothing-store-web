'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('../3d/Hero3D'), { ssr: false });

export const HomeHeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-transparent px-4 sm:px-6 lg:px-8 pt-12">
      {/* Soft Background Gradients & Grid Overlays & Interactive 3D Fabric Backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <Hero3D />
        <div className="absolute top-[15%] right-[5%] w-[40rem] h-[40rem] rounded-full bg-neutral-100/60 filter blur-[120px] animate-anti-gravity-2" />
        <div className="absolute bottom-[10%] left-[2%] w-[30rem] h-[30rem] rounded-full bg-neutral-200/50 filter blur-[100px] animate-anti-gravity-1" />
        <div 
          className="absolute top-[8%] left-[4%] text-[14vw] font-black leading-none tracking-widest font-mono uppercase select-none pointer-events-none opacity-[0.03]"
          style={{ WebkitTextStroke: '2px #000000', color: 'transparent' }}
        >
          NOVYN
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 py-16 md:py-24">
        {/* Hero Content */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-5 block bg-neutral-50 px-4 py-1.5 rounded-full border border-brand-border/60"
          >
            Mùa hè 2026 - Lookbook Weightless
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-text leading-[1.15] mb-6 uppercase"
          >
            Định hình phong cách<br />
            <span className="text-brand-muted font-light italic lowercase">tối giản, nhẹ như không.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm text-brand-muted mb-8 max-w-lg leading-relaxed font-normal font-sans"
          >
            Novyn Wear mang đến những thiết kế tối giản, dễ mặc và bền dáng. Mỗi sản phẩm được tạo nên để đồng hành cùng nhịp sống hiện đại: thoải mái, tinh tế và tự nhiên.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Link
                href="/products"
                className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-full hover:bg-neutral-850 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
              >
                Mua ngay
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Link
                href="/lookbook"
                className="bg-white border border-brand-border text-brand-text text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-full hover:bg-neutral-50 transition-all active:scale-95 shadow-sm"
              >
                Khám phá lookbook
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero Visual Collage with Zero-gravity floating animations */}
        <div className="lg:col-span-6 grid grid-cols-12 gap-4 md:gap-5 relative pt-12 lg:pt-0 max-w-lg mx-auto lg:max-w-none w-full">
          {/* Ethereal Floating Tag */}
          <div className="absolute -top-3 left-[20%] z-20 bg-white/70 backdrop-blur-md border border-white/60 shadow-lg px-4.5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-900 animate-anti-gravity-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-ping"></span>
            Novyn Wear Concept SUMMER&apos;26
          </div>

          {/* Main Visual Image - Slow float */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-7 aspect-[3/4] relative rounded-3xl overflow-hidden shadow-2xl border border-white/40 animate-anti-gravity-1"
          >
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
              alt="Fashion Summer Lookbook"
              fill
              priority
              className="object-cover transition-transform duration-1000 hover:scale-105"
              unoptimized
            />
          </motion.div>

          {/* Sub Visual Collage Column */}
          <div className="col-span-5 flex flex-col gap-5 justify-between">
            {/* Top square image - Float offset 2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-square relative rounded-3xl overflow-hidden shadow-xl border border-white/40 animate-anti-gravity-2"
            >
              <Image
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80"
                alt="Fashion Detail Closeup"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
                unoptimized
              />
            </motion.div>
            
            {/* Bottom tall image - Float offset 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-[4/5] relative rounded-3xl overflow-hidden shadow-xl border border-white/40 animate-anti-gravity-3"
            >
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80"
                alt="Novyn Wear Minimalist Lookbook"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
                unoptimized
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
