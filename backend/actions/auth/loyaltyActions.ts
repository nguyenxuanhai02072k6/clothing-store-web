"use server";

import { prisma } from '@/database/db';
import { getSessionUser } from '@/backend/security/session';
import { formatPrice } from '@/lib/utils';
import { VIP_LOYALTY_VOUCHERS } from './authSchemas';

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
