'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, Award, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { value: '2024', label: 'Năm Thành Lập' },
    { value: '15K+', label: 'Khách Hàng Ưu Tú' },
    { value: '98%', label: 'Nguyên Liệu Tự Nhiên' },
    { value: '100%', label: 'Bao Bì Thân Thiện' },
  ];

  const values = [
    {
      icon: <Leaf className="w-5 h-5 text-brand-text" />,
      title: 'Thời Trang Bền Vững',
      desc: 'Chúng tôi cam kết sử dụng 100% sợi linen organic, cotton hữu cơ và các chất liệu thân thiện nhằm giảm thiểu tối đa tác động lên môi trường.',
    },
    {
      icon: <Award className="w-5 h-5 text-brand-text" />,
      title: 'Tỉ Mỉ Trong Craftsmanship',
      desc: 'Mỗi đường kim mũi chỉ, phom dáng cắt may hay các chi tiết nút áo đều được chế tác thủ công tỉ mỉ bởi những người thợ lành nghề nhất.',
    },
    {
      icon: <Heart className="w-5 h-5 text-brand-text" />,
      title: 'Thiết Kế Độc Bản',
      desc: 'Không chạy theo xu hướng nhất thời, các bộ sưu tập của Novyn Wear định hình phong cách sống tối giản (Quiet Luxury) trường tồn cùng thời gian.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-brand-text" />,
      title: 'Trách Nhiệm Xã Hội',
      desc: 'Chúng tôi xây dựng môi trường làm việc nhân văn, công bằng và đóng góp trích doanh thu cho các dự án trồng rừng xã hội.',
    },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden bg-white">
      
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[45vh] flex items-center bg-white px-4 sm:px-6 lg:px-8 border-b border-brand-border">
        <div className="max-w-4xl mx-auto w-full text-center relative z-10 py-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-muted mb-4 block"
          >
            Câu chuyện thương hiệu
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-widest text-brand-text leading-tight mb-6 uppercase"
          >
            Về Novyn Wear
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm text-brand-muted max-w-2xl mx-auto leading-relaxed font-light tracking-wide"
          >
            Được thành lập với sứ mệnh định hình lại tủ đồ hiện đại, Novyn Wear chắt lọc tinh hoa tối giản, kết hợp nguyên liệu tự nhiên bền vững để kiến tạo nên những sản phẩm tinh tế, nâng niu phong cách sống tự tại của bạn.
          </motion.p>
        </div>
      </section>

      {/* 2. STATS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 w-full">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-brand-border shadow-sm grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y-0 divide-x-0 md:divide-y-0 lg:divide-x lg:divide-brand-border">
          {stats.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center justify-center text-center p-4 lg:first:pl-0 lg:last:pr-0"
            >
              <span className="text-3xl md:text-4xl lg:text-5xl font-normal text-brand-text tracking-tight mb-2">
                {s.value}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-brand-muted">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. MANIFESTO & PHILOSOPHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg md:text-xl font-normal text-brand-text mb-6 tracking-widest uppercase">
            Tuyên Ngôn Thiết Kế: &ldquo;Less but Better&rdquo;
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted leading-loose italic font-light px-4">
            &ldquo;Tại Novyn Wear, chúng tôi tin rằng sự sang trọng thực sự không nằm ở những chi tiết phô trương, mà ẩn giấu trong sự mộc mạc nguyên bản của chất liệu và phom dáng chuẩn mực. Một chiếc áo Linen cao cấp hay mùi hương nước hoa ấm áp từ gỗ tuyết tùng chính là ngôn ngữ thầm lặng, khẳng định cá tính tinh tế, sâu lắng của người sở hữu.&rdquo;
          </p>
        </div>
      </section>

      {/* 4. STORY SECTION (ALTERNATING BLOCKS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-24">
        
        {/* Block 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex flex-col items-start"
          >
            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-3">— Khởi nguồn ý tưởng</span>
            <h3 className="text-2xl font-normal text-brand-text uppercase tracking-widest mb-5">
              Từ ước mơ về sợi Linen bản địa
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-4 font-light">
              Novyn Wear bắt đầu hành trình từ những chuyến đi tìm kiếm chất liệu dệt thô mộc. Chúng tôi nhận thấy những sợi linen tự nhiên có khả năng thoáng mát tự điều hòa nhiệt độ vượt trội, cực kỳ phù hợp với khí hậu nóng ẩm nhiệt đới của Việt Nam.
            </p>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light">
              Trải qua hơn 18 tháng nghiên cứu phát triển sợi Linen hữu cơ cao cấp, Novyn Wear ra đời với mong muốn tạo nên những chiếc áo thô mộc nhưng giữ nguyên phom dáng cắt may hiện đại của thời trang thiết kế cao cấp, giúp tôn vinh thần thái tự tin của người mặc.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 aspect-[16/11] relative rounded-2xl overflow-hidden shadow-sm border border-brand-border"
          >
            <Image
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
              alt="Natural Linen Fabric Production"
              fill
              className="object-cover"
              unoptimized
            />
          </motion.div>
        </div>

        {/* Block 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 lg:order-2 aspect-[16/11] relative rounded-2xl overflow-hidden shadow-sm border border-brand-border"
          >
            <Image
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80"
              alt="Ethical Tailoring Craftsmanship"
              fill
              className="object-cover"
              unoptimized
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 lg:order-1 flex flex-col items-start"
          >
            <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest mb-3">— Triết lý thiết kế</span>
            <h3 className="text-2xl font-normal text-brand-text uppercase tracking-widest mb-5">
              Đôi tay chế tác thủ công tài hoa
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-4 font-light">
              Mỗi sản phẩm Novyn Wear không đơn thuần là quần áo thông thường, đó là một tác phẩm chứa đựng tâm huyết của đội ngũ thợ may dày dặn kinh nghiệm. Chúng tôi thiết lập các tiêu chuẩn khắt khe về kỹ thuật giấu chỉ, vắt sổ, gia cố nút bấm để đảm bảo tuổi thọ tối đa cho sản phẩm.
            </p>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light">
              Bạn có thể dễ dàng cảm nhận sự khác biệt ngay trong lần chạm tay đầu tiên: vải êm mềm không gây ngứa, các nếp gấp tự nhiên rũ nhẹ ôm lấy cơ thể, tạo cảm giác dễ chịu tuyệt đối từ sáng sớm công sở đến tối muộn dạo phố.
            </p>
          </motion.div>
        </div>

      </section>

      {/* 5. BRAND VALUES */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-y border-brand-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-normal text-brand-text mb-3 tracking-widest uppercase">
              Giá trị cốt lõi
            </h2>
            <p className="text-xs md:text-sm text-brand-muted leading-relaxed font-light">
              Những nguyên tắc nền tảng định hình nên tinh thần Novyn Wear trong mọi hoạt động.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-neutral-50/40 p-8 rounded-2xl border border-brand-border shadow-sm flex items-start gap-5 hover:bg-neutral-100/75 transition-colors"
              >
                <div className="p-3.5 bg-white rounded-xl border border-brand-border shrink-0 text-[#26211E]">
                  {val.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest mb-2">
                    {val.title}
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed font-light">
                    {val.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-brand-text text-white rounded-3xl p-12 md:p-16 relative overflow-hidden shadow-sm border border-brand-border"
        >
          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-widest uppercase mb-4 leading-tight text-white">
              Khám Phá Sức Hút Tối Giản
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mb-8 leading-relaxed max-w-sm font-light">
              Tìm kiếm cho riêng mình những trang phục linen nhẹ nhàng hay một mùi hương signature độc bản để tự tin định hình phong cách sống của bạn ngay hôm nay.
            </p>
            <Link
              href="/products"
              className="bg-white text-brand-text text-xs font-bold uppercase tracking-widest px-8 py-4.5 rounded-xl hover:bg-neutral-100 transition-colors flex items-center gap-2 active:scale-95 shadow-sm"
            >
              Xem bộ sưu tập mới nhất
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
