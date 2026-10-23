'use client';

import React from 'react';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { formatPrice } from '../../../../lib/utils';

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'Tops', name: 'Áo' },
  { id: 'Bottoms', name: 'Quần' },
  { id: 'Dresses', name: 'Đầm' },
  { id: 'Outerwear', name: 'Áo khoác' }
];

const categoryLabel: Record<string, string> = {
  Tops: 'Áo thiết kế',
  Bottoms: 'Quần & Chân váy',
  Dresses: 'Đầm thanh lịch',
  Outerwear: 'Áo khoác blazer'
};

interface POSProductCatalogProps {
  productsList: any[];
  branchStock: Record<string, Record<string, number>>;
  currentUser: any;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  barcodeScan: string;
  setBarcodeScan: (b: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  barcodeInputRef: React.RefObject<HTMLInputElement | null>;
  handleBarcodeScan: (e: React.FormEvent) => void;
  handleAddToCart: (product: any, size: string, color: string) => void;
}

export default function POSProductCatalog({
  productsList,
  branchStock,
  currentUser,
  searchQuery,
  setSearchQuery,
  barcodeScan,
  setBarcodeScan,
  selectedCategory,
  setSelectedCategory,
  searchInputRef,
  barcodeInputRef,
  handleBarcodeScan,
  handleAddToCart
}: POSProductCatalogProps) {
  const branchName = currentUser?.branch || 'Chi nhánh Quận 1';

  return (
    <div className="lg:col-span-7 space-y-4">
      {/* Search bar & Barcode Scanner Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Search Input [F1] */}
        <div className="sm:col-span-7 relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm sản phẩm theo tên, SKU... [F1]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-xs bg-white focus:outline-none focus:border-rose-500 text-neutral-800 shadow-xs placeholder-neutral-400"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Barcode Scanner */}
        <form onSubmit={handleBarcodeScan} className="sm:col-span-5 flex gap-1.5">
          <div className="relative flex-1">
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Quét mã Barcode..."
              value={barcodeScan}
              onChange={(e) => setBarcodeScan(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white text-neutral-800 font-mono tracking-wider focus:outline-none focus:border-rose-500 shadow-xs placeholder-neutral-400"
            />
          </div>
          <button
            type="submit"
            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Quét
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar select-none pb-0.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide uppercase transition-all border cursor-pointer active:scale-95 whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
        {productsList
          .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
          .map((prod) => {
            const stock = branchStock?.[prod.id]?.[branchName] ?? 10;

            return (
              <div
                key={prod.id}
                className="bg-white border border-neutral-200 rounded-2xl p-3 flex gap-3 shadow-xs hover:border-neutral-400 transition-all hover:shadow-sm group"
              >
                <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-150">
                  <Image
                    src={prod.images[0]}
                    alt={prod.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-neutral-900 truncate flex-1" title={prod.name}>
                        {prod.name}
                      </h4>
                      {stock === 0 ? (
                        <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">
                          Hết hàng
                        </span>
                      ) : stock < 5 ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">
                          Còn {stock}
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
                          Kho: {stock}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">
                      {categoryLabel[prod.category] || prod.category}
                    </span>
                    <span className="text-xs font-black text-rose-600 font-mono block mt-1">
                      {formatPrice(prod.price)}
                    </span>
                  </div>

                  {/* Quick Variant Size Buttons */}
                  <div className="flex gap-1 flex-wrap pt-1.5">
                    {['S', 'M', 'L', 'XL'].map((sz) => (
                      <button
                        key={sz}
                        disabled={stock === 0}
                        onClick={() =>
                          handleAddToCart(
                            prod,
                            sz,
                            prod.colors?.[0]?.name || prod.colors?.[0] || 'Standard'
                          )
                        }
                        className="px-2 py-1 rounded-lg border border-neutral-200 text-[9px] font-black hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all cursor-pointer active:scale-95 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-400"
                      >
                        + {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
