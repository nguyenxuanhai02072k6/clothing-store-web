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
