'use client';

import React from 'react';
import { MOCK_PRODUCTS } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { HomeHeroSection } from '../components/home/HomeHeroSection';
import { HomeBenefitsSection } from '../components/home/HomeBenefitsSection';
import { HomeBrandStorySection } from '../components/home/HomeBrandStorySection';
import { HomeEditorialLookbookBanner } from '../components/home/HomeEditorialLookbookBanner';
import { HomeCategoriesSection } from '../components/home/HomeCategoriesSection';
import { HomeBestSellersSection } from '../components/home/HomeBestSellersSection';
import { HomePromoSaleBanner } from '../components/home/HomePromoSaleBanner';
import { HomeTestimonialsSection } from '../components/home/HomeTestimonialsSection';

export default function HomePage() {
  const { productsList } = useAuth();
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  // Get 4 products marked with "Best Seller" or fallback to first 4 active products
  const filteredBestSellers = activeProducts
    .filter((product) => product.badges?.includes('Best Seller'))
    .slice(0, 4);
  const bestSellers = filteredBestSellers.length > 0 ? filteredBestSellers : activeProducts.slice(0, 4);

  return (
    <div className="flex flex-col gap-32 pb-32 overflow-hidden relative">
      {/* 1. HERO SECTION */}
      <HomeHeroSection />

      {/* 2. BENEFITS SECTION (Bento Glass Cards) */}
      <HomeBenefitsSection />

      {/* 2.5. BRAND STORY & INTRODUCTION (Quiet Luxury Ethos) */}
      <HomeBrandStorySection />

      {/* 2.6. EDITORIAL INTERACTIVE LOOKBOOK BANNER */}
      <HomeEditorialLookbookBanner />

      {/* 3. CATEGORIES SECTION (BENTO STYLE) */}
      <HomeCategoriesSection />

      {/* 4. BEST SELLERS SECTION */}
      <HomeBestSellersSection products={bestSellers} />

      {/* 5. PROMO SALE BANNER */}
      <HomePromoSaleBanner />

      {/* 6. TESTIMONIALS SECTION */}
      <HomeTestimonialsSection />
    </div>
  );
}
