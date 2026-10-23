import React from 'react';
import { Truck, ShieldCheck, ArrowRight } from 'lucide-react';

interface CheckoutPaymentStepProps {
  paymentMethod: 'cod' | 'vnpay';
  setPaymentMethod: (method: 'cod' | 'vnpay') => void;
  isSubmitting: boolean;
  onBack: () => void;
}

export function CheckoutPaymentStep({
  paymentMethod,
  setPaymentMethod,
  isSubmitting,
  onBack,
}: CheckoutPaymentStepProps) {
  return (
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
            <ShieldCheck className="w-5 h-5 text-brand-muted shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-brand-text uppercase block">Cổng thanh toán điện tử VNPay</span>
                <span className="text-[8px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded border border-rose-100 uppercase">Khuyên dùng</span>
              </div>
              <p className="text-[10px] text-brand-muted leading-normal font-light">
                Hỗ trợ quét mã VietQR ngân hàng, thẻ ATM nội địa 40+ ngân hàng Việt Nam, thẻ quốc tế Visa, Mastercard, JCB qua chuẩn mã hóa bảo mật.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-transparent border border-brand-text text-brand-text text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Quay lại</span>
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Hoàn tất đặt hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
