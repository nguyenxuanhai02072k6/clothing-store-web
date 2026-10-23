'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { VoucherQrScannerModal } from '../../components/common/VoucherQrScannerModal';
import { CartEmptyState } from '../../components/cart/CartEmptyState';
import { CartItemList } from '../../components/cart/CartItemList';
import { CartOrderSummary } from '../../components/cart/CartOrderSummary';
import { CartPromoCodeBox } from '../../components/cart/CartPromoCodeBox';

export default function CartPage() {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTotal,
    appliedPromo,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);

  // Auto-apply voucher from URL parameters (e.g. from camera QR scan)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const voucherParam = params.get('voucher') || params.get('promo') || params.get('code');
      if (voucherParam) {
        applyPromoCode(voucherParam);
      }
    }
  }, [applyPromoCode]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;

    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoInput('');
    } else {
      setPromoError('Mã giảm giá không chính xác hoặc đã hết hạn.');
    }
  };

  const handleQrScanSuccess = (scannedCode: string) => {
    setPromoInput(scannedCode);
    const success = applyPromoCode(scannedCode);
    if (!success) {
      setPromoError(`Mã "${scannedCode}" không hợp lệ hoặc đã hết hạn.`);
    } else {
      setPromoInput('');
      setPromoError('');
    }
  };

  const clickQuickPromo = (code: string) => {
    setPromoInput(code);
    applyPromoCode(code);
  };

  if (cart.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Page Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-text tracking-tight uppercase mb-2">
          Giỏ Hàng Của Bạn
        </h1>
        <p className="text-xs text-brand-muted">
          Quản lý các sản phẩm bạn đã chọn trước khi tiến hành thanh toán đơn hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <CartItemList
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />

        {/* Right Column: Order Summary & Promo Box */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <CartOrderSummary
            cart={cart}
            cartSubtotal={cartSubtotal}
            cartShipping={cartShipping}
            cartDiscount={cartDiscount}
            cartTotal={cartTotal}
            appliedPromo={appliedPromo}
          />

          <CartPromoCodeBox
            appliedPromo={appliedPromo}
            removePromoCode={removePromoCode}
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            promoError={promoError}
            setPromoError={setPromoError}
            onApplyPromo={handleApplyPromo}
            onOpenQrScanner={() => setShowQrScanner(true)}
            onClickQuickPromo={clickQuickPromo}
          />
        </div>
      </div>

      {/* QR Code Voucher Scanner Modal */}
      <VoucherQrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onScanSuccess={handleQrScanSuccess}
        title="Quét mã QR Voucher"
        subtitle="Quét mã voucher trên điện thoại, tem nhãn hoặc thẻ ưu đãi"
      />
    </div>
  );
}
