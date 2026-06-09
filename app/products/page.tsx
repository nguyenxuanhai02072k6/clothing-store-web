'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MOCK_PRODUCTS } from '../../data/products';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from '../../components/product/ProductCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Skeleton component during load state
const ProductSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="animate-pulse flex flex-col h-full bg-white rounded-3xl border border-neutral-100 overflow-hidden">
        <div className="bg-neutral-100 aspect-[3/4] w-full" />
        <div className="p-4 flex-grow flex flex-col gap-3">
          <div className="h-3 bg-neutral-100 w-1/4" />
          <div className="h-4 bg-neutral-100 w-3/4" />
          <div className="h-3 bg-neutral-100 w-1/2" />
          <div className="h-4 bg-neutral-100 w-1/3 mt-4" />
        </div>
      </div>
    ))}
  </div>
);

// Inner Content component that uses useSearchParams
const ProductListContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { productsList } = useAuth();
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState(1500000); // Max price limit
  const [onlySale, setOnlySale] = useState(false);
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedForm, setSelectedForm] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Scroll Lock when mobile filters drawer is open
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

  // Categories list
  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear'];

  // Handle incoming query params
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

  // Handle filter changes with synthetic delay for premium feel
  const triggerFilters = () => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  };

  // Trigger loading effect when filtering or sorting
  useEffect(() => {
    triggerFilters();
  }, [category, sort, priceRange, onlySale, selectedSize, selectedColor, selectedForm, selectedMaterial, selectedStockStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerFilters();
    // Update query url
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    router.replace(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('newest');
    setPriceRange(1500000);
    setOnlySale(false);
    setSelectedSize('All');
    setSelectedColor('All');
    setSelectedForm('All');
    setSelectedMaterial('All');
    setSelectedStockStatus('All');
    router.replace('/products');
    triggerFilters();
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      // 1. Search term match
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      // 2. Category match
      const matchesCategory = category === 'All' || product.category === category;

      // 3. Price range match
      const matchesPrice = product.price <= priceRange;

      // 4. Sale filter
      const matchesSale = !onlySale || product.badges?.includes('Sale');

      // 5. Size match
      const matchesSize = selectedSize === 'All' || product.sizes.includes(selectedSize);

      // 6. Color match
      const matchesColor = selectedColor === 'All' || product.colors.some(c => c.name.toLowerCase().includes(selectedColor.toLowerCase()));

      // 7. Form match (dynamically inferred or mapped)
      let productForm = 'Regular';
      const desc = (product.name + ' ' + product.description).toLowerCase();
      if (desc.includes('oversized') || desc.includes('rộng') || desc.includes('relaxed') || desc.includes('suông')) {
        productForm = 'Oversized';
      } else if (desc.includes('slim') || desc.includes('ôm') || desc.includes('fit')) {
        productForm = 'Slim';
      }
      const matchesForm = selectedForm === 'All' || productForm === selectedForm;

      // 8. Material match (dynamically inferred or mapped)
      let productMaterial = 'Cotton';
      if (desc.includes('linen') || desc.includes('lanh')) {
        productMaterial = 'Linen';
      } else if (desc.includes('jean') || desc.includes('denim') || desc.includes('kaki')) {
        productMaterial = 'Denim';
      } else if (desc.includes('len') || desc.includes('dệt kim') || desc.includes('knit')) {
        productMaterial = 'Knit';
      }
      const matchesMaterial = selectedMaterial === 'All' || productMaterial === selectedMaterial;

      // 9. Stock Status match
      let productStockStatus = 'in-stock';
      if (product.stock <= 10 && product.stock > 0) {
        productStockStatus = 'low-stock';
      } else if (product.stock === 0) {
        productStockStatus = 'out-of-stock';
      }
      const matchesStockStatus = selectedStockStatus === 'All' || productStockStatus === selectedStockStatus;

      return matchesSearch && matchesCategory && matchesPrice && matchesSale && matchesSize && matchesColor && matchesForm && matchesMaterial && matchesStockStatus;
    }).sort((a, b) => {
      // Sorting
      if (sort === 'newest') {
        return b.id.localeCompare(a.id);
      }
      if (sort === 'price-asc') {
        return a.price - b.price;
      }
      if (sort === 'price-desc') {
        return b.price - a.price;
      }
      if (sort === 'rating') {
        return b.rating - a.rating;
      }
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

      {/* Control Panel: Search & Filters (Horizontal) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white p-6 rounded-3xl border border-brand-border sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Bộ lọc tìm kiếm
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold text-rose-600 uppercase hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Filter Categories */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-4">Danh mục</h4>
            <div className="flex flex-col gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left text-xs py-2 px-3 rounded-xl font-medium transition-all ${
                    category === cat
                      ? 'bg-brand-accent text-white shadow-sm'
                      : 'text-brand-muted hover:text-brand-text hover:bg-neutral-50'
                  }`}
                >
                  {cat === 'All' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Price */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">Giá tối đa</h4>
              <span className="text-xs font-bold text-brand-text">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min={150000}
              max={1500000}
              step={50000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1 bg-brand-border rounded-full appearance-none cursor-pointer accent-brand-accent"
            />
            <div className="flex justify-between text-[10px] text-brand-muted mt-2 font-medium">
              <span>150k</span>
              <span>1.5M</span>
            </div>
          </div>

          {/* Filter Size */}
          <div className="mb-6 border-t border-brand-border pt-4">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-3">Kích cỡ</h4>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'S', 'M', 'L', 'XL'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-8 h-8 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-brand-accent border-brand-accent text-white shadow-sm'
                      : 'bg-white border-brand-border text-brand-text hover:border-brand-muted'
                  }`}
                >
                  {sz === 'All' ? 'Tất' : sz}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Color */}
          <div className="mb-6 border-t border-brand-border pt-4">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-3">Màu sắc</h4>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Trắng', 'Đen', 'Beige', 'Nâu', 'Xám', 'Xanh'].map((color) => {
                const isActive = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-accent border-brand-accent text-white shadow-sm'
                        : 'bg-white border-brand-border text-brand-muted hover:border-brand-muted'
                    }`}
                  >
                    {color === 'All' ? 'Tất cả' : color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Form Silhouette */}
          <div className="mb-6 border-t border-brand-border pt-4">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-2.5">Form dáng</h4>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full p-2.5 border border-brand-border rounded-xl bg-white text-xs font-bold text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
            >
              <option value="All">Tất cả phom dáng</option>
              <option value="Slim">Slim Fit</option>
              <option value="Regular">Regular Fit</option>
              <option value="Oversized">Oversized / Relaxed</option>
            </select>
          </div>

          {/* Filter Material */}
          <div className="mb-6 border-t border-brand-border pt-4">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-2.5">Chất liệu</h4>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full p-2.5 border border-brand-border rounded-xl bg-white text-xs font-bold text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
            >
              <option value="All">Tất cả chất liệu</option>
              <option value="Cotton">Cotton Supima</option>
              <option value="Linen">Linen Organic</option>
              <option value="Denim">Denim / Jean</option>
              <option value="Knit">Len / Dệt Kim (Knit)</option>
            </select>
          </div>

          {/* Filter Stock Status */}
          <div className="mb-6 border-t border-brand-border pt-4">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-2.5">Tình trạng kho</h4>
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="w-full p-2.5 border border-brand-border rounded-xl bg-white text-xs font-bold text-brand-text focus:outline-none focus:border-brand-accent cursor-pointer"
            >
              <option value="All">Tất cả tình trạng</option>
              <option value="in-stock">Còn hàng</option>
              <option value="low-stock">Sắp hết hàng</option>
            </select>
          </div>

          {/* Filter Promo Badges */}
          <div className="border-t border-brand-border pt-4">
            <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-3">Ưu đãi</h4>
            <label className="flex items-center gap-3 cursor-pointer group text-xs text-brand-muted font-medium">
              <input
                type="checkbox"
                checked={onlySale}
                onChange={(e) => setOnlySale(e.target.checked)}
                className="w-4 h-4 rounded border-brand-border accent-brand-accent focus:ring-0 cursor-pointer"
              />
              <span className="group-hover:text-brand-text transition-colors">Sản phẩm giảm giá</span>
            </label>
          </div>
        </aside>

        {/* MAIN PRODUCT GRID AREA */}
        <div className="flex-grow w-full">

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50 p-4 rounded-2xl border border-brand-border mb-8 w-full">
            
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
              <input
                type="text"
                ref={searchInputRef}
                placeholder="Nhập tên sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl border border-brand-border bg-white text-xs text-brand-text focus:outline-none focus:border-brand-accent focus:ring-0"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('search');
                    router.replace(`/products?${params.toString()}`);
                    triggerFilters();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
 
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden py-2 px-4 border border-brand-border bg-white rounded-xl text-xs font-bold text-brand-text flex items-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Bộ lọc
              </button>
 
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-brand-border text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-transparent border-none p-0 pr-6 text-xs text-brand-text focus:ring-0 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="best-seller">Bán chạy nhất</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="sale">Đang giảm giá</option>
                </select>
              </div>
 
            </div>
          </div>

          {/* ACTIVE FILTER BADGES PREVIEW */}
          {(category !== 'All' || onlySale || priceRange < 1500000 || search || selectedSize !== 'All' || selectedColor !== 'All' || selectedForm !== 'All' || selectedMaterial !== 'All' || selectedStockStatus !== 'All') && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-[10px] uppercase font-bold text-neutral-400 mr-1">Bộ lọc đang chọn:</span>
              
              {search && (
                <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Từ khóa: &ldquo;{search}&rdquo;
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setSearch(''); triggerFilters(); }} />
                </span>
              )}
              {category !== 'All' && (
                <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Danh mục: {category}
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setCategory('All'); triggerFilters(); }} />
                </span>
              )}
              {priceRange < 1500000 && (
                <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Giá &le; {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(priceRange)}
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setPriceRange(1500000); triggerFilters(); }} />
                </span>
              )}
              {onlySale && (
                <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Đang giảm giá
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setOnlySale(false); triggerFilters(); }} />
                </span>
              )}
              {selectedSize !== 'All' && (
                <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Size: {selectedSize}
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setSelectedSize('All'); triggerFilters(); }} />
                </span>
              )}
              {selectedColor !== 'All' && (
                <span className="bg-neutral-105 text-neutral-750 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Màu: {selectedColor}
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setSelectedColor('All'); triggerFilters(); }} />
                </span>
              )}
              {selectedForm !== 'All' && (
                <span className="bg-neutral-105 text-neutral-750 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Phom: {selectedForm}
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setSelectedForm('All'); triggerFilters(); }} />
                </span>
              )}
              {selectedMaterial !== 'All' && (
                <span className="bg-neutral-105 text-neutral-750 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Vải: {selectedMaterial}
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setSelectedMaterial('All'); triggerFilters(); }} />
                </span>
              )}
              {selectedStockStatus !== 'All' && (
                <span className="bg-neutral-105 text-neutral-750 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-neutral-200/40">
                  Kho: {selectedStockStatus === 'in-stock' ? 'Còn hàng' : 'Sắp hết hàng'}
                  <X className="w-3 h-3 text-neutral-400 cursor-pointer" onClick={() => { setSelectedStockStatus('All'); triggerFilters(); }} />
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-rose-500 uppercase hover:underline ml-2 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          <div className="relative">
            {isLoading ? (
              // Synthetic loading spinner
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                <div className="bg-brand-accent text-white px-5 py-3 rounded-xl flex items-center gap-3 shadow-md">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider">Đang cập nhật...</span>
                </div>
              </div>
            ) : null}
 
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-brand-border"
              >
                <div className="inline-flex p-4 bg-brand-bg rounded-2xl border border-brand-border mb-6 text-brand-muted">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-brand-text mb-2 uppercase">Không tìm thấy sản phẩm</h3>
                <p className="text-xs text-brand-muted mb-8 max-w-sm mx-auto leading-relaxed">
                  Chúng tôi không tìm thấy kết quả phù hợp với các tiêu chí lọc hiện tại của bạn. Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-6 py-4 rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  Xóa toàn bộ bộ lọc
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTERS BOTTOM SHEET OVERLAY */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-neutral-950 z-40 lg:hidden"
            />
            {/* Side Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white z-50 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden border-l border-brand-border rounded-l-3xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
                  <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Bộ lọc tìm kiếm
                  </h3>
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setShowMobileFilters(false);
                    }}
                    className="text-xs font-bold text-rose-600 uppercase hover:underline"
                  >
                    Reset
                  </button>
                </div>
 
                {/* Filter Categories */}
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-3">Danh mục</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`text-xs py-2 px-4 rounded-xl font-bold transition-colors ${
                          category === cat
                            ? 'bg-brand-accent text-white shadow-sm'
                            : 'text-brand-muted bg-neutral-50 border border-brand-border'
                        }`}
                      >
                        {cat === 'All' ? 'Tất cả' : cat}
                      </button>
                    ))}
                  </div>
                </div>
 
                {/* Filter Price */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">Giá tối đa</h4>
                    <span className="text-xs font-bold text-brand-text">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(priceRange)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={150000}
                    max={1500000}
                    step={50000}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 bg-brand-border rounded-full appearance-none cursor-pointer accent-brand-accent"
                  />
                  <div className="flex justify-between text-[10px] text-brand-muted mt-2 font-medium">
                    <span>150k</span>
                    <span>1.5M</span>
                  </div>
                </div>
 
                {/* Filter Size */}
                <div className="mb-6 border-t border-brand-border pt-4">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-3">Kích cỡ</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'S', 'M', 'L', 'XL'].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`w-9 h-9 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-brand-accent border-brand-accent text-white shadow-sm'
                            : 'bg-neutral-50 border-brand-border text-brand-text hover:border-brand-muted'
                        }`}
                      >
                        {sz === 'All' ? 'Tất' : sz}
                      </button>
                    ))}
                  </div>
                </div>
 
                {/* Filter Color */}
                <div className="mb-6 border-t border-brand-border pt-4">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-3">Màu sắc</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Trắng', 'Đen', 'Beige', 'Nâu', 'Xám', 'Xanh'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border transition-colors cursor-pointer ${
                          selectedColor === color
                            ? 'bg-brand-accent border-brand-accent text-white shadow-sm'
                            : 'bg-neutral-50 border-brand-border text-brand-muted hover:border-brand-muted'
                        }`}
                      >
                        {color === 'All' ? 'Tất cả' : color}
                      </button>
                    ))}
                  </div>
                </div>
 
                {/* Filter Form Silhouette */}
                <div className="mb-6 border-t border-brand-border pt-4">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-2.5">Form dáng</h4>
                  <select
                    value={selectedForm}
                    onChange={(e) => setSelectedForm(e.target.value)}
                    className="w-full p-2.5 border border-brand-border rounded-xl bg-white text-xs font-semibold text-brand-text focus:outline-none cursor-pointer"
                  >
                    <option value="All">Tất cả phom dáng</option>
                    <option value="Slim">Slim Fit</option>
                    <option value="Regular">Regular Fit</option>
                    <option value="Oversized">Oversized / Relaxed</option>
                  </select>
                </div>
 
                {/* Filter Material */}
                <div className="mb-6 border-t border-brand-border pt-4">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-2.5">Chất liệu</h4>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full p-2.5 border border-brand-border rounded-xl bg-white text-xs font-semibold text-brand-text focus:outline-none cursor-pointer"
                  >
                    <option value="All">Tất cả chất liệu</option>
                    <option value="Cotton">Cotton Supima</option>
                    <option value="Linen">Linen Organic</option>
                    <option value="Denim">Denim / Jean</option>
                    <option value="Knit">Len / Dệt Kim (Knit)</option>
                  </select>
                </div>
 
                {/* Filter Stock Status */}
                <div className="mb-6 border-t border-brand-border pt-4">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-2.5">Tình trạng kho</h4>
                  <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="w-full p-2.5 border border-brand-border rounded-xl bg-white text-xs font-semibold text-brand-text focus:outline-none cursor-pointer"
                  >
                    <option value="All">Tất cả tình trạng</option>
                    <option value="in-stock">Còn hàng</option>
                    <option value="low-stock">Sắp hết hàng</option>
                  </select>
                </div>
 
                {/* Filter Promo Badges */}
                <div className="border-t border-brand-border pt-4 mb-4">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-3">Ưu đãi</h4>
                  <label className="flex items-center gap-3 cursor-pointer group text-xs text-brand-muted font-medium">
                    <input
                      type="checkbox"
                      checked={onlySale}
                      onChange={(e) => setOnlySale(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-border accent-brand-accent focus:ring-0 cursor-pointer"
                    />
                    <span>Sản phẩm giảm giá</span>
                  </label>
                </div>
              </div>
 
              {/* View Results CTA */}
              <div className="border-t border-brand-border pt-4 mt-6">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-brand-accent text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm text-center"
                >
                  Xem {filteredProducts.length} kết quả
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-8 bg-neutral-100 w-1/4 rounded-full mb-8 animate-pulse" />
        <ProductSkeleton />
      </div>
    }>
      <ProductListContent />
    </Suspense>
  );
}
