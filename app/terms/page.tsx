'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Hammer, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsOfServicePage() {
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
            Điều Khoản Dịch Vụ
          </h1>
          <p className="text-xs text-brand-muted uppercase tracking-widest font-light">
            Quy định sử dụng dịch vụ và pháp lý tại NOVYN.WEAR
          </p>
        </motion.div>

        {/* Highlight cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Thỏa thuận pháp lý</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Bằng cách truy cập website và đặt mua sản phẩm, bạn đồng ý tuân thủ các quy tắc trong điều khoản này.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Sở hữu trí tuệ</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Mọi thiết kế quần áo, hình ảnh lookbook, mã nguồn và logo thương hiệu đều thuộc sở hữu độc quyền của Novyn.Wear.
            </p>
          </div>

          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
            <div className="p-3.5 rounded-full bg-neutral-50 border border-brand-border text-brand-text mb-4">
              <Hammer className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text mb-2">Giải quyết tranh chấp</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Chúng tôi luôn ưu tiên đàm phán thương lượng giải quyết tranh chấp trên tinh thần bảo vệ tối đa lợi ích khách hàng.
            </p>
          </div>
        </motion.div>

        {/* Detailed Sections */}
        <motion.div variants={itemVariants} className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs space-y-8 text-left">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase">
              01. Quy Định Sử Dụng Tài Khoản
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Khách hàng chịu trách nhiệm bảo mật mật khẩu tài khoản đã đăng ký trên website Novyn Wear. Bạn hoàn toàn chịu trách nhiệm về toàn bộ các hoạt động diễn ra dưới tài khoản của mình. Nếu phát hiện bất kỳ dấu hiệu truy cập trái phép nào, vui lòng liên hệ ngay với CSKH Novyn Wear qua Hotline <strong className="text-brand-text font-medium">1900 8899</strong> để tạm khóa tài khoản bảo vệ dữ liệu.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase">
              02. Quyền Sở Hữu Trí Tuệ Độc Quyền
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Toàn bộ nội dung hiển thị trên website, bao gồm thiết kế mẫu mã trang phục, ảnh chụp BST Lookbook, đồ họa thương hiệu, logo, video truyền thông và mã nguồn lập trình đều là tài sản trí tuệ độc quyền của Novyn Wear (hoặc đối tác cấp phép). Mọi hành vi sao chép, phân phối hoặc tái xuất bản thương mại khi chưa được sự đồng ý bằng văn bản của ban quản trị Novyn Wear đều vi phạm luật sở hữu trí tuệ hiện hành.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-base font-normal tracking-wider text-brand-text uppercase">
              03. Quy Định Thanh Toán &amp; Hủy Đơn
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              Novyn Wear hỗ trợ thanh toán khi nhận hàng (COD), thẻ Visa mô phỏng và thanh toán chuyển khoản qua mã QR động trên website. Khách hàng có quyền hủy đơn hàng trước khi trạng thái đơn đổi thành `shipping` (đang giao hàng). Đối với các đơn hàng đã giao cho bưu cục GHN vận chuyển, đơn hàng chỉ có thể đổi trả theo đúng quy trình quy định tại <Link href="/returns" className="text-brand-text hover:underline font-bold">Chính sách đổi trả</Link>.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
