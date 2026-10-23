'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '../../data/products';
import { useAuth } from '../../context/AuthContext';
import { ProductFilterSidebar } from '../../components/catalog/ProductFilterSidebar';
import { ProductFilterToolbar } from '../../components/catalog/ProductFilterToolbar';
import { ProductGridSection, ProductSkeleton } from '../../components/catalog/ProductGridSection';
import { MobileFilterDrawer } from '../../components/catalog/MobileFilterDrawer';

const ProductListContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { productsList } = useAuth();
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState(1500000);
  const [onlySale, setOnlySale] = useState(false);
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedForm, setSelectedForm] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with URL Query Parameters
  useEffect(() => {
    const searchVal = searchParams.get('search') || '';
    const categoryVal = searchParams.get('category') || 'All';
    const focusSearch = searchParams.get('focus') === 'search';

    setSearch(searchVal);
    setCategory(categoryVal);

    if (focusSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchParams]);

  // Scroll lock when mobile drawer is open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileFilters]);

  const triggerFilters = () => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    router.replace(`/products?${params.toString()}`);
    triggerFilters();
  };

  const handleResetFilters = () => {
    setCategory('All');
    setPriceRange(1500000);
    setOnlySale(false);
    setSelectedSize('All');
    setSelectedColor('All');
    setSelectedForm('All');
    setSelectedMaterial('All');
    setSelectedStockStatus('All');
    setSearch('');
    router.replace('/products');
    triggerFilters();
  };

  // Filter and Sort Pipeline
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      // 1. Search Query
      const matchesSearch =
        search === '' ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      // 2. Category
      const matchesCategory = category === 'All' || product.category === category;

      // 3. Price
      const matchesPrice = product.price <= priceRange;

      // 4. Promo
      const matchesSale = !onlySale || product.badges?.includes('Sale');

      // 5. Size
      const matchesSize = selectedSize === 'All' || product.sizes.includes(selectedSize);

      // 6. Color
      const matchesColor = selectedColor === 'All' || product.colors.some((c) => c.name.toLowerCase().includes(selectedColor.toLowerCase()));

      // 7. Form Silhouette
      const desc = product.description.toLowerCase();
      let productForm = 'Regular';
      if (desc.includes('oversize') || desc.includes('rộng') || desc.includes('thoải mái')) {
        productForm = 'Oversized';
      } else if (desc.includes('slim') || desc.includes('ôm') || desc.includes('fit')) {
        productForm = 'Slim';
      }
      const matchesForm = selectedForm === 'All' || productForm === selectedForm;

      // 8. Material
      let productMaterial = 'Cotton';
      if (desc.includes('linen') || desc.includes('lanh')) {
        productMaterial = 'Linen';
      } else if (desc.includes('jean') || desc.includes('denim') || desc.includes('kaki')) {
        productMaterial = 'Denim';
      } else if (desc.includes('len') || desc.includes('dệt kim') || desc.includes('knit')) {
        productMaterial = 'Knit';
      }
      const matchesMaterial = selectedMaterial === 'All' || productMaterial === selectedMaterial;

      // 9. Stock Status
      let productStockStatus = 'in-stock';
      if (product.stock <= 10 && product.stock > 0) {
        productStockStatus = 'low-stock';
      } else if (product.stock === 0) {
        productStockStatus = 'out-of-stock';
      }
      const matchesStockStatus = selectedStockStatus === 'All' || productStockStatus === selectedStockStatus;

      return matchesSearch && matchesCategory && matchesPrice && matchesSale && matchesSize && matchesColor && matchesForm && matchesMaterial && matchesStockStatus;
    }).sort((a, b) => {
      if (sort === 'newest') return b.id.localeCompare(a.id);
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'best-seller') {
        const aBest = a.badges?.includes('Best Seller') ? 1 : 0;
        const bBest = b.badges?.includes('Best Seller') ? 1 : 0;
        return bBest - aBest;
      }
      if (sort === 'sale') {
        const aSale = a.badges?.includes('Sale') ? 1 : 0;
        const bSale = b.badges?.includes('Sale') ? 1 : 0;
        return bSale - aSale;
      }
      return 0;
    });
  }, [search, category, priceRange, onlySale, selectedSize, selectedColor, selectedForm, selectedMaterial, selectedStockStatus, sort, activeProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Title */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl font-bold text-brand-text tracking-tight uppercase mb-2">
          Bộ Sưu Tập Sản Phẩm
        </h1>
        <p className="text-xs md:text-sm text-brand-muted">
          Trải nghiệm những sản phẩm chất lượng cao được thiết kế riêng cho phong cách sống năng động và tinh giản.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white p-6 rounded-3xl border border-brand-border sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
          <ProductFilterSidebar
            category={category}
            setCategory={setCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedForm={selectedForm}
            setSelectedForm={setSelectedForm}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            selectedStockStatus={selectedStockStatus}
            setSelectedStockStatus={setSelectedStockStatus}
            onlySale={onlySale}
            setOnlySale={setOnlySale}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Main Products Content */}
        <div className="flex-grow w-full">
          <ProductFilterToolbar
            search={search}
            setSearch={setSearch}
            searchInputRef={searchInputRef}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={() => {
              setSearch('');
              const params = new URLSearchParams(searchParams.toString());
              params.delete('search');
              router.replace(`/products?${params.toString()}`);
              triggerFilters();
            }}
            onOpenMobileFilters={() => setShowMobileFilters(true)}
            sort={sort}
            setSort={setSort}
            category={category}
            setCategory={setCategory}
            onlySale={onlySale}
            setOnlySale={setOnlySale}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedForm={selectedForm}
            setSelectedForm={setSelectedForm}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            selectedStockStatus={selectedStockStatus}
            setSelectedStockStatus={setSelectedStockStatus}
          />

          <ProductGridSection
            products={filteredProducts}
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        category={category}
        setCategory={setCategory}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedForm={selectedForm}
        setSelectedForm={setSelectedForm}
        selectedMaterial={selectedMaterial}
        setSelectedMaterial={setSelectedMaterial}
        selectedStockStatus={selectedStockStatus}
        setSelectedStockStatus={setSelectedStockStatus}
        onlySale={onlySale}
        setOnlySale={setOnlySale}
        onResetFilters={handleResetFilters}
        totalFilteredCount={filteredProducts.length}
      />
    </div>
  );
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <ProductSkeleton key={n} />
            ))}
          </div>
        </div>
      }
    >
      <ProductListContent />
    </Suspense>
  );
}
