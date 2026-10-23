"use server";

import { prisma } from '@/database/db';
import { hashPassword } from '@/backend/security/passwordHash';
import { z } from 'zod';
import { UserRole } from '@/types';
import { getSessionUser, verifySession } from '@/backend/security/session';
import { emailSchema, passwordSchema, userRoleSchema, phoneSchema } from './authSchemas';

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
