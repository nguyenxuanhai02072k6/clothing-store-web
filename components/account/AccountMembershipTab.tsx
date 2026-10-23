'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, QrCode } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { getCustomerTier, TIER_BENEFITS, TierBenefit } from '../../types';

interface AccountMembershipTabProps {
  currentUser: any;
  redeemedPoints: number;
  handleRedeemVoucher: (cost: number, value: number, code: string) => Promise<void>;
  setQrVoucherModal: (modal: any) => void;
}

export default function AccountMembershipTab({
  currentUser,
  redeemedPoints,
  handleRedeemVoucher,
  setQrVoucherModal
}: AccountMembershipTabProps) {
  const totalSpent = currentUser?.totalSpent || 0;
  const currentTier = getCustomerTier(totalSpent);
  const currentBenefit = TIER_BENEFITS[currentTier];

  // Setup tier styling
  let nextTier: TierBenefit | null = null;
  let spendNeeded = 0;
  let progressPercent = 0;

  if (currentTier === 'standard') {
    nextTier = TIER_BENEFITS.silver;
    spendNeeded = TIER_BENEFITS.silver.minSpend - totalSpent;
    progressPercent = (totalSpent / TIER_BENEFITS.silver.minSpend) * 100;
  } else if (currentTier === 'silver') {
    nextTier = TIER_BENEFITS.gold;
    spendNeeded = TIER_BENEFITS.gold.minSpend - totalSpent;
    const currentTierRange = TIER_BENEFITS.gold.minSpend - TIER_BENEFITS.silver.minSpend;
    const currentTierProgress = totalSpent - TIER_BENEFITS.silver.minSpend;
    progressPercent = (currentTierProgress / currentTierRange) * 100;
  } else if (currentTier === 'gold') {
    nextTier = TIER_BENEFITS.platinum;
    spendNeeded = TIER_BENEFITS.platinum.minSpend - totalSpent;
    const currentTierRange = TIER_BENEFITS.platinum.minSpend - TIER_BENEFITS.gold.minSpend;
    const currentTierProgress = totalSpent - TIER_BENEFITS.gold.minSpend;
    progressPercent = (currentTierProgress / currentTierRange) * 100;
  } else if (currentTier === 'platinum') {
    nextTier = TIER_BENEFITS.diamond;
    spendNeeded = TIER_BENEFITS.diamond.minSpend - totalSpent;
    const currentTierRange = TIER_BENEFITS.diamond.minSpend - TIER_BENEFITS.platinum.minSpend;
    const currentTierProgress = totalSpent - TIER_BENEFITS.platinum.minSpend;
    progressPercent = (currentTierProgress / currentTierRange) * 100;
  } else {
    progressPercent = 100;
  }

  progressPercent = Math.max(0, Math.min(100, progressPercent));

  return (
    <div>
      <h3 className="text-xl font-normal text-brand-text tracking-widest mb-2 uppercase pb-3 border-b border-brand-border">
        Thành viên VIP NOVYN Club
      </h3>
      <p className="text-xs text-brand-muted mb-8 font-light">
        Trở thành khách hàng thân thiết để tận hưởng các chiết khấu trực tiếp và đặc quyền VIP cao cấp.
      </p>

      {/* VIP CARD */}
      <div className="p-8 rounded-2xl bg-neutral-900 text-white border border-brand-border shadow-sm relative overflow-hidden mb-8 transition-transform">
        <div className="flex justify-between items-start mb-12">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] font-normal text-neutral-400 block">NOVYN VIP CLUB</span>
            <h4 className="text-xl font-normal tracking-widest uppercase mt-1.5">{currentBenefit.name}</h4>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold tracking-widest bg-white/10 px-3 py-1.5 rounded-full uppercase text-neutral-300 border border-brand-border/20">
              Ưu đãi: Giảm {currentBenefit.discountPercent}%
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
          <div>
            <span className="text-[8px] uppercase tracking-wider block text-neutral-400 mb-1">MÃ THÀNH VIÊN</span>
            <span className="text-xs font-mono font-bold select-all">{currentUser?.id?.toUpperCase()}</span>
            <span className="text-sm font-normal uppercase tracking-widest block mt-2">{currentUser?.name}</span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[8px] uppercase tracking-wider block text-neutral-400 mb-0.5">TÍCH LŨY CHI TIÊU</span>
            <span className="text-lg font-normal">{formatPrice(totalSpent)}</span>
          </div>
        </div>
      </div>

      {/* NOVYN LOYALTY POINTS DASHBOARD & GIFT SHOP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Points Card */}
        <div className="bg-neutral-50 p-6 rounded-2xl border border-brand-border flex flex-col justify-between relative overflow-hidden md:col-span-1 shadow-sm">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">
              Điểm thưởng NOVYN
            </span>
            <h5 className="text-3xl font-normal text-brand-text">
              {Math.max(0, Math.floor(totalSpent / 10000) - redeemedPoints).toLocaleString()}
            </h5>
            <span className="text-[10px] text-brand-muted font-light block mt-1">
              Tích lũy từ chi tiêu (10.000đ = 1 điểm)
            </span>
          </div>
          <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between text-[9px] text-brand-muted font-bold tracking-wider uppercase">
            <span>Đã đổi: {redeemedPoints}đ</span>
            <span>Tích lũy: {Math.floor(totalSpent / 10000)}đ</span>
          </div>
        </div>

        {/* Gift redemption list */}
        <div className="bg-neutral-50/40 p-6 rounded-2xl border border-brand-border md:col-span-2 text-left shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">
              Đổi điểm lấy Voucher VIP
            </span>
            <p className="text-xs text-brand-muted mb-4 font-light">
              Sử dụng điểm tích lũy của bạn để đổi các mã giảm giá mua hàng ngay:
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { cost: 500, value: 50000, code: 'NOVYNVIP50' },
              { cost: 1000, value: 100000, code: 'NOVYNVIP100' },
              { cost: 2000, value: 200000, code: 'NOVYNVIP200' },
            ].map((item) => {
              const balance = Math.floor(totalSpent / 10000) - redeemedPoints;
              const canRedeem = balance >= item.cost;
              return (
                <div key={item.code} className="flex items-center justify-between p-3 bg-white rounded-xl border border-brand-border shadow-inner">
                  <div className="text-left">
                    <span className="text-xs font-bold text-brand-text uppercase">
                      Voucher Giảm {formatPrice(item.value)}
                    </span>
                    <span className="text-[9px] font-bold text-brand-accent tracking-widest block uppercase mt-0.5">
                      {item.cost} Điểm thưởng
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQrVoucherModal({
                        code: item.code,
                        value: item.value,
                        type: 'fixed',
                        description: `Voucher VIP Loyalty - Giảm ${formatPrice(item.value)}`
                      })}
                      className="px-2.5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 flex items-center gap-1 cursor-pointer active:scale-95"
                      title="Xem mã QR để quét tại quầy thu ngân"
                    >
                      <QrCode className="w-3 h-3 text-rose-500" />
                      <span>Mã QR</span>
                    </button>
                    <button
                      onClick={() => handleRedeemVoucher(item.cost, item.value, item.code)}
                      disabled={!canRedeem}
                      className={`px-3.5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 cursor-pointer border ${
                        canRedeem
                          ? 'bg-brand-accent text-white border-brand-accent hover:bg-neutral-800 shadow-sm'
                          : 'bg-white text-brand-muted border-brand-border cursor-not-allowed'
                      }`}
                    >
                      Đổi mã
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PROGRESS TRACKER */}
      <div className="bg-neutral-50 p-6 rounded-2xl border border-brand-border mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">
            {nextTier ? `Tiến trình nâng hạng tiếp theo` : `Hạng thành viên tối thượng`}
          </span>
          {nextTier && (
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
              Còn thiếu: <strong className="text-brand-text">{formatPrice(spendNeeded)}</strong>
            </span>
          )}
        </div>

        <div className="w-full h-2 bg-brand-border rounded-full overflow-hidden mb-3 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-brand-accent rounded-full"
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold text-brand-muted uppercase tracking-wider">
          <span>Hạng hiện tại: {currentBenefit.name}</span>
          {nextTier ? (
            <span>Mục tiêu: {nextTier.name} ({formatPrice(nextTier.minSpend)})</span>
          ) : (
            <span className="text-emerald-800 font-extrabold">★ Đạt hạng Kim Cương tối cao!</span>
          )}
        </div>
      </div>

      {/* CURRENT TIER BENEFITS GRID */}
      <h4 className="text-[10px] font-bold text-brand-text tracking-widest uppercase mb-4">
        Các đặc quyền hiện tại của bạn
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {currentBenefit.benefits.map((b, idx) => (
          <div key={idx} className="flex gap-3 p-4 bg-neutral-50/30 border border-brand-border rounded-xl items-start">
            <div className="p-1 rounded-md bg-brand-accent text-white shrink-0 shadow-sm mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs text-brand-text leading-relaxed font-light">{b}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ALL TIERS COMPARISON */}
      <h4 className="text-[10px] font-bold text-brand-text tracking-widest uppercase mb-4">
        Bảng so sánh tất cả các phân hạng
      </h4>
      <div className="overflow-x-auto rounded-2xl border border-brand-border mb-8">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-brand-border text-brand-muted font-bold uppercase tracking-widest text-[9px]">
              <th className="p-4">Hạng VIP</th>
              <th className="p-4">Mức tích lũy</th>
              <th className="p-4 text-center">Chiết khấu VIP</th>
              <th className="p-4">Đặc quyền nổi bật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-brand-text font-light">
            {Object.values(TIER_BENEFITS).map((t) => {
              const isCurrent = t.tier === currentTier;
              return (
                <tr
                  key={t.tier}
                  className={`transition-colors ${
                    isCurrent ? 'bg-neutral-50/40 font-semibold border-l-2 border-brand-accent' : 'hover:bg-neutral-50/10'
                  }`}
                >
                  <td className="p-4">
                    <span className="font-bold uppercase tracking-wide text-brand-text">{t.name}</span>
                    {isCurrent && (
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-brand-accent text-white shadow-sm">
                        Hiện tại
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-brand-muted font-bold">{t.minSpend === 0 ? 'Mới đăng ký' : `≥ ${formatPrice(t.minSpend)}`}</td>
                  <td className="p-4 text-center text-brand-text font-bold">{t.discountPercent}%</td>
                  <td className="p-4 text-brand-muted leading-relaxed max-w-xs truncate md:whitespace-normal">
                    {t.tier === 'standard' ? 'Tích luỹ điểm, quà sinh nhật' :
                     t.tier === 'silver' ? 'Giảm 5%, Đổi trả trong 7 ngày' :
                     t.tier === 'gold' ? 'Giảm 10%, Freeship đơn, Đổi trả 15 ngày' :
                     t.tier === 'platinum' ? 'Giảm 15%, Freeship đơn, Lounge VIP, Đổi trả 30 ngày' :
                     'Giảm 20%, Freeship đơn, Stylist tại gia, Đổi trả vô thời hạn'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
