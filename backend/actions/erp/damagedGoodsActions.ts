"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';
import { STAFF_ROLES } from './erpRoles';

// ==========================================
// 4. DAMAGED GOODS
// ==========================================

export async function getDamagedGoodsAction() {
  try {
    await verifySession(STAFF_ROLES);

    let goods = await prisma.damagedGood.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (goods.length === 0) {
      const prod = await prisma.product.findFirst();
      if (prod) {
        const defaultDamaged = {
          id: 'dm-1',
          productId: prod.id,
          productName: prod.name,
          size: 'S',
          color: 'Màu Cát',
          branch: 'Chi nhánh Quận 1',
          quantity: 2,
          issue: 'Bị ố vàng cổ áo'
        };

        await prisma.damagedGood.upsert({
          where: { id: defaultDamaged.id },
          update: {},
          create: defaultDamaged
        });

        goods = await prisma.damagedGood.findMany({
          orderBy: { createdAt: 'desc' }
        });
      }
    }

    return { success: true, data: goods };
  } catch (error: any) {
    console.error('getDamagedGoodsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải biên bản hàng lỗi' };
  }
}

export async function createDamagedGoodAction(data: {
  productId: string;
  productName: string;
  size: string;
  color: string;
  branch: string;
  quantity: number;
  issue: string;
}) {
  try {
    const session = await verifySession(STAFF_ROLES);

    const record = await prisma.$transaction(async (tx: any) => {
      // Find variant
      let variant = await tx.productVariant.findFirst({
        where: {
          productId: data.productId,
          size: data.size,
          colorName: data.color
        }
      });

      if (!variant) {
        variant = await tx.productVariant.findFirst({
          where: {
            productId: data.productId,
            size: data.size
          }
        });
      }

      // If variant found, decrement inventory and record transaction
      if (variant) {
        const item = await tx.inventoryItem.findUnique({
          where: {
            variantId_branchName: {
              variantId: variant.id,
              branchName: data.branch
            }
          }
        });

        if (item && item.quantity > 0) {
          const deductQty = Math.min(item.quantity, data.quantity);
          await tx.inventoryItem.update({
            where: {
              variantId_branchName: {
                variantId: variant.id,
                branchName: data.branch
              }
            },
            data: {
              quantity: { decrement: deductQty }
            }
          });

          await tx.inventoryTransaction.create({
            data: {
              variantId: variant.id,
              branchName: data.branch,
              quantity: -deductQty,
              type: 'damaged',
              reason: `Hàng lỗi: ${data.issue}`,
              createdById: session.userId
            }
          });
        }
      }

      return await tx.damagedGood.create({
        data: {
          productId: data.productId,
          productName: data.productName,
          size: data.size,
          color: data.color,
          branch: data.branch,
          quantity: data.quantity,
          issue: data.issue
        }
      });
    });

    await prisma.auditLog.create({
      data: {
        action: 'DAMAGED_GOOD_LOGGED',
        details: `Ghi nhận ${data.quantity} sp lỗi [${data.productName}] tại ${data.branch}: ${data.issue}`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: record };
  } catch (error: any) {
    console.error('createDamagedGoodAction error:', error);
    return { success: false, error: error.message || 'Không thể tạo biên bản hàng lỗi' };
  }
}
