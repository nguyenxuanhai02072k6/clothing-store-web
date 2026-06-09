'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingBag, ArrowRight, X, Check, Sparkles, AlertCircle, Info } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/products';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Product, ColorOption } from '../../types';

interface Hotspot {
  id: string;
  productId: string;
  top: string;  // absolute percentage e.g. "30%"
  left: string; // absolute percentage e.g. "45%"
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right';
}

interface LookbookItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  hotspots: Hotspot[];
}

export default function LookbookPage() {
  const { addToCart, addDynamicPromoCode, applyPromoCode } = useCart();
  const { productsList } = useAuth();
  const { showToast } = useToast();
  
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  // States
  const [activeDrawerLook, setActiveDrawerLook] = useState<LookbookItem | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, ColorOption>>({});
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);

  // AI Outfit suggestion states
  const [outfitGender, setOutfitGender] = useState<'male' | 'female'>('female');
  const [outfitOccasion, setOutfitOccasion] = useState<string>('office');
  const [outfitColor, setOutfitColor] = useState<string>('minimalist');
  const [generatedOutfit, setGeneratedOutfit] = useState<Product[]>([]);
  const [showOutfitResult, setShowOutfitResult] = useState(false);
  const [outfitSizes, setOutfitSizes] = useState<Record<string, string>>({});
  const [outfitColors, setOutfitColors] = useState<Record<string, ColorOption>>({});

  const handleGenerateOutfit = () => {
    let topId = 'prod-03';
    let bottomId = 'prod-05';
    let outerId = 'prod-02';
    let dressId = '';

    if (outfitGender === 'male') {
      if (outfitOccasion === 'office') {
        topId = 'prod-03';
        bottomId = 'prod-05';
        outerId = 'prod-02';
      } else if (outfitOccasion === 'streetwear') {
        topId = 'prod-01';
        bottomId = 'prod-31';
        outerId = 'prod-33';
      } else if (outfitOccasion === 'beach') {
        topId = 'prod-03';
        bottomId = 'prod-06';
        outerId = '';
      } else if (outfitOccasion === 'party') {
        topId = 'prod-03';
        bottomId = 'prod-05';
        outerId = 'prod-02';
      }
    } else {
      if (outfitOccasion === 'office') {
        dressId = 'prod-29';
        outerId = 'prod-02';
        bottomId = '';
        topId = '';
      } else if (outfitOccasion === 'streetwear') {
        topId = 'prod-01';
        bottomId = 'prod-31';
        outerId = 'prod-33';
      } else if (outfitOccasion === 'beach') {
        dressId = 'prod-29';
        outerId = 'prod-03';
        bottomId = '';
        topId = '';
      } else if (outfitOccasion === 'party') {
        dressId = 'prod-29';
        outerId = 'prod-30';
        bottomId = '';
        topId = '';
      }
    }

    const items = [topId, bottomId, outerId, dressId]
      .filter((id) => id !== '')
      .map((id) => activeProducts.find((p) => p.id === id))
      .filter((p): p is Product => !!p);

    setGeneratedOutfit(items);
    setShowOutfitResult(true);

    const sizes: Record<string, string> = {};
    const colors: Record<string, ColorOption> = {};
    items.forEach((p) => {
      sizes[p.id] = p.sizes[0] || 'M';
      colors[p.id] = p.colors[0];
    });
    setOutfitSizes(sizes);
    setOutfitColors(colors);
    showToast('AI đã tạo bộ phối đồ gợi ý cho bạn!', 'success');
  };

  const handleApplyTemplate = (gender: 'male' | 'female', occasion: string, color: string) => {
    setOutfitGender(gender);
    setOutfitOccasion(occasion);
    setOutfitColor(color);

    let topId = 'prod-03';
    let bottomId = 'prod-05';
    let outerId = 'prod-02';
    let dressId = '';

    if (gender === 'male') {
      if (occasion === 'office') {
        topId = 'prod-03';
        bottomId = 'prod-05';
        outerId = 'prod-02';
      } else if (occasion === 'streetwear') {
        topId = 'prod-01';
        bottomId = 'prod-31';
        outerId = 'prod-33';
      } else if (occasion === 'beach') {
        topId = 'prod-03';
        bottomId = 'prod-06';
        outerId = '';
      } else if (occasion === 'party') {
        topId = 'prod-03';
        bottomId = 'prod-05';
        outerId = 'prod-02';
      }
    } else {
      if (occasion === 'office') {
        dressId = 'prod-29';
        outerId = 'prod-02';
        bottomId = '';
        topId = '';
      } else if (occasion === 'streetwear') {
        topId = 'prod-01';
        bottomId = 'prod-31';
        outerId = 'prod-33';
      } else if (occasion === 'beach') {
        dressId = 'prod-29';
        outerId = 'prod-03';
        bottomId = '';
        topId = '';
      } else if (occasion === 'party') {
        dressId = 'prod-29';
        outerId = 'prod-30';
        bottomId = '';
        topId = '';
      }
    }

    const items = [topId, bottomId, outerId, dressId]
      .filter((id) => id !== '')
      .map((id) => activeProducts.find((p) => p.id === id))
      .filter((p): p is Product => !!p);

    setGeneratedOutfit(items);
    setShowOutfitResult(true);

    const sizes: Record<string, string> = {};
    const colors: Record<string, ColorOption> = {};
    items.forEach((p) => {
      sizes[p.id] = p.sizes[0] || 'M';
      colors[p.id] = p.colors[0];
    });
    setOutfitSizes(sizes);
    setOutfitColors(colors);
    showToast('Đã áp dụng bản phối ý tưởng từ AI Lounge!', 'success');
  };

  const handleBuyOutfit = () => {
    if (generatedOutfit.length === 0) return;
    generatedOutfit.forEach((product) => {
      const size = outfitSizes[product.id] || product.sizes[0] || 'M';
      const color = outfitColors[product.id] || product.colors[0];
      addToCart(product, 1, color, size);
    });

    addDynamicPromoCode('NOVYNLOOK', 'percent', 10, 'Ưu đãi trọn bộ Lookbook 10%');
    applyPromoCode('NOVYNLOOK');
    showToast('Đã thêm trọn bộ phối đồ vào giỏ hàng và áp dụng giảm giá 10% NOVYNLOOK!', 'success');
  };

  // Lookbook curated collections matching our products
  const lookbooks: LookbookItem[] = [
    {
      id: 'lookbook-1',
      title: "Linen Ease",
      subtitle: "SỢI TỰ NHIÊN & PHÓNG KHOÁNG",
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
      description: 'Dệt nên từ sợi linen tự nhiên nhập khẩu siêu nhẹ và mát lành. Áo sơ mi linen cổ trụ mộc mạc đi kèm quần short dây rút tạo cảm giác tự do, phóng khoáng cho những chuyến đi mùa hè đầy trải nghiệm.',
      hotspots: [
        {
          id: 'hs-1-1',
          productId: 'prod-03', // Sơ mi linen
          top: '42%',
          left: '46%',
          tooltipPosition: 'right'
        },
        {
          id: 'hs-1-2',
          productId: 'prod-06', // Quần short linen
          top: '65%',
          left: '55%',
          tooltipPosition: 'left'
        }
      ]
    },
    {
      id: 'lookbook-2',
      title: "Urban Softness",
      subtitle: "PHONG THÁI ĐƯỜNG PHỐ TỰ DO",
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&auto=format&fit=crop&q=80',
      description: 'Vẻ đẹp năng động và cá tính của nhịp sống hiện đại được thể hiện qua chiếc áo khoác Bomber Satin óng nhẹ dập nổi khóa đồng sang trọng kết hợp cùng Quần jean straight-fit cổ điển bụi bặm.',
      hotspots: [
        {
          id: 'hs-2-1',
          productId: 'prod-33', // Bomber satin
          top: '38%',
          left: '48%',
          tooltipPosition: 'right'
        },
        {
          id: 'hs-2-2',
          productId: 'prod-31', // Jeans straight-fit
          top: '70%',
          left: '52%',
          tooltipPosition: 'left'
        }
      ]
    },
    {
      id: 'lookbook-3',
      title: "Everyday Neutral",
      subtitle: "ĐƯỜNG CẮT VÀ SỰ TĨNH LẶNG CỦA PHOM DÁNG",
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
      description: 'Sự kết hợp hoàn mỹ của áo khoác Blazer Relaxed Fit hiện đại phóng khoáng và chiếc Quần tây ống suông xếp ly Pleated Trousers kéo dài chân tôn dáng. Biểu trưng cho phong thái thanh lịch và tối giản.',
      hotspots: [
        {
          id: 'hs-3-1',
          productId: 'prod-02', // Blazer
          top: '40%',
          left: '49%',
          tooltipPosition: 'right'
        },
        {
          id: 'hs-3-2',
          productId: 'prod-05', // Quần tây
          top: '72%',
          left: '53%',
          tooltipPosition: 'left'
        }
      ]
    },
    {
      id: 'lookbook-4',
      title: "Light Motion",
      subtitle: "BẢN GIAO HƯỞNG GIỮA LỤA VÀ DẠ MĂNG TÔ",
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&auto=format&fit=crop&q=80',
      description: 'Một sự kết hợp đầy nghệ thuật giữa chất liệu lụa satin bias-cut óng ả và phom dáng đứng măng tô dạ len lông cừu dáng dài kinh điển. Sự tương phản mang lại chiều sâu độc đáo và cảm giác chuyển động nhẹ nhàng.',
      hotspots: [
        {
          id: 'hs-4-1',
          productId: 'prod-29', // Đầm lụa
          top: '60%',
          left: '46%',
          tooltipPosition: 'right'
        },
        {
          id: 'hs-4-2',
          productId: 'prod-30', // Trench coat dạ
          top: '32%',
          left: '53%',
          tooltipPosition: 'left'
        }
      ]
    }
  ];

  // Initialize selected colors and sizes when a look is opened in drawer
  useEffect(() => {
    if (!activeDrawerLook) return;

    const initialSizes = { ...selectedSizes };
    const initialColors = { ...selectedColors };
    let updated = false;

    activeDrawerLook.hotspots.forEach((hs) => {
      const p = activeProducts.find((prod) => prod.id === hs.productId);
      if (p) {
        if (!initialSizes[p.id]) {
          initialSizes[p.id] = p.sizes[0] || 'M';
          updated = true;
        }
        if (!initialColors[p.id]) {
          initialColors[p.id] = p.colors[0];
          updated = true;
        }
      }
    });

    if (updated) {
      setSelectedSizes(initialSizes);
      setSelectedColors(initialColors);
    }
  }, [activeDrawerLook, activeProducts, selectedSizes, selectedColors]);

  // Scroll Lock when Shop the Look drawer is open
  useEffect(() => {
    if (activeDrawerLook) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeDrawerLook]);

  // Handle adding a single product to cart
  const handleAddSingleToCart = (product: Product) => {
    const size = selectedSizes[product.id] || product.sizes[0] || 'M';
    const color = selectedColors[product.id] || product.colors[0];

    if (!color) {
      showToast('Vui lòng chọn màu sắc sản phẩm.', 'error');
      return;
    }

    addToCart(product, 1, color, size);
    showToast(`Đã thêm ${product.name} vào giỏ hàng.`, 'success');
  };

  // Handle buying the complete look
  const handleBuyFullLook = () => {
    if (!activeDrawerLook) return;

    const styledProducts = activeDrawerLook.hotspots
      .map((hs) => activeProducts.find((p) => p.id === hs.productId))
      .filter((p): p is Product => !!p);

    if (styledProducts.length === 0) {
      showToast('Không tìm thấy sản phẩm trong Lookbook này.', 'error');
      return;
    }

    // Add all products with selected options
    styledProducts.forEach((product) => {
      const size = selectedSizes[product.id] || product.sizes[0] || 'M';
      const color = selectedColors[product.id] || product.colors[0];
      addToCart(product, 1, color, size);
    });

    // Create & apply discount
    addDynamicPromoCode('NOVYNLOOK', 'percent', 10, 'Ưu đãi trọn bộ Lookbook 10%');
    applyPromoCode('NOVYNLOOK');

    setActiveDrawerLook(null);
    showToast(
      'Đã thêm trọn bộ phối đồ vào giỏ hàng và áp dụng mã giảm giá 10% NOVYNLOOK!',
      'success'
    );
  };

  // Calculate pricing for the complete look drawer
  const lookDrawerSummary = useMemo(() => {
    if (!activeDrawerLook) return { originalTotal: 0, discountedTotal: 0, itemsCount: 0, products: [] };

    const products = activeDrawerLook.hotspots
      .map((hs) => activeProducts.find((p) => p.id === hs.productId))
      .filter((p): p is Product => !!p);

    const originalTotal = products.reduce((acc, p) => acc + p.price, 0);
    const discountedTotal = Math.round(originalTotal * 0.9);

    return {
      originalTotal,
      discountedTotal,
      itemsCount: products.length,
      products
    };
  }, [activeDrawerLook, activeProducts]);

  return (
    <div className="bg-white min-h-screen text-brand-text py-16 md:py-24 relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-muted mb-4 block">
            — SUMMER WEIGHTLESS 2026
          </span>
          <h1 className="text-4xl sm:text-6xl font-normal tracking-widest text-brand-text uppercase mb-6">
            NOVYN WEAR <span className="font-light italic text-brand-muted lowercase">lookbook</span>
          </h1>
        </div>

        {/* AI INTERACTIVE OUTFIT SUGGESTION WIDGET */}
        <div className="max-w-4xl mx-auto bg-[#FAF8F5] border border-brand-border rounded-3xl p-6 sm:p-8 mb-24 shadow-lg relative overflow-hidden text-brand-text">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/60 filter blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest">
              Novyn AI Fitting Lounge - Gợi ý phối đồ
            </h3>
          </div>

          {/* Quick Coordination Templates */}
          <div className="mb-8 flex flex-wrap gap-2.5 items-center justify-start border-b border-brand-border pb-6">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mr-2">Bản phối gợi ý nhanh:</span>
            {[
              { name: '☕ Lịch lãm Công sở', gender: 'female', occasion: 'office', color: 'minimalist' },
              { name: '🌊 Đi biển Mộc mạc', gender: 'female', occasion: 'beach', color: 'neutral' },
              { name: '🍸 Tiệc đêm Sang trọng', gender: 'female', occasion: 'party', color: 'minimalist' },
              { name: '🛹 Dạo phố Phong cách', gender: 'male', occasion: 'streetwear', color: 'bright' },
            ].map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => handleApplyTemplate(tpl.gender as any, tpl.occasion, tpl.color)}
                className="px-3.5 py-2 rounded-xl bg-white border border-brand-border hover:bg-neutral-50 text-brand-text text-[10px] font-bold tracking-wide transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                {tpl.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-6 border-b border-brand-border">
            {/* Gender Select */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Giới tính</label>
              <div className="flex bg-white border border-brand-border rounded-xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setOutfitGender('female')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    outfitGender === 'female' ? 'bg-brand-text text-white shadow-sm' : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  Nữ
                </button>
                <button
                  type="button"
                  onClick={() => setOutfitGender('male')}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    outfitGender === 'male' ? 'bg-brand-text text-white shadow-sm' : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  Nam
                </button>
              </div>
            </div>

            {/* Occasion Select */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Dịp sử dụng</label>
              <select
                value={outfitOccasion}
                onChange={(e) => setOutfitOccasion(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-semibold focus:outline-none cursor-pointer focus:border-brand-text shadow-sm"
              >
                <option value="office">Công sở / Thanh lịch</option>
                <option value="streetwear">Dạo phố / Streetwear</option>
                <option value="beach">Đi biển / Nghỉ dưỡng</option>
                <option value="party">Đi tiệc / Event</option>
              </select>
            </div>

            {/* Color Select */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">Tông màu chủ đạo</label>
              <select
                value={outfitColor}
                onChange={(e) => setOutfitColor(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-semibold focus:outline-none cursor-pointer focus:border-brand-text shadow-sm"
              >
                <option value="minimalist">Tối giản (Đen / Trắng / Xám)</option>
                <option value="neutral">Trung tính (Beige / Nâu / Kem)</option>
                <option value="bright">Tươi sáng (Xanh mộc / Pastel)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <button
              type="button"
              onClick={handleGenerateOutfit}
              className="bg-brand-text hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Phối đồ thông minh AI</span>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Result Panel */}
          <AnimatePresence>
            {showOutfitResult && generatedOutfit.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 border-t border-brand-border pt-8 overflow-hidden text-left"
              >
                <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-inner flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Left Column: Description & Summary */}
                  <div className="flex-1 flex flex-col justify-between h-full min-h-[200px]">
                    <div>
                      <span className="bg-[#FAF8F5] border border-brand-border px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-brand-muted w-fit block mb-4">
                        Set đồ hoàn thiện đề xuất
                      </span>
                      <h4 className="text-xl font-normal text-brand-text uppercase tracking-widest mb-3">
                        {outfitOccasion === 'office' ? 'Sophisticated Minimalist' :
                         outfitOccasion === 'streetwear' ? 'Urban Quiet Luxury' :
                         outfitOccasion === 'beach' ? 'Organic Breathable Summer' : 'Elegant Chic Party'}
                      </h4>
                      <p className="text-xs text-brand-muted leading-relaxed font-light mb-6">
                        {outfitOccasion === 'office'
                          ? 'Set đồ công sở lịch lãm pha trộn giữa chất liệu cao cấp mộc mạc và những đường cắt tinh xảo. Vừa thoải mái năng động vừa giữ vững nét chuyên nghiệp.'
                          : outfitOccasion === 'streetwear'
                          ? 'Thời trang dạo phố mang hơi thở tối giản hiện đại. Kết cấu thoải mái cùng phom dáng rủ nhẹ tạo cảm giác mặc tự do tự tại.'
                          : outfitOccasion === 'beach'
                          ? 'Hành trang nghỉ dưỡng nhẹ tênh dệt hoàn toàn từ sợi lanh tự nhiên thô mộc. Thấm hút mồ hôi cực tốt, thông thoáng mát mẻ suốt cả ngày.'
                          : 'Bản phối đi tiệc cao cấp tôn vinh phom dáng đứng măng tô dạ len wool và đầm satin bias-cut sang trọng.'}
                      </p>
                    </div>

                    <div className="border-t border-brand-border pt-4 mt-auto">
                      <div className="flex justify-between items-baseline mb-4">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-brand-muted">
                          Giá trọn bộ phối đồ
                        </span>
                        <div className="text-right">
                          <span className="text-xs line-through text-brand-muted mr-2">
                            {formatPrice(generatedOutfit.reduce((acc, p) => acc + p.price, 0))}
                          </span>
                          <span className="text-lg font-normal text-brand-text">
                            {formatPrice(Math.round(generatedOutfit.reduce((acc, p) => acc + p.price, 0) * 0.9))}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleBuyOutfit}
                        className="w-full py-4 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <ShoppingBag className="w-4 h-4 text-white" />
                        <span>Mua trọn bộ set đồ (-10%)</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Items Swatches List */}
                  <div className="w-full md:w-96 flex flex-col gap-4">
                    {generatedOutfit.map((product) => {
                      const selectedSize = outfitSizes[product.id] || product.sizes[0] || 'M';
                      const selectedColor = outfitColors[product.id] || product.colors[0];

                      return (
                        <div key={product.id} className="flex gap-4 p-4 border border-brand-border rounded-xl bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] transition-all">
                          <div className="relative aspect-[4/5] w-14 rounded-lg overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <h5 className="text-xs font-bold uppercase text-brand-text truncate leading-tight mb-1">{product.name}</h5>
                              <span className="text-[10px] text-brand-text font-bold block">{formatPrice(product.price)}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1.5">
                              {/* Quick Size selection */}
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] font-bold text-brand-muted uppercase">Size:</span>
                                <select
                                  value={selectedSize}
                                  onChange={(e) => setOutfitSizes(prev => ({ ...prev, [product.id]: e.target.value }))}
                                  className="bg-transparent border-0 text-[9px] font-bold text-brand-text p-0 focus:outline-none uppercase cursor-pointer"
                                >
                                  {product.sizes.map((sz) => (
                                    <option key={sz} value={sz} className="bg-white text-brand-text">{sz}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Quick Color selection */}
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] font-bold text-brand-muted uppercase">Màu:</span>
                                <select
                                  value={selectedColor?.name}
                                  onChange={(e) => {
                                    const col = product.colors.find(c => c.name === e.target.value);
                                    if (col) setOutfitColors(prev => ({ ...prev, [product.id]: col }));
                                  }}
                                  className="bg-transparent border-0 text-[9px] font-bold text-brand-text p-0 focus:outline-none lowercase cursor-pointer"
                                >
                                  {product.colors.map((c) => (
                                    <option key={c.name} value={c.name} className="bg-white text-brand-text">{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Curated Editorial Lookbooks Magazine Grid */}
        <div className="space-y-32 md:space-y-44">
          {lookbooks.map((lb, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={lb.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
              >
                {/* Lookbook Visual Card Column */}
                <div
                  className={`lg:col-span-7 relative rounded-3xl overflow-hidden border border-brand-border bg-white aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] group shadow-sm ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <Image
                    src={lb.image}
                    alt={lb.title}
                    fill
                    priority={index === 0}
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                    unoptimized
                  />

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />

                  {/* HOTSPOTS MAP */}
                  {lb.hotspots.map((hs, subIndex) => {
                    const linkedProduct = activeProducts.find((p) => p.id === hs.productId);
                    if (!linkedProduct) return null;

                    return (
                      <div
                        key={hs.id}
                        style={{ top: hs.top, left: hs.left }}
                        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      >
                        {/* Elegant Minimalist Hotspot Button */}
                        <button
                          onClick={() => {
                            setActiveDrawerLook(lb);
                            setHighlightedProductId(hs.productId);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center relative cursor-pointer focus:outline-none transition-all duration-300 border border-brand-border bg-white/95 text-brand-text shadow-md hover:scale-110 active:scale-95 group/btn"
                          aria-label={`Shop product ${linkedProduct.name}`}
                        >
                          <span className="text-[10px] font-bold text-brand-text">
                            {String(subIndex + 1).padStart(2, '0')}
                          </span>

                          {/* Pulsing halo */}
                          <span className="w-12 h-12 border border-white/60 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping opacity-40 pointer-events-none" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Editorial Collection Info Column */}
                <div
                  className={`lg:col-span-5 flex flex-col justify-center text-left ${
                    isEven ? 'lg:order-2 lg:pl-10' : 'lg:order-1 lg:pr-10'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-brand-accent mb-3 block">
                    {lb.subtitle}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-normal text-brand-text uppercase tracking-widest mb-6">
                    {lb.title}
                  </h2>
                  <div className="h-[1px] w-12 bg-brand-border mb-6" />
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light tracking-wide mb-8">
                    {lb.description}
                  </p>
                  
                  {/* Shop the Look Button */}
                  <button
                    onClick={() => {
                      setActiveDrawerLook(lb);
                      setHighlightedProductId(null);
                    }}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-text hover:text-brand-muted transition-colors border-b border-brand-text hover:border-brand-muted pb-1.5 w-fit cursor-pointer"
                  >
                    <span>Khám phá set đồ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SHOP THE LOOK DRAWER */}
      <AnimatePresence>
        {activeDrawerLook && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrawerLook(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 cursor-pointer"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto border-l border-brand-border flex flex-col rounded-l-3xl"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-brand-border flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-brand-muted block mb-1">
                    SHOP THE LOOK
                  </span>
                  <h3 className="text-2xl font-normal uppercase text-brand-text tracking-widest">
                    {activeDrawerLook.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDrawerLook(null)}
                  className="w-10 h-10 rounded-xl border border-brand-border flex items-center justify-center text-brand-muted hover:bg-neutral-50 hover:text-brand-text transition-colors cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Garments List */}
              <div className="p-6 flex-1 space-y-8 bg-neutral-50/30">
                {lookDrawerSummary.products.map((product, subIndex) => {
                  const isHighlighted = highlightedProductId === product.id;
                  const selectedSize = selectedSizes[product.id] || product.sizes[0] || 'M';
                  const selectedColor = selectedColors[product.id] || product.colors[0];

                  return (
                    <div
                      key={product.id}
                      id={`drawer-product-${product.id}`}
                      className={`p-5 rounded-xl border transition-all duration-300 relative ${
                        isHighlighted
                          ? 'border-brand-accent bg-white shadow-md'
                          : 'border-brand-border bg-white shadow-sm'
                      }`}
                    >
                      {/* Highlighted Badge */}
                      {isHighlighted && (
                        <div className="absolute top-3 right-3 bg-brand-accent text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Mục đang xem</span>
                        </div>
                      )}

                      <div className="flex gap-5">
                        {/* Image */}
                        <div className="relative aspect-[4/5] w-20 rounded-xl overflow-hidden bg-brand-bg border border-brand-border shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-brand-muted font-bold block mb-0.5">
                              {product.category}
                            </span>
                            <h4 className="text-xs sm:text-sm font-semibold uppercase text-brand-text tracking-wide mb-1">
                              {product.name}
                            </h4>
                            <p className="text-xs sm:text-sm font-bold text-brand-text">
                              {formatPrice(product.price)}
                            </p>
                          </div>

                          {/* Quick single-item add to cart */}
                          <div className="pt-2">
                            <button
                              onClick={() => handleAddSingleToCart(product)}
                              className="py-2 px-3 bg-brand-accent hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Thêm món này</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Swatches Selection */}
                      <div className="mt-5 pt-4 border-t border-brand-border grid grid-cols-2 gap-4">
                        {/* Colors Swatches */}
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block mb-2">
                            Màu: <span className="text-brand-text lowercase font-normal">{selectedColor?.name}</span>
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {product.colors.map((color) => {
                              const isColorActive = selectedColor?.name === color.name;
                              return (
                                <button
                                  key={color.name}
                                  onClick={() =>
                                    setSelectedColors((prev) => ({
                                      ...prev,
                                      [product.id]: color
                                    }))
                                  }
                                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                    isColorActive
                                      ? 'border-brand-text scale-110 shadow-sm'
                                      : 'border-transparent hover:scale-105'
                                  }`}
                                  title={color.name}
                                >
                                  <span
                                    className="w-4 h-4 rounded-full border border-brand-border"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sizes Swatches */}
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-brand-muted font-bold block mb-2">
                            Size: <span className="text-brand-text font-normal">{selectedSize}</span>
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.map((size) => {
                              const isSizeActive = selectedSize === size;
                              return (
                                <button
                                  key={size}
                                  onClick={() =>
                                    setSelectedSizes((prev) => ({
                                      ...prev,
                                      [product.id]: size
                                    }))
                                  }
                                  className={`w-6 h-6 text-[9px] font-bold rounded-xl border transition-all ${
                                    isSizeActive
                                      ? 'bg-brand-text border-brand-text text-white'
                                      : 'bg-white border-brand-border text-brand-muted hover:border-brand-text hover:text-brand-text'
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Bottom Checkout Bundle Area */}
              <div className="p-6 border-t border-brand-border bg-white sticky bottom-0 z-10 space-y-4">
                <div className="flex items-start gap-2 bg-neutral-50 border border-brand-border p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-brand-muted shrink-0 mt-0.5" />
                  <p className="text-[10px] text-brand-muted font-light leading-relaxed">
                    Mua trọn bộ phối đồ để được tự động ưu đãi giảm ngay <strong className="text-brand-text">10%</strong> cho tổng giá trị bộ sản phẩm (mã áp dụng: <span className="font-bold uppercase tracking-wider text-brand-text">NOVYNLOOK</span>).
                  </p>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">
                    Tổng cộng bộ ({lookDrawerSummary.itemsCount} món)
                  </span>
                  <div className="text-right">
                    <span className="text-xs line-through text-brand-muted mr-2">
                      {formatPrice(lookDrawerSummary.originalTotal)}
                    </span>
                    <span className="text-lg font-normal text-brand-text">
                      {formatPrice(lookDrawerSummary.discountedTotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBuyFullLook}
                  className="w-full py-4.5 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Mua trọn bộ phối đồ (-10%)</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
