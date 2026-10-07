'use server';

import { prisma } from '@/database/db';
import { contactRateLimiter } from '@/backend/security/rateLimiter';
import { sendContactConfirmationEmail } from '@/backend/services/emailService';

export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  botField?: string; // Honeypot field for anti-spam
}

function mapSubjectToCategory(subject: string): string {
  switch (subject) {
    case 'order':
      return 'Hỗ trợ đơn hàng';
    case 'partnership':
      return 'Hợp tác kinh doanh';
    case 'feedback':
      return 'Khiếu nại dịch vụ';
    case 'general':
    default:
      return 'Tư vấn phong cách & Đặt hàng';
  }
}

export async function submitContactFormAction(data: ContactFormData) {
  try {
    // 1. Anti-spam Honeypot Check: bots often fill in hidden fields
    if (data.botField && data.botField.trim() !== '') {
      // Silently pretend success to deceive spam bots
      return { success: true, message: 'Lời nhắn của bạn đã được gửi thành công!' };
    }

    const fullName = (data.fullName || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const phone = (data.phone || '').trim();
    const subject = (data.subject || 'general').trim();
    const message = (data.message || '').trim();

    // 2. Server-side validation
    if (!fullName || fullName.length < 2 || fullName.length > 100) {
      return { success: false, error: 'Họ và tên không hợp lệ (từ 2 đến 100 ký tự).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 150) {
      return { success: false, error: 'Địa chỉ email không đúng định dạng.' };
    }

    // 2.1 Sliding Window Rate Limiting (Anti-spam / Anti-flooding)
    const rateCheck = await contactRateLimiter.check(email);
    if (!rateCheck.success) {
      const waitSecs = Math.ceil(rateCheck.retryAfterMs / 1000);
      return {
        success: false,
        error: `Bạn đã gửi lời nhắn quá nhiều lần. Vui lòng thử lại sau ${waitSecs} giây.`
      };
    }

    if (phone) {
      const cleanPhone = phone.replace(/[\s\.\-\(\)]/g, '');
      const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return { success: false, error: 'Số điện thoại không hợp lệ (10-11 chữ số).' };
      }
    }

    if (!message || message.length < 10) {
      return { success: false, error: 'Nội dung lời nhắn phải dài ít nhất 10 ký tự.' };
    }

    if (message.length > 3000) {
      return { success: false, error: 'Nội dung lời nhắn không được vượt quá 3000 ký tự.' };
    }

    const category = mapSubjectToCategory(subject);
    const formattedDescription = `[Yêu cầu từ Website / Form Liên hệ]\n- Khách hàng: ${fullName}\n- Email: ${email}\n- SĐT: ${phone || 'Không cung cấp'}\n- Chủ đề: ${category}\n\n[Nội dung]:\n${message}`;

    // 3. Save ticket to database for CSKH department
    const ticket = await prisma.cSKHTicket.create({
      data: {
        customerName: fullName,
        category: category,
        description: formattedDescription,
        status: 'pending'
      }
    });

    // 4. Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'CONTACT_FORM_SUBMITTED',
        details: `Khách hàng ${fullName} (${email}) gửi lời nhắn liên hệ (${category}) [Ticket #${ticket.id.slice(0, 8)}]`,
        performedByName: fullName
      }
    });

    // 5. Send automated confirmation receipt email asynchronously
    sendContactConfirmationEmail({
      ticketId: ticket.id,
      customerName: fullName,
      customerEmail: email,
      category,
      message
    }).catch(err => console.error('[EMAIL ERROR] Failed to send contact confirmation email:', err));

    return {
      success: true,
      data: { ticketId: ticket.id },
      message: 'Lời nhắn của bạn đã được gửi thành công! Đội ngũ CSKH sẽ phản hồi trong 12-24 giờ làm việc.'
    };
  } catch (error: any) {
    console.error('submitContactFormAction error:', error);
    return {
      success: false,
      error: 'Hệ thống đang bận. Vui lòng thử lại sau hoặc liên hệ Hotline 1900 8899.'
    };
  }
}
