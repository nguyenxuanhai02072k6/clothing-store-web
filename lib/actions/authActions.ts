"use server"

import { prisma } from '../db';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRole } from '../../types';
import { setSessionCookie, clearSessionCookie, getSessionUser, verifySession } from '../session';

const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải dài từ 8 ký tự trở lên')
  .regex(/[A-Za-z]/, 'Mật khẩu phải có ít nhất 1 chữ cái')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
  .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt');

const emailSchema = z.string().trim().toLowerCase().email('Email không đúng định dạng');

const userRoleSchema = z.enum([
  'customer',
  'employee',
  'manager',
  'director',
  'accountant',
  'cskh',
  'cashier',
  'stocker',
]);

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không hợp lệ')
  .optional()
  .or(z.literal(''));

export async function getUsersAction() {
  try {
    // Access control: Only allow registered staff or directors to list users
    await verifySession(['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker']);
    return await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branch: true,
        avatar: true,
        salary: true,
        totalSpent: true,
        phone: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
      }
    });
  } catch (error) {
    console.error('getUsersAction error:', error);
    return [];
  }
}

// Rate limiter for brute force prevention: email -> { count: number, lockedUntil: number, firstAttemptAt: number }
const loginAttemptMap = new Map<string, { count: number; lockedUntil: number; firstAttemptAt: number }>();
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000;   // 5 minutes

function recordFailedAttempt(email: string): number {
  const now = Date.now();
  const rec = loginAttemptMap.get(email) || { count: 0, lockedUntil: 0, firstAttemptAt: now };
  rec.count += 1;
  if (rec.count >= MAX_FAILED_LOGIN_ATTEMPTS) {
    rec.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  loginAttemptMap.set(email, rec);
  return rec.count;
}

export async function loginAction(email: string, password: string) {
  const parsed = z.object({
    email: emailSchema,
    password: z.string().min(1),
  }).safeParse({ email, password });

  if (!parsed.success) {
    return null;
  }

  const cleanEmail = parsed.data.email.toLowerCase();
  const now = Date.now();
  const attemptRecord = loginAttemptMap.get(cleanEmail);

  if (attemptRecord) {
    if (attemptRecord.lockedUntil > now) {
      const remainingSecs = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
      throw new Error(`Tài khoản tạm thời bị khóa do thử sai quá nhiều lần. Vui lòng thử lại sau ${remainingSecs} giây.`);
    }
    if (now - attemptRecord.firstAttemptAt > ATTEMPT_WINDOW_MS) {
      loginAttemptMap.delete(cleanEmail);
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user || !user.isActive) {
      recordFailedAttempt(cleanEmail);
      return null;
    }

    // Verify password
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      const failedCount = recordFailedAttempt(cleanEmail);
      if (failedCount >= MAX_FAILED_LOGIN_ATTEMPTS) {
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_LOCKOUT',
            details: `Tài khoản ${cleanEmail} bị tạm khóa 5 phút do đăng nhập sai 5 lần liên tiếp.`,
            performedByName: cleanEmail
          }
        }).catch(() => {});
        throw new Error('Đăng nhập sai quá 5 lần. Tài khoản tạm thời bị khóa 5 phút để bảo vệ an toàn.');
      }
      return null;
    }

    // Reset rate limiter on successful authentication
    loginAttemptMap.delete(cleanEmail);

    // Set secure HTTP-Only session cookie
    await setSessionCookie(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error: any) {
    if (error.message?.includes('khóa')) {
      throw error;
    }
    console.error('loginAction error:', error);
    return null;
  }
}

export async function logoutAction() {
  try {
    await clearSessionCookie();
    return { success: true };
  } catch (error) {
    console.error('logoutAction error:', error);
    return { success: false, message: 'Lỗi đăng xuất' };
  }
}

export async function getCurrentUserAction() {
  try {
    const session = await getSessionUser();
    if (!session) return null;
    
    // Fetch latest user info from DB to check active status
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });
    
    if (!user || !user.isActive) {
      await clearSessionCookie();
      return null;
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('getCurrentUserAction error:', error);
    return null;
  }
}

export async function changePasswordAction(userId: string, currentPassword: string, newPassword: string) {
  try {
    // Security: Caller must be authenticated and can only change their own password
    const session = await verifySession();
    if (!session || session.userId !== userId) {
      return { success: false, message: 'Bạn không có quyền thực hiện thao tác đổi mật khẩu cho tài khoản này' };
    }

    const parsed = z.object({
      userId: z.string().min(1),
      currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
      newPassword: passwordSchema,
    }).safeParse({ userId, currentPassword, newPassword });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Thông tin đổi mật khẩu không hợp lệ' };
    }

    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId }
    });

    if (!user || !user.isActive) {
      return { success: false, message: 'Tài khoản không tồn tại hoặc đã bị khóa' };
    }

    const isValid = bcrypt.compareSync(parsed.data.currentPassword, user.password);
    if (!isValid) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng' };
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(parsed.data.newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    await prisma.auditLog.create({
      data: {
        action: 'USER_PASSWORD_CHANGE',
        details: `Người dùng ${user.email} đã đổi mật khẩu`,
        performedById: user.id,
        performedByName: user.name,
      }
    });

    return { success: true };
  } catch (error) {
    console.error('changePasswordAction error:', error);
    return { success: false, message: 'Lỗi hệ thống khi đổi mật khẩu' };
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
  role: UserRole,
  branch?: string,
  phone?: string
) {
  try {
    const parsed = z.object({
      name: z.string().trim().min(2, 'Tên phải dài từ 2 ký tự trở lên').max(80, 'Tên quá dài'),
      email: emailSchema,
      password: passwordSchema,
      role: userRoleSchema,
      branch: z.string().trim().optional(),
      phone: phoneSchema,
    }).safeParse({ name, email, password, role, branch, phone });

    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || 'Thông tin đăng ký không hợp lệ' };
    }

    // Security check: Only allow registering as 'customer' unless the caller is a 'director'
    if (parsed.data.role !== 'customer') {
      const session = await getSessionUser();
      if (!session || session.role !== 'director') {
        return { success: false, message: 'Chỉ có Giám đốc mới có quyền đăng ký tài khoản nhân viên' };
      }
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existing) {
      return { success: false, message: 'Email đã tồn tại' };
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(parsed.data.password, salt);

    const defaultSalary = parsed.data.role === 'director' ? 25000000 : 
                          parsed.data.role === 'accountant' ? 12000000 : 
                          parsed.data.role === 'cskh' ? 9500000 :
                          parsed.data.role === 'manager' ? 15000000 : 
                          parsed.data.role === 'employee' ? 8500000 :
                          parsed.data.role === 'cashier' ? 8000000 :
                          parsed.data.role === 'stocker' ? 8200000 : undefined;

    const newUser = await prisma.user.create({
      data: {
        id: `usr-${Date.now()}`,
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
        role: parsed.data.role,
        branch: parsed.data.branch || null,
        phone: parsed.data.phone || null,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        salary: defaultSalary || null,
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error('registerAction error:', error);
    return { success: false, message: 'Lỗi hệ thống' };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    // Access control: Only directors are allowed to delete users
    const callerSession = await verifySession(['director']);
    
    // Self-deletion prevention
    if (callerSession.userId === userId) {
      return false;
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
    
    // Log to audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_DELETE',
        details: `Đã vô hiệu hóa tài khoản người dùng ID: ${userId}`,
        performedById: callerSession.userId,
        performedByName: callerSession.name,
      }
    });
    
    return true;
  } catch (error) {
    console.error('deleteUserAction error:', error);
    return false;
  }
}

export async function updateUserSpentAction(userId: string, amount: number) {
  try {
    // Security: Only authorized staff (director, manager, accountant, cashier) can adjust customer spending.
    // Customers are strictly forbidden from modifying totalSpent directly to prevent VIP tier manipulation.
    const session = await verifySession(['director', 'manager', 'accountant', 'cashier']);
    
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
      return false;
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalSpent: { increment: amount }
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CUSTOMER_SPENT_UPDATE',
        details: `Cập nhật chi tiêu cho người dùng ID ${userId}: ${amount > 0 ? '+' : ''}${amount}đ`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return true;
  } catch (error) {
    console.error('updateUserSpentAction error:', error);
    return false;
  }
}
