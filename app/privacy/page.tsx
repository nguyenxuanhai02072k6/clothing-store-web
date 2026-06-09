'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Key, UserCheck, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      {/* Back button */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1.5"
        >
          ← Quay lại trang chủ
        </Link>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center pb-8 border-b border-brand-border">
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] text-brand-text uppercase mb-4">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-xs text-brand-muted uppercase tracking-widest font-light">
            Bảo vệ thông tin cá nhân và quyền riêng tư của khách hàng
          </p>
        </motion.div>

        {/* Highlight cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Mã hóa an toàn</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Novyn Wear sử dụng chứng chỉ mã hóa dữ liệu đầu cuối SSL/TLS để bảo mật mọi thông tin giao dịch cá nhân.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Không chia sẻ dữ liệu</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Chúng tôi cam kết tuyệt đối không bán, cho thuê hoặc chia sẻ dữ liệu của khách hàng cho bên thứ ba.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Quyền kiểm soát của bạn</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Khách hàng hoàn toàn có quyền cập nhật, thay đổi thông tin cá nhân hoặc yêu cầu vô hiệu hóa tài khoản bất kỳ lúc nào.
            </p>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <motion.div variants={itemVariants} className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8 text-left">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase">
              01. Các Thông Tin Thu Thập
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Khi khách hàng đăng ký tài khoản hoặc thực hiện giao dịch mua hàng trên website Novyn.Wear, chúng tôi sẽ thu thập các thông tin cơ bản sau để phục vụ vận hành: Họ và tên, Số điện thoại nhận hàng, Địa chỉ giao hàng chi tiết, Địa chỉ email và Lịch sử giao dịch mua sắm.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase">
              02. Mục Đích Sử Dụng Dữ Liệu
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Mọi dữ liệu cá nhân do khách hàng cung cấp chỉ được sử dụng cho các mục đích nội bộ sau:
              <br />
              - Xử lý đơn hàng, bàn giao vận chuyển, xuất hóa đơn và liên lạc xác nhận giao hàng.
              <br />
              - Tích lũy chi tiêu tự động thăng cấp VIP Novyn Club và cộng điểm đổi Voucher thưởng trong tài khoản.
              <br />
              - Gửi thông tin thông báo trạng thái đơn hàng (đã gửi hàng, giao hàng thành công/thất bại).
              <br />
              - Giải quyết khiếu nại, hỗ trợ đổi trả sản phẩm lỗi hoặc bảo hành trọn đời.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase">
              03. Cam Kết Bảo Mật &amp; Lưu Trữ
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Dữ liệu của khách hàng được lưu trữ an toàn trong cơ sở dữ liệu SQLite cục bộ được bảo vệ bởi tường lửa của hệ thống máy chủ Novyn.Wear. Mật khẩu đăng nhập của khách hàng được mã hóa hoàn toàn một chiều (hashing) trước khi lưu vào cơ sở dữ liệu nhằm ngăn chặn tối đa nguy cơ rò rỉ dữ liệu trong trường hợp bị tấn công.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 font-light text-xs text-brand-muted flex items-start gap-2.5 bg-rose-50/20 p-4 border border-rose-200/30 rounded-xl">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-brand-text font-bold uppercase tracking-wider block mb-1">Cảnh giác cuộc gọi giả mạo thương hiệu:</strong>
              Novyn Wear chỉ liên hệ xác nhận đơn hàng qua số Hotline duy nhất <strong className="text-brand-text font-bold">1900 8899</strong> và email <strong className="text-brand-text font-bold">support@novynwear.com</strong>. Chúng tôi tuyệt đối KHÔNG bao giờ yêu cầu khách hàng cung cấp mã OTP ngân hàng, số thẻ tín dụng hoặc các mật khẩu tài khoản cá nhân.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
