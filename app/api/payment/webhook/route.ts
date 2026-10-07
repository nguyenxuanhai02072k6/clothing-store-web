import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/database/db';
import { verifyPaymentSignature } from '@/backend/services/paymentService';
import { webhookRateLimiter } from '@/backend/security/rateLimiter';

/**
 * Handle Payment Gateway Webhook / IPN (Instant Payment Notification)
 * Standardized for HMAC-SHA512 secure payment gateways (e.g. VNPAY/Banking)
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'webhook-gateway';
    const rateCheck = await webhookRateLimiter.check(ip);
    if (!rateCheck.success) {
      return NextResponse.json({ RspCode: '99', Message: 'Too many requests' }, { status: 429 });
    }

    const contentType = request.headers.get('content-type') || '';
    let data: Record<string, string> = {};

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        data[key] = String(value);
      });
    } else {
      // Fallback: try json, else query params
      try {
        data = await request.json();
      } catch {
        request.nextUrl.searchParams.forEach((value, key) => {
          data[key] = value;
        });
      }
    }
    return await handlePaymentNotification(data);
  } catch (err: any) {
    console.error('Payment webhook error:', err);
    return NextResponse.json({ RspCode: '99', Message: 'Invalid request format' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'webhook-gateway';
    const rateCheck = await webhookRateLimiter.check(ip);
    if (!rateCheck.success) {
      return NextResponse.json({ RspCode: '99', Message: 'Too many requests' }, { status: 429 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    return await handlePaymentNotification(queryParams);
  } catch (err: any) {
    console.error('Payment webhook GET error:', err);
    return NextResponse.json({ RspCode: '99', Message: 'Internal Server Error' }, { status: 500 });
  }
}

async function handlePaymentNotification(params: Record<string, string>) {
  const secureHash = params['vnp_SecureHash'] || params['secureHash'];
  const orderId = params['vnp_TxnRef'] || params['orderId'];
  const responseCode = params['vnp_ResponseCode'] || params['responseCode'];
  const amountStr = params['vnp_Amount'] || params['amount'];
  const transactionNo = params['vnp_TransactionNo'] || params['transactionId'] || null;

  // 1. Verify Checksum / Cryptographic Signature
  if (!secureHash || !verifyPaymentSignature(params, secureHash)) {
    console.warn('[SECURITY ALERT] Payment webhook invalid checksum from IP');
    return NextResponse.json(
      { RspCode: '97', Message: 'Invalid Checksum Signature' },
      { status: 400 }
    );
  }

  if (!orderId) {
    return NextResponse.json(
      { RspCode: '01', Message: 'Missing order reference' },
      { status: 400 }
    );
  }

  // 2. Query Order from Database
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true }
  });

  if (!order) {
    return NextResponse.json(
      { RspCode: '01', Message: 'Order not found' },
      { status: 404 }
    );
  }

  // 3. Amount Integrity Check (Anti-Tampering)
  const incomingAmount = Number(amountStr) / 100;
  if (!isNaN(incomingAmount) && Math.round(incomingAmount) !== Math.round(order.total)) {
    console.warn(`[SECURITY ALERT] Payment amount mismatch for order ${orderId}: expected ${order.total}, got ${incomingAmount}`);
    return NextResponse.json(
      { RspCode: '04', Message: 'Amount mismatch' },
      { status: 400 }
    );
  }

  // 4. Idempotency Check: prevent replay attacks
  if (order.status === 'completed' && order.payment?.status === 'success') {
    return NextResponse.json(
      { RspCode: '02', Message: 'Order already confirmed' },
      { status: 200 }
    );
  }

  // 5. Execute Atomic Database State Transition
  const isSuccess = responseCode === '00';

  await prisma.$transaction(async (tx) => {
    if (isSuccess) {
      // Update Payment to success
      await tx.payment.upsert({
        where: { orderId: order.id },
        update: {
          status: 'success',
          transactionId: transactionNo
        },
        create: {
          orderId: order.id,
          amount: order.total,
          method: 'vnpay',
          status: 'success',
          transactionId: transactionNo
        }
      });

      // Update Order to completed
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'completed' }
      });

      // Award VIP spend tier
      const customer = await tx.user.findFirst({
        where: { email: order.customerEmail }
      });
      if (customer && customer.role === 'customer') {
        await tx.user.update({
          where: { id: customer.id },
          data: { totalSpent: (customer.totalSpent || 0) + order.total }
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_WEBHOOK_SUCCESS',
          details: `Xác nhận thanh toán tự động thành công cho đơn ${order.id}. Giao dịch #${transactionNo || 'N/A'}, số tiền: ${order.total}đ`
        }
      });
    } else {
      // Payment Failed
      await tx.payment.upsert({
        where: { orderId: order.id },
        update: {
          status: 'failed',
          transactionId: transactionNo
        },
        create: {
          orderId: order.id,
          amount: order.total,
          method: 'vnpay',
          status: 'failed',
          transactionId: transactionNo
        }
      });

      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_WEBHOOK_FAILED',
          details: `Thanh toán thất bại cho đơn ${order.id} (Mã lỗi: ${responseCode})`
        }
      });
    }
  });

  return NextResponse.json(
    { RspCode: '00', Message: 'Confirm Success' },
    { status: 200 }
  );
}
