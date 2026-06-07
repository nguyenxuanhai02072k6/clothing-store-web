"use server"

import { prisma } from '../db';

export async function getBranchStockAction() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        variant: true
      }
    });

    const stockMap: Record<string, Record<string, number>> = {};
    
    items.forEach(item => {
      const prodId = item.variant.productId;
      if (!stockMap[prodId]) {
        stockMap[prodId] = {
          'Chi nhánh Quận 1': 0,
          'Chi nhánh Thảo Điền': 0
        };
      }
      stockMap[prodId][item.branchName] = (stockMap[prodId][item.branchName] || 0) + item.quantity;
    });

    return stockMap;
  } catch (error) {
    console.error('getBranchStockAction error:', error);
    return {};
  }
}

export async function getBranchSizeStockAction() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        variant: true
      }
    });

    const sizeStockMap: Record<string, Record<string, Record<string, number>>> = {};

    items.forEach(item => {
      const prodId = item.variant.productId;
      const branch = item.branchName;
      const size = item.variant.size;

      if (!sizeStockMap[prodId]) {
        sizeStockMap[prodId] = {
          'Chi nhánh Quận 1': {},
          'Chi nhánh Thảo Điền': {}
        };
      }
      if (!sizeStockMap[prodId][branch]) {
        sizeStockMap[prodId][branch] = {};
      }
      sizeStockMap[prodId][branch][size] = (sizeStockMap[prodId][branch][size] || 0) + item.quantity;
    });

    return sizeStockMap;
  } catch (error) {
    console.error('getBranchSizeStockAction error:', error);
    return {};
  }
}

export async function getBranchColorStockAction() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        variant: true
      }
    });

    const colorStockMap: Record<string, Record<string, Record<string, number>>> = {};

    items.forEach(item => {
      const prodId = item.variant.productId;
      const branch = item.branchName;
      const color = item.variant.colorName;

      if (!colorStockMap[prodId]) {
        colorStockMap[prodId] = {
          'Chi nhánh Quận 1': {},
          'Chi nhánh Thảo Điền': {}
        };
      }
      if (!colorStockMap[prodId][branch]) {
        colorStockMap[prodId][branch] = {};
      }
      colorStockMap[prodId][branch][color] = (colorStockMap[prodId][branch][color] || 0) + item.quantity;
    });

    return colorStockMap;
  } catch (error) {
    console.error('getBranchColorStockAction error:', error);
    return {};
  }
}

export async function getRestockRecordsAction() {
  try {
    const records = await prisma.restockRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return (records as any[]).map((r: any) => ({
      id: r.id,
      productId: r.productId,
      productName: r.productName,
      branch: r.branch,
      amount: r.amount,
      cost: r.cost,
      createdAt: r.createdAt.toISOString().replace('T', ' ').substring(0, 19),
      status: r.status as 'pending' | 'approved' | 'rejected',
      size: r.size || undefined,
      color: r.color || undefined
    }));
  } catch (error) {
    console.error('getRestockRecordsAction error:', error);
    return [];
  }
}

export async function restockBranchProductAction(
  productId: string,
  amount: number,
  size: string,
  color?: string,
  targetBranch?: string
) {
  if (!targetBranch) return null;
  
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) return null;

    // Find the variant matching color & size
    const colorName = color || 'Default';
    let variant = await prisma.productVariant.findFirst({
      where: {
        productId,
        size,
        colorName
      }
    });

    // If it doesn't exist, create it
    if (!variant) {
      const cleanColorName = colorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const cleanSize = size.toLowerCase();
      const sku = `${product.slug}-${cleanColorName}-${cleanSize}`;
      
      variant = await prisma.productVariant.create({
        data: {
          productId,
          sku,
          colorName,
          colorHex: '#CCCCCC',
          size
        }
      });

      await prisma.inventoryItem.create({
        data: { variantId: variant.id, branchName: 'Chi nhánh Quận 1', quantity: 0 }
      });
      await prisma.inventoryItem.create({
        data: { variantId: variant.id, branchName: 'Chi nhánh Thảo Điền', quantity: 0 }
      });
    }

    if (amount < 0) {
      // Direct deduction (e.g. sales in POS)
      const absAmount = Math.abs(amount);
      const inventoryItem = await prisma.inventoryItem.findUnique({
        where: {
          variantId_branchName: {
            variantId: variant.id,
            branchName: targetBranch
          }
        }
      });

      const currentQty = inventoryItem?.quantity || 0;
      const newQty = Math.max(0, currentQty - absAmount);

      await prisma.inventoryItem.upsert({
        where: {
          variantId_branchName: {
            variantId: variant.id,
            branchName: targetBranch
          }
        },
        create: {
          variantId: variant.id,
          branchName: targetBranch,
          quantity: newQty
        },
        update: {
          quantity: newQty
        }
      });

      // Log transaction
      await prisma.inventoryTransaction.create({
        data: {
          variantId: variant.id,
          branchName: targetBranch,
          quantity: -absAmount,
          type: 'sale',
          reason: 'Bán hàng trực tiếp tại quầy POS'
        }
      });
      
      return null;
    }

    // For positive amount, we create a pending restock request
    const cost = Math.round(product.price * 0.40 * amount);
    const newRecord = await prisma.restockRecord.create({
      data: {
        id: `rest-${Date.now()}`,
        productId,
        productName: product.name,
        branch: targetBranch,
        amount,
        cost,
        size,
        color: colorName,
        status: 'pending',
      }
    });

    return {
      id: newRecord.id,
      productId: newRecord.productId,
      productName: newRecord.productName,
      branch: newRecord.branch,
      amount: newRecord.amount,
      cost: newRecord.cost,
      createdAt: newRecord.createdAt.toISOString().replace('T', ' ').substring(0, 19),
      status: newRecord.status as 'pending' | 'approved' | 'rejected',
      size: newRecord.size || undefined,
      color: newRecord.color || undefined
    };
  } catch (error) {
    console.error('restockBranchProductAction error:', error);
    return null;
  }
}

export async function approveRestockRequestAction(requestId: string, approvedById?: string) {
  try {
    const record = await prisma.restockRecord.findUnique({
      where: { id: requestId }
    });

    if (!record || record.status !== 'pending') return false;

    // Find the variant
    const colorName = record.color || 'Default';
    const size = record.size || 'S';
    
    let variant = await prisma.productVariant.findFirst({
      where: {
        productId: record.productId,
        size,
        colorName
      }
    });

    if (!variant) {
      const product = await prisma.product.findUnique({ where: { id: record.productId } });
      if (!product) return false;
      const cleanColorName = colorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const cleanSize = size.toLowerCase();
      const sku = `${product.slug}-${cleanColorName}-${cleanSize}`;
      
      variant = await prisma.productVariant.create({
        data: {
          productId: record.productId,
          sku,
          colorName,
          colorHex: '#CCCCCC',
          size
        }
      });
    }

    // Update inventory quantity
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        variantId_branchName: {
          variantId: variant.id,
          branchName: record.branch
        }
      }
    });

    const currentQty = inventoryItem?.quantity || 0;
    const newQty = currentQty + record.amount;

    await prisma.inventoryItem.upsert({
      where: {
        variantId_branchName: {
          variantId: variant.id,
          branchName: record.branch
        }
      },
      create: {
        variantId: variant.id,
        branchName: record.branch,
        quantity: newQty
      },
      update: {
        quantity: newQty
      }
    });

    // Update restock request status
    await prisma.restockRecord.update({
      where: { id: requestId },
      data: { status: 'approved' }
    });

    // Log transaction
    await prisma.inventoryTransaction.create({
      data: {
        variantId: variant.id,
        branchName: record.branch,
        quantity: record.amount,
        type: 'restock',
        reason: 'Duyệt yêu cầu nhập hàng bổ sung',
        createdById: approvedById || null
      }
    });

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'STOCK_APPROVE',
        details: `Đã duyệt yêu cầu nhập hàng bổ sung ID ${requestId} cho ${record.productName} số lượng ${record.amount}`,
        performedById: approvedById
      }
    });

    return true;
  } catch (error) {
    console.error('approveRestockRequestAction error:', error);
    return false;
  }
}

export async function rejectRestockRequestAction(requestId: string, rejectedById?: string) {
  try {
    await prisma.restockRecord.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });

    // Log to Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'STOCK_REJECT',
        details: `Đã từ chối yêu cầu nhập hàng bổ sung ID ${requestId}`,
        performedById: rejectedById
      }
    });
    
    return true;
  } catch (error) {
    console.error('rejectRestockRequestAction error:', error);
    return false;
  }
}
