'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MOCK_PRODUCTS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/product/ProductCard';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Headphones, Star, Leaf, Award } from 'lucide-react';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('../components/3d/Hero3D'), { ssr: false });

export default function HomePage() {
  const { productsList } = useAuth();
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  // Get 4 products marked with "Best Seller" or just take the first 4 products
  const bestSellers = activeProducts.filter((product) =>
    product.badges?.includes('Best Seller')
  ).slice(0, 4);

  const categories = [
    {
      name: 'Tops',
      slug: 'Tops',
      count: '9 sản phẩm',
      description: 'Áo thun Supima, sơ mi Linen nhẹ nhàng, tinh tế và cực kỳ thoáng mát.',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80',
      gridArea: 'col-span-1 md:col-span-2 row-span-1',
    },
    {
      name: 'Bottoms',
      slug: 'Bottoms',
      count: '9 sản phẩm',
      description: 'Quần tây suông xếp ly, quần shorts tự do tôn dáng và linh hoạt dạo phố.',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
      gridArea: 'col-span-1 row-span-1',
    },
    {
      name: 'Outerwear',
      slug: 'Outerwear',
      count: '3 sản phẩm',
      description: 'Blazer, bomber satin, trench coat thời thượng phom dáng relaxed.',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
      gridArea: 'col-span-1 md:col-span-2 row-span-1',
    },
    {
      name: 'Dresses',
      slug: 'Dresses',
      count: '1 sản phẩm',
      description: 'Đầm lụa bias-cut thướt tha, tôn trọn vẹn khí chất tự nhiên mềm mại.',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80',
      gridArea: 'col-span-1 row-span-1',
    },
  ];

  const benefits = [
    {
      icon: <Leaf className="w-5 h-5 text-neutral-850" />,
      title: 'Chất liệu chọn lọc',
      desc: '100% sợi Linen tự nhiên, Cotton Supima hữu cơ siêu mát lành và thân thiện với làn da.',
    },
    {
      icon: <Award className="w-5 h-5 text-neutral-850" />,
      title: 'Form dáng dễ mặc',
      desc: 'Thiết kế tinh giản, relaxed-fit chuẩn dáng và mang lại nét thanh lịch, tự nhiên nhất.',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-neutral-850" />,
      title: 'Đổi trả linh hoạt',
      desc: 'Chính sách đổi size miễn phí hoặc đổi trả hoàn tiền trong vòng 7 ngày cực kỳ dễ dàng.',
    },
    {
      icon: <Truck className="w-5 h-5 text-neutral-850" />,
      title: 'Giao hàng toàn quốc',
      desc: 'Giao hàng nhanh toàn quốc, miễn phí vận chuyển cho mọi đơn hàng giá trị từ 500k.',
    },
  ];

  const testimonials = [
    {
      quote: 'Tôi cực kỳ ấn tượng với chất liệu linen của Novyn Wear. Vải nhẹ, mặc mát và đứng dáng. Đóng gói hộp rất cao cấp, cảm giác khui hộp như nhận quà cao cấp vậy!',
      author: 'Hoàng Minh Tuấn',
      role: 'Creative Director',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      quote: 'Chiếc đầm lụa slip dress của Novyn Wear thực sự là cực phẩm. Lụa tơ tằm mềm mịn rủ tôn dáng cực kỳ quyến rũ, đường may bias-cut xéo vải tinh xảo hoàn hảo vô cùng!',
      author: 'Lê Khánh Linh',
      role: 'Fashion Blogger',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    {
      quote: 'Bộ vest blazer và quần tây xếp ly của Novyn Wear mặc lên đứng phom rất thanh lịch và chuyên nghiệp. Chất vải tuyết mưa dày dặn nhưng mặc rất thoáng mát, cực kỳ ưng ý!',
      author: 'Phạm Thu Trang',
      role: 'Marketing Manager',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="flex flex-col gap-32 pb-32 overflow-hidden relative">
      
      {/* 1. HERO SECTION */}
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
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-text leading-[1.15] mb-6 uppercase"
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
          <div className="lg:col-span-6 grid grid-cols-12 gap-5 relative pt-12 lg:pt-0">
            
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
 
      {/* 2. BENEFITS SECTION (Bento Glass Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start p-7 rounded-3xl glass-card glass-card-hover"
            >
              <div className="p-3 bg-white rounded-2xl border border-brand-border mb-6 shrink-0 text-brand-text">
                {b.icon}
              </div>
              <h4 className="text-xs font-bold text-brand-text mb-2 uppercase tracking-widest">{b.title}</h4>
              <p className="text-xs text-brand-muted leading-relaxed font-normal">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
 
      {/* 2.5. EDITORIAL LOOKBOOK SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-neutral-50 rounded-3xl p-8 md:p-14 border border-brand-border relative overflow-hidden flex flex-col md:flex-row items-center gap-10 md:gap-16 shadow-sm"
        >
          {/* Soft background glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-neutral-200/20 filter blur-3xl pointer-events-none" />
          
          <div className="w-full md:w-1/2 flex flex-col items-start text-left relative z-10">
            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-4 bg-white px-3 py-1 rounded-full border border-brand-border">Summer Weightless 2026</span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-text uppercase tracking-tight mb-6 leading-tight">
              Tối giản trong từng phom dáng,<br />
              <span className="text-brand-muted font-light italic lowercase">tự do trong từng chuyển động.</span>
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed mb-8 font-normal">
              Novyn Wear chắt lọc những mảnh ghép thời trang tối giản thanh lịch nhất tạo nên các outfits hoàn chỉnh. Mỗi set đồ được chế tác từ sợi lanh tự nhiên thô mộc, lụa bias-cut hay blazer đứng phom mang đến cảm hứng mặc nhẹ tênh, tự do.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/lookbook"
                className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-6 py-4 rounded-full hover:bg-neutral-850 transition-all shadow-sm flex items-center gap-2 active:scale-95"
              >
                Shop the look
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/lookbook"
                className="bg-white border border-brand-border text-brand-text text-xs font-bold uppercase tracking-widest px-6 py-4 rounded-full hover:bg-neutral-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
              >
                Xem lookbook
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 aspect-[4/3] relative rounded-3xl overflow-hidden border border-brand-border relative z-10 shrink-0 animate-anti-gravity-2">
            <Image
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80"
              alt="Summer Weightless Lookbook Promo"
              fill
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              unoptimized
            />
          </div>
        </motion.div>
      </section>
 
      {/* 3. CATEGORIES SECTION (BENTO STYLE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 tracking-tight uppercase">
            Danh Mục Nổi Bật
          </h2>
          <p className="text-xs md:text-sm text-brand-muted font-normal leading-relaxed">
            Tuyển chọn những sản phẩm thuộc phong cách sống tối giản tinh tế được ưa chuộng nhất.
          </p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[260px] md:auto-rows-[320px]">
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
 
      {/* 4. BEST SELLERS SECTION */}
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
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
 
      {/* 5. PROMO SALE BANNER */}
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
 
      {/* 6. TESTIMONIALS SECTION */}
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
 
    </div>
  );
}
