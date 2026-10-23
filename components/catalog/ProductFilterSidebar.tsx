import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { CATEGORIES, SIZES, COLORS, FORMS, MATERIALS, STOCK_STATUSES } from './catalogTypes';
import { formatPrice } from '../../lib/utils';

interface ProductFilterSidebarProps {
  category: string;
  setCategory: (cat: string) => void;
  priceRange: number;
  setPriceRange: (price: number) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedForm: string;
  setSelectedForm: (form: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (mat: string) => void;
  selectedStockStatus: string;
  setSelectedStockStatus: (status: string) => void;
  onlySale: boolean;
  setOnlySale: (sale: boolean) => void;
  onResetFilters: () => void;
}

export function ProductFilterSidebar({
  category,
  setCategory,
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
  onlySale,
  setOnlySale,
  onResetFilters,
}: ProductFilterSidebarProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
        <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Bộ lọc tìm kiếm
        </h3>
        <button
          onClick={onResetFilters}
          className="text-[10px] font-bold text-rose-600 uppercase hover:underline cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Filter Categories */}
      <div className="mb-8">
        <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-4">Danh mục</h4>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-left text-xs py-2 px-3 rounded-xl font-medium transition-all cursor-pointer ${
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
            {formatPrice(priceRange)}
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
          {SIZES.map((sz) => (
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
          {COLORS.map((color) => {
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
          {FORMS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
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
          {MATERIALS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
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
          {STOCK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
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
    </div>
  );
}
