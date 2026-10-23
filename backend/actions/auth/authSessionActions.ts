"use server";

import { prisma } from '@/database/db';
import { hashPassword, verifyPassword } from '@/backend/security/passwordHash';
import { z } from 'zod';
import { setSessionCookie, clearSessionCookie, getSessionUser, verifySession } from '@/backend/security/session';
import { authRateLimiter } from '@/backend/security/rateLimiter';
import { emailSchema, passwordSchema } from './authSchemas';

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
