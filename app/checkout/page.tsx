'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/utils';
import { ShieldCheck, Truck, Landmark, CheckCircle, ArrowRight, ArrowLeft, Info, Zap, Clock, PackageCheck, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VietnamAddressSelector, { AddressSelectorValue } from '../../components/checkout/VietnamAddressSelector';
import { ShippingOption } from '../../lib/services/smartShippingEngine';
import { getCustomerTier } from '../../types';

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function CheckoutPage() {
  const { cart, cartSubtotal, cartDiscount, memberDiscount, cartShipping, cartTotal, appliedPromo, clearCart } = useCart();
  const { createOrder, currentUser } = useAuth();
  const router = useRouter();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Smart Address & Shipping States
  const [addressData, setAddressData] = useState<AddressSelectorValue | null>(null);
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<'instant_2h' | 'express_standard' | 'economy'>('express_standard');

  const customerTier = currentUser && currentUser.role === 'customer'
    ? (getCustomerTier(currentUser.totalSpent || 0) as 'standard' | 'silver' | 'gold' | 'platinum' | 'diamond')
    : 'standard';

  // Handle cascading address change from VietnamAddressSelector
  const handleAddressChange = useCallback((val: AddressSelectorValue) => {
    setAddressData(val);
    setAddress(val.fullAddress);
    if (val.shippingData.recommendedBranch) {
      setSelectedBranch(val.shippingData.recommendedBranch);
    }
    // If current selected option is not available in newly calculated options (e.g. instant_2h outside HCM)
    if (!val.shippingData.options.some(o => o.id === selectedShippingOptionId)) {
      setSelectedShippingOptionId('express_standard');
    }
  }, [selectedShippingOptionId]);

  // Dynamic Shipping Fee & Effective Total
  const activeShippingOption: ShippingOption | undefined = useMemo(() => {
    if (!addressData) return undefined;
    return addressData.shippingData.options.find(o => o.id === selectedShippingOptionId) || addressData.shippingData.selectedOption;
  }, [addressData, selectedShippingOptionId]);

  const effectiveShippingFee = activeShippingOption !== undefined ? activeShippingOption.finalFee : cartShipping;
  const effectiveTotal = Math.max(
    0,
    cartSubtotal - (appliedPromo?.code === 'FREESHIP' ? memberDiscount : cartDiscount) + effectiveShippingFee
  );

  // Load addresses from local storage
  const [addressBook, setAddressBook] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser) {
      setEmail(prev => prev || currentUser.email || '');
      setFullName(prev => prev || currentUser.name || '');
      setPhone(prev => prev || currentUser.phone || '');
      
      try {
        const stored = localStorage.getItem(`novyn_addresses_${currentUser.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setAddressBook(parsed);
          
          // Auto fill default address on initial load
          const defaultAddr = parsed.find((a: any) => a.isDefault);
          if (defaultAddr) {
            setFullName(defaultAddr.fullName || '');
            setPhone(defaultAddr.phone || '');
            setAddress(`${defaultAddr.detailAddress}, ${defaultAddr.city}`);
          }
        } else {
          setAddressBook([]);
          setFullName(currentUser.name || '');
          setPhone(currentUser.phone || '');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer' | 'vnpay'>('cod');

  // Shipping Branch
  const [selectedBranch, setSelectedBranch] = useState('Chi nhánh Quận 1');
  
  // Checkout Steps: 'info' | 'shipping' | 'payment'
  const [checkoutStep, setCheckoutStep] = useState<'info' | 'shipping' | 'payment'>('info');

  // Errors and UI States
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // Scroll Lock when success modal is open
  useEffect(() => {
    if (showSuccessModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSuccessModal]);

  // Validate step fields
  const validateInfoStep = (): boolean => {
    const tempErrors: FormErrors = {};
    if (!fullName.trim()) tempErrors.fullName = 'Vui lòng nhập họ và tên.';
    
    const phoneRegex = /^0[35789]\d{8}$/;
    if (!phone.trim()) {
      tempErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      tempErrors.phone = 'Số điện thoại không hợp lệ (gồm 10 chữ số đầu 03/05/07/08/09).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!emailRegex.test(email)) {
      tempErrors.email = 'Địa chỉ email không đúng định dạng.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateShippingStep = (): boolean => {
    const tempErrors: FormErrors = {};
    if (!addressData?.street?.trim() && !address.trim()) {
      tempErrors.address = 'Vui lòng nhập số nhà và tên đường chi tiết.';
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkoutStep === 'info') {
      if (validateInfoStep()) setCheckoutStep('shipping');
      return;
    }
    if (checkoutStep === 'shipping') {
      if (validateShippingStep()) setCheckoutStep('payment');
      return;
    }

    // We are on payment step, confirm everything is validated
    if (!validateInfoStep() || !validateShippingStep()) return;

    setIsSubmitting(true);
    
    const finalAddress = addressData?.fullAddress || address;
    const shippingInfoNote = activeShippingOption ? `[${activeShippingOption.name} - ${activeShippingOption.carrierName}]` : '';
    const finalNotes = [shippingInfoNote, notes].filter(Boolean).join(' | ');

    createOrder(
      { fullName, phone, email, address: finalAddress, notes: finalNotes },
      cart,
      cartSubtotal,
      cartDiscount,
      effectiveShippingFee,
      effectiveTotal,
      paymentMethod,
      selectedBranch,
      'pending',
      appliedPromo?.code,
      selectedShippingOptionId,
      addressData?.province,
      addressData?.district,
      addressData?.ward
    )
      .then((res) => {
        const orderId = typeof res === 'string' ? res : res.orderId;
        const paymentUrl = typeof res === 'object' ? res.paymentUrl : undefined;
        setGeneratedOrderId(orderId);
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          setShowSuccessModal(true);
        }
      })
      .catch((err) => {
        console.error('Checkout error:', err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleFinishCheckout = () => {
    clearCart();
    setShowSuccessModal(false);
    router.push('/');
  };

  if (cart.length === 0 && !showSuccessModal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-normal text-brand-text mb-4 uppercase tracking-wider">Bạn chưa có sản phẩm để thanh toán</h2>
        <p className="text-xs text-brand-muted mb-8 leading-relaxed">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thực hiện bước thanh toán này.</p>
        <Link
          href="/products"
          className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Back to Cart link */}
      <Link
        href="/cart"
        className="text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text flex items-center gap-1.5 mb-8 w-fit transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Quay lại giỏ hàng
      </Link>

      {/* Page Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-normal text-brand-text tracking-tight uppercase mb-2">
          Thanh Toán Đơn Hàng
        </h1>
        <p className="text-xs text-brand-muted">
          Vui lòng điền đầy đủ thông tin giao hàng và chọn phương thức thanh toán phù hợp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Shipping Form & Payments (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Stepper progress indicator */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
            <button
              type="button"
              onClick={() => setCheckoutStep('info')}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                checkoutStep === 'info' ? 'bg-brand-text border-brand-text text-white' : 'border-brand-border text-brand-muted'
              }`}>1</span>
              <span className={`hidden sm:inline text-[10px] font-bold uppercase tracking-widest ${
                checkoutStep === 'info' ? 'text-brand-text' : 'text-brand-muted'
              }`}>Thông tin</span>
            </button>
            <div className="h-[1px] flex-grow bg-brand-border mx-2 md:mx-4" />
            <button
              type="button"
              onClick={() => {
                if (validateInfoStep()) setCheckoutStep('shipping');
              }}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                checkoutStep === 'shipping' ? 'bg-brand-text border-brand-text text-white' : 'border-brand-border text-brand-muted'
              }`}>2</span>
              <span className={`hidden sm:inline text-[10px] font-bold uppercase tracking-widest ${
                checkoutStep === 'shipping' ? 'text-brand-text' : 'text-brand-muted'
              }`}>Vận chuyển</span>
            </button>
            <div className="h-[1px] flex-grow bg-brand-border mx-2 md:mx-4" />
            <button
              type="button"
              onClick={() => {
                if (validateInfoStep() && validateShippingStep()) setCheckoutStep('payment');
              }}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                checkoutStep === 'payment' ? 'bg-brand-text border-brand-text text-white' : 'border-brand-border text-brand-muted'
              }`}>3</span>
              <span className={`hidden sm:inline text-[10px] font-bold uppercase tracking-widest ${
                checkoutStep === 'payment' ? 'text-brand-text' : 'text-brand-muted'
              }`}>Thanh toán</span>
            </button>
          </div>

          <form onSubmit={handleOrderSubmit} className="flex flex-col gap-6">
            
            {/* Step 1 panel: Customer details */}
            {checkoutStep === 'info' && (
              <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col gap-5">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-4 border-b border-brand-border mb-2">
                  1. Thông tin liên hệ
                </h3>

                {currentUser && addressBook.length > 0 && (
                  <div className="flex flex-col gap-2 pb-4 border-b border-brand-border mb-2 animate-fade-in">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">
                      Sử dụng địa chỉ đã lưu
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addressBook.map((addr) => {
                        const isSelected = fullName === addr.fullName && phone === addr.phone;
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

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn A..."
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
                      errors.fullName ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] font-bold text-rose-600">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Số điện thoại *</label>
                    <input
                      type="tel"
                      placeholder="Ví dụ: 0909xxxxxx..."
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
                        errors.phone ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
                      }`}
                    />
                    {errors.phone && <p className="text-[10px] font-bold text-rose-600">{errors.phone}</p>}
                  </div>

                  {/* Email Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Email liên hệ *</label>
                    <input
                      type="email"
                      placeholder="Ví dụ: name@gmail.com..."
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
                        errors.email ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
                      }`}
                    />
                    {errors.email && <p className="text-[10px] font-bold text-rose-600">{errors.email}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (validateInfoStep()) setCheckoutStep('shipping');
                  }}
                  className="mt-4 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>Tiếp tục vận chuyển</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Step 2 panel: Shipping & Address options */}
            {checkoutStep === 'shipping' && (
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
                    appliedPromoCode={appliedPromo?.code}
                    onChange={handleAddressChange}
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
                    onClick={() => setCheckoutStep('info')}
                    className="flex-1 bg-transparent border border-brand-text text-brand-text text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Quay lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateShippingStep()) setCheckoutStep('payment');
                    }}
                    className="flex-1 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>Tiếp tục thanh toán</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 panel: Payment details */}
            {checkoutStep === 'payment' && (
              <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col gap-5">
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-4 border-b border-brand-border mb-2">
                  3. Phương thức thanh toán
                </h3>

                <div className="flex flex-col gap-4">
                  
                  {/* COD Method option */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-all ${
                      paymentMethod === 'cod' ? 'border-brand-text bg-neutral-50' : 'border-brand-border hover:border-brand-text'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 accent-neutral-900 mt-1 cursor-pointer shrink-0"
                    />
                    <div className="flex gap-3">
                      <Truck className="w-5 h-5 text-brand-muted shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-brand-text uppercase block mb-1">Thanh toán khi nhận hàng (COD)</span>
                        <p className="text-[10px] text-brand-muted leading-normal font-light">
                          Quý khách thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer Method option */}
                  <div
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 rounded-xl border flex flex-col gap-4 cursor-pointer transition-all ${
                      paymentMethod === 'transfer' ? 'border-brand-text bg-neutral-50' : 'border-brand-border hover:border-brand-text'
                    }`}
                  >
                    <div className="flex items-start gap-4 w-full">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'transfer'}
                        onChange={() => setPaymentMethod('transfer')}
                        className="w-4 h-4 accent-neutral-900 mt-1 cursor-pointer shrink-0"
                      />
                      <div className="flex gap-3">
                        <Landmark className="w-5 h-5 text-brand-muted shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-brand-text uppercase block mb-1">Chuyển khoản ngân hàng trực tuyến</span>
                          <p className="text-[10px] text-brand-muted leading-normal font-light">
                            Chuyển khoản nhanh qua Internet Banking bằng mã QR code thông tin đơn hàng cực đơn giản.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subpanel for Bank Details QR code */}
                    {paymentMethod === 'transfer' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden border-t border-brand-border pt-4 flex flex-col md:flex-row items-center gap-6"
                      >
                        {/* Simulated QR Code Canvas */}
                        <div className="bg-white p-3 rounded-xl border border-brand-border shadow-inner flex flex-col items-center shrink-0">
                          <div className="w-32 h-32 relative bg-neutral-100 rounded-xl border border-brand-border flex items-center justify-center p-2">
                            <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2.5 opacity-85">
                              {[...Array(25)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`rounded-md ${
                                    i % 2 === 0 || i % 7 === 0 || i % 9 === 0 ? 'bg-brand-text' : 'bg-transparent'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="absolute bg-white px-2 py-0.5 border border-brand-border rounded-xl text-[8px] font-bold tracking-widest text-brand-text">
                              NOVYN
                            </div>
                          </div>
                          <span className="text-[8px] font-bold uppercase text-brand-muted mt-2 tracking-widest">Mã QR chuyển khoản</span>
                        </div>

                        {/* Bank Text Details */}
                        <div className="flex-grow flex flex-col gap-2.5 text-xs text-brand-muted">
                          <div className="grid grid-cols-3">
                            <span className="font-bold text-brand-muted/70">Ngân hàng</span>
                            <span className="col-span-2 text-brand-text font-bold">Techcombank (TCB)</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-bold text-brand-muted/70">Số tài khoản</span>
                            <span className="col-span-2 text-brand-text font-bold select-all">1903 4567 8901 234</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-bold text-brand-muted/70">Chủ tài khoản</span>
                            <span className="col-span-2 text-brand-text font-bold">CONG TY TNHH NOVYN WEAR</span>
                          </div>
                          <div className="grid grid-cols-3">
                            <span className="font-bold text-brand-muted/70">Nội dung ck</span>
                            <span className="col-span-2 text-brand-accent font-bold uppercase tracking-wider select-all">
                              NOVYN CK {generatedOrderId || 'DONHANG'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* VNPay Online Gateway option */}
                  <div
                    onClick={() => setPaymentMethod('vnpay')}
                    className={`p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-all ${
                      paymentMethod === 'vnpay' ? 'border-brand-text bg-neutral-50' : 'border-brand-border hover:border-brand-text'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'vnpay'}
                      onChange={() => setPaymentMethod('vnpay')}
                      className="w-4 h-4 accent-neutral-900 mt-1 cursor-pointer shrink-0"
                    />
                    <div className="flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-text uppercase block mb-1">Cổng thanh toán trực tuyến (VNPay / Thẻ ATM / Visa)</span>
                          <span className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Tự động 24/7</span>
                        </div>
                        <p className="text-[10px] text-brand-muted leading-normal font-light">
                          Thanh toán tự động qua cổng bảo mật VNPay bằng quét mã QR, thẻ ATM nội địa hoặc thẻ tín dụng quốc tế (Visa/Mastercard). Trạng thái đơn được cập nhật tức thời qua webhook mã hóa HMAC-SHA512.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('shipping')}
                    className="flex-1 bg-transparent border border-brand-text text-brand-text text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Quay lại</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      <>
                        <span>Hoàn tất đặt hàng</span>
                        <ShieldCheck className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Right Column: Order Checkout Summary (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Order items block list */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-4 border-b border-brand-border mb-5">
              Tóm tắt đơn hàng
            </h3>

            {/* List of scrollable items */}
            <div className="flex flex-col gap-4 max-h-60 overflow-y-auto mb-6 divide-y divide-brand-border">
              {cart.map((item, idx) => (
                <div key={item.id} className={`flex gap-3 pt-3 ${idx === 0 ? 'pt-0' : ''}`}>
                  <div className="relative w-12 aspect-[4/5] bg-brand-bg rounded-xl overflow-hidden border border-brand-border shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-xs font-medium uppercase text-brand-text hover:text-brand-muted line-clamp-1 mb-1">{item.product.name}</h4>
                    <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">
                      Màu: <span className="lowercase text-brand-text">{item.selectedColor.name}</span> | Size: <span className="text-brand-text">{item.selectedSize}</span>
                    </p>
                    <div className="flex justify-between items-end mt-1 text-[10px] tracking-wide">
                      <span className="text-brand-muted">Số lượng: {item.quantity}</span>
                      <span className="font-bold text-brand-text">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="flex flex-col gap-3 text-xs text-brand-muted border-t border-brand-border pt-5 mb-5 font-light">
              <div className="flex justify-between items-center">
                <span>Tạm tính</span>
                <span className="font-semibold text-brand-text">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>Phí vận chuyển</span>
                  {activeShippingOption && (
                    <span className="text-[10px] text-brand-muted font-normal">({activeShippingOption.name})</span>
                  )}
                </span>
                {effectiveShippingFee === 0 ? (
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 border border-emerald-100 rounded-full text-[10px] uppercase tracking-widest">Miễn phí</span>
                ) : (
                  <span className="font-semibold text-brand-text">{formatPrice(effectiveShippingFee)}</span>
                )}
              </div>
              {memberDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-800 font-bold">
                  <span>Chiết khấu VIP member</span>
                  <span>-{formatPrice(memberDiscount)}</span>
                </div>
              )}
              {cartDiscount - memberDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-800 font-bold">
                  <span>Voucher giảm giá {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
                  <span>-{formatPrice(cartDiscount - memberDiscount)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-end border-t border-brand-border pt-5 mb-6">
              <span className="text-xs uppercase font-bold text-brand-text">Tổng thanh toán</span>
              <span className="text-lg md:text-xl font-normal text-brand-text leading-none">
                {formatPrice(effectiveTotal)}
              </span>
            </div>

            {/* Final Order CTA button */}
            <button
              onClick={handleOrderSubmit}
              disabled={isSubmitting}
              className="w-full bg-brand-accent hover:bg-neutral-800 text-white text-xs md:text-sm font-bold uppercase tracking-widest py-4.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xử lý đặt hàng...</span>
                </div>
              ) : (
                <>
                  Đặt hàng an toàn
                  <ShieldCheck className="w-4.5 h-4.5" />
                </>
              )}
            </button>

            <span className="text-[10px] text-brand-muted text-center block mt-4 font-light leading-relaxed">
              Thanh toán được xử lý qua phương thức bạn chọn. NOVYN WEAR không lưu thông tin thẻ ngân hàng trên website.
            </span>
          </div>

        </div>

      </div>

      {/* 4. SUCCESS COMPLETED MODAL OVERLAY */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleFinishCheckout}
              className="fixed inset-0 bg-neutral-900/70 backdrop-blur-sm"
            />

            {/* Success Card Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="relative bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-brand-border z-10 flex flex-col items-center text-center overflow-hidden"
            >
              
              {/* Success Badge */}
              <div className="p-4 bg-neutral-100 rounded-2xl border border-brand-border text-emerald-800 mb-6 flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>

              {/* Lời Cảm Ơn */}
              <h2 className="text-xl sm:text-2xl font-normal text-brand-text uppercase tracking-widest mb-2">
                Đặt hàng thành công!
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-6 max-w-sm font-light">
                Cảm ơn bạn đã lựa chọn mua sắm tại <strong className="text-brand-text font-normal uppercase">NOVYN WEAR</strong>. Đơn hàng của bạn đã được tiếp nhận thành công.
              </p>

              {/* Order Invoice info block */}
              <div className="bg-neutral-50 w-full p-5 rounded-2xl border border-brand-border flex flex-col gap-3 text-xs sm:text-sm text-brand-muted mb-8 max-w-md text-left font-light">
                <div className="grid grid-cols-3 pb-2.5 border-b border-brand-border">
                  <span className="font-bold text-brand-text/70 uppercase text-[10px] tracking-wider">Mã đơn hàng</span>
                  <span className="col-span-2 text-brand-text font-bold select-all font-mono">{generatedOrderId}</span>
                </div>
                <div className="grid grid-cols-3 pb-2.5 border-b border-brand-border">
                  <span className="font-bold text-brand-text/70 uppercase text-[10px] tracking-wider">Người nhận</span>
                  <span className="col-span-2 text-brand-text font-normal">{fullName}</span>
                </div>
                <div className="grid grid-cols-3 pb-2.5 border-b border-brand-border">
                  <span className="font-bold text-brand-text/70 uppercase text-[10px] tracking-wider">Địa chỉ giao</span>
                  <span className="col-span-2 text-brand-text leading-tight">{address}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="font-bold text-brand-text/70 uppercase text-[10px] tracking-wider">Tổng tiền</span>
                  <span className="col-span-2 text-brand-text font-bold">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Instruction if Bank Transfer */}
              {paymentMethod === 'transfer' && (
                <div className="bg-neutral-50 p-4 rounded-xl border border-brand-border text-[10px] text-brand-muted font-light leading-relaxed text-left mb-8 w-full max-w-md">
                  📌 <strong>Hướng dẫn thanh toán chuyển khoản:</strong> Quý khách vui lòng chuyển khoản nhanh đúng số tiền <strong className="text-brand-text">{formatPrice(cartTotal)}</strong> tới STK <strong className="text-brand-text">1903 4567 8901 234</strong> (Techcombank) của NOVYN WEAR với nội dung: <strong className="text-brand-accent select-all">{`NOVYN CK ${generatedOrderId}`}</strong> để hệ thống tự động xác nhận giao hàng.
                </div>
              )}

              {/* CTA buttons */}
              <button
                onClick={handleFinishCheckout}
                className="w-full max-w-md bg-brand-accent hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold uppercase tracking-widest py-4.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                Tiếp tục mua sắm
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
