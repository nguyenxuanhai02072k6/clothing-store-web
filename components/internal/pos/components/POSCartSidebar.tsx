'use client';

import React from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Zap,
  QrCode,
  Printer,
  Check
} from 'lucide-react';
import { formatPrice } from '../../../../lib/utils';
import { CartTab, CartItem } from '../posTypes';

const CROSS_SELL_ITEMS = [
  { id: 'cross-socks', name: 'Vớ Cotton Khử Mùi', price: 49000, sku: 'ACC-SOCK-01' },
  { id: 'cross-spray', name: 'Xịt Thơm Vải Novyn', price: 129000, sku: 'CARE-SPR-01' },
  { id: 'cross-scarf', name: 'Khăn Lụa Vuông Tơ', price: 189000, sku: 'ACC-SCRF-01' }
];

interface POSCartSidebarProps {
  activeTab: CartTab;
  updateActiveTab: (updater: Partial<CartTab> | ((prev: CartTab) => CartTab)) => void;
  subtotal: number;
  vipDiscountPercent: number;
  vipDiscountAmt: number;
  promoDiscountAmt: number;
  finalTotal: number;
  cashTendered: number;
  changeDue: number;
  getCashSuggestions: (total: number) => number[];
  handleUpdateQuantity: (itemId: string, delta: number) => void;
  handleCustomerLookup: () => void;
  handleCheckout: () => void;
  setShowProformaModal: (v: boolean) => void;
  setShowVoucherScanner: (v: boolean) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  customerInputRef: React.RefObject<HTMLInputElement | null>;
  promoInputRef: React.RefObject<HTMLInputElement | null>;
  cashInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function POSCartSidebar({
  activeTab,
  updateActiveTab,
  subtotal,
  vipDiscountPercent,
  vipDiscountAmt,
  promoDiscountAmt,
  finalTotal,
  cashTendered,
  changeDue,
  getCashSuggestions,
  handleUpdateQuantity,
  handleCustomerLookup,
  handleCheckout,
  setShowProformaModal,
  setShowVoucherScanner,
  showToast,
  customerInputRef,
  promoInputRef,
  cashInputRef
}: POSCartSidebarProps) {
  return (
    <div className="lg:col-span-5 bg-white border rounded-2xl p-4 shadow-xs space-y-4 sticky top-4">
      {/* Header Cart Info */}
      <div className="flex justify-between items-center border-b pb-3">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-rose-500" />
          <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">
            {activeTab.name} • Giỏ hàng
          </h4>
          <span className="text-rose-600 font-mono text-[10px] font-bold">
            ({activeTab.items.reduce((sum, i) => sum + i.quantity, 0)} sp)
          </span>
        </div>

        {/* Clear Cart Button */}
        {activeTab.items.length > 0 && (
          <button
            onClick={() => updateActiveTab({ items: [] })}
            className="text-[10px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-0.5 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Xóa trắng</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 border-b pb-3">
        {activeTab.items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2 stroke-1" />
            <p className="text-xs text-neutral-400 italic">Chưa có sản phẩm nào trong {activeTab.name}.</p>
            <p className="text-[10px] text-neutral-400 mt-1">Bấm nút kích cỡ bên trái hoặc quét mã barcode [F1]</p>
          </div>
        ) : (
          activeTab.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center gap-2 text-xs py-1.5 border-b border-neutral-100 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-neutral-900 block truncate">{item.product.name}</span>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="text-[9px] bg-neutral-100 text-neutral-600 px-1 py-0.2 rounded font-mono font-bold">
                    {item.size}
                  </span>
                  <span className="text-[8.5px] text-neutral-400 font-mono">SKU: {item.sku}</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleUpdateQuantity(item.id, -1)}
                  className="w-5 h-5 rounded bg-neutral-100 font-bold hover:bg-neutral-200 flex items-center justify-center text-[10px] cursor-pointer"
                >
                  -
                </button>
                <span className="w-4 text-center font-bold font-mono">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, 1)}
                  className="w-5 h-5 rounded bg-neutral-100 font-bold hover:bg-neutral-200 flex items-center justify-center text-[10px] cursor-pointer"
                >
                  +
                </button>
              </div>

              <span className="font-bold font-mono text-neutral-900 shrink-0 w-20 text-right">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Quick Cross-sell Add-on Bar */}
      <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            Gợi ý bán kèm tại quầy (Upsell)
          </span>
          <span className="text-[8px] font-bold text-neutral-500">+ AOV</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {CROSS_SELL_ITEMS.map((crossItem) => (
            <button
              key={crossItem.id}
              type="button"
              onClick={() => {
                const existing = activeTab.items.find((i) => i.product.id === crossItem.id);
                if (existing) {
                  handleUpdateQuantity(existing.id, 1);
                } else {
                  const newItem: CartItem = {
                    id: `${crossItem.id}-${Date.now()}`,
                    product: { id: crossItem.id, name: crossItem.name, price: crossItem.price, images: ['/brand/logo.png'] },
                    size: 'F',
                    color: 'Standard',
                    quantity: 1,
                    price: crossItem.price,
                    sku: crossItem.sku
                  };
                  updateActiveTab({ items: [...activeTab.items, newItem] });
                }
                showToast(`✓ Đã thêm ${crossItem.name} vào ${activeTab.name}`, 'success');
              }}
              className="p-1.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-lg text-left transition-all cursor-pointer shadow-xs"
            >
              <span className="text-[9px] font-bold block truncate text-neutral-900">{crossItem.name}</span>
              <span className="text-[8.5px] font-mono font-bold text-amber-800 block mt-0.5">
                {formatPrice(crossItem.price)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Customer Loyalty Search [F2] */}
      <div className="space-y-1.5 border-b pb-3">
        <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">
          Khách hàng thân thiết [F2]
        </label>
        <div className="flex gap-2">
          <input
            ref={customerInputRef}
            type="text"
            placeholder="Nhập SĐT hoặc tên khách..."
            value={activeTab.customerPhone}
            onChange={(e) => updateActiveTab({ customerPhone: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomerLookup()}
            className="flex-1 px-3 py-1.5 border rounded-lg text-xs bg-white text-neutral-800 focus:outline-none focus:border-rose-500 font-mono"
          />
          <button
            type="button"
            onClick={handleCustomerLookup}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
          >
            Đồng bộ
          </button>
        </div>
        {activeTab.selectedCustomer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-900">
            <div>
              <span className="font-bold">💎 {activeTab.selectedCustomer.name}</span>
              <span className="text-[9px] text-amber-700 block mt-0.5">
                Hạng: <strong className="uppercase">{activeTab.selectedCustomer.tier}</strong> • Điểm:{' '}
                <strong>{activeTab.selectedCustomer.points || 0}</strong>
              </span>
            </div>
            <span className="font-mono font-black text-xs text-amber-800">
              -{vipDiscountPercent * 100}%
            </span>
          </div>
        )}
      </div>

      {/* Promo Code Input [F3] with QR Scanner */}
      <div className="flex gap-2 border-b pb-3 items-center">
        <input
          ref={promoInputRef}
          type="text"
          placeholder="Mã voucher (SALE10, FREESHIP)... [F3]"
          value={activeTab.promoCode}
          onChange={(e) => updateActiveTab({ promoCode: e.target.value })}
          className="flex-1 px-3 py-1.5 border rounded-lg text-xs bg-white text-neutral-800 uppercase font-bold focus:outline-none focus:border-rose-500"
        />
        <button
          type="button"
          onClick={() => setShowVoucherScanner(true)}
          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 shadow-xs"
          title="Mở camera hoặc tải ảnh quét mã QR voucher"
        >
          <QrCode className="w-3.5 h-3.5 text-rose-400" />
          <span>Quét QR</span>
        </button>
        {activeTab.promoCode && (
          <span
            className={`text-[9px] font-black uppercase tracking-wide px-2 py-1.5 rounded-lg flex items-center shrink-0 border ${
              promoDiscountAmt > 0
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-neutral-100 text-neutral-500 border-neutral-200'
            }`}
          >
            {promoDiscountAmt > 0 ? `-${formatPrice(promoDiscountAmt)}` : 'Không hợp lệ'}
          </span>
        )}
      </div>

      {/* Pricing Summary */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-neutral-600">
          <span>Tổng tiền hàng</span>
          <span className="font-mono">{formatPrice(subtotal)}</span>
        </div>
        {vipDiscountAmt > 0 && (
          <div className="flex justify-between text-amber-700 font-semibold">
            <span>Ưu đãi VIP ({activeTab.selectedCustomer?.tier})</span>
            <span className="font-mono">-{formatPrice(vipDiscountAmt)}</span>
          </div>
        )}
        {promoDiscountAmt > 0 && (
          <div className="flex justify-between text-rose-600 font-semibold">
            <span>Voucher giảm giá</span>
            <span className="font-mono">-{formatPrice(promoDiscountAmt)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-neutral-900 border-t pt-2 mt-1 text-base">
          <span>Phải thanh toán:</span>
          <span className="font-mono text-rose-600">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">
          Phương thức thanh toán
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'cash', label: '💵 Tiền mặt' },
            { key: 'transfer', label: '🏦 VietQR' },
            { key: 'wallet', label: '📱 Ví điện tử' }
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => updateActiveTab({ paymentMethod: m.key as any })}
              className={`py-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                activeTab.paymentMethod === m.key
                  ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                  : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* CASH TENDER SECTION: QUICK DENOMINATION BUTTONS & CHANGE CALCULATION */}
      {activeTab.paymentMethod === 'cash' && finalTotal > 0 && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-neutral-700">Tiền khách đưa:</span>
            <div className="relative w-36">
              <input
                ref={cashInputRef}
                type="number"
                value={activeTab.cashTendered || ''}
                onChange={(e) =>
                  updateActiveTab({ cashTendered: parseFloat(e.target.value) || 0 })
                }
                placeholder="Nhập số tiền..."
                className="w-full px-2.5 py-1 text-right font-mono font-bold text-xs border rounded-lg bg-white focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Fast Denomination Buttons */}
          <div className="flex gap-1.5 flex-wrap">
            {getCashSuggestions(finalTotal).map((amt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateActiveTab({ cashTendered: amt })}
                className="px-2 py-1 rounded-md text-[9px] font-bold font-mono bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 cursor-pointer active:scale-95 transition-all"
              >
                {idx === 0 ? 'Đúng tiền' : formatPrice(amt)}
              </button>
            ))}
          </div>

          {/* Change due result */}
          <div className="flex justify-between items-center pt-1 border-t border-dashed border-neutral-200">
            <span className="text-xs font-bold text-neutral-700">Tiền thừa trả khách:</span>
            <span
              className={`text-sm font-black font-mono px-2 py-0.5 rounded-lg ${
                changeDue > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : cashTendered > 0 && cashTendered < finalTotal
                  ? 'bg-rose-100 text-rose-800'
                  : 'text-neutral-500'
              }`}
            >
              {cashTendered > 0 && cashTendered < finalTotal
                ? `Thiếu ${formatPrice(finalTotal - cashTendered)}`
                : formatPrice(changeDue)}
            </span>
          </div>
        </div>
      )}

      {/* DYNAMIC VIETQR PREVIEW IF BANK TRANSFER */}
      {activeTab.paymentMethod === 'transfer' && finalTotal > 0 && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
          <div className="relative w-32 h-32 border-2 border-dashed border-rose-300 rounded-xl overflow-hidden bg-white p-1 shadow-inner">
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://qr.vietqr.co/NOVYN-STUDIO-RECONCILIATION-AMOUNT-${finalTotal}`}
              alt="VietQR Chuyển khoản"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="text-center">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">
              VietQR động hiển thị màn hình phụ
            </span>
            <span className="text-xs font-bold text-rose-600 font-mono">{formatPrice(finalTotal)}</span>
          </div>
        </div>
      )}

      {/* Action CTAs: Pro-forma & Final Checkout [F9] */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => setShowProformaModal(true)}
          disabled={activeTab.items.length === 0}
          className="w-full py-2 rounded-xl border border-neutral-300 hover:border-neutral-900 text-neutral-700 font-bold uppercase text-[10px] tracking-wider transition-all disabled:opacity-40 hover:bg-neutral-50 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5 text-neutral-600" />
          In Phiếu Tạm Tính
        </button>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={activeTab.items.length === 0}
          className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-xs tracking-wider transition-all disabled:opacity-40 shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Chốt đơn & In hóa đơn lẻ [F9]</span>
        </button>
      </div>
    </div>
  );
}
