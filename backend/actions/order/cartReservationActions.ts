"use server";

import { prisma } from '@/database/db';
import { stockReservationEngine } from '@/backend/security/stockReservationEngine';

/**
 * Tạm giữ hàng trong giỏ 10 phút (Cart Reservation) trước khi thanh toán
 */
export async function reserveCartStockAction(
  items: Array<{ productId: string; size: string; colorName: string; quantity: number }>,
  branchName: string,
  sessionId: string,
  ttlSeconds = 600
) {
  try {
    const results = [];
    for (const item of items) {
      const variant = await prisma.productVariant.findFirst({
        where: {
          productId: item.productId,
          size: item.size,
          colorName: item.colorName
        }
      });
      if (!variant) {
        return { success: false, message: `Biến thể ${item.colorName} - ${item.size} không tồn tại` };
      }

      const res = await stockReservationEngine.reserveStock({
        variantId: variant.id,
        branchName,
        quantity: item.quantity,
        sessionId,
        ttlSeconds
      });

      if (!res.success) {
        // Rollback any earlier reservations in this cart request
        for (const prev of results) {
          if (prev.reservationId) {
            await stockReservationEngine.releaseReservation(prev.reservationId);
          }
        }
        return { success: false, message: res.message || 'Hết hàng tạm giữ' };
      }

      results.push({
        productId: item.productId,
        variantId: variant.id,
        size: item.size,
        colorName: item.colorName,
        reservationId: res.reservationId,
        expiresAt: res.expiresAt,
        expiresInSeconds: res.expiresInSeconds
      });
    }

    return {
      success: true,
      reservations: results,
      ttlSeconds,
      expiresAt: results[0]?.expiresAt
    };
  } catch (err: any) {
    console.error('reserveCartStockAction error:', err);
    return { success: false, message: 'Lỗi hệ thống khi tạm giữ giỏ hàng' };
  }
}

/**
 * Hủy tạm giữ hàng (khi khách đổi ý hoặc thoát khỏi checkout)
 */
export async function releaseCartStockAction(reservationIds: string[]) {
  try {
    if (!Array.isArray(reservationIds)) return { success: false };
    for (const id of reservationIds) {
      if (typeof id === 'string') {
        await stockReservationEngine.releaseReservation(id);
      }
    }
    return { success: true };
  } catch (err: any) {
    console.error('releaseCartStockAction error:', err);
    return { success: false };
  }
}

/**
 * Kiểm tra trạng thái và số giây còn lại của mã giữ hàng
 */
export async function getReservationStatusAction(reservationId: string) {
  try {
    return await stockReservationEngine.getReservationStatus(reservationId);
  } catch (err) {
    return null;
  }
}
