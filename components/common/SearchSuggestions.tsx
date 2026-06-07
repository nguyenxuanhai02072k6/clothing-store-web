'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, History, TrendingUp, X, Sparkles } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/products';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SearchSuggestionsProps {
  query: string;
  onSelectKeyword: (keyword: string) => void;
  onClose: () => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSelectKeyword,
  onClose,
}) => {
  const { productsList } = useAuth();
  const activeProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  const [history, setHistory] = useState<string[]>([]);
  const [popularKeywords] = useState<string[]>([
    'Linen',
    'Áo Thun',
    'Blazer',
    'Đầm Lụa',
    'Quần Tây',
    'Cotton',
  ]);

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('novyn_search_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter matching products
  const matchingProducts = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return activeProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query, activeProducts]);

  const handleDeleteHistoryItem = (e: React.MouseEvent, itemToDelete: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = history.filter((h) => h !== itemToDelete);
    setHistory(updated);
    try {
      localStorage.setItem('novyn_search_history', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-border shadow-xl z-50 p-4 max-h-[85vh] overflow-y-auto flex flex-col gap-5 rounded-2xl">
      {/* 1. If query is empty: Show history & popular keywords */}
      {!query.trim() ? (
        <>
          {/* History */}
          {history.length > 0 && (
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-neutral-400" />
                Tìm kiếm gần đây
              </span>
              <div className="flex flex-col gap-1">
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-neutral-50 rounded-lg cursor-pointer group"
                    onClick={() => onSelectKeyword(item)}
                  >
                    <span className="text-neutral-700 font-medium">{item}</span>
                    <button
                      onClick={(e) => handleDeleteHistoryItem(e, item)}
                      className="p-1 text-neutral-300 hover:text-neutral-600 rounded-full"
                      aria-label="Xóa lịch sử tìm kiếm này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
              Từ khóa phổ biến
            </span>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => onSelectKeyword(kw)}
                  className="px-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 transition-colors border border-brand-border text-xs font-bold text-neutral-700 rounded-full cursor-pointer"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 2. Real-time Product Search Results */}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Sản phẩm gợi ý ({matchingProducts.length})
            </span>

            {matchingProducts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {matchingProducts.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/products/${prod.slug}`}
                    onClick={onClose}
                    className="flex gap-3 items-center group/item hover:bg-neutral-50/50 p-1.5 border border-transparent hover:border-brand-border transition-all"
                  >
                    <div className="relative w-10 aspect-[4/5] bg-neutral-50 rounded-lg border border-brand-border overflow-hidden shrink-0">
                      <Image
                        src={prod.images[0]}
                        alt={prod.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-850 truncate group-hover/item:text-neutral-600 transition-colors">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-neutral-450 font-bold">
                          {prod.category}
                        </span>
                        <span className="text-xs font-bold text-neutral-900">
                          {formatPrice(prod.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => onSelectKeyword(query)}
                  className="w-full text-center py-2 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors mt-2 cursor-pointer rounded-xl"
                >
                  Xem tất cả kết quả cho &ldquo;{query}&rdquo;
                </button>
              </div>
            ) : (
              // Empty search state
              <div className="text-center py-6 text-xs text-neutral-450">
                Không tìm thấy sản phẩm nào khớp với &ldquo;{query}&rdquo;.
                <div className="mt-4 pt-4 border-t border-neutral-50">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-2">Thử các từ khóa phổ biến:</span>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {popularKeywords.slice(0, 4).map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => onSelectKeyword(kw)}
                        className="px-2.5 py-1 bg-neutral-50 border text-[10px] font-bold text-neutral-700 rounded-full cursor-pointer"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
