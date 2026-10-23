import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải dài từ 8 ký tự trở lên')
  .regex(/[A-Za-z]/, 'Mật khẩu phải có ít nhất 1 chữ cái')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
  .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt');

export const emailSchema = z.string().trim().toLowerCase().email('Email không đúng định dạng');

export const userRoleSchema = z.enum([
  'customer',
  'employee',
  'manager',
  'director',
  'accountant',
  'cskh',
  'cashier',
  'stocker',
]);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không hợp lệ')
  .optional()
  .or(z.literal(''));

export const VIP_LOYALTY_VOUCHERS: Record<string, { cost: number; value: number }> = {
  NOVYNVIP50: { cost: 500, value: 50000 },
  NOVYNVIP100: { cost: 1000, value: 100000 },
  NOVYNVIP200: { cost: 2000, value: 200000 },
};
