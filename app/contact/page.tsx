'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ContactFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export default function ContactPage() {
  const { showToast } = useToast();
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  
  // UI States
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: '1. Thời gian giao hàng bao lâu?',
      answer: 'Thời gian giao hàng tiêu chuẩn là từ 2 - 4 ngày làm việc tùy thuộc vào khoảng cách địa lý. Đơn hàng nội thành Hà Nội và TP.HCM có thể giao ngay trong ngày qua dịch vụ hỏa tốc.'
    },
    {
      question: '2. Tôi có thể đổi size không?',
      answer: 'Novyn Wear hỗ trợ đổi size miễn phí trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện sản phẩm còn nguyên tag mác, chưa qua sử dụng hay giặt là. Bạn có thể đổi tại showroom hoặc qua bưu điện.'
    },
    {
      question: '3. Làm sao để kiểm tra đơn hàng?',
      answer: 'Bạn có thể đăng nhập vào tài khoản trên website để theo dõi trạng thái vận đơn trực tiếp, hoặc liên hệ Hotline 1900 8899/ nhắn tin cho chatbot để nhân viên CSKH tra cứu mã vận đơn cho bạn.'
    },
    {
      question: '4. Novyn Wear có showroom không?',
      answer: 'Hiện tại Novyn Wear có 2 chi nhánh lớn tại Hà Nội (28 Tràng Tiền, Hoàn Kiếm) và TP.HCM (152 Đồng Khởi, Quận 1). Bạn có thể ghé thăm để trực tiếp trải nghiệm phom dáng và chất liệu.'
    }
  ];

  const toggleFaq = (idx: number) => {
    setActiveFaq(prev => prev === idx ? null : idx);
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const tempErrors: ContactFormErrors = {};
    
    if (!fullName.trim()) {
      tempErrors.fullName = 'Vui lòng nhập họ và tên của bạn.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = 'Vui lòng nhập địa chỉ email liên hệ.';
    } else if (!emailRegex.test(email)) {
      tempErrors.email = 'Địa chỉ email không đúng định dạng.';
    }

    const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
    if (phone.trim() && !phoneRegex.test(phone.replace(/\s/g, ''))) {
      tempErrors.phone = 'Số điện thoại không hợp lệ (gồm 10 chữ số).';
    }

    if (!message.trim()) {
      tempErrors.message = 'Vui lòng nhập nội dung lời nhắn.';
    } else if (message.trim().length < 10) {
      tempErrors.message = 'Nội dung lời nhắn phải dài ít nhất 10 ký tự.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin trong form liên hệ.', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending message API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      showToast('Lời nhắn của bạn đã được gửi thành công!', 'success');
      
      // Clear inputs
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSubject('general');
    }, 1500);
  };

  const handleResetSuccess = () => {
    setIsSuccess(false);
  };

  const showrooms = [
    {
      city: 'Hà Nội Showroom',
      address: '28 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
      phone: '024 7308 6688',
      email: 'hanoi@novynwear.com',
      hours: '09:00 - 22:00 (Hằng ngày)',
    },
    {
      city: 'TP. Hồ Chí Minh Flagship',
      address: '152 Đồng Khởi, Quận 1, TP. Hồ Chí Minh',
      phone: '028 7308 9988',
      email: 'saigon@novynwear.com',
      hours: '09:00 - 22:30 (Hằng ngày)',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 bg-white">
      
      {/* Page Title */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-3xl font-normal text-brand-text tracking-tight uppercase mb-2">
          Liên Hệ Với NOVYN WEAR
        </h1>
        <p className="text-xs text-brand-muted max-w-xl leading-relaxed">
          Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp, thắc mắc về đơn hàng, hay đề xuất hợp tác từ quý khách hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Interactive Contact Form (7 Columns) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-brand-border shadow-sm relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="contact-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-4 border-b border-brand-border mb-6">
                  Gửi Lời Nhắn Cho Chúng Tôi
                </h3>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                  
                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-fullname" className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                      Họ và tên *
                    </label>
                    <input
                      id="contact-fullname"
                      type="text"
                      placeholder="Nguyễn Văn A..."
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                      }}
                      className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
                        errors.fullName ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
                      }`}
                      required
                    />
                    {errors.fullName && <p className="text-[10px] font-bold text-rose-600">{errors.fullName}</p>}
                  </div>

                  {/* 2-Column Inputs for Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-email" className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                        Địa chỉ Email *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="name@example.com..."
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
                          errors.email ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
                        }`}
                        required
                      />
                      {errors.email && <p className="text-[10px] font-bold text-rose-600">{errors.email}</p>}
                    </div>

                    {/* Phone Input */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-phone" className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                        Số điện thoại (Tùy chọn)
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="Ví dụ: 0909xxxxxx..."
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors({ ...errors, phone: undefined });
                        }}
                        className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full ${
                          errors.phone ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
                        }`}
                      />
                      {errors.phone && <p className="text-[10px] font-bold text-rose-600">{errors.phone}</p>}
                    </div>

                  </div>

                  {/* Subject Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-subject" className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                      Chủ đề liên hệ
                    </label>
                    <div className="relative">
                      <select
                        id="contact-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="bg-white border border-brand-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full appearance-none cursor-pointer font-medium"
                      >
                        <option value="general">Tư vấn phong cách & Đặt hàng</option>
                        <option value="order">Hỗ trợ đổi trả & Đơn hàng</option>
                        <option value="partnership">Hợp tác kinh doanh & Đại lý</option>
                        <option value="feedback">Góp ý chất lượng dịch vụ</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-brand-muted">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="contact-message" className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                      Nội dung lời nhắn *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Nhập thông tin chi tiết về thắc mắc hoặc câu hỏi của bạn..."
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors({ ...errors, message: undefined });
                      }}
                      className={`bg-white border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand-accent focus:bg-neutral-50 w-full resize-none ${
                        errors.message ? 'border-rose-600 focus:border-rose-700' : 'border-brand-border'
                      }`}
                      required
                    />
                    {errors.message && <p className="text-[10px] font-bold text-rose-600">{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full bg-brand-accent text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 shadow-sm"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Đang gửi lời nhắn...</span>
                      </div>
                    ) : (
                      <>
                        Gửi lời nhắn ngay
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                </form>
              </motion.div>
            ) : (
              <motion.div
                key="contact-success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center text-center py-10"
              >
                <div className="p-4 bg-neutral-100 rounded-2xl border border-brand-border text-emerald-800 mb-6 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-normal text-brand-text uppercase mb-2 tracking-widest">
                  Gửi thành công!
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed max-w-sm mb-8 font-light">
                  Cảm ơn bạn đã liên hệ với <strong className="text-brand-text font-normal uppercase">NOVYN WEAR</strong>. Đội ngũ CSKH của chúng tôi sẽ phản hồi lại bạn qua email sớm nhất trong vòng 12-24 giờ làm việc.
                </p>
                <button
                  onClick={handleResetSuccess}
                  className="bg-brand-accent text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-neutral-800 transition-colors flex items-center gap-2"
                >
                  Gửi thêm lời nhắn mới
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: Showroom Info & Operating Hours (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section: Direct contacts info */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-3 border-b border-brand-border">
              Liên Hệ Trực Tiếp
            </h3>

            <div className="flex flex-col gap-4 text-xs text-brand-muted font-light">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 rounded-xl border border-brand-border shrink-0 text-brand-text">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-brand-muted block text-[9px] uppercase tracking-widest">Hotline Tư Vấn</span>
                  <span className="font-bold text-brand-text hover:text-brand-accent transition-colors block mt-0.5 select-all">
                    1900 8899 (09:00 - 22:00)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 rounded-xl border border-brand-border shrink-0 text-brand-text">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-brand-muted block text-[9px] uppercase tracking-widest">Email Chăm Sóc Khách Hàng</span>
                  <span className="font-bold text-brand-text hover:text-brand-accent transition-colors block mt-0.5 select-all">
                    support@novynwear.com
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-neutral-100 rounded-xl border border-brand-border shrink-0 text-brand-text">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-brand-muted block text-[9px] uppercase tracking-widest">Giờ Làm Việc</span>
                  <span className="font-semibold text-brand-text block mt-0.5">
                    Thứ 2 - Chủ Nhật: 09:00 - 22:30
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Showrooms List */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col gap-5">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-widest pb-3 border-b border-brand-border">
              Hệ Thống Showroom
            </h3>

            <div className="flex flex-col gap-6">
              {showrooms.map((sr, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-brand-text uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                    {sr.city}
                  </h4>
                  <div className="text-[11px] sm:text-xs text-brand-muted pl-6 flex flex-col gap-1 leading-relaxed font-light">
                    <p>{sr.address}</p>
                    <p className="font-semibold text-brand-text">Điện thoại: {sr.phone}</p>
                    <p>Email: {sr.email}</p>
                    <p>Mở cửa: {sr.hours}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Elegant Map Placeholder */}
          <div className="relative aspect-[16/9] w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-border flex items-center justify-center">
            <div className="absolute inset-0 bg-neutral-50/40 flex items-center justify-center p-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-brand-text block uppercase tracking-widest">Bản Đồ Chỉ Đường</span>
                  <p className="text-[9px] text-brand-muted mt-1 max-w-[200px] leading-normal font-light">
                    Khu vực mua sắm Tràng Tiền (Hà Nội) & Đồng Khởi (TP.HCM). Rất hân hạnh được đón tiếp bạn!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FAQ Section */}
      <section className="mt-24 pt-16 border-t border-brand-border">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xl sm:text-2xl font-normal text-brand-text uppercase tracking-widest mb-3">
            Câu Hỏi Thường Gặp (FAQ)
          </h2>
          <p className="text-xs text-brand-muted font-light">
            Giải đáp nhanh các thắc mắc phổ biến của khách hàng về mua sắm và dịch vụ tại Novyn Wear.
          </p>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-neutral-50/50 transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-brand-text uppercase tracking-wider">
                    {faq.question}
                  </span>
                  <span className={`text-brand-muted transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-brand-border/60 text-xs text-brand-muted leading-relaxed font-light font-sans">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
