/**
 * Utilities for Voucher QR Code generation, parsing, and extraction.
 * Supports:
 * - Pure voucher strings: "SALE10", "FREESHIP", "XUAN2026"
 * - Prefix schemes: "VOUCHER:SALE10", "NOVYN-VOUCHER:SALE10", "PROMO:SALE10"
 * - Universal URLs: "https://novynwear.com/cart?voucher=SALE10", "https://...?promo=SALE10"
 * - JSON encoded strings: '{"voucher":"SALE10"}'
 */

/**
 * Extracts a clean, normalized voucher/coupon code from any scanned QR raw payload.
 */
export function extractVoucherCodeFromQR(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  // 1. Try URL parsing
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const voucherParam =
        url.searchParams.get('voucher') ||
        url.searchParams.get('promo') ||
        url.searchParams.get('code') ||
        url.searchParams.get('coupon');
      if (voucherParam) {
        return voucherParam.trim().toUpperCase();
      }
      // If URL path ends with /voucher/CODE
      const pathParts = url.pathname.split('/').filter(Boolean);
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length >= 3 && lastPart.length <= 30) {
        return lastPart.toUpperCase();
      }
    } catch {
      // Fallback to regex below
    }
  }

  // 2. Try JSON parsing
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const code = parsed.voucher || parsed.promo || parsed.code || parsed.coupon;
      if (code && typeof code === 'string') {
        return code.trim().toUpperCase();
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  // 3. Try prefix pattern (e.g. VOUCHER:SALE10, NOVYN:SALE10, PROMO:SALE10)
  const prefixMatch = trimmed.match(/^(?:NOVYN[-_]?VOUCHER|VOUCHER|PROMO|COUPON|NOVYN)[:=_-]\s*([A-Za-z0-9_-]+)$/i);
  if (prefixMatch && prefixMatch[1]) {
    return prefixMatch[1].trim().toUpperCase();
  }

  // 4. Default: sanitize string (keep alphanumeric and hyphens/underscores)
  const cleanCode = trimmed.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  return cleanCode;
}

/**
 * Encodes a voucher code into a universal deep link that also works if scanned by standard phone camera.
 */
export function encodeVoucherPayload(code: string): string {
  const cleanCode = code.trim().toUpperCase();
  return `https://novynwear.com/cart?voucher=${encodeURIComponent(cleanCode)}`;
}

/**
 * Generates an SVG/PNG QR Code image URL via secure QR rendering service.
 */
export function getVoucherQrCodeUrl(code: string, size = 260): string {
  const payload = encodeVoucherPayload(code);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}&margin=12&format=png`;
}

/**
 * Sample vouchers available for quick testing in POS or online store
 */
export const SAMPLE_VOUCHERS = [
  { code: 'SALE10', label: 'Giảm 10%', desc: 'Giảm 10% tổng đơn hàng', type: 'percent', value: 10 },
  { code: 'FREESHIP', label: 'Miễn Ship', desc: 'Miễn phí vận chuyển toàn quốc (30k)', type: 'fixed', value: 30000 },
  { code: 'XUAN2026', label: 'Giảm 50K', desc: 'Giảm 50k cho đơn từ 500k', type: 'fixed', value: 50000 },
  { code: 'SALE15', label: 'Giảm 15%', desc: 'Giảm 15% tổng hóa đơn mua sắm', type: 'percent', value: 15 },
  { code: 'SALE20', label: 'Jackpot 20%', desc: 'Giảm 20% hóa đơn thành viên', type: 'percent', value: 20 },
  { code: 'NOVYN50K', label: 'Voucher 50K', desc: 'Giảm trực tiếp 50.000 ₫', type: 'fixed', value: 50000 },
];
