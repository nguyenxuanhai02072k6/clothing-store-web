import { submitContactFormAction } from '../backend/actions/contactActions';
import { prisma } from '../database/db';

async function runContactTests() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TÍNH NĂNG LIÊN HỆ (/contact)...\n');

  let passed = 0;
  let total = 0;

  // TEST 1: Valid contact submission
  total++;
  try {
    const res = await submitContactFormAction({
      fullName: 'Nguyễn Văn Test',
      email: 'test.contact@gmail.com',
      phone: '0909123456',
      subject: 'order',
      message: 'Tôi muốn kiểm tra tình trạng đơn hàng #ORD-123456 đổi size.'
    });

    if (res.success && res.data?.ticketId) {
      const ticket = await prisma.cSKHTicket.findUnique({
        where: { id: res.data.ticketId }
      });
      if (ticket && ticket.customerName === 'Nguyễn Văn Test' && ticket.category === 'Hỗ trợ đơn hàng') {
        console.log('✅ TEST 1: Gửi liên hệ hợp lệ & tạo CSKHTicket thành công');
        passed++;
        // Clean up test ticket
        await prisma.cSKHTicket.delete({ where: { id: ticket.id } });
      } else {
        console.error('❌ TEST 1: Ticket không được tạo đúng thông tin trong DB');
      }
    } else {
      console.error('❌ TEST 1: Submit contact thất bại', res);
    }
  } catch (err) {
    console.error('❌ TEST 1: Lỗi ngoại lệ', err);
  }

  // TEST 2: Honeypot Anti-Spam (Bot detection)
  total++;
  try {
    const beforeCount = await prisma.cSKHTicket.count();
    const res = await submitContactFormAction({
      fullName: 'Spam Bot 3000',
      email: 'bot@spam.com',
      subject: 'general',
      message: 'Cheap sunglasses click here buy now http://spam.xyz',
      botField: 'I am a real human' // Bot fills this in
    });

    const afterCount = await prisma.cSKHTicket.count();
    if (res.success && afterCount === beforeCount) {
      console.log('✅ TEST 2: Chống Spam Honeypot hoạt động chuẩn (Đánh lừa bot và không lưu rác vào DB)');
      passed++;
    } else {
      console.error('❌ TEST 2: Bot vẫn tạo rác trong DB');
    }
  } catch (err) {
    console.error('❌ TEST 2: Lỗi ngoại lệ', err);
  }

  // TEST 3: Validation checks (Email sai, nội dung quá ngắn)
  total++;
  try {
    const resBadEmail = await submitContactFormAction({
      fullName: 'A', // Too short
      email: 'invalid-email',
      subject: 'general',
      message: 'Hi' // Too short
    });

    if (!resBadEmail.success) {
      console.log('✅ TEST 3: Validation phía Server từ chối dữ liệu không hợp lệ');
      passed++;
    } else {
      console.error('❌ TEST 3: Server vẫn chấp nhận dữ liệu rác');
    }
  } catch (err) {
    console.error('❌ TEST 3: Lỗi ngoại lệ', err);
  }

  console.log(`\n🎯 KẾT QUẢ: ${passed}/${total} BÀI TEST THÀNH CÔNG!`);
  if (passed === total) {
    console.log('🎉 PHẦN LIÊN HỆ ĐÃ HOẠT ĐỘNG HOÀN TOÀN ỔN ĐỊNH VÀ AN TOÀN.');
  }
}

runContactTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
