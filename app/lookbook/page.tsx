'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_PRODUCTS } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Product, ColorOption } from '../../types';
import { LookbookItem } from '../../components/lookbook/lookbookTypes';
import { LOOKBOOK_COLLECTIONS } from '../../components/lookbook/lookbookData';
import { LookbookHeroHeader } from '../../components/lookbook/LookbookHeroHeader';
import { VirtualStylistSection } from '../../components/lookbook/VirtualStylistSection';
import { LookbookGridSection } from '../../components/lookbook/LookbookGridSection';
import { LookbookDrawer } from '../../components/lookbook/LookbookDrawer';

export default function LookbookPage() {
  const { addToCart, addDynamicPromoCode, applyPromoCode } = useCart();
  const { productsList } = useAuth();
  const { showToast } = useToast();
  
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  // Drawer & Selection States
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

    styledProducts.forEach((product) => {
      const size = selectedSizes[product.id] || product.sizes[0] || 'M';
      const color = selectedColors[product.id] || product.colors[0];
      addToCart(product, 1, color, size);
    });

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
        <LookbookHeroHeader />

        {/* AI Virtual Stylist Section */}
        <VirtualStylistSection
          outfitGender={outfitGender}
          setOutfitGender={setOutfitGender}
          outfitOccasion={outfitOccasion}
          setOutfitOccasion={setOutfitOccasion}
          outfitColor={outfitColor}
          setOutfitColor={setOutfitColor}
          generatedOutfit={generatedOutfit}
          showOutfitResult={showOutfitResult}
          outfitSizes={outfitSizes}
          setOutfitSizes={setOutfitSizes}
          outfitColors={outfitColors}
          setOutfitColors={setOutfitColors}
          onGenerateOutfit={handleGenerateOutfit}
          onApplyTemplate={handleApplyTemplate}
          onBuyOutfit={handleBuyOutfit}
        />

        {/* Curated Editorial Lookbooks Magazine Grid */}
        <LookbookGridSection
          lookbooks={LOOKBOOK_COLLECTIONS}
          activeProducts={activeProducts}
          onSelectLook={(lb, productId) => {
            setActiveDrawerLook(lb);
            setHighlightedProductId(productId || null);
          }}
        />
      </div>

      {/* SHOP THE LOOK DRAWER */}
      <LookbookDrawer
        activeDrawerLook={activeDrawerLook}
        onClose={() => setActiveDrawerLook(null)}
        highlightedProductId={highlightedProductId}
        lookDrawerSummary={lookDrawerSummary}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        onAddSingleToCart={handleAddSingleToCart}
        onBuyFullLook={handleBuyFullLook}
      />
    </div>
  );
}
