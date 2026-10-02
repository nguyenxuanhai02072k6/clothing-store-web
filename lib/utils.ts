/**
 * Ghép các class CSS động một cách an toàn và gọn gàng.
 */
export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean })[]) {
  return inputs
    .flatMap((input) => {
      if (!input) return [];
      if (typeof input === 'string') return [input];
      return Object.entries(input)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key);
    })
    .join(' ');
}

/**
 * Định dạng số tiền sang chuẩn tiền tệ Việt Nam Đồng (VND).
 * Ví dụ: 350000 -> 350.000 ₫
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

/**
 * Trả về URL an toàn của ứng dụng, phòng chống Host Header Poisoning.
 */
export function getSafeAppUrl(request?: { headers: { get: (name: string) => string | null } }): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }
  if (!request) return 'http://localhost:3000';

  const host = request.headers.get('host') || 'localhost:3000';
  const isAllowedHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) ||
    /^[a-zA-Z0-9-]+\.(novynwear\.com|vercel\.app)(:\d+)?$/.test(host);
  const safeHost = isAllowedHost ? host : 'localhost:3000';

  const proto = request.headers.get('x-forwarded-proto') || (safeHost.includes('localhost') || safeHost.includes('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${safeHost}`;
}
