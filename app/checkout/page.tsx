'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { AddressSelectorValue } from '../../components/checkout/VietnamAddressSelector';
import { ShippingOption } from '@/backend/services/smartShippingEngine';
import { getCustomerTier } from '../../types';
import { FormErrors, CheckoutStep } from '../../components/checkout/checkoutTypes';
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper';
import { CheckoutCustomerInfoStep } from '../../components/checkout/CheckoutCustomerInfoStep';
import { CheckoutShippingStep } from '../../components/checkout/CheckoutShippingStep';
import { CheckoutPaymentStep } from '../../components/checkout/CheckoutPaymentStep';
import { CheckoutOrderSummarySidebar } from '../../components/checkout/CheckoutOrderSummarySidebar';
import { CheckoutSuccessModal } from '../../components/checkout/CheckoutSuccessModal';

export default function CheckoutPage() {
  const { cart, cartSubtotal, cartDiscount, memberDiscount, cartShipping, clearCart, appliedPromo } = useCart();
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
  const [selectedBranch, setSelectedBranch] = useState('Chi nhánh Quận 1');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('info');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

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
        {/* Left Column: Form & Stepper */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <CheckoutStepper
            checkoutStep={checkoutStep}
            setCheckoutStep={setCheckoutStep}
            validateInfoStep={validateInfoStep}
            validateShippingStep={validateShippingStep}
          />

          <form onSubmit={handleOrderSubmit} className="flex flex-col gap-6">
            {checkoutStep === 'info' && (
              <CheckoutCustomerInfoStep
                fullName={fullName}
                setFullName={setFullName}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                setAddress={setAddress}
                addressBook={addressBook}
                currentUser={currentUser}
                errors={errors}
                setErrors={setErrors}
                onContinue={() => {
                  if (validateInfoStep()) setCheckoutStep('shipping');
                }}
              />
            )}

            {checkoutStep === 'shipping' && (
              <CheckoutShippingStep
                currentUser={currentUser}
                addressBook={addressBook}
                address={address}
                setAddress={setAddress}
                setFullName={setFullName}
                setPhone={setPhone}
                cartSubtotal={cartSubtotal}
                customerTier={customerTier}
                paymentMethod={paymentMethod}
                appliedPromoCode={appliedPromo?.code}
                onAddressChange={handleAddressChange}
                addressData={addressData}
                selectedShippingOptionId={selectedShippingOptionId}
                setSelectedShippingOptionId={setSelectedShippingOptionId}
                notes={notes}
                setNotes={setNotes}
                errors={errors}
                onBack={() => setCheckoutStep('info')}
                onContinue={() => {
                  if (validateShippingStep()) setCheckoutStep('payment');
                }}
              />
            )}

            {checkoutStep === 'payment' && (
              <CheckoutPaymentStep
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isSubmitting={isSubmitting}
                onBack={() => setCheckoutStep('shipping')}
              />
            )}
          </form>
        </div>

        {/* Right Column: Order Checkout Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <CheckoutOrderSummarySidebar
            cart={cart}
            cartSubtotal={cartSubtotal}
            effectiveShippingFee={effectiveShippingFee}
            activeShippingOption={activeShippingOption}
            memberDiscount={memberDiscount}
            cartDiscount={cartDiscount}
            appliedPromo={appliedPromo}
            effectiveTotal={effectiveTotal}
            isSubmitting={isSubmitting}
            onOrderSubmit={handleOrderSubmit}
          />
        </div>
      </div>

      {/* Success Modal */}
      <CheckoutSuccessModal
        show={showSuccessModal}
        orderId={generatedOrderId}
        fullName={fullName}
        address={address}
        effectiveTotal={effectiveTotal}
        onFinish={handleFinishCheckout}
      />
    </div>
  );
}
