'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { showToast } = useToast();
  const pathname = usePathname();

  if (pathname?.startsWith('/internal')) {
    return null;
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
            <div className="lg:col-span-6 w-full">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full max-w-md lg:ml-auto">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribed}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neutral-500 w-full disabled:opacity-50 transition-all placeholder:text-neutral-500 min-h-[44px]"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className={`px-5 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-all min-h-[44px] cursor-pointer ${
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 border-b border-neutral-900 md:border-b-0 pb-8 md:pb-0">
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
                <span>152 Đồng Khởi, Quận 1, Thành phố Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <a href="tel:19008899" className="hover:text-white transition-colors">1900 8899</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <a href="mailto:support@novynwear.com" className="hover:text-white transition-colors">support@novynwear.com</a>
              </li>
            </ul>
          </div>

          {/* Column 2: Quick Links (Accordion on Mobile) */}
          <div className="lg:col-span-2 lg:col-start-6 border-b border-neutral-900 md:border-b-0 pb-6 md:pb-0">
            <button
              onClick={() => toggleSection('shopping')}
              className="w-full md:pointer-events-none flex items-center justify-between text-sm font-bold text-white uppercase tracking-wider mb-0 md:mb-6 py-2 md:py-0 cursor-pointer"
            >
              <span>Mua Sắm</span>
              <span className="md:hidden text-lg font-normal">
                {openSections['shopping'] ? '−' : '+'}
              </span>
            </button>
            <ul className={`space-y-4 text-sm mt-4 md:mt-0 ${openSections['shopping'] ? 'block' : 'hidden md:block'}`}>
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

          {/* Column 3: Customer Support (Accordion on Mobile) */}
          <div className="lg:col-span-2 border-b border-neutral-900 md:border-b-0 pb-6 md:pb-0">
            <button
              onClick={() => toggleSection('support')}
              className="w-full md:pointer-events-none flex items-center justify-between text-sm font-bold text-white uppercase tracking-wider mb-0 md:mb-6 py-2 md:py-0 cursor-pointer"
            >
              <span>Hỗ trợ</span>
              <span className="md:hidden text-lg font-normal">
                {openSections['support'] ? '−' : '+'}
              </span>
            </button>
            <ul className={`space-y-4 text-sm mt-4 md:mt-0 ${openSections['support'] ? 'block' : 'hidden md:block'}`}>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Liên hệ</Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">Chính sách giao hàng</Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">Chính sách đổi trả</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social media & payments (Accordion on Mobile) */}
          <div className="lg:col-span-3 border-b border-neutral-900 md:border-b-0 pb-6 md:pb-0">
            <button
              onClick={() => toggleSection('social')}
              className="w-full md:pointer-events-none flex items-center justify-between text-sm font-bold text-white uppercase tracking-wider mb-0 md:mb-6 py-2 md:py-0 cursor-pointer"
            >
              <span>Theo dõi chúng tôi</span>
              <span className="md:hidden text-lg font-normal">
                {openSections['social'] ? '−' : '+'}
              </span>
            </button>
            <div className={`mt-4 md:mt-0 space-y-6 ${openSections['social'] ? 'block' : 'hidden md:block'}`}>
              <div className="flex gap-4">
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
                <span className="bg-neutral-950/80 px-3 py-1.5 rounded-lg border border-neutral-850 text-[10px] font-medium tracking-wide text-white uppercase">
                  Visa / Master
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-neutral-900 pt-8 mt-16 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left">
          <p>© {currentYear} Novyn Wear. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
