"use server"

import { prisma } from '../db';
import { z } from 'zod';

// Zod schemas for validation
const customerInfoSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  notes: z.string().optional()
});

const orderItemInputSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  colorName: z.string(),
  colorHex: z.string(),
  size: z.string()
});

const checkoutSchema = z.object({
  customerInfo: customerInfoSchema,
  items: z.array(orderItemInputSchema).nonempty("Giỏ hàng trống"),
  paymentMethod: z.enum(['cod', 'transfer', 'card']),
  branchName: z.string(),
  voucherCode: z.string().optional(),
  currentCustomerId: z.string().optional()
});

function mapOrder(dbOrder: any) {
  const items = (dbOrder.items || []).map((item: any) => {
    let productImages: string[] = [];
    try {
      productImages = JSON.parse(item.variant.product.images);
    } catch {
      productImages = [item.variant.product.images];
    }
    
    return {
      id: item.id,
      quantity: item.quantity,
      selectedColor: {
        name: item.colorName,
        hex: item.colorHex
      },
      selectedSize: item.size,
      product: {
        id: item.variant.productId,
        name: item.productName,
        slug: item.variant.product.slug,
        category: item.variant.product.category,
        price: item.price,
        description: item.variant.product.description,
        images: productImages,
        rating: item.variant.product.rating,
        reviews: item.variant.product.reviews,
        colors: [],
        sizes: [],
        stock: 0
      }
    };
  });

  return {
    id: dbOrder.id,
    customerInfo: {
      fullName: dbOrder.customerName,
      phone: dbOrder.customerPhone,
      email: dbOrder.customerEmail,
      address: dbOrder.customerAddress,
      notes: dbOrder.customerNotes || undefined
    },
    items,
    subtotal: dbOrder.subtotal,
    discount: dbOrder.discount,
    shipping: dbOrder.shipping,
    total: dbOrder.total,
    paymentMethod: dbOrder.paymentMethod as 'cod' | 'transfer' | 'card',
    branch: dbOrder.branchName,
    status: dbOrder.status as 'pending' | 'shipping' | 'completed' | 'cancelled',
    createdAt: dbOrder.createdAt.toISOString().replace('T', ' ').substring(0, 19)
  };
}

export async function getOrdersAction() {
  try {
    const orders = await prisma.order.findMany({
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

export async function createOrderAction(rawInput: any) {
  try {
    // 1. Validate Input
    const input = checkoutSchema.parse(rawInput);
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Run the checkout process inside a database transaction
    const result = await prisma.$transaction(async (tx: any) => {
      let subtotal = 0;
      const orderItemsToCreate = [];
      const inventoryUpdates = [];
      const txLogs = [];

      // 2. Lock & Check Inventory, calculate Subtotal
      for (const item of input.items) {
        // Fetch current product price from DB (never trust the client price)
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });
        if (!product || !product.isActive) {
          throw new Error(`Sản phẩm ${item.productId} không tồn tại hoặc đã ngừng kinh doanh`);
        }

        // Find variant SKU
        const variant = await tx.productVariant.findFirst({
          where: {
            productId: item.productId,
            size: item.size,
            colorName: item.colorName
          }
        });
        if (!variant) {
          throw new Error(`Biến thể Màu ${item.colorName} - Size ${item.size} của sản phẩm ${product.name} không tồn tại`);
        }

        // Lock inventory record for update
        const inventoryItem = await tx.inventoryItem.findUnique({
          where: {
            variantId_branchName: {
              variantId: variant.id,
              branchName: input.branchName
            }
          }
        });

        const availableQty = inventoryItem?.quantity || 0;
        if (availableQty < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} (Màu ${item.colorName}, Size ${item.size}) không đủ hàng tại chi nhánh. Yêu cầu: ${item.quantity}, Hiện có: ${availableQty}`);
        }

        // Prepare inventory update
        inventoryUpdates.push(
          tx.inventoryItem.update({
            where: {
              variantId_branchName: {
                variantId: variant.id,
                branchName: input.branchName
              }
            },
            data: {
              quantity: { decrement: item.quantity }
            }
          })
        );

        // Prepare transaction log
        txLogs.push({
          variantId: variant.id,
          branchName: input.branchName,
          quantity: -item.quantity,
          type: 'sale',
          reason: `Đơn hàng trực tuyến ${orderId}`
        });

        // Add to subtotal
        subtotal += product.price * item.quantity;

        // Prepare order item creation details
        orderItemsToCreate.push({
          variantId: variant.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          colorName: item.colorName,
          colorHex: item.colorHex,
          size: item.size
        });
      }

      // Execute inventory updates
      await Promise.all(inventoryUpdates);

      // Create inventory transaction logs
      for (const log of txLogs) {
        await tx.inventoryTransaction.create({ data: log });
      }

      // 3. Calculate VIP Discount
      let vipDiscount = 0;
      if (input.currentCustomerId) {
        const user = await tx.user.findUnique({
          where: { id: input.currentCustomerId }
        });
        if (user) {
          const spend = user.totalSpent || 0;
          let rate = 0;
          if (spend >= 60000000) rate = 0.20; // Diamond
          else if (spend >= 30000000) rate = 0.15; // Platinum
          else if (spend >= 15000000) rate = 0.10; // Gold
          else if (spend >= 5000000) rate = 0.05;  // Silver
          
          vipDiscount = Math.round(subtotal * rate);
        }
      }

      // 4. Calculate Voucher Discount
      let voucherDiscount = 0;
      let isFreeship = false;
      if (input.voucherCode) {
        const promotion = await tx.promotion.findUnique({
          where: { code: input.voucherCode }
        });
        
        if (promotion && promotion.isActive) {
          if (subtotal >= promotion.minOrderValue) {
            if (promotion.discountType === 'percent') {
              voucherDiscount = Math.round(subtotal * (promotion.value / 100));
            } else if (promotion.discountType === 'fixed') {
              voucherDiscount = promotion.value;
            } else if (promotion.discountType === 'freeship') {
              isFreeship = true;
            }
          }
        }
      }

      // 5. Calculate Shipping Fee
      // Free shipping for orders over 1,000,000 VND or if freeship promotion applied
      let shipping = 30000;
      if (subtotal > 1000000 || isFreeship) {
        shipping = 0;
      }

      const discount = vipDiscount + voucherDiscount;
      const total = Math.max(0, subtotal - discount + shipping);

      // 6. Create Order record
      const dbOrder = await tx.order.create({
        data: {
          id: orderId,
          customerName: input.customerInfo.fullName,
          customerPhone: input.customerInfo.phone,
          customerEmail: input.customerInfo.email,
          customerAddress: input.customerInfo.address,
          customerNotes: input.customerInfo.notes || null,
          subtotal,
          discount,
          shipping,
          total,
          paymentMethod: input.paymentMethod,
          branchName: input.branchName,
          status: 'pending', // Default online order status is pending
        }
      });

      // 7. Create OrderItems
      for (const orderItem of orderItemsToCreate) {
        await tx.orderItem.create({
          data: {
            orderId: dbOrder.id,
            variantId: orderItem.variantId,
            productName: orderItem.productName,
            price: orderItem.price,
            quantity: orderItem.quantity,
            colorName: orderItem.colorName,
            colorHex: orderItem.colorHex,
            size: orderItem.size
          }
        });
      }

      // 8. Create Payment
      await tx.payment.create({
        data: {
          orderId: dbOrder.id,
          amount: total,
          method: input.paymentMethod,
          status: 'pending'
        }
      });

      // 9. Update Customer spent amount (loyalty)
      if (input.currentCustomerId) {
        await tx.user.update({
          where: { id: input.currentCustomerId },
          data: {
            totalSpent: { increment: total }
          }
        });
      }

      // 10. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'ORDER_CREATE',
          details: `Đã đặt đơn hàng mới ${orderId} qua ${input.paymentMethod.toUpperCase()}. Tổng tiền: ${total}đ (Chi nhánh: ${input.branchName})`,
          performedById: input.currentCustomerId
        }
      });

      return orderId;
    });

    return { success: true, orderId: result };
  } catch (error: any) {
    console.error('createOrderAction error:', error);
    return { success: false, message: error.message || 'Lỗi đặt hàng không xác định' };
  }
}

export async function cancelOrderAction(orderId: string, performedById?: string, performedByName?: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true
      }
    });

    if (!order) {
      return { success: false, message: 'Đơn hàng không tồn tại' };
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

      // 4. Reverse loyalty spent amount if customer account was linked
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

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'ORDER_CANCEL',
          details: `Đã hủy đơn hàng ${orderId}. Hoàn trả lại tồn kho các biến thể sản phẩm.`,
          performedById,
          performedByName
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

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    if (!order) return { success: false, message: 'Đơn hàng không tồn tại' };

    await prisma.$transaction(async (tx: any) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      if (status === 'completed') {
        await tx.payment.update({
          where: { orderId },
          data: { status: 'success' }
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'ORDER_STATUS',
          details: `Đã cập nhật trạng thái đơn hàng ${orderId} thành ${status.toUpperCase()}`,
          performedById,
          performedByName
        }
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error('updateOrderStatusAction error:', error);
    return { success: false, message: error.message || 'Lỗi cập nhật trạng thái' };
  }
}
