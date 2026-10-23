"use server"

import { prisma } from '@/database/db';
import { hashPassword, verifyPassword } from '@/backend/security/passwordHash';
import { z } from 'zod';
import { UserRole } from '@/types';
import { setSessionCookie, clearSessionCookie, getSessionUser, verifySession } from '@/backend/security/session';
import { formatPrice } from '@/lib/utils';
import { authRateLimiter } from '@/backend/security/rateLimiter';

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

export async function loginAction(email: string, password: string) {
  const parsed = z.object({
    email: emailSchema,
    password: z.string().min(1),
  }).safeParse({ email, password });

  if (!parsed.success) {
    return null;
  }

  const cleanEmail = parsed.data.email.toLowerCase();

  // Check if account is currently locked out by sliding window limiter
  const lockStatus = await authRateLimiter.isLocked(cleanEmail);
  if (lockStatus.locked) {
    const remainingSecs = Math.ceil(lockStatus.retryAfterMs / 1000);
    throw new Error(`Tài khoản tạm thời bị khóa do thử sai quá nhiều lần. Vui lòng thử lại sau ${remainingSecs} giây.`);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user || !user.isActive) {
      const attempt = await authRateLimiter.check(cleanEmail);
      if (!attempt.success) {
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_LOCKOUT',
            details: `Tài khoản ${cleanEmail} bị tạm khóa do đăng nhập sai 5 lần liên tiếp.`,
            performedByName: cleanEmail
          }
        }).catch(() => { });
        const waitMins = Math.ceil(attempt.retryAfterMs / 60000);
        throw new Error(`Đăng nhập sai quá 5 lần. Tài khoản tạm thời bị khóa ${waitMins} phút để bảo vệ an toàn.`);
      }
      return null;
    }

    // Verify password using Argon2id with seamless legacy bcrypt migration
    const verifyResult = await verifyPassword(password, user.password);
    if (!verifyResult.isValid) {
      const attempt = await authRateLimiter.check(cleanEmail);
      if (!attempt.success) {
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_LOCKOUT',
            details: `Tài khoản ${cleanEmail} bị tạm khóa do đăng nhập sai 5 lần liên tiếp.`,
            performedByName: cleanEmail
          }
        }).catch(() => { });
        const waitMins = Math.ceil(attempt.retryAfterMs / 60000);
        throw new Error(`Đăng nhập sai quá 5 lần. Tài khoản tạm thời bị khóa ${waitMins} phút để bảo vệ an toàn.`);
      }
      return null;
    }

    // Transparently upgrade legacy bcrypt hashes to Argon2id
    if (verifyResult.needsRehash) {
      try {
        const upgradedHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: upgradedHash }
        });
      } catch (rehashErr) {
        console.warn('Silent argon2 rehash upgrade failed:', rehashErr);
      }
    }

    // Reset rate limiter on successful authentication
    await authRateLimiter.reset(cleanEmail);

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

    const verifyResult = await verifyPassword(parsed.data.currentPassword, user.password);
    if (!verifyResult.isValid) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng' };
    }

    const hashedPassword = await hashPassword(parsed.data.newPassword);

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

    // Security check: Only allow registering as 'customer' unless caller has permission (director or manager or accountant)
    let creatorSession: any = null;
    if (parsed.data.role !== 'customer') {
      creatorSession = await getSessionUser();
      if (!creatorSession || !['director', 'manager', 'accountant'].includes(creatorSession.role)) {
        return { success: false, message: 'Chỉ có Ban giám đốc hoặc Quản lý cửa hàng mới có quyền tạo tài khoản nhân viên' };
      }

      // If caller is a store manager, enforce branch boundaries and allowed staff roles
      if (creatorSession.role === 'manager') {
        const allowedRolesForManager = ['employee', 'cashier', 'stocker', 'cskh'];
        if (!allowedRolesForManager.includes(parsed.data.role)) {
          return {
            success: false,
            message: 'Quản lý cửa hàng chỉ có quyền tạo tài khoản nhân viên vận hành chi nhánh (Nhân viên bán hàng, Thu ngân, Thủ kho, CSKH)'
          };
        }
        // Force employee's branch to match manager's branch
        if (creatorSession.branch) {
          parsed.data.branch = creatorSession.branch;
        }
      }
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existing) {
      return { success: false, message: 'Email đã tồn tại' };
    }

    const hashedPassword = await hashPassword(parsed.data.password);

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

    if (creatorSession) {
      await prisma.auditLog.create({
        data: {
          action: 'STAFF_REGISTER',
          details: `${creatorSession.name} (${creatorSession.role}) đã tạo tài khoản nhân viên mới: ${newUser.name} (${newUser.role}) tại ${newUser.branch || 'Toàn hệ thống'}`,
          performedById: creatorSession.userId,
          performedByName: creatorSession.name,
        }
      });
    }

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

const VIP_LOYALTY_VOUCHERS: Record<string, { cost: number; value: number }> = {
  NOVYNVIP50: { cost: 500, value: 50000 },
  NOVYNVIP100: { cost: 1000, value: 100000 },
  NOVYNVIP200: { cost: 2000, value: 200000 },
};

export async function getLoyaltyPointsAction() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, message: 'Chưa đăng nhập', accruedPoints: 0, redeemedPoints: 0, balance: 0 };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });
    if (!user) {
      return { success: false, message: 'Người dùng không tồn tại', accruedPoints: 0, redeemedPoints: 0, balance: 0 };
    }

    const accruedPoints = Math.floor((user.totalSpent || 0) / 10000);

    const logs = await prisma.auditLog.findMany({
      where: {
        performedById: user.id,
        action: 'LOYALTY_REDEEM'
      }
    });

    let redeemedPoints = 0;
    for (const log of logs) {
      try {
        const data = JSON.parse(log.details);
        if (typeof data.cost === 'number') {
          redeemedPoints += data.cost;
        }
      } catch { }
    }

    const balance = Math.max(0, accruedPoints - redeemedPoints);
    return {
      success: true,
      accruedPoints,
      redeemedPoints,
      balance
    };
  } catch (error) {
    console.error('getLoyaltyPointsAction error:', error);
    return { success: false, message: 'Lỗi lấy thông tin điểm tích lũy', accruedPoints: 0, redeemedPoints: 0, balance: 0 };
  }
}

export async function redeemLoyaltyVoucherAction(code: string) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return { success: false, message: 'Vui lòng đăng nhập để đổi voucher' };
    }

    const voucherConfig = VIP_LOYALTY_VOUCHERS[code];
    if (!voucherConfig) {
      return { success: false, message: 'Mã voucher quy đổi không hợp lệ' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });
    if (!user) {
      return { success: false, message: 'Tài khoản người dùng không tồn tại' };
    }

    const accruedPoints = Math.floor((user.totalSpent || 0) / 10000);

    const logs = await prisma.auditLog.findMany({
      where: {
        performedById: user.id,
        action: 'LOYALTY_REDEEM'
      }
    });

    let redeemedPoints = 0;
    for (const log of logs) {
      try {
        const data = JSON.parse(log.details);
        if (typeof data.cost === 'number') {
          redeemedPoints += data.cost;
        }
      } catch { }
    }

    const balance = accruedPoints - redeemedPoints;
    if (balance < voucherConfig.cost) {
      return { success: false, message: 'Số điểm tích lũy của bạn không đủ để đổi voucher này!' };
    }

    // Ensure the voucher exists in Promotion table so server checkout can validate it
    await prisma.promotion.upsert({
      where: { code },
      update: {
        discountType: 'fixed',
        value: voucherConfig.value,
        isActive: true,
        description: `Voucher Loyalty VIP đổi từ điểm thưởng - Giảm ${formatPrice(voucherConfig.value)}`
      },
      create: {
        code,
        discountType: 'fixed',
        value: voucherConfig.value,
        minOrderValue: 0,
        isActive: true,
        description: `Voucher Loyalty VIP đổi từ điểm thưởng - Giảm ${formatPrice(voucherConfig.value)}`
      }
    });

    // Record audit log for redemption
    await prisma.auditLog.create({
      data: {
        action: 'LOYALTY_REDEEM',
        details: JSON.stringify({ code, cost: voucherConfig.cost, value: voucherConfig.value }),
        performedById: user.id,
        performedByName: user.name
      }
    });

    const newRedeemedPoints = redeemedPoints + voucherConfig.cost;
    const newBalance = Math.max(0, accruedPoints - newRedeemedPoints);

    return {
      success: true,
      redeemedPoints: newRedeemedPoints,
      balance: newBalance,
      voucher: {
        code,
        value: voucherConfig.value,
        cost: voucherConfig.cost
      }
    };
  } catch (error) {
    console.error('redeemLoyaltyVoucherAction error:', error);
    return { success: false, message: 'Lỗi hệ thống khi đổi điểm thưởng' };
  }
}

