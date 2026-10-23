'use client';

import React from 'react';
import { Star, ShoppingBag, Heart, RotateCcw, Truck, ShieldCheck, HelpCircle, Minus, Plus } from 'lucide-react';
import { formatPrice } from '../../../lib/utils';
import { Product } from '../../../types';

interface ProductDetailFormProps {
  product: Product;
  dynamicRating: number;
  dynamicReviewsCount: number;
  selectedColor: { name: string; hex: string };
  setSelectedColor: (c: { name: string; hex: string }) => void;
  selectedSize: string;
  setSelectedSize: (s: string) => void;
  quantity: number;
  handleDecreaseQty: () => void;
  handleIncreaseQty: () => void;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
  toggleWishlist: (p: Product) => void;
  isLoved: boolean;
  setShowFitFinder: (v: boolean) => void;
  setRecommendedSize: (s: string | null) => void;
  branchStock: Record<string, Record<string, number>>;
  branchSizeStock: Record<string, Record<string, Record<string, number>>>;
  branchColorStock: Record<string, Record<string, Record<string, number>>>;
}

export default function ProductDetailForm({
  product,
  dynamicRating,
  dynamicReviewsCount,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  handleDecreaseQty,
  handleIncreaseQty,
  handleAddToCart,
  handleBuyNow,
  toggleWishlist,
  isLoved,
  setShowFitFinder,
  setRecommendedSize,
  branchStock,
  branchSizeStock,
  branchColorStock
}: ProductDetailFormProps) {
  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
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
                i < Math.floor(dynamicRating) ? 'text-amber-500' : 'text-neutral-200'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-brand-text">{dynamicRating}</span>
        <span className="text-[10px] text-brand-border">|</span>
        <span className="text-xs text-brand-muted hover:underline cursor-pointer">
          {dynamicReviewsCount} đánh giá
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
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
              Kích thước: <span className="text-brand-text">{selectedSize}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setRecommendedSize(null);
                setShowFitFinder(true);
              }}
              className="text-[10px] font-bold text-brand-accent uppercase tracking-widest hover:underline cursor-pointer flex items-center gap-1"
            >
              📐 Tìm size phù hợp (AI Finder)
            </button>
          </div>
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
          {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng tạm thời'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="flex-1 bg-brand-accent border border-brand-accent text-white text-xs sm:text-sm font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-800 transition-all text-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
        >
          {product.stock > 0 ? 'Mua Ngay' : 'Tạm hết hàng'}
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
  );
}
