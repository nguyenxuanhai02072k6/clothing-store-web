"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';
import { STAFF_ROLES } from './erpRoles';

// ==========================================
// 3. INVENTORY TRANSFERS
// ==========================================

export async function getInventoryTransfersAction() {
  try {
    await verifySession(STAFF_ROLES);

    let transfers = await prisma.inventoryTransfer.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (transfers.length === 0) {
      // Check if products exist before seeding
      const prods = await prisma.product.findMany({ take: 2 });

      if (prods.length >= 2) {
        const defaultTransfers = [
          { id: 'tr-1', productId: prods[0].id, productName: prods[0].name, size: 'M', color: 'Trắng', fromBranch: 'Chi nhánh Quận 1', toBranch: 'Chi nhánh Thảo Điền', quantity: 10, status: 'received' },
          { id: 'tr-2', productId: prods[1].id, productName: prods[1].name, size: 'L', color: 'Nâu Oatmeal', fromBranch: 'Chi nhánh Quận 1', toBranch: 'Chi nhánh Thảo Điền', quantity: 5, status: 'shipping' }
        ];

        for (const tr of defaultTransfers) {
          await prisma.inventoryTransfer.upsert({
            where: { id: tr.id },
            update: {},
            create: tr
          });
        }

        transfers = await prisma.inventoryTransfer.findMany({
          orderBy: { createdAt: 'desc' }
        });
      }
    }

    return { success: true, data: transfers };
  } catch (error: any) {
    console.error('getInventoryTransfersAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải lịch sử điều chuyển hàng' };
  }
}

export async function createInventoryTransferAction(data: {
  productId: string;
  productName: string;
  size: string;
  color: string;
  fromBranch: string;
  toBranch: string;
  quantity: number;
}) {
  try {
    const session = await verifySession(STAFF_ROLES);

    if (data.fromBranch === data.toBranch) {
      return { success: false, error: 'Chi nhánh nguồn và chi nhánh đích không được trùng nhau!' };
    }

    if (!data.quantity || data.quantity <= 0) {
      return { success: false, error: 'Số lượng chuyển kho phải lớn hơn 0!' };
    }

    // Execute transfer creation and stock deduction in a single database transaction
    const transfer = await prisma.$transaction(async (tx: any) => {
      // 1. Find product variant matching color & size
      let variant = await tx.productVariant.findFirst({
        where: {
          productId: data.productId,
          size: data.size,
          colorName: data.color
        }
      });

      // Fallback matching size if color name variation occurs
      if (!variant) {
        variant = await tx.productVariant.findFirst({
          where: {
            productId: data.productId,
            size: data.size
          }
        });
      }

      // If still not found, create the variant entry
      if (!variant) {
        const prod = await tx.product.findUnique({ where: { id: data.productId } });
        const cleanColor = data.color.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanSize = data.size.toLowerCase();
        const sku = `${prod?.slug || 'prod'}-${cleanColor}-${cleanSize}`;
        variant = await tx.productVariant.create({
          data: {
            productId: data.productId,
            sku,
            colorName: data.color,
            colorHex: '#CCCCCC',
            size: data.size
          }
        });
      }

      // 2. Check source branch inventory
      const sourceItem = await tx.inventoryItem.findUnique({
        where: {
          variantId_branchName: {
            variantId: variant.id,
            branchName: data.fromBranch
          }
        }
      });

      const currentSourceQty = sourceItem?.quantity || 0;
      if (currentSourceQty < data.quantity) {
        throw new Error(
          `Số lượng tồn tại ${data.fromBranch} (${currentSourceQty} sp) không đủ để chuyển ${data.quantity} sp!`
        );
      }

      // 3. Decrement source inventory
      await tx.inventoryItem.update({
        where: {
          variantId_branchName: {
            variantId: variant.id,
            branchName: data.fromBranch
          }
        },
        data: {
          quantity: { decrement: data.quantity }
        }
      });

      // 4. Record Inventory Transaction (transfer_out)
      await tx.inventoryTransaction.create({
        data: {
          variantId: variant.id,
          branchName: data.fromBranch,
          quantity: -data.quantity,
          type: 'transfer_out',
          reason: `Điều chuyển kho sang ${data.toBranch}`,
          createdById: session.userId
        }
      });

      // 5. Create transfer record
      return await tx.inventoryTransfer.create({
        data: {
          productId: data.productId,
          productName: data.productName,
          size: data.size,
          color: data.color,
          fromBranch: data.fromBranch,
          toBranch: data.toBranch,
          quantity: data.quantity,
          status: 'shipping'
        }
      });
    });

    await prisma.auditLog.create({
      data: {
        action: 'INVENTORY_TRANSFER_CREATED',
        details: `Điều chuyển ${data.quantity} sp [${data.productName}] (${data.size}/${data.color}) từ ${data.fromBranch} -> ${data.toBranch}`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: transfer };
  } catch (error: any) {
    console.error('createInventoryTransferAction error:', error);
    return { success: false, error: error.message || 'Không thể tạo phiếu điều chuyển' };
  }
}

export async function updateInventoryTransferStatusAction(transferId: string, status: string) {
  try {
    const session = await verifySession(STAFF_ROLES);

    const existingTransfer = await prisma.inventoryTransfer.findUnique({
      where: { id: transferId }
    });

    if (!existingTransfer) {
      return { success: false, error: 'Không tìm thấy phiếu điều chuyển' };
    }

    if (existingTransfer.status === status) {
      return { success: true, data: existingTransfer }; // Idempotent
    }

    // Run inventory receipt or cancellation rollback in a transaction
    const updatedTransfer = await prisma.$transaction(async (tx: any) => {
      // Find variant
      let variant = await tx.productVariant.findFirst({
        where: {
          productId: existingTransfer.productId,
          size: existingTransfer.size,
          colorName: existingTransfer.color
        }
      });

      if (!variant) {
        variant = await tx.productVariant.findFirst({
          where: {
            productId: existingTransfer.productId,
            size: existingTransfer.size
          }
        });
      }

      if (!variant) {
        const prod = await tx.product.findUnique({ where: { id: existingTransfer.productId } });
        const cleanColor = existingTransfer.color.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanSize = existingTransfer.size.toLowerCase();
        const sku = `${prod?.slug || 'prod'}-${cleanColor}-${cleanSize}`;
        variant = await tx.productVariant.create({
          data: {
            productId: existingTransfer.productId,
            sku,
            colorName: existingTransfer.color,
            colorHex: '#CCCCCC',
            size: existingTransfer.size
          }
        });
      }

      if (status === 'received') {
        // Increment stock at destination branch
        await tx.inventoryItem.upsert({
          where: {
            variantId_branchName: {
              variantId: variant.id,
              branchName: existingTransfer.toBranch
            }
          },
          create: {
            variantId: variant.id,
            branchName: existingTransfer.toBranch,
            quantity: existingTransfer.quantity
          },
          update: {
            quantity: { increment: existingTransfer.quantity }
          }
        });

        // Record Inventory Transaction (transfer_in)
        await tx.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            branchName: existingTransfer.toBranch,
            quantity: existingTransfer.quantity,
            type: 'transfer_in',
            reason: `Nhận điều chuyển kho từ ${existingTransfer.fromBranch}`,
            createdById: session.userId
          }
        });
      } else if (status === 'cancelled' && existingTransfer.status === 'shipping') {
        // Rollback stock back to source branch
        await tx.inventoryItem.upsert({
          where: {
            variantId_branchName: {
              variantId: variant.id,
              branchName: existingTransfer.fromBranch
            }
          },
          create: {
            variantId: variant.id,
            branchName: existingTransfer.fromBranch,
            quantity: existingTransfer.quantity
          },
          update: {
            quantity: { increment: existingTransfer.quantity }
          }
        });

        // Record Inventory Transaction (transfer_cancelled)
        await tx.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            branchName: existingTransfer.fromBranch,
            quantity: existingTransfer.quantity,
            type: 'adjustment',
            reason: `Hủy phiếu điều chuyển ${existingTransfer.id}, hoàn trả tồn kho nguồn`,
            createdById: session.userId
          }
        });
      }

      return await tx.inventoryTransfer.update({
        where: { id: transferId },
        data: { status }
      });
    });

    await prisma.auditLog.create({
      data: {
        action: 'INVENTORY_TRANSFER_STATUS_UPDATED',
        details: `Cập nhật phiếu chuyển ${transferId}: trạng thái ${status} (${existingTransfer.quantity} sp [${existingTransfer.productName}])`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: updatedTransfer };
  } catch (error: any) {
    console.error('updateInventoryTransferStatusAction error:', error);
    return { success: false, error: error.message || 'Không thể cập nhật phiếu chuyển' };
  }
}
