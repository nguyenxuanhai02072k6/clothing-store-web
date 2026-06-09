'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShippingPolicyPage() {
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
            Chính Sách Giao Hàng
          </h1>
          <p className="text-xs text-brand-muted uppercase tracking-widest font-light">
            Vận chuyển cao cấp &amp; Bảo đảm trải nghiệm của khách hàng
          </p>
        </motion.div>

        {/* Highlight cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Đồng giá vận chuyển</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Phí ship đồng giá 30.000đ toàn quốc. Miễn phí vận chuyển cho mọi hóa đơn từ 500.000đ trở lên.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Thời gian nhanh chóng</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Giao hàng từ 1-3 ngày làm việc đối với khu vực nội thành, 3-5 ngày đối với khu vực ngoại thành và liên tỉnh.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Đồng kiểm khi nhận</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Khách hàng hoàn toàn có quyền mở gói hàng và kiểm tra sản phẩm với bưu tá trước khi thanh toán nhận hàng.
            </p>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <motion.div variants={itemVariants} className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8 text-left">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase flex items-center gap-2">
              <span className="text-sm">01.</span> Hỏa Tốc Nội Thành TP. HCM &amp; Hà Nội
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Đối với khách hàng có nhu cầu nhận sản phẩm ngay trong ngày tại khu vực nội thành TP. Hồ Chí Minh và Hà Nội, Novyn Wear cung cấp dịch vụ giao hàng hỏa tốc qua AhaMove/GrabExpress. Chi phí giao hàng hỏa tốc được tính theo khoảng cách thực tế từ showroom gần nhất đến địa chỉ của bạn. Vui lòng liên hệ Hotline <strong className="text-brand-text font-bold">1900 8899</strong> để được hỗ trợ tốt nhất.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase flex items-center gap-2">
              <span className="text-sm">02.</span> Quy trình kiểm hàng (Đồng kiểm)
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light mb-2">
              Để đảm bảo sự yên tâm và tin tưởng tối đa cho khách hàng khi mua sắm online tại Novyn Wear, chúng tôi áp dụng chính sách đồng kiểm:
            </p>
            <ul className="space-y-2.5">
              {[
                'Khách hàng được quyền mở hộp, kiểm tra phom dáng, màu sắc, size sản phẩm bên trong bưu kiện trước khi thanh toán.',
                'Tuyệt đối KHÔNG thử mặc sản phẩm trực tiếp (để tránh rủi ro vấy bẩn mỹ phẩm, mồ hôi hoặc làm hỏng sản phẩm chưa thanh toán).',
                'Nếu phát hiện sản phẩm bị lỗi do vận chuyển, không đúng mẫu mã, màu sắc hoặc kích cỡ đã đặt, khách hàng có quyền từ chối nhận hàng mà không cần thanh toán bất kỳ chi phí phát sinh nào.'
              ].map((text, idx) => (
                <li key={idx} className="flex gap-2 items-start text-xs text-brand-muted font-light">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-muted shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase flex items-center gap-2">
              <span className="text-sm">03.</span> Đóng gói quà tặng cao cấp
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Mỗi đơn hàng từ Novyn Wear đều được bọc giấy chống ẩm cao cấp, xếp gọn gàng trong hộp giấy kraft bảo vệ môi trường, kèm thư cảm ơn viết tay. Đối với nhu cầu làm quà tặng, quý khách có thể chọn thêm tùy chọn hộp quà tặng ép kim chữ nhũ sang trọng tại trang checkout hoặc liên hệ trực tiếp nhân viên tư vấn.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase flex items-center gap-2">
              <span className="text-sm">04.</span> Theo dõi trạng thái vận đơn
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Ngay sau khi đơn hàng được bàn giao cho đối tác vận chuyển Giao Hàng Nhanh (GHN), hệ thống sẽ cập nhật mã vận đơn thực tế lên lịch sử mua hàng trong <Link href="/account" className="text-brand-text hover:underline font-bold">Tài khoản khách hàng</Link>. Khách hàng có thể dễ dàng kiểm tra trực tiếp lộ trình di chuyển của bưu kiện ngay tại giao diện cá nhân.
            </p>
          </div>
        </motion.div>

        {/* Contact info box */}
        <motion.div variants={itemVariants} className="bg-neutral-50 border border-brand-border rounded-2xl p-6 text-center">
          <p className="text-xs text-brand-muted leading-relaxed font-light">
            Nếu có bất kỳ thắc mắc hoặc yêu cầu thay đổi địa chỉ giao hàng sau khi đặt mua, xin vui lòng gọi ngay Hotline{' '}
            <strong className="text-brand-text font-bold">1900 8899</strong> hoặc gửi thư về{' '}
            <strong className="text-brand-text font-bold">support@novynwear.com</strong> để được hỗ trợ kịp thời trước khi bưu kiện rời kho.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
