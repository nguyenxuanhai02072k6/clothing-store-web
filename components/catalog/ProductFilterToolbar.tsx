import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

interface ProductFilterToolbarProps {
  search: string;
  setSearch: (s: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onSearchSubmit: (e: React.FormEvent) => void;
  onClearSearch: () => void;
  onOpenMobileFilters: () => void;
  sort: string;
  setSort: (s: string) => void;
  category: string;
  setCategory: (c: string) => void;
  onlySale: boolean;
  setOnlySale: (s: boolean) => void;
  priceRange: number;
  setPriceRange: (p: number) => void;
  selectedSize: string;
  setSelectedSize: (s: string) => void;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  selectedForm: string;
  setSelectedForm: (f: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (m: string) => void;
  selectedStockStatus: string;
  setSelectedStockStatus: (st: string) => void;
}

export function ProductFilterToolbar({
  search,
  setSearch,
  searchInputRef,
  onSearchSubmit,
  onClearSearch,
  onOpenMobileFilters,
  sort,
  setSort,
  category,
  setCategory,
  onlySale,
  setOnlySale,
  priceRange,
  setPriceRange,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  selectedForm,
  setSelectedForm,
  selectedMaterial,
  setSelectedMaterial,
  selectedStockStatus,
  setSelectedStockStatus,
}: ProductFilterToolbarProps) {
  const hasActiveFilters =
    category !== 'All' ||
    onlySale ||
    priceRange < 1500000 ||
    search ||
    selectedSize !== 'All' ||
    selectedColor !== 'All' ||
    selectedForm !== 'All' ||
    selectedMaterial !== 'All' ||
    selectedStockStatus !== 'All';

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-neutral-50 p-4 rounded-2xl border border-brand-border mb-8 w-full">
        {/* Search Form */}
        <form onSubmit={onSearchSubmit} className="relative w-full sm:max-w-xs">
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
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden py-2 px-4 border border-brand-border bg-white rounded-xl text-xs font-bold text-brand-text flex items-center gap-2 cursor-pointer"
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
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-[10px] uppercase font-bold text-neutral-400 mr-1">Bộ lọc đang chọn:</span>
          {category !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[11px] font-bold text-brand-text">
              {category}
              <button onClick={() => setCategory('All')} className="hover:text-rose-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {onlySale && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[11px] font-bold text-brand-text">
              Đang giảm giá
              <button onClick={() => setOnlySale(false)} className="hover:text-rose-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {priceRange < 1500000 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[11px] font-bold text-brand-text">
              Dưới {formatPrice(priceRange)}
              <button onClick={() => setPriceRange(1500000)} className="hover:text-rose-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSize !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[11px] font-bold text-brand-text">
              Size: {selectedSize}
              <button onClick={() => setSelectedSize('All')} className="hover:text-rose-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedColor !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[11px] font-bold text-brand-text">
              Màu: {selectedColor}
              <button onClick={() => setSelectedColor('All')} className="hover:text-rose-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedForm !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[11px] font-bold text-brand-text">
              Dáng: {selectedForm}
              <button onClick={() => setSelectedForm('All')} className="hover:text-rose-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedMaterial !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[11px] font-bold text-brand-text">
              Chất liệu: {selectedMaterial}
              <button onClick={() => setSelectedMaterial('All')} className="hover:text-rose-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStockStatus !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-border rounded-full text-[11px] font-bold text-brand-text">
              {selectedStockStatus === 'in-stock' ? 'Còn hàng' : 'Sắp hết'}
              <button onClick={() => setSelectedStockStatus('All')} className="hover:text-rose-600 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </>
  );
}
