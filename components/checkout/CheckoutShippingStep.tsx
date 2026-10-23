import React from 'react';
import { ArrowRight, Sparkles, Truck, Zap, PackageCheck, Clock } from 'lucide-react';
import VietnamAddressSelector, { AddressSelectorValue } from './VietnamAddressSelector';
import { FormErrors } from './checkoutTypes';
import { formatPrice } from '../../lib/utils';

interface CheckoutShippingStepProps {
  currentUser: any;
  addressBook: any[];
  address: string;
  setAddress: (addr: string) => void;
  setFullName: (name: string) => void;
  setPhone: (phone: string) => void;
  cartSubtotal: number;
  customerTier: 'standard' | 'silver' | 'gold' | 'platinum' | 'diamond';
  paymentMethod: 'cod' | 'vnpay';
  appliedPromoCode?: string;
  onAddressChange: (val: AddressSelectorValue) => void;
  addressData: AddressSelectorValue | null;
  selectedShippingOptionId: 'instant_2h' | 'express_standard' | 'economy';
  setSelectedShippingOptionId: (id: 'instant_2h' | 'express_standard' | 'economy') => void;
  notes: string;
  setNotes: (notes: string) => void;
  errors: FormErrors;
  onBack: () => void;
  onContinue: () => void;
}

export function CheckoutShippingStep({
  currentUser,
  addressBook,
  address,
  setAddress,
  setFullName,
  setPhone,
  cartSubtotal,
  customerTier,
  paymentMethod,
  appliedPromoCode,
  onAddressChange,
  addressData,
  selectedShippingOptionId,
  setSelectedShippingOptionId,
  notes,
  setNotes,
  errors,
  onBack,
  onContinue,
}: CheckoutShippingStepProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-brand-border">
        <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-2">
          <span>2. Địa chỉ nhận hàng & Giao vận</span>
        </h3>
        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          Định tuyến thông minh
        </span>
      </div>

      {/* Quick select saved addresses */}
      {currentUser && addressBook.length > 0 && (
        <div className="flex flex-col gap-2 pb-4 border-b border-brand-border animate-fade-in">
          <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">
            Sử dụng địa chỉ đã lưu
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {addressBook.map((addr) => {
              const isSelected = address.includes(addr.detailAddress);
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    setFullName(addr.fullName);
                    setPhone(addr.phone);
                    setAddress(`${addr.detailAddress}, ${addr.city}`);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer focus:outline-none ${
                    isSelected
                      ? 'border-brand-text bg-neutral-50 shadow-sm'
                      : 'border-brand-border hover:border-brand-text bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold text-brand-text">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded-md">Mặc định</span>
                    )}
                  </div>
                  <span className="text-[10px] text-brand-muted font-mono">{addr.phone}</span>
                  <span className="text-[10px] text-brand-muted line-clamp-1">{addr.detailAddress}, {addr.city}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4-Tier Administrative Address Cascading Selector */}
      <div className="flex flex-col gap-2">
        <VietnamAddressSelector
          subtotal={cartSubtotal}
          customerTier={customerTier}
          paymentMethod={paymentMethod}
          appliedPromoCode={appliedPromoCode}
          onChange={onAddressChange}
          error={errors.address}
        />
      </div>

      {/* 3 SLA Delivery Options Cards */}
      <div className="flex flex-col gap-3 pt-3 border-t border-brand-border">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-brand-accent" />
            Gói cước giao hàng (SLA Delivery Options) *
          </label>
          <span className="text-[10px] text-neutral-500 font-mono">
            {addressData?.shippingData.options.length || 0} lựa chọn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(addressData?.shippingData.options || []).map((option) => {
            const isSelected = selectedShippingOptionId === option.id;
            return (
              <div
                key={option.id}
                onClick={() => setSelectedShippingOptionId(option.id)}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all relative ${
                  isSelected
                    ? 'border-brand-accent bg-neutral-50/80 shadow-xs ring-1 ring-brand-accent'
                    : 'border-brand-border hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      {option.id === 'instant_2h' ? (
                        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : option.id === 'express_standard' ? (
                        <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <PackageCheck className="w-4 h-4 text-sky-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-brand-text">{option.name}</span>
                    </div>
                    {option.badge && (
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        option.badge.includes('Miễn phí')
                          ? 'bg-emerald-100 text-emerald-800'
                          : option.badge.includes('Siêu tốc')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-neutral-200 text-neutral-800'
                      }`}>
                        {option.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-neutral-600 line-clamp-1">{option.desc}</p>
                  
                  <div className="flex items-center gap-1 text-[10px] text-brand-muted font-medium mt-1">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>{option.estimatedDelivery}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-brand-border/60">
                  <span className="text-[9px] text-brand-muted">{option.carrierName.split(' ')[0]}</span>
                  <div className="text-right">
                    {option.finalFee === 0 ? (
                      <span className="text-xs font-bold text-emerald-700 uppercase">Miễn phí</span>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        {option.discount > 0 && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            {formatPrice(option.originalFee)}
                          </span>
                        )}
                        <span className="text-xs font-bold text-brand-text">
                          {formatPrice(option.finalFee)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-brand-border">
        <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Ghi chú đơn hàng (Tùy chọn)</label>
        <textarea
          rows={2}
          placeholder="Ghi chú về thời gian giao hàng, chỉ dẫn tìm đường..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-white border border-brand-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent w-full resize-none"
        />
      </div>

      <div className="flex gap-4 mt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-transparent border border-brand-text text-brand-text text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Quay lại</span>
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
        >
          <span>Tiếp tục thanh toán</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
