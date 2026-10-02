"use server";

import { prisma } from '@/database/db';
import { verifySession } from '@/backend/security/session';

const STAFF_ROLES = ['director', 'manager', 'accountant', 'cashier', 'stocker', 'cskh', 'employee'];
const FINANCIAL_ROLES = ['director', 'manager', 'accountant', 'cashier'];
const AUDIT_ROLES = ['director', 'manager', 'accountant'];

// ==========================================
// 1. CRM CLIENTS
// ==========================================

export async function getCRMClientsAction() {
  try {
    await verifySession(STAFF_ROLES);

    let clients = await prisma.cRMClient.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (clients.length === 0) {
      const defaultClients = [
        { id: 'crm-1', name: 'Lâm Khánh Vy', email: 'customer@novynwear.com', phone: '0912345678', totalSpent: 22500000, points: 225, tier: 'Gold' },
        { id: 'crm-2', name: 'Đoàn Phương Linh', email: 'linh.dp@gmail.com', phone: '0987654321', totalSpent: 35000000, points: 350, tier: 'Platinum' },
        { id: 'crm-3', name: 'Nguyễn Bích Thuỷ', email: 'thuy.nb@gmail.com', phone: '0909090909', totalSpent: 58000000, points: 580, tier: 'VVIP' },
        { id: 'crm-4', name: 'Hoàng Hải Nam', email: 'nam.hh@gmail.com', phone: '0933221100', totalSpent: 1200000, points: 12, tier: 'Regular' }
      ];

      for (const client of defaultClients) {
        await prisma.cRMClient.upsert({
          where: { id: client.id },
          update: {},
          create: client
        });
      }

      clients = await prisma.cRMClient.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return { success: true, data: clients };
  } catch (error: any) {
    console.error('getCRMClientsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải danh sách khách hàng CRM' };
  }
}

export async function createCRMClientAction(data: {
  name: string;
  email: string;
  phone: string;
  totalSpent?: number;
  points?: number;
  tier?: string;
}) {
  try {
    const session = await verifySession(STAFF_ROLES);

    const client = await prisma.cRMClient.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        totalSpent: data.totalSpent || 0,
        points: data.points || 0,
        tier: data.tier || 'Regular'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CRM_CLIENT_CREATED',
        details: `Thêm khách hàng CRM: ${client.name} (${client.phone})`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: client };
  } catch (error: any) {
    console.error('createCRMClientAction error:', error);
    return { success: false, error: error.message || 'Không thể tạo khách hàng mới' };
  }
}

export async function updateCRMClientLoyaltyAction(clientId: string, addedSpent: number) {
  try {
    const session = await verifySession(FINANCIAL_ROLES);

    const client = await prisma.cRMClient.findUnique({ where: { id: clientId } });
    if (!client) {
      return { success: false, error: 'Khách hàng không tồn tại' };
    }

    const newSpent = client.totalSpent + addedSpent;
    const newPoints = Math.floor(newSpent / 100000);
    let newTier = 'Regular';
    if (newSpent >= 50000000) newTier = 'VVIP';
    else if (newSpent >= 30000000) newTier = 'Platinum';
    else if (newSpent >= 10000000) newTier = 'Gold';

    const updated = await prisma.cRMClient.update({
      where: { id: clientId },
      data: {
        totalSpent: newSpent,
        points: newPoints,
        tier: newTier
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CRM_CLIENT_LOYALTY_UPDATED',
        details: `Cộng tích lũy khách ${updated.name}: +${addedSpent.toLocaleString('vi-VN')}đ (Tổng: ${newSpent.toLocaleString('vi-VN')}đ, Hạng: ${newTier})`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('updateCRMClientLoyaltyAction error:', error);
    return { success: false, error: error.message || 'Không thể cập nhật điểm tích lũy' };
  }
}

// ==========================================
// 2. CSKH TICKETS
// ==========================================

export async function getCSKHTicketsAction() {
  try {
    await verifySession(STAFF_ROLES);

    let tickets = await prisma.cSKHTicket.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (tickets.length === 0) {
      const defaultTickets = [
        { id: 'tk-1', customerName: 'Lâm Khánh Vy', category: 'Đổi size', description: 'Đổi quần Linen size M sang size S do mặc bị rộng eo.', status: 'pending' },
        { id: 'tk-2', customerName: 'Đoàn Phương Linh', category: 'Trả hàng lỗi', description: 'Áo khoác Blazer tuyết mưa bị sứt chỉ cánh tay phải.', status: 'resolved' }
      ];

      for (const t of defaultTickets) {
        await prisma.cSKHTicket.upsert({
          where: { id: t.id },
          update: {},
          create: t
        });
      }

      tickets = await prisma.cSKHTicket.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return { success: true, data: tickets };
  } catch (error: any) {
    console.error('getCSKHTicketsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải danh sách phiếu khiếu nại' };
  }
}

export async function createCSKHTicketAction(data: {
  customerName: string;
  category: string;
  description: string;
}) {
  try {
    const session = await verifySession(STAFF_ROLES);

    const ticket = await prisma.cSKHTicket.create({
      data: {
        customerName: data.customerName,
        category: data.category,
        description: data.description,
        status: 'pending'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CSKH_TICKET_CREATED',
        details: `Tạo phiếu khiếu nại (${ticket.category}) cho khách ${ticket.customerName}`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: ticket };
  } catch (error: any) {
    console.error('createCSKHTicketAction error:', error);
    return { success: false, error: error.message || 'Không thể tạo phiếu khiếu nại' };
  }
}

export async function updateCSKHTicketStatusAction(ticketId: string, status: string) {
  try {
    const session = await verifySession(STAFF_ROLES);

    const ticket = await prisma.cSKHTicket.update({
      where: { id: ticketId },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CSKH_TICKET_STATUS_UPDATED',
        details: `Cập nhật phiếu CSKH ${ticket.id} thành: ${status}`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: ticket };
  } catch (error: any) {
    console.error('updateCSKHTicketStatusAction error:', error);
    return { success: false, error: error.message || 'Không thể cập nhật trạng thái phiếu' };
  }
}

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

// ==========================================
// 5. CASH RECONCILIATION
// ==========================================

export async function getCashReconciliationsAction() {
  try {
    await verifySession(FINANCIAL_ROLES);

    let recons = await prisma.cashReconciliation.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (recons.length === 0) {
      const defaultRecon = {
        id: 'rc-1',
        date: '2026-05-30',
        branch: 'Chi nhánh Quận 1',
        cashierName: 'Nguyễn Thuỳ Lan',
        expectedCash: 5200000,
        actualCash: 5200000,
        discrepancy: 0,
        notes: 'Đối soát két chuẩn khớp',
        status: 'approved'
      };

      await prisma.cashReconciliation.upsert({
        where: { id: defaultRecon.id },
        update: {},
        create: defaultRecon
      });

      recons = await prisma.cashReconciliation.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return { success: true, data: recons };
  } catch (error: any) {
    console.error('getCashReconciliationsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải biên bản đối soát két' };
  }
}

export async function createCashReconciliationAction(data: {
  date: string;
  branch: string;
  cashierName: string;
  expectedCash: number;
  actualCash: number;
  discrepancy: number;
  notes?: string;
  status?: string;
}) {
  try {
    const session = await verifySession(FINANCIAL_ROLES);

    const record = await prisma.cashReconciliation.create({
      data: {
        date: data.date,
        branch: data.branch,
        cashierName: data.cashierName,
        expectedCash: data.expectedCash,
        actualCash: data.actualCash,
        discrepancy: data.discrepancy,
        notes: data.notes || null,
        status: data.status || 'approved'
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CASH_RECONCILIATION_LOGGED',
        details: `Đối soát két [${data.branch} - ${data.date}]: Dự kiến ${data.expectedCash.toLocaleString('vi-VN')}đ, Thực tế ${data.actualCash.toLocaleString('vi-VN')}đ, Lệch ${data.discrepancy.toLocaleString('vi-VN')}đ`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: record };
  } catch (error: any) {
    console.error('createCashReconciliationAction error:', error);
    return { success: false, error: error.message || 'Không thể ghi nhận đối soát két' };
  }
}

// ==========================================
// 6. TAX RECORDS
// ==========================================

export async function getTaxRecordsAction() {
  try {
    await verifySession(FINANCIAL_ROLES);

    const records = await prisma.taxRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error('getTaxRecordsAction error:', error);
    return { success: false, error: error.message || 'Lỗi khi tải hồ sơ quyết toán thuế' };
  }
}

export async function settleTaxRecordAction(data: {
  period: string;
  revenue: number;
  cogs: number;
  expenses: number;
  salaries: number;
  restockCost: number;
  ebt: number;
  citRate: number;
  citAmount: number;
  pitAmount: number;
  netProfit: number;
  settledAt: string;
  accountantName: string;
}) {
  try {
    const session = await verifySession(AUDIT_ROLES);

    const record = await prisma.taxRecord.create({
      data: {
        period: data.period,
        revenue: data.revenue,
        cogs: data.cogs,
        expenses: data.expenses,
        salaries: data.salaries,
        restockCost: data.restockCost,
        ebt: data.ebt,
        citRate: data.citRate,
        citAmount: data.citAmount,
        pitAmount: data.pitAmount,
        netProfit: data.netProfit,
        settledAt: data.settledAt,
        accountantName: data.accountantName
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'TAX_RECORD_SETTLED',
        details: `Quyết toán thuế kỳ ${data.period}: EBT ${data.ebt.toLocaleString('vi-VN')}đ, Thuế TNDN ${data.citAmount.toLocaleString('vi-VN')}đ, Lợi nhuận ròng ${data.netProfit.toLocaleString('vi-VN')}đ`,
        performedById: session.userId,
        performedByName: session.name
      }
    });

    return { success: true, data: record };
  } catch (error: any) {
    console.error('settleTaxRecordAction error:', error);
    return { success: false, error: error.message || 'Không thể tạo bản quyết toán thuế' };
  }
}
