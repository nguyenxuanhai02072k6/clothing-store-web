import { prisma } from '../database/db';
import {
  computeHmacSha512,
  buildQueryDataString,
  createPaymentGatewayUrl,
  verifyPaymentSignature
} from '../backend/services/paymentService';
import { POST } from '../app/api/payment/webhook/route';
import { NextRequest } from 'next/server';

async function runPaymentTests() {
  console.log('🧪 === BẮT ĐẦU KIỂM THỬ AUTOMATED PAYMENT GATEWAY & WEBHOOK ===\n');

  const secret = process.env.PAYMENT_HASH_SECRET || 'novyn-fashion-payment-secure-hash-secret-2026';

  // 1. Test signature calculation & verification
  console.log('1. Kiểm tra thuật toán ký số HMAC-SHA512 & Timing-Safe Verification...');
  const testSecret = 'TEST_SECRET_KEY_123456';
  const testParams: Record<string, string> = {
    vnp_Amount: '50000000',
    vnp_Command: 'pay',
    vnp_TxnRef: 'ORD-TEST-01'
  };
  const rawData = buildQueryDataString(testParams);
  const expectedHash = computeHmacSha512(rawData, testSecret);
  const isValid = verifyPaymentSignature(testParams, expectedHash, testSecret);
  const isInvalid = verifyPaymentSignature(testParams, 'tampered_hash_value_123456', testSecret);

  if (isValid && !isInvalid) {
    console.log('   ✅ Ký và đối soát chữ ký HMAC-SHA512 chính xác 100% (Timing-Safe equal).');
  } else {
    throw new Error('❌ Lỗi xác thực chữ ký HMAC-SHA512!');
  }

  // 2. Test createPaymentGatewayUrl helper
  console.log('\n2. Kiểm tra hàm khởi tạo payment gateway URL...');
  const gatewayUrl = createPaymentGatewayUrl({
    orderId: 'ORD-TEST-01',
    amount: 500000,
    orderInfo: 'Thanh toan don hang ORD-TEST-01',
    ipAddr: '127.0.0.1'
  });
  if (gatewayUrl.includes('vnp_SecureHash=') && gatewayUrl.includes('vnp_TxnRef=ORD-TEST-01')) {
    console.log('   ✅ URL chuyển hướng cổng thanh toán chứa đầy đủ query params và secure hash.');
  } else {
    throw new Error('❌ Gateway URL thiếu tham số bắt buộc!');
  }

  // 3. Chuẩn bị sản phẩm và đơn hàng thực tế trong SQLite để test Webhook
  console.log('\n3. Tạo đơn hàng thử nghiệm trong SQLite để test Webhook end-to-end...');
  const firstVariant = await prisma.productVariant.findFirst();
  if (!firstVariant) {
    throw new Error('❌ Không tìm thấy ProductVariant trong DB để tạo OrderItem test');
  }

  const testOrder = await prisma.order.create({
    data: {
      id: `TEST-ORD-${Date.now()}`,
      customerName: 'Nguyen Van Test',
      customerEmail: 'test.payment@novyn.com',
      customerPhone: '0901234567',
      customerAddress: '123 Le Loi, Q1',
      subtotal: 500000,
      discount: 0,
      shipping: 30000,
      total: 530000,
      paymentMethod: 'vnpay',
      branchName: 'Chi nhánh Quận 1',
      status: 'pending',
      items: {
        create: [
          {
            variantId: firstVariant.id,
            productName: 'Áo Sơ Mi Test VNPay',
            price: 500000,
            quantity: 1,
            colorName: 'Trắng',
            colorHex: '#FFFFFF',
            size: 'L'
          }
        ]
      }
    }
  });
  console.log(`   ✅ Đã tạo đơn hàng test ID: ${testOrder.id} (Trạng thái: ${testOrder.status}, Tổng tiền: ${testOrder.total} VND)`);

  // 4. Test Webhook với chữ ký giả mạo (Bad Signature)
  console.log('\n4. Kiểm thử Webhook từ chối chữ ký giả mạo (Tampered Signature)...');
  const fakeParams = {
    vnp_TxnRef: testOrder.id,
    vnp_Amount: (testOrder.total * 100).toString(),
    vnp_ResponseCode: '00',
    vnp_TransactionNo: 'VNP_TRANS_12345',
    vnp_BankCode: 'NCB',
    vnp_SecureHash: 'fake_tampered_hash_attacker'
  };
  const fakeReq = new NextRequest('http://localhost:3000/api/payment/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(fakeParams)
  });
  const fakeRes = await POST(fakeReq);
  const fakeResData = await fakeRes.json();
  if (fakeRes.status === 400 && fakeResData.RspCode === '97') {
    console.log('   ✅ Webhook bảo vệ thành công: Chặn đứng chữ ký không hợp lệ (RspCode 97 - Invalid Checksum Signature).');
  } else {
    throw new Error(`❌ Webhook không chặn chữ ký giả mạo! Status: ${fakeRes.status}, data: ${JSON.stringify(fakeResData)}`);
  }

  // 5. Test Webhook với số tiền bị chỉnh sửa (Tampered Amount)
  console.log('\n5. Kiểm thử Webhook từ chối số tiền sai lệch (Amount Tampering)...');
  const tamperedAmount = (10000 * 100).toString(); // Đơn hàng 530.000đ nhưng hacker gửi 10.000đ
  const tamperedParamsObj: Record<string, string> = {
    vnp_Amount: tamperedAmount,
    vnp_BankCode: 'NCB',
    vnp_ResponseCode: '00',
    vnp_TransactionNo: 'VNP_TRANS_TAMPERED',
    vnp_TxnRef: testOrder.id
  };
  const tamperedDataString = buildQueryDataString(tamperedParamsObj);
  const tamperedHash = computeHmacSha512(tamperedDataString, secret);
  tamperedParamsObj.vnp_SecureHash = tamperedHash;

  const tamperedReq = new NextRequest('http://localhost:3000/api/payment/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(tamperedParamsObj)
  });
  const tamperedRes = await POST(tamperedReq);
  const tamperedResData = await tamperedRes.json();
  if (tamperedRes.status === 400 && tamperedResData.RspCode === '04') {
    console.log('   ✅ Webhook phát hiện gian lận số tiền: Bác bỏ thanh toán (RspCode 04 - Amount mismatch).');
  } else {
    throw new Error(`❌ Webhook không chặn số tiền sai lệch! Status: ${tamperedRes.status}, data: ${JSON.stringify(tamperedResData)}`);
  }

  // 6. Test Webhook thanh toán hợp lệ (Success)
  console.log('\n6. Kiểm thử Webhook thanh toán hợp lệ (HMAC-SHA512 chuẩn)...');
  const validParamsObj: Record<string, string> = {
    vnp_Amount: (testOrder.total * 100).toString(),
    vnp_BankCode: 'NCB',
    vnp_CardType: 'ATM',
    vnp_OrderInfo: `Thanh toan don hang ${testOrder.id}`,
    vnp_PayDate: '20261007120000',
    vnp_ResponseCode: '00',
    vnp_TransactionNo: 'VNP_TXN_999888',
    vnp_TransactionStatus: '00',
    vnp_TxnRef: testOrder.id
  };
  const validDataString = buildQueryDataString(validParamsObj);
  const validHash = computeHmacSha512(validDataString, secret);
  validParamsObj.vnp_SecureHash = validHash;

  const validReq = new NextRequest('http://localhost:3000/api/payment/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(validParamsObj)
  });
  const validRes = await POST(validReq);
  const validResData = await validRes.json();

  if (validRes.status === 200 && validResData.RspCode === '00') {
    console.log('   ✅ Webhook xử lý thành công đơn hàng (RspCode 00 - Confirm Success).');
  } else {
    throw new Error(`❌ Webhook thất bại xử lý đơn hợp lệ! Status: ${validRes.status}, data: ${JSON.stringify(validResData)}`);
  }

  // Kiểm tra đơn hàng trong DB đã được cập nhật chưa
  const updatedOrder = await prisma.order.findUnique({
    where: { id: testOrder.id },
    include: { payment: true }
  });
  if (updatedOrder && updatedOrder.status === 'completed' && updatedOrder.payment?.status === 'success') {
    console.log(`   ✅ Database đã cập nhật: Status: "${updatedOrder.status}", Đã ghi nhận bản ghi Payment ID: "${updatedOrder.payment.id}" với TransactionID: "${updatedOrder.payment.transactionId}".`);
  } else {
    throw new Error('❌ Trạng thái đơn hàng trong database không được cập nhật đúng!');
  }

  // 7. Test Idempotency (Gửi lại Webhook lần 2 cùng mã giao dịch)
  console.log('\n7. Kiểm thử Idempotency (Chống xử lý trùng lặp khi webhook gửi lại)...');
  const duplicateReq = new NextRequest('http://localhost:3000/api/payment/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(validParamsObj)
  });
  const duplicateRes = await POST(duplicateReq);
  const duplicateResData = await duplicateRes.json();
  if (duplicateRes.status === 200 && duplicateResData.RspCode === '02') {
    console.log('   ✅ Idempotency hoạt động hoàn hảo: Đơn hàng đã xử lý được nhận diện an toàn (RspCode 02 - Order already confirmed).');
  } else {
    throw new Error(`❌ Lỗi idempotency! Status: ${duplicateRes.status}, data: ${JSON.stringify(duplicateResData)}`);
  }

  // Dọn dẹp dữ liệu test
  await prisma.auditLog.deleteMany({ where: { action: 'PAYMENT_WEBHOOK_SUCCESS' } });
  await prisma.payment.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  console.log('\n🧹 Đã dọn dẹp sạch sẽ dữ liệu đơn hàng test trong database.');

  console.log('\n✨ TẤT CẢ 7/7 TEST CASES THANH TOÁN & WEBHOOK ĐÃ PASS THÀNH CÔNG! ✨');
}

runPaymentTests().catch(err => {
  console.error('\n❌ TEST PAYMENT GATEWAY THẤT BẠI:', err);
  process.exit(1);
});
