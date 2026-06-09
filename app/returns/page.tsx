'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReturnsPolicyPage() {
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
            Chính Sách Đổi Trả
          </h1>
          <p className="text-xs text-brand-muted uppercase tracking-widest font-light">
            Đổi trả linh hoạt - Cam kết chất lượng dịch vụ cao cấp
          </p>
        </motion.div>

        {/* Highlight cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Đổi hàng trong 7 ngày</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Chúng tôi hỗ trợ đổi size, đổi mẫu sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng thành công.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Đổi trả đa kênh</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Khách hàng có thể đổi trực tiếp tại hệ thống Showroom hoặc gửi bưu điện thu hồi tận nhà trên toàn quốc.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Bảo hành lỗi may</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Miễn phí sửa đổi, bảo hành đường may, cúc áo trọn đời cho toàn bộ sản phẩm mua sắm tại Novyn Wear.
            </p>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <motion.div variants={itemVariants} className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8 text-left">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase flex items-center gap-2">
              <span className="text-sm">01.</span> Điều Kiện Sản Phẩm Được Áp Dụng Đổi Trả
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light mb-2">
              Sản phẩm yêu cầu đổi trả cần phải đáp ứng đầy đủ các tiêu chuẩn kiểm duyệt chất lượng nghiêm ngặt của Novyn Wear:
            </p>
            <ul className="space-y-2.5">
              {[
                'Sản phẩm còn nguyên tem mác treo, nhãn mác thương hiệu và hóa đơn mua hàng đi kèm.',
                'Sản phẩm hoàn toàn chưa qua sử dụng, chưa qua giặt tẩy, không có mùi lạ (mồ hôi, nước hoa, chất tẩy rửa).',
                'Sản phẩm không có bất kỳ dấu hiệu hư tổn vật lý nào do tác động từ bên ngoài (trầy xước vải, đứt chỉ co giãn, mất khuy nút) sau khi nhận bưu kiện.',
                'Sản phẩm mua trong các chương trình khuyến mãi giảm giá từ 50% trở lên sẽ không được hỗ trợ đổi trả mẫu (chỉ hỗ trợ đổi size nếu còn tồn kho).'
              ].map((text, idx) => (
                <li key={idx} className="flex gap-2 items-start text-xs text-brand-muted font-light">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-muted shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase flex items-center gap-2">
              <span className="text-sm">02.</span> Hướng Dẫn Quy Trình Đổi Trả
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light mb-2">
              Khách hàng mua sắm trực tuyến có thể lựa chọn 1 trong 2 phương thức đổi trả vô cùng thuận tiện sau:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-xl border border-brand-border">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Cách 1: Đổi trực tiếp tại Showroom</h4>
                <p className="text-xs text-brand-muted leading-relaxed font-light">
                  Quý khách mang sản phẩm lỗi/cần đổi size kèm hóa đơn đến trực tiếp Showroom chính thức của chúng tôi tại <strong className="text-brand-text font-medium">152 Đồng Khởi, Q. 1, TP. HCM</strong> để được nhân viên hỗ trợ đổi mới ngay lập tức.
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl border border-brand-border">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">Cách 2: Đổi trả thu hồi tại nhà</h4>
                <p className="text-xs text-brand-muted leading-relaxed font-light">
                  Liên hệ Hotline <strong className="text-brand-text font-medium">1900 8899</strong>. Chúng tôi sẽ điều phối shipper của bưu cục đến tận nhà quý khách để giao sản phẩm mới đồng thời thu hồi sản phẩm cần đổi trả về mà khách hàng không cần tự đem đi gửi.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase flex items-center gap-2">
              <span className="text-sm">03.</span> Chi Phí Vận Chuyển Khi Đổi Trả
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              - Trường hợp đổi trả do lỗi thiết kế của Novyn Wear, lỗi từ nhà sản xuất hoặc giao sai mẫu mã/size so với đơn đặt hàng: Novyn Wear <strong className="text-brand-text font-bold">chịu 100% chi phí vận chuyển hai chiều</strong>.
              <br />
              - Trường hợp khách hàng muốn đổi mẫu khác, đổi size khác theo sở thích cá nhân: Khách hàng vui lòng thanh toán phí ship phát sinh.
            </p>
          </div>
        </motion.div>

        {/* Action Call to customer dashboard */}
        <motion.div variants={itemVariants} className="bg-neutral-50 border border-brand-border rounded-2xl p-6 text-center">
          <p className="text-xs text-brand-muted leading-relaxed font-light mb-4">
            Để theo dõi lịch sử và đăng ký yêu cầu đổi trả, quý khách có thể thực hiện trực tiếp tại trang chi tiết đơn hàng trong tài khoản cá nhân của bạn.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center justify-center bg-brand-accent text-white text-[9px] font-bold uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
          >
            Quản lý đơn hàng
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
