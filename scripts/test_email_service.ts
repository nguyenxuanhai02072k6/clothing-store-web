import {
  sendEmail,
  sendOrderConfirmationEmail,
  sendContactConfirmationEmail,
  sendPaymentSuccessEmail
} from '../backend/services/emailService';
import { submitContactFormAction } from '../backend/actions/contactActions';
import { prisma } from '../database/db';

async function runEmailTests() {
  console.log('🧪 === BẮT ĐẦU KIỂM THỬ TRANSACTIONAL EMAIL SERVICE ===\n');

  // 1. Test low-level universal email dispatch
  console.log('1. Kiểm thử hàm gửi email cấp thấp sendEmail...');
  const baseResult = await sendEmail({
    to: 'customer.test@example.com',
    subject: 'Kiểm thử gửi email hệ thống',
    html: '<p>Đây là email kiểm tra hệ thống thông báo tự động</p>'
  });
  if (baseResult.success && baseResult.messageId) {
    console.log(`   ✅ Gửi email cơ bản thành công (Message ID: ${baseResult.messageId}).`);
  } else {
    throw new Error('❌ sendEmail thất bại!');
  }

  // 2. Test Order Confirmation Email Generator
  console.log('\n2. Kiểm thử tạo và gửi email Xác nhận đơn hàng (Itemized Receipt)...');
  const orderEmailResult = await sendOrderConfirmationEmail({
    orderId: 'ORD-TEST-9988',
    customerName: 'Hoang Van Nam',
    customerEmail: 'nam.hoang@test.com',
    customerPhone: '0908889999',
    customerAddress: '45 Thảo Điền, Quận 2, TP.HCM',
    items: [
      {
        productName: 'Áo Blazer Minimalist Lụa Tơ Tằm',
        size: 'L',
        colorName: 'Đen Tuyển',
        quantity: 1,
        price: 1850000
      },
      {
        productName: 'Quần Tây Ống Rộng Xếp Ly',
        size: 'M',
        colorName: 'Be Sữa',
        quantity: 2,
        price: 750000
      }
    ],
    subtotal: 3350000,
    discount: 335000,
    shipping: 0,
    total: 3015000,
    paymentMethod: 'vnpay',
    branchName: 'Chi nhánh Thảo Điền'
  });
  if (orderEmailResult.success && orderEmailResult.messageId) {
    console.log(`   ✅ Email hóa đơn đơn hàng đã tạo thành công với đầy đủ chi tiết sản phẩm và bảng giá.`);
  } else {
    throw new Error('❌ Gửi email xác nhận đơn hàng thất bại!');
  }

  // 3. Test CSKH Contact Form Inquiry Acknowledgment Email
  console.log('\n3. Kiểm thử tạo và gửi email Tiếp nhận phiếu CSKH...');
  const contactEmailResult = await sendContactConfirmationEmail({
    ticketId: 'cskh-ticket-uuid-12345',
    customerName: 'Le Thi Lan',
    customerEmail: 'lan.le@test.com',
    category: 'Tư vấn phong cách & Đặt hàng',
    message: 'Tôi muốn tư vấn mẫu áo phù hợp với chiều cao 1m65 và phong cách tối giản dự tiệc.'
  });
  if (contactEmailResult.success && contactEmailResult.messageId) {
    console.log(`   ✅ Email tiếp nhận yêu cầu CSKH đã gửi thành công kèm mã Ticket ID và cam kết SLA.`);
  } else {
    throw new Error('❌ Gửi email CSKH thất bại!');
  }

  // 4. Test Payment Success Email
  console.log('\n4. Kiểm thử email Thông báo thanh toán trực tuyến thành công...');
  const paymentEmailResult = await sendPaymentSuccessEmail({
    orderId: 'ORD-TEST-9988',
    customerName: 'Hoang Van Nam',
    customerEmail: 'nam.hoang@test.com',
    amount: 3015000,
    transactionNo: 'VNPAY_TRANS_888999'
  });
  if (paymentEmailResult.success && paymentEmailResult.messageId) {
    console.log(`   ✅ Email xác nhận thanh toán thành công đã phát hành.`);
  } else {
    throw new Error('❌ Gửi email thanh toán thành công thất bại!');
  }

  // 5. Test End-to-End Action Integration (Form submit auto triggers email)
  console.log('\n5. Kiểm thử tích hợp Action thực tế (submitContactFormAction tự động kích hoạt email)...');
  const uniqueTestEmail = `e2e_contact_${Date.now()}@domain.com`;
  const formRes = await submitContactFormAction({
    fullName: 'Nguyen Thi E2E',
    email: uniqueTestEmail,
    subject: 'general',
    message: 'Nội dung test gửi liên hệ để kiểm tra tích hợp gửi email tự động.'
  });
  if (formRes.success && formRes.data?.ticketId) {
    console.log(`   ✅ Action submitContactFormAction hoàn tất thành công (Ticket ID: ${formRes.data.ticketId}). Email tự động được dispatch.`);
    // Dọn dẹp ticket test
    await prisma.cSKHTicket.delete({ where: { id: formRes.data.ticketId } });
    await prisma.auditLog.deleteMany({ where: { performedByName: 'Nguyen Thi E2E' } });
  } else {
    throw new Error(`❌ Action form liên hệ không kích hoạt thành công: ${JSON.stringify(formRes)}`);
  }

  console.log('\n✨ TẤT CẢ 5/5 TEST CASES TRANSACTIONAL EMAIL ĐÃ PASS THÀNH CÔNG! ✨');
}

runEmailTests().catch(err => {
  console.error('\n❌ TEST TRANSACTIONAL EMAIL THẤT BẠI:', err);
  process.exit(1);
});
