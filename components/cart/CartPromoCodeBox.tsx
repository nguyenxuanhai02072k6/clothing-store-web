import React from 'react';
import { Tag, QrCode, X } from 'lucide-react';

interface CartPromoCodeBoxProps {
  appliedPromo: any;
  removePromoCode: () => void;
  promoInput: string;
  setPromoInput: (val: string) => void;
  promoError: string;
  setPromoError: (err: string) => void;
  onApplyPromo: (e: React.FormEvent) => void;
  onOpenQrScanner: () => void;
  onClickQuickPromo: (code: string) => void;
}

export function CartPromoCodeBox({
  appliedPromo,
  removePromoCode,
  promoInput,
  setPromoInput,
  promoError,
  setPromoError,
  onApplyPromo,
  onOpenQrScanner,
  onClickQuickPromo,
}: CartPromoCodeBoxProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-2">
          <Tag className="w-4 h-4 text-brand-muted" />
          Mã giảm giá
        </h3>
        {!appliedPromo && (
          <button
            type="button"
            onClick={onOpenQrScanner}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-rose-400" />
            <span>Quét mã QR</span>
          </button>
        )}
      </div>

      {appliedPromo ? (
        // Active coupon badge
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold uppercase block">{appliedPromo.code}</span>
              <span className="text-[10px] text-emerald-600">{appliedPromo.description}</span>
            </div>
          </div>
          <button
            onClick={removePromoCode}
            className="p-1 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/50 transition-colors cursor-pointer"
            aria-label="Remove code"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Promo input form
        <form onSubmit={onApplyPromo} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Mã giảm giá..."
                value={promoInput}
                onChange={(e) => {
                  setPromoInput(e.target.value);
                  setPromoError('');
                }}
                className="bg-neutral-50 border border-brand-border rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-brand-accent focus:bg-white w-full uppercase text-brand-text"
              />
              <button
                type="button"
                onClick={onOpenQrScanner}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                title="Mở camera quét mã QR voucher"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!promoInput.trim()}
              className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </form>
      )}

      {promoError && (
        <p className="text-[10px] font-bold text-rose-600 mt-2">{promoError}</p>
      )}

      {/* Quick coupons selector */}
      {!appliedPromo && (
        <div className="mt-4 pt-4 border-t border-brand-border">
          <span className="text-[10px] font-bold uppercase text-brand-muted block mb-2">Mã giảm giá có sẵn:</span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onClickQuickPromo('SALE10')}
              className="text-left p-2.5 rounded-xl bg-neutral-50 hover:bg-brand-bg transition-colors border border-brand-border flex items-center justify-between text-[10px] text-brand-text font-bold cursor-pointer"
            >
              <span>🎁 SALE10 (Giảm 10%)</span>
              <span className="text-brand-muted hover:text-brand-text underline text-[9px] uppercase tracking-wider">Áp dụng nhanh</span>
            </button>
            <button
              type="button"
              onClick={() => onClickQuickPromo('FREESHIP')}
              className="text-left p-2.5 rounded-xl bg-neutral-50 hover:bg-brand-bg transition-colors border border-brand-border flex items-center justify-between text-[10px] text-brand-text font-bold cursor-pointer"
            >
              <span>🚚 FREESHIP (Miễn ship)</span>
              <span className="text-brand-muted hover:text-brand-text underline text-[9px] uppercase tracking-wider">Áp dụng nhanh</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
