"use server";

import { prisma } from '@/database/db';
import { getSessionUser, verifySession } from '@/backend/security/session';
import { STAFF_ROLES, mapOrder } from './orderSchemas';

export async function getOrdersAction() {
  try {
    const session = await getSessionUser();
    if (!session) return [];

    const where = session.role === 'customer'
      ? { customerEmail: session.email }
      : STAFF_ROLES.includes(session.role)
        ? {}
        : { id: '__forbidden__' };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders.map(mapOrder);
  } catch (error) {
    console.error('getOrdersAction error:', error);
    return [];
  }
}

export async function cancelOrderAction(orderId: string, performedById?: string, performedByName?: string) {
  try {
    const session = await verifySession();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      return { success: false, message: 'Đơn hàng không tồn tại' };
    }

    const isStaff = STAFF_ROLES.includes(session.role);
    const isOwner = session.role === 'customer' && order.customerEmail === session.email;
    if (!isStaff && !isOwner) {
      return { success: false, message: 'Bạn không có quyền hủy đơn hàng này' };
    }

    if (order.status === 'cancelled') {
      return { success: false, message: 'Đơn hàng đã được hủy trước đó' };
    }

    if (order.status === 'completed') {
      return { success: false, message: 'Đơn hàng đã hoàn thành, không thể hủy' };
    }

    await prisma.$transaction(async (tx: any) => {
      // 1. Update Order Status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' }
      });

      // 2. Update Payment Status
      await tx.payment.update({
        where: { orderId },
        data: { status: 'failed' }
      });

      // 3. Return inventory items
      for (const item of order.items) {
        // Increment stock
        await tx.inventoryItem.update({
          where: {
            variantId_branchName: {
              variantId: item.variantId,
              branchName: order.branchName
            }
          },
          data: {
            quantity: { increment: item.quantity }
          }
        });

        // Log transaction
        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            branchName: order.branchName,
            quantity: item.quantity,
            type: 'return',
            reason: `Hủy đơn hàng ${orderId}`
          }
        });
      }

      // 4. Reverse loyalty spent amount ONLY if the order was previously completed
      if (order.status === 'completed') {
        const customer = await tx.user.findFirst({
          where: { email: order.customerEmail }
        });
        
        if (customer && customer.role === 'customer') {
          const newSpent = Math.max(0, (customer.totalSpent || 0) - order.total);
          await tx.user.update({
            where: { id: customer.id },
            data: { totalSpent: newSpent }
          });
        }
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'ORDER_CANCEL',
          details: `Đã hủy đơn hàng ${orderId}. Hoàn trả lại tồn kho các biến thể sản phẩm.`,
          performedById: session.userId || performedById,
          performedByName: session.name || performedByName
        }
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error('cancelOrderAction error:', error);
    return { success: false, message: error.message || 'Lỗi hủy đơn hàng không xác định' };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: 'pending' | 'shipping' | 'completed' | 'cancelled',
  performedById?: string,
  performedByName?: string
) {
  try {
    if (status === 'cancelled') {
      return await cancelOrderAction(orderId, performedById, performedByName);
    }

    const session = await verifySession(STAFF_ROLES);

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) return { success: false, message: 'Đơn hàng không tồn tại' };

    await prisma.$transaction(async (tx: any) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      if (status === 'completed' && order.status !== 'completed') {
        await tx.payment.update({
          where: { orderId },
          data: { status: 'success' }
        });

        // Award loyalty spent amount to registered customer only when payment/delivery completed
        const customer = await tx.user.findFirst({
          where: { email: order.customerEmail }
        });
        if (customer && customer.role === 'customer') {
          await tx.user.update({
            where: { id: customer.id },
            data: { totalSpent: { increment: order.total } }
          });
        }
      }

      await tx.auditLog.create({
        data: {
          action: 'ORDER_STATUS',
          details: `Đã cập nhật trạng thái đơn hàng ${orderId} thành ${status.toUpperCase()}`,
          performedById: session.userId || performedById,
          performedByName: session.name || performedByName
        }
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error('updateOrderStatusAction error:', error);
    return { success: false, message: error.message || 'Lỗi cập nhật trạng thái' };
  }
}
