import React from 'react';
import { CheckoutStep } from './checkoutTypes';

interface CheckoutStepperProps {
  checkoutStep: CheckoutStep;
  setCheckoutStep: (step: CheckoutStep) => void;
  validateInfoStep: () => boolean;
  validateShippingStep: () => boolean;
}

export function CheckoutStepper({
  checkoutStep,
  setCheckoutStep,
  validateInfoStep,
  validateShippingStep,
}: CheckoutStepperProps) {
  return (
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
  );
}
