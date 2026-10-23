"use server";

import { prisma } from '@/database/db';
import { getSessionUser } from '@/backend/security/session';
import { createPaymentGatewayUrl } from '@/backend/services/paymentService';
import { sendOrderConfirmationEmail } from '@/backend/services/emailService';
import { stockReservationEngine } from '@/backend/security/stockReservationEngine';
import { smartShippingEngine } from '@/backend/services/smartShippingEngine';
import { getCustomerTier } from '@/types';
import { checkoutSchema } from './orderSchemas';

export async function createOrderAction(rawInput: any) {
  try {
    const session = await getSessionUser();
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

        const physicalQty = inventoryItem?.quantity || 0;
        const reservedByOthers = stockReservationEngine.getReservedQuantity(variant.id, input.branchName);
        let effectiveAvailable = physicalQty - reservedByOthers;

        // If customer provided an active reservation, their reserved quantity is credited back to them
        if (item.reservationId) {
          const resStatus = await stockReservationEngine.getReservationStatus(item.reservationId);
          if (resStatus && resStatus.status === 'active' && !resStatus.isExpired && resStatus.variantId === variant.id) {
            effectiveAvailable += resStatus.quantity;
          }
        }

        if (effectiveAvailable < item.quantity) {
          throw new Error(`Sản phẩm ${product.name} (Màu ${item.colorName}, Size ${item.size}) không đủ hàng hoặc đang được khách hàng khác tạm giữ trong giỏ. Hiện có sẵn: ${Math.max(0, effectiveAvailable)}`);
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

      // Commit all active stock reservations
      for (const item of input.items) {
        if (item.reservationId) {
          await stockReservationEngine.commitReservation(item.reservationId, tx);
        }
      }

      // 3. Calculate VIP Discount
      let vipDiscount = 0;
      const linkedCustomer = session?.role === 'customer'
        ? await tx.user.findUnique({ where: { id: session.userId } })
        : null;

      if (linkedCustomer) {
        const spend = linkedCustomer.totalSpent || 0;
        let rate = 0;
        if (spend >= 60000000) rate = 0.20; // Diamond
        else if (spend >= 30000000) rate = 0.15; // Platinum
        else if (spend >= 15000000) rate = 0.10; // Gold
        else if (spend >= 5000000) rate = 0.05;  // Silver

        vipDiscount = Math.round(subtotal * rate);
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

      // 5. Calculate Shipping Fee using SmartShippingEngine
      let shipping = 30000;
      let shippingOptionInfo: string | null = null;
      if (input.provinceName && input.districtName) {
        const customerTier = linkedCustomer ? getCustomerTier(linkedCustomer.totalSpent || 0) : 'standard';
        const shippingCalc = smartShippingEngine.calculate({
          provinceName: input.provinceName,
          districtName: input.districtName,
          wardName: input.wardName,
          subtotal,
          customerTier: customerTier as any,
          paymentMethod: input.paymentMethod,
          appliedPromoCode: input.voucherCode
        });
        const chosen = shippingCalc.options.find(o => o.id === input.shippingOptionId) || shippingCalc.selectedOption;
        shipping = chosen.finalFee;
        shippingOptionInfo = `[${chosen.name} - ${chosen.carrierName} - ${chosen.estimatedDelivery}]`;
      } else if (input.shippingFee !== undefined) {
        shipping = input.shippingFee;
      } else if (subtotal >= 500000 || isFreeship) {
        shipping = 0;
      }

      const discount = vipDiscount + voucherDiscount;
      const total = Math.max(0, subtotal - discount + shipping);

      // Format customer notes with shipping carrier information if available
      const customerNotes = [shippingOptionInfo, input.customerInfo.notes].filter(Boolean).join(' | ') || null;

      // 6. Create Order record
      const dbOrder = await tx.order.create({
        data: {
          id: orderId,
          customerName: input.customerInfo.fullName,
          customerPhone: input.customerInfo.phone,
          customerEmail: input.customerInfo.email,
          customerAddress: input.customerInfo.address,
          customerNotes,
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

      // 9. Loyalty spent amount is NOT updated on pending creation.
      // It is securely awarded only when the order is marked 'completed'.

      // 10. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'ORDER_CREATE',
          details: `Đã đặt đơn hàng mới ${orderId} qua ${input.paymentMethod.toUpperCase()}. Tổng tiền: ${total}đ (Chi nhánh: ${input.branchName})`,
          performedById: session?.userId,
          performedByName: session?.name
        }
      });

      return {
        orderId,
        total,
        subtotal,
        discount,
        shipping,
        items: orderItemsToCreate
      };
    });

    // Dispatch transactional order confirmation email asynchronously
    sendOrderConfirmationEmail({
      orderId: result.orderId,
      customerName: input.customerInfo.fullName,
      customerEmail: input.customerInfo.email,
      customerPhone: input.customerInfo.phone,
      customerAddress: input.customerInfo.address,
      items: result.items.map(item => ({
        productName: item.productName,
        size: item.size,
        colorName: item.colorName,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: result.subtotal,
      discount: result.discount,
      shipping: result.shipping,
      total: result.total,
      paymentMethod: input.paymentMethod,
      branchName: input.branchName
    }).catch(err => console.error('[EMAIL ERROR] Failed to dispatch order confirmation email:', err));

    let paymentUrl: string | undefined = undefined;
    if (input.paymentMethod === 'vnpay') {
      paymentUrl = createPaymentGatewayUrl({
        orderId: result.orderId,
        amount: result.total,
        orderInfo: `Thanh toan don hang ${result.orderId}`,
        returnUrl: `/checkout?orderId=${result.orderId}`
      });
    }

    return { success: true, orderId: result.orderId, paymentUrl };
  } catch (error: any) {
    console.error('createOrderAction error:', error);
    return { success: false, message: error.message || 'Lỗi đặt hàng không xác định' };
  }
}
