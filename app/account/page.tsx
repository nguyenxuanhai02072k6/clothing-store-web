'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../lib/utils';
import { getCustomerTier, TIER_BENEFITS, TierBenefit } from '../../types';
import {
  Heart,
  LogOut,
  UserCheck,
  FileText,
  TrendingUp,
  User as UserIcon,
  CheckCircle2,
  Lock,
  Mail,
  Phone as PhoneIcon,
  User as NameIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccountPage() {
  const {
    currentUser,
    login,
    register,
    loginWithSocial,
    logout,
    quickLogin,
    addCustomerSpending
  } = useAuth();

  const { showToast } = useToast();
  const { wishlist, addDynamicPromoCode } = useCart();
  const router = useRouter();

  // Loyalty Points State
  const [redeemedPoints, setRedeemedPoints] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const redeemed = localStorage.getItem('novyn_redeemed_points');
      if (redeemed) {
        setRedeemedPoints(parseInt(redeemed));
      }
    }
  }, []);

  const handleRedeemVoucher = (cost: number, value: number, code: string) => {
    const totalSpent = currentUser?.totalSpent || 0;
    const accruedPoints = Math.floor(totalSpent / 10000);
    const balance = accruedPoints - redeemedPoints;

    if (balance < cost) {
      showToast('Số điểm tích lũy của bạn không đủ để đổi voucher này!', 'error');
      return;
    }

    const newRedeemed = redeemedPoints + cost;
    setRedeemedPoints(newRedeemed);
    localStorage.setItem('novyn_redeemed_points', String(newRedeemed));

    addDynamicPromoCode(code, 'fixed', value, `Voucher Loyalty VIP đổi từ điểm thưởng - Giảm ${formatPrice(value)}`);
    showToast(`Đổi điểm thành công! Đã tạo mã ${code} giảm ${formatPrice(value)} vào giỏ hàng.`, 'success');
  };

  // Redirect internal staff to /internal web
  useEffect(() => {
    if (currentUser && currentUser.role !== 'customer') {
      router.push('/internal');
    }
  }, [currentUser, router]);

  // Navigation / Tabs inside Dashboard
  const [activeTab, setActiveTab] = useState('profile');

  // Login / Register Form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Handle forms
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password && phone) {
      const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
      if (!phoneRegex.test(phone)) {
        showToast('Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 số (bắt đầu bằng 03, 05, 07, 08, 09).', 'error');
        return;
      }
      register(name, email, password, 'customer', undefined, phone);
    } else {
      showToast('Vui lòng nhập đầy đủ thông tin đăng ký!', 'error');
    }
  };

  // Quick Switch accounts helper
  const demoAccounts = [
    { name: 'Giám đốc Bảo', email: 'director@novynwear.com', role: 'director', desc: 'Chủ tổng' },
    { name: 'Kế toán Thảo', email: 'accountant@novynwear.com', role: 'accountant', desc: 'Kế toán trưởng' },
    { name: 'CSKH Mai An', email: 'cskh@novynwear.com', role: 'cskh', desc: 'CSKH Trưởng' },
    { name: 'CSKH Thùy Dương', email: 'duong.cskh@novynwear.com', role: 'cskh', desc: 'CSKH Viên' },
    { name: 'QL Q.1 Hoàng', email: 'manager.q1@novynwear.com', role: 'manager', desc: 'Quản lý Q.1' },
    { name: 'QL Thảo Điền Trang', email: 'manager.td@novynwear.com', role: 'manager', desc: 'Quản lý T.Đ' },
    { name: 'NV Q.1 Đức', email: 'employee.q1@novynwear.com', role: 'employee', desc: 'Nhân viên Q.1' },
    { name: 'NV Q.1 Tâm', email: 'tam.employee.q1@novynwear.com', role: 'employee', desc: 'Nhân viên Q.1' },
    { name: 'NV Thảo Điền Nam', email: 'nam.employee.td@novynwear.com', role: 'employee', desc: 'Nhân viên T.Đ' },
    { name: 'Khách hàng Vy', email: 'customer@gmail.com', role: 'customer', desc: 'Khách hàng' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* SECTION 1: DEV QUICK SWITCHER BANNER */}
      <div className="bg-neutral-50 border border-brand-border rounded-2xl p-5 mb-10 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-muted" />
              Chế độ DEMO - Chuyển đổi tài khoản nhanh
            </h4>
            <p className="text-[11px] text-brand-muted font-light leading-relaxed">
              Nhấp chuột chọn nhanh vai trò để kiểm duyệt các chức năng phân quyền lập tức!
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => {
                  quickLogin(acc.email);
                  setActiveTab('profile');
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all active:scale-95 cursor-pointer flex flex-col items-start ${
                  currentUser?.email === acc.email
                    ? 'bg-brand-text text-white border-brand-text shadow-sm'
                    : 'bg-white text-brand-text border-brand-border hover:bg-neutral-50'
                }`}
              >
                <span>{acc.name}</span>
                <span className={`text-[8px] font-normal mt-0.5 ${currentUser?.email === acc.email ? 'text-neutral-400' : 'text-brand-muted'}`}>
                  {acc.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: AUTHENTICATION (IF NOT LOGGED IN) */}
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="auth-forms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto"
          >
            {/* Elegant Auth Card */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden p-6 sm:p-8">
              
              {/* Form header selector */}
              <div className="flex border-b border-brand-border pb-5 mb-6">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 text-center pb-2.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
                    authMode === 'login'
                      ? 'border-brand-text text-brand-text'
                      : 'border-transparent text-brand-muted hover:text-brand-text'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 text-center pb-2.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
                    authMode === 'register'
                      ? 'border-brand-text text-brand-text'
                      : 'border-transparent text-brand-muted hover:text-brand-text'
                  }`}
                >
                  Đăng ký
                </button>
              </div>

              {/* SOCIAL SIGN IN MOCK */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => loginWithSocial('google')}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-brand-border bg-white hover:bg-neutral-50 transition-all text-xs font-bold text-brand-text active:scale-95 cursor-pointer uppercase tracking-widest text-[9px]"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.54 0-6.423-2.883-6.423-6.423S10.45 5.67 13.99 5.67c1.782 0 3.32.73 4.417 1.905l3.226-3.227C19.68 2.415 16.99 1.1 13.99 1.1 7.975 1.1 3.1 5.975 3.1 12s4.875 10.9 10.89 10.9c5.626 0 10.315-4.074 10.315-10.9 0-.616-.055-1.2-.156-1.715H12.24z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => loginWithSocial('facebook')}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-brand-border bg-white hover:bg-neutral-50 transition-all text-xs font-bold text-brand-text active:scale-95 cursor-pointer uppercase tracking-widest text-[9px]"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-brand-border w-full absolute" />
                <span className="bg-white px-3 text-[9px] text-brand-muted font-bold uppercase tracking-widest relative">
                  Hoặc bằng email
                </span>
              </div>

              {/* RENDER LOGIN / REGISTER FORMS */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1.5">Email của bạn</label>
                    <input
                      type="email"
                      required
                      placeholder="customer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs font-medium text-brand-text bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1.5">Mật khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs font-medium text-brand-text bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-brand-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm active:scale-95 cursor-pointer mt-6"
                  >
                    Đăng Nhập
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1.5">Họ và tên</label>
                    <input
                      type="text"
                      required
                      placeholder="Lâm Khánh Vy"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs font-medium text-brand-text bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1.5">Số điện thoại</label>
                    <input
                      type="tel"
                      required
                      placeholder="0901234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs font-medium text-brand-text bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1.5">Email đăng ký</label>
                    <input
                      type="email"
                      required
                      placeholder="customer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs font-medium text-brand-text bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1.5">Mật khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs font-medium text-brand-text bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-brand-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors shadow-sm active:scale-95 cursor-pointer mt-6"
                  >
                    Tạo tài khoản mới
                  </button>
                </form>
              )}

            </div>
          </motion.div>
        ) : (
          
          // SECTION 3: LOGGED IN CUSTOMER DASHBOARD
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* 3.1 LEFT PROFILE & MENU CARD (Sidebar) */}
            <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl shadow-sm p-6 flex flex-col gap-6">
              
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-border shadow-sm mb-4 shrink-0 bg-brand-bg">
                  <Image
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                    alt={currentUser.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h3 className="text-base font-normal text-brand-text uppercase tracking-wider mb-1">{currentUser.name}</h3>
                <span className="text-[10px] text-brand-muted font-bold tracking-widest uppercase mb-3">{currentUser.email}</span>
                
                <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shadow-sm bg-brand-accent">
                  Khách Hàng
                </span>
              </div>

              {/* Navigation Menu Links */}
              <nav className="flex flex-col gap-1 border-t border-brand-border pt-5">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border-l-2 ${
                    activeTab === 'profile'
                      ? 'bg-neutral-50 text-brand-text shadow-sm border-brand-text'
                      : 'text-brand-muted hover:text-brand-text hover:bg-neutral-50 border-transparent'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  Hồ sơ cá nhân
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border-l-2 ${
                    activeTab === 'wishlist'
                      ? 'bg-neutral-50 text-brand-text shadow-sm border-brand-text'
                      : 'text-brand-muted hover:text-brand-text hover:bg-neutral-50 border-transparent'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-600" />
                  Sản phẩm yêu thích ({wishlist.length})
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border-l-2 ${
                    activeTab === 'orders'
                      ? 'bg-neutral-50 text-brand-text shadow-sm border-brand-text'
                      : 'text-brand-muted hover:text-brand-text hover:bg-neutral-50 border-transparent'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Lịch sử mua hàng
                </button>

                <button
                  onClick={() => setActiveTab('membership')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border-l-2 ${
                    activeTab === 'membership'
                      ? 'bg-neutral-50 text-brand-text shadow-sm border-brand-text'
                      : 'text-brand-muted hover:text-brand-text hover:bg-neutral-50 border-transparent'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-brand-accent" />
                  Thành viên VIP NOVYN
                </button>

                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors text-left cursor-pointer mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </nav>
            </div>

            {/* 3.2 RIGHT MAIN DISPLAY PANEL */}
            <div className="lg:col-span-9 bg-white border border-brand-border rounded-2xl shadow-sm p-6 sm:p-8 min-h-[500px]">
              
              {/* Profile Overview Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-xl font-normal text-brand-text tracking-widest mb-6 uppercase pb-3 border-b border-brand-border">Hồ sơ tài khoản</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-neutral-50 p-5 rounded-xl border border-brand-border">
                      <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block mb-1">Họ và tên</span>
                      <p className="text-sm font-semibold text-brand-text uppercase">{currentUser.name}</p>
                    </div>
                    <div className="bg-neutral-50 p-5 rounded-xl border border-brand-border">
                      <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block mb-1">Email đăng nhập</span>
                      <p className="text-sm font-bold text-brand-text">{currentUser.email}</p>
                    </div>
                    <div className="bg-neutral-50 p-5 rounded-xl border border-brand-border">
                      <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block mb-1">Quyền hạn</span>
                      <p className="text-xs font-bold text-brand-text uppercase tracking-widest mt-1">Khách hàng</p>
                    </div>
                    {currentUser.phone && (
                      <div className="bg-neutral-50 p-5 rounded-xl border border-brand-border">
                        <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block mb-1">Số điện thoại</span>
                        <p className="text-sm font-bold text-brand-text">{currentUser.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 bg-brand-accent text-white p-6 rounded-2xl relative overflow-hidden">
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-2">Thành viên cao cấp NOVYN</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed max-w-md mb-4 font-light">
                      Chào mừng bạn gia nhập câu lạc bộ thành viên NOVYN WEAR. Trải nghiệm không gian thời trang tối giản và các sản phẩm phong cách sống thiết kế hàng đầu.
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center justify-center bg-white text-brand-text text-[9px] font-bold uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-neutral-100 transition-colors shadow-sm"
                    >
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h3 className="text-xl font-normal text-brand-text tracking-widest mb-6 uppercase pb-3 border-b border-brand-border">Danh sách yêu thích ({wishlist.length})</h3>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-brand-border flex flex-col items-center">
                      <Heart className="w-12 h-12 text-brand-border mb-3" />
                      <p className="text-xs text-brand-muted font-bold mb-4">Bạn chưa lưu bất kỳ sản phẩm nào.</p>
                      <Link href="/products" className="bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest px-5 py-3 rounded-xl hover:bg-neutral-800 transition-colors">
                        Khám phá sản phẩm
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map((prod) => (
                        <div key={prod.id} className="flex gap-4 p-4 border border-brand-border rounded-xl items-center bg-neutral-50/30 hover:bg-white transition-all shadow-sm">
                          <div className="relative w-16 aspect-[4/5] rounded-xl bg-brand-bg overflow-hidden border border-brand-border shrink-0">
                            <Image
                              src={prod.images[0]}
                              alt={prod.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-xs font-semibold uppercase text-brand-text">{prod.name}</h4>
                            <span className="text-[8px] uppercase tracking-widest font-bold text-brand-muted block mt-0.5">{prod.category}</span>
                            <span className="text-xs font-bold text-brand-text block mt-1.5">{formatPrice(prod.price)}</span>
                          </div>
                          <Link
                            href={`/products/${prod.slug}`}
                            className="bg-brand-accent text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors"
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Order History Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-xl font-normal text-brand-text tracking-widest mb-6 uppercase pb-3 border-b border-brand-border">Lịch sử mua hàng</h3>
                  
                  <div className="space-y-4">
                    {[
                      { id: 'ORD-58190', date: '28/05/2026', total: 680000, status: 'Đang xử lý', items: 'Áo Sơ Mi Linen Cổ Tàu x 1, Quần Kaki Chino Slim Fit x 1' },
                      { id: 'ORD-41902', date: '15/05/2026', total: 1250000, status: 'Đã giao hàng', items: 'Áo Vest Blazer Linen x 1, Túi Tote Canvas Hữu Cơ x 1' }
                    ].map((ord) => (
                      <div key={ord.id} className="bg-neutral-50/40 hover:bg-white border border-brand-border p-5 rounded-xl transition-all shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-brand-border mb-3 gap-2">
                          <div>
                            <span className="text-[8px] font-bold text-brand-muted block tracking-widest">MÃ ĐƠN HÀNG</span>
                            <h4 className="text-xs font-bold text-brand-text font-mono uppercase">{ord.id}</h4>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[8px] font-bold text-brand-muted block tracking-widest">NGÀY MUA</span>
                            <p className="text-xs text-brand-text font-bold">{ord.date}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[8px] font-bold text-brand-muted block tracking-widest mb-0.5">TRẠNG THÁI</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                              ord.status === 'Đang xử lý' 
                                ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-brand-muted font-light mb-3">Sản phẩm: {ord.items}</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-brand-muted font-bold uppercase tracking-widest text-[9px]">Tổng thanh toán:</span>
                          <span className="text-sm font-bold text-brand-text">{formatPrice(ord.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Premium Customer Membership Panel */}
              {activeTab === 'membership' && (() => {
                const totalSpent = currentUser.totalSpent || 0;
                const currentTier = getCustomerTier(totalSpent);
                const currentBenefit = TIER_BENEFITS[currentTier];

                // Setup tier styling
                let nextTier: TierBenefit | null = null;
                let spendNeeded = 0;
                let progressPercent = 0;

                if (currentTier === 'standard') {
                  nextTier = TIER_BENEFITS.silver;
                  spendNeeded = TIER_BENEFITS.silver.minSpend - totalSpent;
                  progressPercent = (totalSpent / TIER_BENEFITS.silver.minSpend) * 100;
                } else if (currentTier === 'silver') {
                  nextTier = TIER_BENEFITS.gold;
                  spendNeeded = TIER_BENEFITS.gold.minSpend - totalSpent;
                  const currentTierRange = TIER_BENEFITS.gold.minSpend - TIER_BENEFITS.silver.minSpend;
                  const currentTierProgress = totalSpent - TIER_BENEFITS.silver.minSpend;
                  progressPercent = (currentTierProgress / currentTierRange) * 100;
                } else if (currentTier === 'gold') {
                  nextTier = TIER_BENEFITS.platinum;
                  spendNeeded = TIER_BENEFITS.platinum.minSpend - totalSpent;
                  const currentTierRange = TIER_BENEFITS.platinum.minSpend - TIER_BENEFITS.gold.minSpend;
                  const currentTierProgress = totalSpent - TIER_BENEFITS.gold.minSpend;
                  progressPercent = (currentTierProgress / currentTierRange) * 100;
                } else if (currentTier === 'platinum') {
                  nextTier = TIER_BENEFITS.diamond;
                  spendNeeded = TIER_BENEFITS.diamond.minSpend - totalSpent;
                  const currentTierRange = TIER_BENEFITS.diamond.minSpend - TIER_BENEFITS.platinum.minSpend;
                  const currentTierProgress = totalSpent - TIER_BENEFITS.platinum.minSpend;
                  progressPercent = (currentTierProgress / currentTierRange) * 100;
                } else {
                  progressPercent = 100;
                }
                
                progressPercent = Math.max(0, Math.min(100, progressPercent));

                return (
                  <div>
                    <h3 className="text-xl font-normal text-brand-text tracking-widest mb-2 uppercase pb-3 border-b border-brand-border">Thành viên VIP NOVYN Club</h3>
                    <p className="text-xs text-brand-muted mb-8 font-light">Trở thành khách hàng thân thiết để tận hưởng các chiết khấu trực tiếp và đặc quyền VIP cao cấp.</p>

                    {/* VIP CARD */}
                    <div className="p-8 rounded-2xl bg-neutral-900 text-white border border-brand-border shadow-sm relative overflow-hidden mb-8 transition-transform">
                      <div className="flex justify-between items-start mb-12">
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.2em] font-normal text-neutral-400 block">NOVYN VIP CLUB</span>
                          <h4 className="text-xl font-normal tracking-widest uppercase mt-1.5">{currentBenefit.name}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold tracking-widest bg-white/10 px-3 py-1.5 rounded-full uppercase text-neutral-300 border border-brand-border/20">
                            Ưu đãi: Giảm {currentBenefit.discountPercent}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider block text-neutral-400 mb-1">MÃ THÀNH VIÊN</span>
                          <span className="text-xs font-mono font-bold select-all">{currentUser.id.toUpperCase()}</span>
                          <span className="text-sm font-normal uppercase tracking-widest block mt-2">{currentUser.name}</span>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <span className="text-[8px] uppercase tracking-wider block text-neutral-400 mb-0.5">TÍCH LŨY CHI TIÊU</span>
                          <span className="text-lg font-normal">{formatPrice(totalSpent)}</span>
                        </div>
                      </div>
                    </div>

                    {/* NOVYN LOYALTY POINTS DASHBOARD & GIFT SHOP */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {/* Points Card */}
                      <div className="bg-neutral-50 p-6 rounded-2xl border border-brand-border flex flex-col justify-between relative overflow-hidden md:col-span-1 shadow-sm">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">Điểm thưởng NOVYN</span>
                          <h5 className="text-3xl font-normal text-brand-text">
                            {Math.max(0, Math.floor(totalSpent / 10000) - redeemedPoints).toLocaleString()}
                          </h5>
                          <span className="text-[10px] text-brand-muted font-light block mt-1">
                            Tích lũy từ chi tiêu (10.000đ = 1 điểm)
                          </span>
                        </div>
                        <div className="mt-6 pt-4 border-t border-brand-border flex items-center justify-between text-[9px] text-brand-muted font-bold tracking-wider uppercase">
                          <span>Đã đổi: {redeemedPoints}đ</span>
                          <span>Tích lũy: {Math.floor(totalSpent / 10000)}đ</span>
                        </div>
                      </div>

                      {/* Gift redemption list */}
                      <div className="bg-neutral-50/40 p-6 rounded-2xl border border-brand-border md:col-span-2 text-left shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">Đổi điểm lấy Voucher VIP</span>
                          <p className="text-xs text-brand-muted mb-4 font-light">Sử dụng điểm tích lũy của bạn để đổi các mã giảm giá mua hàng ngay:</p>
                        </div>
                        
                        <div className="space-y-2.5">
                          {[
                            { cost: 500, value: 50000, code: 'NOVYNVIP50' },
                            { cost: 1000, value: 100000, code: 'NOVYNVIP100' },
                            { cost: 2000, value: 200000, code: 'NOVYNVIP200' },
                          ].map((item) => {
                            const balance = Math.floor(totalSpent / 10000) - redeemedPoints;
                            const canRedeem = balance >= item.cost;
                            return (
                              <div key={item.code} className="flex items-center justify-between p-3 bg-white rounded-xl border border-brand-border shadow-inner">
                                <div className="text-left">
                                  <span className="text-xs font-bold text-brand-text uppercase">Voucher Giảm {formatPrice(item.value)}</span>
                                  <span className="text-[9px] font-bold text-brand-accent tracking-widest block uppercase mt-0.5">{item.cost} Điểm thưởng</span>
                                </div>
                                <button
                                  onClick={() => handleRedeemVoucher(item.cost, item.value, item.code)}
                                  disabled={!canRedeem}
                                  className={`px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 cursor-pointer border ${
                                    canRedeem
                                      ? 'bg-brand-accent text-white border-brand-accent hover:bg-neutral-800 shadow-sm'
                                      : 'bg-white text-brand-muted border-brand-border cursor-not-allowed'
                                  }`}
                                >
                                  Đổi mã
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* PROGRESS TRACKER */}
                    <div className="bg-neutral-50 p-6 rounded-2xl border border-brand-border mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">
                          {nextTier ? `Tiến trình nâng hạng tiếp theo` : `Hạng thành viên tối thượng`}
                        </span>
                        {nextTier && (
                          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                            Còn thiếu: <strong className="text-brand-text">{formatPrice(spendNeeded)}</strong>
                          </span>
                        )}
                      </div>

                      <div className="w-full h-2 bg-brand-border rounded-full overflow-hidden mb-3 relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full bg-brand-accent rounded-full"
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                        <span>Hạng hiện tại: {currentBenefit.name}</span>
                        {nextTier ? (
                          <span>Mục tiêu: {nextTier.name} ({formatPrice(nextTier.minSpend)})</span>
                        ) : (
                          <span className="text-emerald-800 font-extrabold">★ Đạt hạng Kim Cương tối cao!</span>
                        )}
                      </div>
                    </div>

                    {/* CURRENT TIER BENEFITS GRID */}
                    <h4 className="text-[10px] font-bold text-brand-text tracking-widest uppercase mb-4">Các đặc quyền hiện tại của bạn</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {currentBenefit.benefits.map((b, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-neutral-50/30 border border-brand-border rounded-xl items-start">
                          <div className="p-1 rounded-md bg-brand-accent text-white shrink-0 shadow-sm mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs text-brand-text leading-relaxed font-light">{b}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ALL TIERS COMPARISON */}
                    <h4 className="text-[10px] font-bold text-brand-text tracking-widest uppercase mb-4">Bảng so sánh tất cả các phân hạng</h4>
                    <div className="overflow-x-auto rounded-2xl border border-brand-border mb-8">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-brand-border text-brand-muted font-bold uppercase tracking-widest text-[9px]">
                            <th className="p-4">Hạng VIP</th>
                            <th className="p-4">Mức tích lũy</th>
                            <th className="p-4 text-center">Chiết khấu VIP</th>
                            <th className="p-4">Đặc quyền nổi bật</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border text-brand-text font-light">
                          {Object.values(TIER_BENEFITS).map((t) => {
                            const isCurrent = t.tier === currentTier;
                            return (
                              <tr
                                key={t.tier}
                                className={`transition-colors ${
                                  isCurrent ? 'bg-neutral-50/40 font-semibold border-l-2 border-brand-accent' : 'hover:bg-neutral-50/10'
                                }`}
                              >
                                <td className="p-4">
                                  <span className="font-bold uppercase tracking-wide text-brand-text">{t.name}</span>
                                  {isCurrent && (
                                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-brand-accent text-white shadow-sm">
                                      Hiện tại
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-brand-muted font-bold">{t.minSpend === 0 ? 'Mới đăng ký' : `≥ ${formatPrice(t.minSpend)}`}</td>
                                <td className="p-4 text-center text-brand-text font-bold">{t.discountPercent}%</td>
                                <td className="p-4 text-brand-muted leading-relaxed max-w-xs truncate md:whitespace-normal">
                                  {t.tier === 'standard' ? 'Tích luỹ điểm, quà sinh nhật' :
                                   t.tier === 'silver' ? 'Giảm 5%, Đổi trả trong 7 ngày' :
                                   t.tier === 'gold' ? 'Giảm 10%, Freeship đơn, Đổi trả 15 ngày' :
                                   t.tier === 'platinum' ? 'Giảm 15%, Freeship đơn, Lounge VIP, Đổi trả 30 ngày' :
                                   'Giảm 20%, Freeship đơn, Stylist tại gia, Đổi trả vô thời hạn'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* SPENDING SIMULATOR FOR TESTING */}
                    <div className="p-6 rounded-2xl bg-brand-text text-white border border-brand-border shadow-md relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-neutral-800 rounded-full filter blur-xl opacity-40 pointer-events-none" />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-brand-muted" />
                            Giả lập chi tiêu (Dành cho nhà phát triển)
                          </h4>
                          <p className="text-[11px] text-neutral-300 font-light leading-relaxed">
                            Nhấn nút để cộng thêm tiền chi tiêu giả lập nhằm kiểm thử quá trình thăng cấp VIP & tích điểm tự động của tài khoản này!
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <button
                            onClick={() => {
                              addCustomerSpending(currentUser.id, 1000000);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-white text-brand-text text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all active:scale-95 cursor-pointer shadow-sm"
                          >
                            + Mua 1 Triệu
                          </button>
                          <button
                            onClick={() => {
                              addCustomerSpending(currentUser.id, 5000000);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-white text-brand-text text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all active:scale-95 cursor-pointer shadow-sm"
                          >
                            + Mua 5 Triệu
                          </button>
                          <button
                            onClick={() => {
                              addCustomerSpending(currentUser.id, 15000000);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-white text-brand-text text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all active:scale-95 cursor-pointer shadow-sm"
                          >
                            + Mua 15 Triệu
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
