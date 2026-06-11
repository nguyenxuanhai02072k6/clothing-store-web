"use server"

import { prisma } from '../db';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../../types';

export async function getUsersAction() {
  try {
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
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Verify password
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('loginAction error:', error);
    return null;
  }
}

export async function changePasswordAction(userId: string, currentPassword: string, newPassword: string) {
  try {
    if (newPassword.length < 8) {
      return { success: false, message: 'Mật khẩu mới phải dài từ 8 ký tự trở lên' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isActive) {
      return { success: false, message: 'Tài khoản không tồn tại hoặc đã bị khóa' };
    }

    const isValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isValid) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng' };
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

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
    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existing) {
      return { success: false, message: 'Email đã tồn tại' };
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const defaultSalary = role === 'director' ? 25000000 : 
                          role === 'accountant' ? 12000000 : 
                          role === 'cskh' ? 9500000 :
                          role === 'manager' ? 15000000 : 
                          role === 'employee' ? 8500000 :
                          role === 'cashier' ? 8000000 :
                          role === 'stocker' ? 8200000 : undefined;

    const newUser = await prisma.user.create({
      data: {
        id: `usr-${Date.now()}`,
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        branch: branch || null,
        phone: phone || null,
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
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
    
    // Log to audit log
    await prisma.auditLog.create({
      data: {
        action: 'USER_DELETE',
        details: `Đã vô hiệu hóa tài khoản người dùng ID: ${userId}`,
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
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalSpent: { increment: amount }
      }
    });
    return true;
  } catch (error) {
    console.error('updateUserSpentAction error:', error);
    return false;
  }
}
