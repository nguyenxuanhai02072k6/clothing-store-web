/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MOCK_PRODUCTS } from '../../../data/products';
import { useAuth } from '../../../context/AuthContext';
import { ProductCard } from '../../../components/product/ProductCard';
import { useCart } from '../../../context/CartContext';
import { formatPrice } from '../../../lib/utils';
import { Star, ShoppingBag, Truck, RotateCcw, ShieldCheck, ChevronDown, Plus, Minus, Heart, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const ProductViewer3D = dynamic(() => import('../../../components/3d/ProductViewer3D'), { ssr: false });

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { productsList, branchStock, branchSizeStock, branchColorStock } = useAuth();
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  // Find product by slug
  const product = useMemo(() => {
    return activeProducts.find((p) => p.slug === slug);
  }, [slug, activeProducts]);

  const isLoved = product ? isInWishlist(product.id) : false;

  // Product interaction states
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || { name: '', hex: '' });
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || 'F');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('desc');
  const [view3D, setView3D] = useState(false);
  const [modelSize, setModelSize] = useState<'S' | 'XL'>('S');
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Sync initial color and size when product loads
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || { name: '', hex: '' });
      setSelectedSize(product.sizes[0] || 'F');
      setQuantity(1);
      setActiveImageIdx(0);
      setView3D(false);
      setModelSize('S');
    }
  }, [product]);

  // Track window scroll to toggle Sticky Add-to-Cart Bar on mobile
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 550) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute displayed images based on Model Size selection ("View on Model")
  const displayedImages = useMemo(() => {
    if (!product) return [];
    if (modelSize === 'XL') {
      // Swapping images and adding an extra model query to simulate XL size shoot
      return [
        product.images[1] || product.images[0],
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
        product.images[0],
      ];
    }
    return product.images;
  }, [product, modelSize]);

  // Related products (4 products in same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return activeProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
  }, [product, activeProducts]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-neutral-400 mb-8">Sản phẩm bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
        <Link
          href="/products"
          className="bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleDecreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQty = () => {
    setQuantity((prev) => Math.min(product.stock, prev + 1));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    router.push('/cart');
  };

  const toggleAccordion = (tab: string) => {
    setActiveAccordion((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Breadcrumbs */}
      <nav className="text-xs text-neutral-400 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-neutral-700 transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-neutral-700 transition-colors">Sản phẩm</Link>
        <span>/</span>
        <span className="text-neutral-600 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main product view grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 grid grid-cols-12 gap-4">
          
          {/* Thumbnails list (Desktop sidebar) */}
          <div className="col-span-12 md:col-span-2 order-2 md:order-1 flex md:flex-col gap-3 justify-center md:justify-start">
            {displayedImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative aspect-square w-16 md:w-full rounded-xl overflow-hidden border bg-neutral-50 transition-all ${
                  activeImageIdx === idx ? 'border-neutral-950 shadow-sm' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>

          {/* Large display image / 3D Canvas Viewer */}
          <div className="col-span-12 md:col-span-10 order-1 md:order-2 aspect-[3/4] relative bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200/60 shadow-sm">
            {view3D && product.has3D ? (
              <div className="w-full h-full relative bg-neutral-900/5 backdrop-blur-md">
                <ProductViewer3D modelType={product.modelType} colorHex={selectedColor.hex} />
              </div>
            ) : (
              <Image
                src={displayedImages[activeImageIdx] || product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-cover"
                unoptimized
              />
            )}

            {/* Premium 3D View Toggle Button */}
            {product.has3D && (
              <button
                onClick={() => setView3D(!view3D)}
                className="absolute top-4 right-4 z-20 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white/70 hover:bg-white/90 text-neutral-900 border border-neutral-200/50 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                {view3D ? (
                  <>
                    <span>Xem ảnh</span>
                    <span>🖼️</span>
                  </>
                ) : (
                  <>
                    <span>Xem 3D</span>
                    <span className="animate-spin" style={{ animationDuration: '6s' }}>🔄</span>
                  </>
                )}
              </button>
            )}

            {/* SKIMS style Floating "View on Model" Toggle */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center bg-white/90 backdrop-blur-sm rounded-xl p-1 border border-neutral-200/60 shadow-sm">
              <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 px-2.5">
                Mẫu mặc:
              </span>
              <button
                onClick={() => {
                  setModelSize('S');
                  setActiveImageIdx(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                  modelSize === 'S'
                    ? 'bg-neutral-950 text-white shadow-none'
                    : 'text-neutral-500 hover:text-neutral-855'
                }`}
              >
                Size S
              </button>
              <button
                onClick={() => {
                  setModelSize('XL');
                  setActiveImageIdx(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                  modelSize === 'XL'
                    ? 'bg-neutral-950 text-white shadow-none'
                    : 'text-neutral-500 hover:text-neutral-855'
                }`}
              >
                Size XL
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Product Detail Form */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          
          {/* Badge & Category */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-neutral-200">
              {product.category}
            </span>
            {product.badges?.map((b) => {
              let badgeStyle = 'bg-neutral-950 text-white border-neutral-950';
              if (b === 'Sale') {
                badgeStyle = 'bg-rose-50 text-rose-750 border-rose-150';
              } else if (b === 'New') {
                badgeStyle = 'bg-neutral-100 text-neutral-600 border-neutral-200';
              } else if (b === 'Best Seller') {
                badgeStyle = 'bg-neutral-100 text-neutral-800 border-neutral-200';
              }
              return (
                <span
                  key={b}
                  className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
                >
                  {b}
                </span>
              );
            })}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-text leading-tight mb-3 uppercase tracking-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 fill-current ${
                    i < Math.floor(product.rating) ? 'text-amber-500' : 'text-neutral-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-brand-text">{product.rating}</span>
            <span className="text-[10px] text-brand-border">|</span>
            <span className="text-xs text-brand-muted hover:underline cursor-pointer">
              {product.reviews} đánh giá
            </span>
          </div>

          {/* Pricing tag */}
          <div className="flex items-baseline gap-4 py-5 border-y border-brand-border mb-6">
            <span className="text-2xl md:text-3xl font-bold text-brand-text">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <>
                <span className="text-sm md:text-base text-brand-muted line-through font-normal">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                  Tiết kiệm {discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Short description */}
          <p className="text-sm text-brand-muted leading-relaxed mb-6 font-normal">
            {product.description}
          </p>

          {/* Selector 1: Color options */}
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-muted block mb-3">
              Màu sắc: <span className="text-brand-text">{selectedColor.name}</span>
            </span>
            <div className="flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-full border border-brand-border relative shadow-inner cursor-pointer transition-all ${
                    selectedColor.name === c.name
                      ? 'ring-1 ring-brand-accent ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Selector 2: Size options */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted block mb-3">
                Kích thước: <span className="text-brand-text">{selectedSize}</span>
              </span>
              <div className="flex gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-11 h-11 text-xs font-bold rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                      selectedSize === s
                        ? 'border-brand-accent bg-brand-accent text-white shadow-none'
                        : 'border-brand-border text-brand-text hover:border-brand-accent hover:bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SKIMS Fit Finder Note */}
          <div className="mb-8 bg-neutral-50 border border-brand-border p-4 rounded-2xl flex items-start gap-3">
            <span className="text-base select-none shrink-0 mt-0.5">📐</span>
            <div className="text-xs">
              <span className="font-bold text-brand-text block mb-0.5 uppercase tracking-widest text-[9px]">Gợi ý chọn Size (Fit Finder)</span>
              <p className="text-brand-muted leading-relaxed font-normal">
                Sản phẩm có độ co giãn tốt, ôm phom nhẹ nhàng và đúng kích cỡ chuẩn. Nếu số đo của bạn nằm giữa 2 size, hãy chọn size lớn hơn để có cảm giác thoải mái nhất.
              </p>
            </div>
          </div>

          {/* NOVYN Store Availability Widget */}
          <div className="mb-8 bg-white border border-brand-border p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-4 flex items-center gap-1.5">
              📍 TÌNH TRẠNG SẴN HÀNG TẠI CHI NHÁNH
            </span>
            <div className="space-y-4">
              {['Chi nhánh Quận 1', 'Chi nhánh Thảo Điền'].map((branchName) => {
                const totalStock = branchStock[product.id]?.[branchName] || 0;
                const sizeStock = branchSizeStock[product.id]?.[branchName] || {};
                const colorStock = branchColorStock[product.id]?.[branchName] || {};
                
                const hasSize = (sizeStock[selectedSize] || 0) > 0;
                const hasColor = (colorStock[selectedColor.name] || 0) > 0;
                const isComboAvailable = totalStock > 0 && hasSize && hasColor;
                
                const address = branchName === 'Chi nhánh Quận 1' 
                  ? '120 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh'
                  : '23 Xuân Thủy, Phường Thảo Điền, Quận 2, TP. Thủ Đức, TP. Hồ Chí Minh';

                return (
                  <div key={branchName} className="border-b border-brand-border last:border-0 pb-4 last:pb-0 flex items-start justify-between gap-4">
                    <div className="flex gap-2.5">
                      <span className="text-sm shrink-0 select-none mt-0.5 text-brand-muted">🏛️</span>
                      <div>
                        <span className="text-xs font-bold text-brand-text block leading-tight mb-1">{branchName}</span>
                        <span className="text-[9px] text-brand-muted font-normal block leading-relaxed max-w-[280px]">
                          {address}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shrink-0 text-center border transition-all ${
                      isComboAvailable 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {isComboAvailable ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selector 3: Quantity selector and stock info */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-muted block mb-3">
              Số lượng
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-brand-border rounded-xl bg-white">
                <button
                  onClick={handleDecreaseQty}
                  className="p-3 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-brand-text">
                  {quantity}
                </span>
                <button
                  onClick={handleIncreaseQty}
                  className="p-3 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-brand-muted font-bold">
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mb-10">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-transparent border border-brand-accent text-brand-text text-xs sm:text-sm font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              Thêm vào giỏ
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 bg-brand-accent border border-brand-accent text-white text-xs sm:text-sm font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-800 transition-all text-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              Mua Ngay
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-4 rounded-xl border flex items-center justify-center transition-all duration-300 active:scale-90 shrink-0 cursor-pointer ${
                isLoved
                  ? 'bg-rose-50 border-rose-250 text-rose-500 hover:bg-rose-100 shadow-none scale-105'
                  : 'bg-white border-brand-border text-brand-muted hover:text-rose-500 hover:border-brand-accent'
              }`}
              title={isLoved ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
              aria-label={isLoved ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
            >
              <Heart className={`w-5 h-5 ${isLoved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Shipping & trust parameters */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col gap-4">
            <div className="flex gap-3">
              <RotateCcw className="w-5 h-5 text-brand-text shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-brand-text mb-0.5">Đổi trả trong 7 ngày</h5>
                <p className="text-[10px] text-brand-muted">Hỗ trợ đổi size hoặc hoàn trả dễ dàng tại các chi nhánh.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Truck className="w-5 h-5 text-brand-text shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-brand-text mb-0.5">Giao hàng toàn quốc</h5>
                <p className="text-[10px] text-brand-muted">Vận chuyển nhanh chóng, miễn phí cho đơn hàng từ 500k.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-text shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-brand-text mb-0.5">Kiểm tra hàng trước khi nhận</h5>
                <p className="text-[10px] text-brand-muted">Khách hàng được đồng kiểm chất lượng sản phẩm cùng bưu tá.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <HelpCircle className="w-5 h-5 text-brand-text shrink-0" />
              <div>
                <h5 className="text-xs font-bold text-brand-text mb-0.5">Tư vấn size miễn phí</h5>
                <p className="text-[10px] text-brand-muted">Hỗ trợ tư vấn số đo chuẩn xác 24/7 qua chatbot hoặc hotline.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Accordion detail tab section */}
      <section className="mb-24 border-t border-brand-border pt-10">
        <div className="max-w-3xl">
          
          {/* Tab 1: Mô tả chi tiết */}
          <div className="border-b border-brand-border py-4">
            <button
              onClick={() => toggleAccordion('desc')}
              className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
            >
              <span>Mô tả sản phẩm</span>
              <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'desc' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeAccordion === 'desc' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed pt-2 pb-4 font-medium">
                    {product.description} Cửa hàng cam kết tất cả sợi dệt và vật liệu đều được kiểm định an toàn nghiêm ngặt theo tiêu chuẩn quốc tế. Từng sản phẩm của NOVYN WEAR đều chứa đựng sự chăm chút tỉ mỉ từ tay nghề nghệ nhân Việt để đem đến sự hài lòng tối đa khi tới tay khách hàng.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab 2: Chất liệu & form dáng */}
          <div className="border-b border-brand-border py-4">
            <button
              onClick={() => toggleAccordion('material')}
              className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
            >
              <span>Chất liệu & phom dáng</span>
              <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'material' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeAccordion === 'material' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-brand-muted leading-relaxed pt-2 pb-4 font-normal">
                    Sản phẩm được dệt hoàn toàn từ các loại sợi tự nhiên hữu cơ tuyển chọn kỹ lưỡng, mang lại trải nghiệm mặc mát lành, thoáng khí tối đa. Phom dáng cắt may hiện đại, kết cấu đường chỉ giấu tinh xảo giúp sản phẩm luôn đứng dáng thanh lịch suốt cả ngày dài.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab 3: Hướng dẫn chọn size */}
          <div className="border-b border-brand-border py-4">
            <button
              onClick={() => toggleAccordion('size-guide')}
              className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
            >
              <span>Hướng dẫn chọn size</span>
              <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'size-guide' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeAccordion === 'size-guide' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-4 text-sm text-brand-muted leading-relaxed font-normal space-y-2">
                    <p>• <strong>Size S:</strong> Chiều cao 1m50 - 1m62, Cân nặng 45kg - 55kg.</p>
                    <p>• <strong>Size M:</strong> Chiều cao 1m62 - 1m70, Cân nặng 55kg - 65kg.</p>
                    <p>• <strong>Size L:</strong> Chiều cao 1m70 - 1m77, Cân nặng 65kg - 75kg.</p>
                    <p>• <strong>Size XL:</strong> Chiều cao 1m77 - 1m85, Cân nặng 75kg - 85kg.</p>
                    <p className="text-xs text-brand-text bg-neutral-50 p-4 rounded-xl border border-brand-border mt-3 font-normal leading-normal">
                      💡 Mẹo nhỏ: Novyn Wear hỗ trợ tư vấn chọn size hoàn toàn miễn phí trực tiếp qua Hotline 1900 8899 hoặc Chatbox để giúp bạn tìm thấy phom dáng vừa vặn nhất.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab 4: Hướng dẫn bảo quản */}
          <div className="border-b border-brand-border py-4">
            <button
              onClick={() => toggleAccordion('care')}
              className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
            >
              <span>Hướng dẫn bảo quản</span>
              <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'care' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeAccordion === 'care' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-4 text-sm text-brand-muted leading-relaxed font-normal space-y-1">
                    <p>• Giặt máy ở chế độ nhẹ nhàng (delicate cycle) hoặc giặt tay với nước mát.</p>
                    <p>• Sử dụng túi giặt và nước giặt dịu nhẹ, tránh dùng chất tẩy có chứa clo.</p>
                    <p>• Phơi ngang dưới bóng râm thoáng gió, hạn chế sấy bằng máy ở nhiệt độ cao.</p>
                    <p>• Là ủi hơi nước ở nhiệt độ thích hợp (nên là khi chất liệu vải còn ẩm nhẹ).</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab 5: Chính sách đổi trả */}
          <div className="border-b border-brand-border py-4">
            <button
              onClick={() => toggleAccordion('return')}
              className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
            >
              <span>Chính sách đổi trả</span>
              <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'return' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeAccordion === 'return' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-4 text-sm text-brand-muted leading-relaxed font-normal space-y-1.5">
                    <p>• Hỗ trợ đổi size hoặc màu sắc miễn phí trong vòng 7 ngày kể từ khi nhận hàng.</p>
                    <p>• Sản phẩm gửi đổi cần giữ nguyên tem tag nhãn hiệu, hóa đơn mua lẻ và chưa qua sử dụng hay giặt là.</p>
                    <p>• Áp dụng đổi size hoặc đổi sang mẫu mới có giá trị tương đương hoặc cao hơn.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tab 3: Đánh giá */}
          <div className="border-b border-brand-border py-4">
            <button
              onClick={() => toggleAccordion('reviews')}
              className="flex justify-between items-center w-full text-left font-semibold text-sm sm:text-base text-brand-text uppercase tracking-widest py-2 cursor-pointer"
            >
              <span>Đánh giá từ khách hàng ({product.reviews})</span>
              <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-300 ${activeAccordion === 'reviews' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {activeAccordion === 'reviews' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 pb-6">
                    {/* Review Overview Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-neutral-50 p-6 sm:p-8 rounded-2xl border border-brand-border mb-10 items-center">
                      {/* Large Score Column */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center text-center md:border-r border-brand-border/60 md:pr-8 py-2">
                        <span className="text-5xl font-bold text-brand-text tracking-tight mb-2">
                          {product.rating}
                        </span>
                        <div className="flex items-center text-amber-500 gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 fill-current ${
                                i < Math.floor(product.rating) ? 'text-amber-500' : 'text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-brand-muted font-bold">
                          {product.reviews} đánh giá thực tế
                        </p>
                        <p className="text-[10px] text-brand-muted mt-1">
                          100% người mua hài lòng với sản phẩm
                        </p>
                      </div>

                      {/* Star Distribution Column */}
                      <div className="md:col-span-8 flex flex-col gap-2.5">
                        {[
                          { stars: 5, pct: 82, count: Math.round(product.reviews * 0.82) },
                          { stars: 4, pct: 12, count: Math.round(product.reviews * 0.12) },
                          { stars: 3, pct: 4, count: Math.round(product.reviews * 0.04) },
                          { stars: 2, pct: 1, count: Math.round(product.reviews * 0.01) },
                          { stars: 1, pct: 1, count: Math.round(product.reviews * 0.01) },
                        ].map((row) => (
                          <div key={row.stars} className="flex items-center gap-3 text-xs">
                            <span className="w-3 font-bold text-brand-text">{row.stars}</span>
                            <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                            <div className="flex-1 h-2 bg-neutral-100 border border-brand-border rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${row.pct}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-brand-accent"
                              />
                            </div>
                            <span className="w-8 text-right text-brand-muted font-bold">{row.pct}%</span>
                            <span className="w-10 text-right text-brand-muted font-medium text-[10px]">({row.count})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review Filter Tags (aesthetic only) */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {['Tất cả', 'Hình ảnh/Video (12)', '5 Sao (24)', 'Có phản hồi từ NOVYN WEAR (18)'].map((tag, idx) => (
                        <span
                          key={tag}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            idx === 0
                              ? 'bg-brand-accent text-white border border-brand-accent shadow-none'
                              : 'bg-white text-brand-muted border border-brand-border hover:bg-brand-bg'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Detailed Review List */}
                    <div className="space-y-6">
                      {[
                        {
                          name: 'Hoàng Minh Trí',
                          avatarColor: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
                          rating: 5,
                          date: '2 ngày trước',
                          variant: `Màu: ${selectedColor.name || product.colors[0].name} | Size: ${selectedSize}`,
                          comment: 'Đường may vô cùng sắc sảo và chỉn chu, chất vải rủ nhẹ vừa phải đúng chất Quiet Luxury. Form mặc lên chuẩn như đo ni đóng giày, cực kỳ tôn dáng và sang trọng. Sẽ ủng hộ shop thêm nhiều sản phẩm khác!',
                          verified: true,
                          helpfulCount: 8,
                        },
                        {
                          name: 'Lê Khánh An',
                          avatarColor: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
                          rating: 5,
                          date: '1 tuần trước',
                          variant: `Màu: ${product.colors[0].name} | Size: M`,
                          comment: 'Đóng gói sản phẩm siêu đẹp bằng hộp giấy kraft bảo vệ môi trường, có cả thiệp cảm ơn viết tay rất tinh tế. Chất vải mát mẻ, sờ mướt tay, mặc đi làm hay đi cà phê cuối tuần đều lịch sự và thoải mái.',
                          verified: true,
                          helpfulCount: 5,
                        },
                        {
                          name: 'Nguyễn Bích Ngọc',
                          avatarColor: 'bg-neutral-100 text-neutral-500 border border-neutral-200',
                          rating: 4,
                          date: '2 tuần trước',
                          variant: `Màu: ${product.colors[1]?.name || product.colors[0].name} | Size: S`,
                          comment: 'Chất lượng vải xuất sắc vượt mong đợi, form dáng rộng rãi hiện đại. Điểm cộng lớn cho nhân viên CSKH hỗ trợ tư vấn size cực kỳ nhiệt tình và có tâm. Giao hàng Hà Nội chỉ mất 1 ngày rưỡi.',
                          verified: true,
                          helpfulCount: 3,
                        }
                      ].map((review, idx) => (
                        <div
                          key={idx}
                          className="pb-6 border-b border-brand-border last:border-0 last:pb-0 flex flex-col gap-3"
                        >
                          {/* Reviewer Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-full ${review.avatarColor} font-bold flex items-center justify-center text-xs shrink-0 shadow-sm uppercase`}>
                                {review.name.split(' ').map((n) => n[0]).join('').slice(-2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-brand-text">{review.name}</span>
                                  {review.verified && (
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                                      Đã mua hàng
                                    </span>
                                  )}
                                </div>
                                <div className="flex text-amber-500 gap-0.5 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 fill-current ${
                                        i < review.rating ? 'text-amber-500' : 'text-neutral-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-brand-muted font-normal block">
                                  {review.variant}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-brand-muted font-normal">{review.date}</span>
                          </div>

                          {/* Comment Text */}
                          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-normal">
                            {review.comment}
                          </p>

                          {/* Action / Feedback row */}
                          <div className="flex items-center gap-4 text-[10px] text-brand-muted font-normal">
                            <button className="hover:text-brand-text transition-colors flex items-center gap-1 active:scale-95 cursor-pointer">
                              <span>Hữu ích ({review.helpfulCount})</span>
                            </button>
                            <span>•</span>
                            <button className="hover:text-brand-text transition-colors active:scale-95 cursor-pointer">
                              Báo cáo vi phạm
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-brand-border pt-16">
          <h2 className="text-xl md:text-2xl font-bold text-brand-text uppercase tracking-tight mb-8">
            Sản phẩm liên quan
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Mobile Add-to-Cart Bar (Ghim đáy màn hình di động khi cuộn xuống) */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-brand-border p-4 shadow-xl flex items-center justify-between gap-4"
          >
            {/* Left: Thumbnail & Size Quick Select */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-12 bg-brand-bg rounded-xl overflow-hidden shrink-0 border border-brand-border">
                <Image
                  src={displayedImages[activeImageIdx] || product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-brand-text truncate uppercase tracking-tight">{product.name}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] font-bold text-brand-text">{formatPrice(product.price)}</span>
                  <span className="text-[9px] text-brand-border font-bold">|</span>
                  
                  {/* Quick Size Dropdown */}
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="bg-transparent border-0 text-[9px] font-bold text-brand-text focus:outline-none uppercase p-0"
                  >
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>Size {s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest px-5 py-3.5 rounded-xl hover:bg-neutral-800 active:scale-95 transition-all shadow-none shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Hết hàng' : 'Thêm giỏ'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
