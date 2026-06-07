'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight, Check, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [policyModal, setPolicyModal] = useState<'delivery' | 'return' | 'terms' | 'privacy' | null>(null);
  const { showToast } = useToast();
  const pathname = usePathname();

  if (pathname?.startsWith('/internal')) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Vui lòng nhập địa chỉ email hợp lệ!', 'error');
      return;
    }

    setIsSubscribed(true);
    showToast('Đăng ký nhận bản tin thành công! Cảm ơn bạn.', 'success');
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800/40">
      
      {/* Top Banner / Newsletter */}
      <div className="border-b border-neutral-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Newsletter text */}
            <div className="lg:col-span-6">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
                Tham gia cộng đồng Novyn Wear
              </h3>
              <p className="text-sm text-neutral-400">
                Đăng ký nhận tin để cập nhật những bộ sưu tập mới nhất, tin tức thời trang và nhận ngay ưu đãi **10%** cho đơn hàng đầu tiên.
              </p>
            </div>

            {/* Newsletter Input Form */}
            <div className="lg:col-span-6">
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-md lg:ml-auto">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribed}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-500 w-full disabled:opacity-50 transition-all placeholder:text-neutral-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className={`px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-all ${
                    isSubscribed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-neutral-950 hover:bg-neutral-100 active:scale-95'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã Đăng Ký
                    </>
                  ) : (
                    <>
                      Đăng Ký
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group w-fit">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-neutral-800 bg-[#FFFBF8] flex items-center justify-center p-0.5 shadow-sm group-hover:border-neutral-750 transition-colors">
                <img
                  src="/logo.png"
                  alt="NOVYN WEAR Monogram"
                  className="w-full h-full object-contain scale-125 -translate-y-[1px]"
                />
              </div>
              <span className="text-2xl font-black tracking-wider text-white group-hover:text-neutral-300 transition-colors">
                NOVYN<span className="text-neutral-500 font-light">.WEAR</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
              Thương hiệu thời trang thiết kế cao cấp. Chúng tôi tin vào triết lý thiết kế tối giản, bền vững và tôn vinh cá tính độc bản trong từng sản phẩm.
            </p>
            
            {/* Contact Details */}
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white shrink-0 mt-1" />
                <span>285 Cách Mạng Tháng Tám, Quận 10, Thành phố Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <a href="tel:0909000000" className="hover:text-white transition-colors">0909.000.000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <a href="mailto:support@novynwear.vn" className="hover:text-white transition-colors">support@novynwear.vn</a>
              </li>
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Mua Sắm</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/products?category=Tops" className="hover:text-white transition-colors">Áo (Tops)</Link>
              </li>
              <li>
                <Link href="/products?category=Bottoms" className="hover:text-white transition-colors">Quần (Bottoms)</Link>
              </li>
              <li>
                <Link href="/products?category=Dresses" className="hover:text-white transition-colors">Đầm (Dresses)</Link>
              </li>
              <li>
                <Link href="/products?category=Outerwear" className="hover:text-white transition-colors">Áo khoác (Outerwear)</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Liên hệ</Link>
              </li>
              <li>
                <span onClick={() => setPolicyModal('delivery')} className="cursor-pointer hover:text-white transition-colors">Chính sách giao hàng</span>
              </li>
              <li>
                <span onClick={() => setPolicyModal('return')} className="cursor-pointer hover:text-white transition-colors">Chính sách đổi trả</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Social media & payments */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Theo dõi chúng tôi</h4>
            <div className="flex gap-4 mb-8">
              <span className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-colors text-white text-xs font-semibold">
                FB
              </span>
              <span className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-colors text-white text-xs font-semibold">
                IG
              </span>
              <span className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 flex items-center justify-center cursor-pointer transition-colors text-white text-xs font-semibold">
                TT
              </span>
            </div>

            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Phương thức thanh toán</h4>
            <div className="flex flex-wrap gap-2">
              <span className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-850 text-[10px] font-medium tracking-wide text-white uppercase">
                COD
              </span>
              <span className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-850 text-[10px] font-medium tracking-wide text-white uppercase">
                Chuyển Khoản
              </span>
              <span className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-850 text-[10px] font-medium tracking-wide text-white uppercase">
                Visa / Master
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-neutral-900 pt-8 mt-16 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} Novyn Wear. Tất cả quyền được bảo lưu. Dự án Demo E-commerce.</p>
          <div className="flex gap-6">
            <span onClick={() => setPolicyModal('terms')} className="cursor-pointer hover:text-white transition-colors">Điều khoản dịch vụ</span>
            <span onClick={() => setPolicyModal('privacy')} className="cursor-pointer hover:text-white transition-colors">Chính sách bảo mật</span>
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      <AnimatePresence>
        {policyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setPolicyModal(null)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm z-45"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white text-neutral-800 w-full max-w-lg rounded-3xl border border-brand-border z-50 overflow-hidden p-6 max-h-[80vh] flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                    {policyModal === 'delivery' && 'Chính sách giao hàng'}
                    {policyModal === 'return' && 'Chính sách đổi trả'}
                    {policyModal === 'terms' && 'Điều khoản dịch vụ'}
                    {policyModal === 'privacy' && 'Chính sách bảo mật'}
                  </h3>
                  <button onClick={() => setPolicyModal(null)} className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-xs sm:text-sm text-neutral-600 leading-relaxed overflow-y-auto max-h-[50vh] pr-2 space-y-4 font-sans">
                  {policyModal === 'delivery' && (
                    <>
                      <p>• <strong>Miễn phí vận chuyển:</strong> Áp dụng cho mọi đơn hàng có giá trị thanh toán từ 500.000 ₫ trở lên toàn quốc.</p>
                      <p>• <strong>Phí vận chuyển tiêu chuẩn:</strong> Đối với đơn hàng dưới 500.000 ₫, phí ship đồng giá là 30.000 ₫.</p>
                      <p>• <strong>Thời gian giao hàng:</strong> Giao nhanh nội thành HN & TP.HCM từ 1 - 2 ngày. Các tỉnh thành khác từ 2 - 4 ngày làm việc.</p>
                      <p>• <strong>Chính sách đồng kiểm:</strong> Quý khách được quyền mở hộp kiểm tra ngoại quan sản phẩm cùng nhân viên giao hàng trước khi nhận.</p>
                    </>
                  )}
                  {policyModal === 'return' && (
                    <>
                      <p>• <strong>Thời gian hỗ trợ:</strong> Đổi size hoặc đổi mẫu trong vòng 7 ngày kể từ khi quý khách nhận được đơn hàng.</p>
                      <p>• <strong>Điều kiện sản phẩm:</strong> Sản phẩm gửi đổi cần giữ nguyên vẹn tem tag nhãn mác thương hiệu, chưa qua sử dụng, giặt là hay sửa chữa.</p>
                      <p>• <strong>Quy trình thực hiện:</strong> Quý khách mang sản phẩm qua trực tiếp showroom hoặc liên hệ Hotline 1900 8899 để bưu tá qua thu hồi đổi hàng tận nhà.</p>
                    </>
                  )}
                  {policyModal === 'terms' && (
                    <>
                      <p>Chào mừng bạn đến với <strong>NOVYN.WEAR</strong>. Khi sử dụng dịch vụ trên website của chúng tôi, bạn đồng ý tuân thủ các quy định và hướng dẫn mua hàng, thanh toán trực tuyến và đổi trả hợp lệ.</p>
                      <p>Mọi nội dung, hình ảnh, thiết kế lookbook và nhãn hiệu trên trang web này đều thuộc sở hữu trí tuệ độc quyền của NOVYN.WEAR. Nghiêm cấm mọi hành vi sao chép phi thương mại hoặc thương mại mà không có sự đồng ý bằng văn bản.</p>
                    </>
                  )}
                  {policyModal === 'privacy' && (
                    <>
                      <p>• <strong>Bảo mật thông tin:</strong> NOVYN.WEAR cam kết tuyệt đối bảo vệ thông tin cá nhân khách hàng (họ tên, sđt, địa chỉ, email) theo tiêu chuẩn bảo mật dữ liệu thương mại điện tử.</p>
                      <p>• <strong>Mục đích sử dụng:</strong> Chúng tôi chỉ thu thập thông tin để phục vụ cho việc xác nhận giao dịch mua hàng, giao hàng bưu tá và gửi thông báo tin tức ưu đãi nếu được sự đồng ý của khách hàng.</p>
                    </>
                  )}
                </div>
              </div>
              
              <button onClick={() => setPolicyModal(null)} className="w-full mt-6 py-3 bg-neutral-950 hover:bg-neutral-850 text-white text-xs font-bold uppercase tracking-wider text-center cursor-pointer">
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};
