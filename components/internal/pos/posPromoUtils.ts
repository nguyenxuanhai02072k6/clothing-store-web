export interface PromoCheckResult {
  discount: number;
  desc: string;
  isValid: boolean;
}

const KNOWN_PROMOS: Record<string, { type: 'percent' | 'fixed'; value: number; minOrder?: number; desc: string }> = {
  SALE10: { type: 'percent', value: 10, desc: 'Giảm 10% tổng đơn' },
  SALE12: { type: 'percent', value: 12, desc: 'Giảm 12% tổng đơn' },
  SALE15: { type: 'percent', value: 15, desc: 'Giảm 15% tổng đơn' },
  SALE20: { type: 'percent', value: 20, desc: 'Jackpot Giảm 20%' },
  FREESHIP: { type: 'fixed', value: 30000, desc: 'Trừ 30.000 ₫' },
  LUCKYSHIP: { type: 'fixed', value: 30000, desc: 'Trừ 30.000 ₫' },
  LUCKYSHIP2: { type: 'fixed', value: 30000, desc: 'Trừ 30.000 ₫' },
  NOVYN50K: { type: 'fixed', value: 50000, desc: 'Giảm trực tiếp 50.000 ₫' },
  VIP50K: { type: 'fixed', value: 50000, desc: 'Giảm trực tiếp 50.000 ₫' },
  NOVYNVIP50: { type: 'fixed', value: 50000, desc: 'Voucher VIP 50.000 ₫' },
  NOVYNVIP100: { type: 'fixed', value: 100000, desc: 'Voucher VIP 100.000 ₫' },
  NOVYNVIP200: { type: 'fixed', value: 200000, desc: 'Voucher VIP 200.000 ₫' },
  XUAN2026: { type: 'fixed', value: 50000, minOrder: 500000, desc: 'Giảm 50.000 ₫ cho đơn từ 500.000 ₫' }
};

export function getPromoDiscount(code: string, subtotalAfterVip: number): PromoCheckResult {
  if (!code) return { discount: 0, desc: '', isValid: false };
  const clean = code.trim().toUpperCase();

  // Check dynamic promos from localStorage
  let dynamicMap: Record<string, any> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('novyn_dynamic_promos');
      if (raw) dynamicMap = JSON.parse(raw);
    } catch {}
  }

  if (dynamicMap[clean]) {
    const p = dynamicMap[clean];
    const discount = p.type === 'percent'
      ? Math.round((subtotalAfterVip * p.value) / 100)
      : Math.min(p.value, subtotalAfterVip);
    return { discount, desc: p.description || '', isValid: true };
  }

  // Predefined voucher catalog
  if (KNOWN_PROMOS[clean]) {
    const p = KNOWN_PROMOS[clean];
    if (p.minOrder && subtotalAfterVip < p.minOrder) {
      return { discount: 0, desc: `Đơn tối thiểu ${p.minOrder.toLocaleString('vi-VN')} ₫`, isValid: false };
    }
    const discount = p.type === 'percent'
      ? Math.round((subtotalAfterVip * p.value) / 100)
      : Math.min(p.value, subtotalAfterVip);
    return { discount, desc: p.desc, isValid: true };
  }

  return { discount: 0, desc: 'Mã không tồn tại', isValid: false };
}
