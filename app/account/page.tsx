'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../lib/utils';
import { authService } from '../../lib/services/authService';
import { getCustomerTier, TIER_BENEFITS, TierBenefit } from '../../types';
import {
  Heart,
  LogOut,
  UserCheck,
  FileText,
  User as UserIcon,
  CheckCircle2,
  Lock,
  Mail,
  Phone as PhoneIcon,
  User as NameIcon,
  Sparkles,
  Key,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_ACCOUNTS = [
  {
    role: 'director',
    title: 'Giám Đốc (Director)',
    badge: 'Toàn Quyền ERP',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    name: 'Trần Quốc Bảo',
    email: 'director@novynwear.com',
    desc: 'Báo cáo doanh số toàn chuỗi, duyệt tăng lương, duyệt giá sản phẩm & bảng biểu tài chính',
    icon: '👑'
  },
  {
    role: 'manager',
    title: 'Quản Lý Cửa Hàng (Store Manager)',
    badge: 'Chi Nhánh Q1',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    name: 'Nguyễn Huy Hoàng',
    email: 'manager.q1@novynwear.com',
    desc: 'Vận hành chi nhánh, duyệt ca kíp, nhập hàng và chấm công nhân sự',
    icon: '🏢'
  },
  {
    role: 'cashier',
    title: 'Thu Ngân POS (Cashier)',
    badge: 'POS Tại Quầy',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    name: 'Nguyễn Thuỳ Lan',
    email: 'cashier.q1@novynwear.com',
    desc: 'Quẹt mã vạch POS, tích điểm thành viên VIP, khóa két & đối soát tiền cuối ngày',
    icon: '💳'
  },
  {
    role: 'accountant',
    title: 'Kế Toán Trưởng (Accountant)',
    badge: 'Tài Chính & Thuế',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    name: 'Phạm Thu Thảo',
    email: 'accountant@novynwear.com',
    desc: 'Quản lý thu chi, bảng chi lương, tính thuế TNDN & quyết toán sổ sách kỳ',
    icon: '📊'
  },
  {
    role: 'cskh',
    title: 'CSKH (Support Specialist)',
    badge: 'Live Chat & Khiếu Nại',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    name: 'Mai An CSKH',
    email: 'cskh@novynwear.com',
    desc: 'Tiếp nhận Live Chat với khách online, xử lý phiếu đổi size, bảo hành sản phẩm',
    icon: '💬'
  },
  {
    role: 'stocker',
    title: 'Thủ Kho (Warehouse Stocker)',
    badge: 'Kho Vận & Hàng Lỗi',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    name: 'Trần Minh Hải',
    email: 'stocker.q1@novynwear.com',
    desc: 'Kiểm kê tồn kho, lập phiếu điều chuyển kho Q1 - Thảo Điền, lập biên bản hàng lỗi',
    icon: '📦'
  },
  {
    role: 'customer',
    title: 'Khách Hàng VIP (Customer)',
    badge: 'Gold Tier 5%',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    name: 'Lâm Khánh Vy',
    email: 'customer@novynwear.com',
    desc: 'Mua sắm trực tuyến, tích lũy điểm VIP, đổi voucher giảm giá độc quyền',
    icon: '🛍️'
  }
];

export default function AccountPage() {
  const {
    currentUser,
    login,
    register,
    changePassword,
    logout,
    refreshUser,
    allOrders
  } = useAuth();

  const { showToast } = useToast();
  const { wishlist, addDynamicPromoCode } = useCart();
  const router = useRouter();

  // Handle OAuth callback status from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get('oauth');
    const oauthError = params.get('oauth_error');

    if (oauthStatus === 'success') {
      refreshUser();
      showToast('Đăng nhập thành công! Chào mừng bạn quay lại.', 'success');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (oauthError) {
      showToast(decodeURIComponent(oauthError) || 'Đăng nhập mạng xã hội thất bại!', 'error');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshUser, showToast]);

  // Loyalty Points State (Loaded securely from Server DB AuditLog & User Spending)
  const [redeemedPoints, setRedeemedPoints] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (currentUser) {
      authService.getLoyaltyPoints().then((res) => {
        if (isMounted && res.success) {
          setRedeemedPoints(res.redeemedPoints);
        }
      });
    } else {
      setRedeemedPoints(0);
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const handleRedeemVoucher = async (cost: number, value: number, code: string) => {
    try {
      const res = await authService.redeemLoyaltyVoucher(code);
      if (!res.success) {
        showToast(res.message || 'Số điểm tích lũy của bạn không đủ để đổi voucher này!', 'error');
        return;
      }

      setRedeemedPoints(res.redeemedPoints ?? (redeemedPoints + cost));
      addDynamicPromoCode(code, 'fixed', value, `Voucher Loyalty VIP đổi từ điểm thưởng - Giảm ${formatPrice(value)}`);
      showToast(`Đổi điểm thành công! Đã tạo mã ${code} giảm ${formatPrice(value)} vào giỏ hàng.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi đổi điểm thưởng!', 'error');
    }
  };

  // Redirect internal staff to /internal web
  useEffect(() => {
    if (currentUser && currentUser.role !== 'customer') {
      router.push('/internal');
    }
  }, [currentUser, router]);

  // Navigation / Tabs inside Dashboard
  const [activeTab, setActiveTab] = useState('profile');

  // Change Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Address Book states
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDetail, setAddrDetail] = useState('');
  const [addrCity, setAddrCity] = useState('TP. Hồ Chí Minh');
  const [addrDefault, setAddrDefault] = useState(false);

  // Order Tracking states
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Filter orders for the logged-in customer
  const customerOrders = useMemo(() => {
    if (!currentUser || !allOrders) return [];
    return allOrders.filter((ord: any) => {
      const emailMatch = ord.customerInfo.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
      const phoneMatch = currentUser.phone && ord.customerInfo.phone.trim() === currentUser.phone.trim();
      return emailMatch || phoneMatch;
    });
  }, [allOrders, currentUser]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getTimelineSteps = (order: any) => {
    if (!order) return [];
    const status = order.status;
    const time = order.createdAt;

    if (status === 'cancelled') {
      return [
        { title: 'Đặt hàng thành công', desc: 'Đơn hàng đã được ghi nhận trên hệ thống Novyn Wear.', time, status: 'completed' },
        { title: 'Yêu cầu hủy đơn hàng', desc: 'Khách hàng hoặc quản trị viên đã gửi yêu cầu hủy đơn.', time: 'Vừa xong', status: 'completed' },
        { title: 'Hủy đơn hoàn tất', desc: 'Hệ thống đã hoàn trả tồn kho sản phẩm và giao dịch bị hủy.', time: 'Vừa xong', status: 'active' }
      ];
    }

    return [
      { title: 'Đặt hàng thành công', desc: 'Đơn hàng đã được ghi nhận trên hệ thống Novyn Wear.', time, status: 'completed' },
      { title: 'Xác nhận & Chuẩn bị hàng', desc: 'Nhân viên cửa hàng đã xác nhận và đang đóng gói sản phẩm.', time: status !== 'pending' ? 'Đã xác nhận' : 'Đang xử lý', status: status !== 'pending' ? 'completed' : 'active' },
      { title: 'Đã giao cho GHN', desc: 'Đơn hàng đã được bàn giao cho đối tác vận chuyển Giao Hàng Nhanh.', time: status !== 'pending' ? 'Đã bàn giao' : '--/--/----', status: status !== 'pending' ? 'completed' : 'pending' },
      { title: 'Đang vận chuyển liên tỉnh', desc: 'Hàng đang trung chuyển tại bưu cục TP. Hồ Chí Minh.', time: status === 'completed' ? 'Đã trung chuyển' : status === 'shipping' ? 'Đang vận chuyển' : '--/--/----', status: status === 'completed' ? 'completed' : status === 'shipping' ? 'active' : 'pending' },
      { title: 'Shipper đang giao hàng', desc: 'Đơn hàng đang được shipper đi giao tới địa chỉ của bạn.', time: status === 'completed' ? 'Đã giao' : status === 'shipping' ? 'Đang giao' : '--/--/----', status: status === 'completed' ? 'completed' : status === 'shipping' ? 'active' : 'pending' },
      { title: 'Giao hàng thành công', desc: 'Đã nhận hàng và ký tên xác nhận.', time: status === 'completed' ? 'Hoàn tất' : '--/--/----', status: status === 'completed' ? 'completed' : 'pending' },
    ];
  };

  // Load addresses effect
  useEffect(() => {
    if (currentUser) {
      try {
        const stored = localStorage.getItem(`novyn_addresses_${currentUser.id}`);
        if (stored) {
          setAddresses(JSON.parse(stored));
        } else {
          setAddresses([]);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser]);

  // Save address action
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrPhone.trim() || !addrDetail.trim()) {
      showToast('Vui lòng điền đầy đủ thông tin địa chỉ.', 'error');
      return;
    }

    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(addrPhone)) {
      showToast('Số điện thoại nhận hàng không hợp lệ (10 số, bắt đầu bằng 03, 05, 07, 08, 09).', 'error');
      return;
    }

    let updated = [...addresses];
    
    if (addrDefault) {
      updated = updated.map(a => ({ ...a, isDefault: false }));
    }

    if (editingAddress) {
      updated = updated.map(a => a.id === editingAddress.id ? {
        ...a,
        fullName: addrName,
        phone: addrPhone,
        detailAddress: addrDetail,
        city: addrCity,
        isDefault: addrDefault
      } : a);
    } else {
      const newAddr = {
        id: `addr-${Math.floor(Math.random() * 100000)}`,
        fullName: addrName,
        phone: addrPhone,
        detailAddress: addrDetail,
        city: addrCity,
        isDefault: updated.length === 0 ? true : addrDefault
      };
      updated.push(newAddr);
    }

    setAddresses(updated);
    try {
      if (currentUser) {
        localStorage.setItem(`novyn_addresses_${currentUser.id}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }

    setAddrName('');
    setAddrPhone('');
    setAddrDetail('');
    setAddrCity('TP. Hồ Chí Minh');
    setAddrDefault(false);
    setEditingAddress(null);
    setShowAddressForm(false);
    showToast('Đã lưu địa chỉ nhận hàng thành công!', 'success');
  };

  const handleEditAddressClick = (addr: any) => {
    setEditingAddress(addr);
    setAddrName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrDetail(addr.detailAddress);
    setAddrCity(addr.city);
    setAddrDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    const target = addresses.find(a => a.id === id);
    let updated = addresses.filter(a => a.id !== id);
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    try {
      if (currentUser) {
        localStorage.setItem(`novyn_addresses_${currentUser.id}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    showToast('Đã xóa địa chỉ nhận hàng.', 'info');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    try {
      if (currentUser) {
        localStorage.setItem(`novyn_addresses_${currentUser.id}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    showToast('Đã thiết lập địa chỉ mặc định mới.', 'success');
  };

  // Change password action
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Vui lòng điền đầy đủ các trường mật khẩu.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Mật khẩu mới phải dài từ 8 ký tự trở lên.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không khớp.', 'error');
      return;
    }

    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    }
  };

  // Login / Register Form states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Demo Accounts states
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleDemoLogin = async (demoEmail: string) => {
    setIsDemoLoggingIn(demoEmail);
    setEmail(demoEmail);
    setPassword('NovynDev!2026');
    showToast(`Đang đăng nhập demo: ${demoEmail}...`, 'info');
    try {
      const success = await login(demoEmail, 'NovynDev!2026');
      if (success) {
        showToast('Đăng nhập tài khoản demo thành công!', 'success');
        if (demoEmail !== 'customer@novynwear.com') {
          router.push('/internal');
        }
      }
    } finally {
      setIsDemoLoggingIn(null);
    }
  };

  const handleCopyPassword = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText('NovynDev!2026');
      setCopiedPassword(true);
      showToast('Đã sao chép mật khẩu: NovynDev!2026', 'success');
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  // Handle forms
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const success = await login(email, password);
      if (success && email !== 'customer@novynwear.com') {
        router.push('/internal');
      }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

      {/* SECTION 1: AUTHENTICATION (IF NOT LOGGED IN) */}
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="auth-forms"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-lg mx-auto"
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

              {/* RENDER LOGIN / REGISTER FORMS */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1.5">Email của bạn</label>
                    <input
                      type="email"
                      required
                      placeholder="customer@novynwear.com"
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
                      placeholder="customer@novynwear.com"
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

              {/* OR SEPARATOR */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-brand-muted">
                  <span className="bg-white px-3">Hoặc tiếp tục với</span>
                </div>
              </div>

              {/* SOCIAL LOGINS */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/api/auth/google"
                  className="flex items-center justify-center gap-2.5 py-3 px-3 border border-brand-border rounded-xl text-xs font-semibold text-brand-text hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Đăng nhập bằng tài khoản Google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </a>

                <a
                  href="/api/auth/facebook"
                  className="flex items-center justify-center gap-2.5 py-3 px-3 border border-brand-border rounded-xl text-xs font-semibold text-brand-text hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Đăng nhập bằng tài khoản Facebook"
                >
                  <svg className="w-4 h-4 text-[#1877F2] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>

              {/* QUICK DEMO LOGIN PANEL */}
              <div className="mt-6 pt-6 border-t border-brand-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-text">Tài Khoản Demo (1-Click Login)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                    className="text-[10px] font-bold text-brand-muted hover:text-brand-text flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showDemoAccounts ? 'Thu gọn' : 'Xem tất cả (7 vai trò)'}
                    {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password indicator bar */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-brand-border text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                    <span className="text-[11px] text-brand-muted font-medium">Mật khẩu chung:</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-brand-border font-mono text-[11px] font-bold text-brand-text">NovynDev!2026</code>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="text-[10px] font-bold uppercase tracking-wider text-brand-accent hover:text-neutral-900 flex items-center gap-1 cursor-pointer transition-colors"
                    title="Sao chép mật khẩu demo"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPassword ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                {/* Demo Accounts List */}
                {showDemoAccounts && (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        disabled={isDemoLoggingIn !== null}
                        onClick={() => handleDemoLogin(acc.email)}
                        className="w-full text-left p-3 rounded-xl border border-brand-border hover:border-brand-accent/50 bg-white hover:bg-neutral-50/80 transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs active:scale-[0.99] disabled:opacity-50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0 select-none">{acc.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-brand-text truncate group-hover:text-brand-accent transition-colors">
                                {acc.title}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider border shrink-0 ${acc.badgeColor}`}>
                                {acc.badge}
                              </span>
                            </div>
                            <span className="text-[10px] text-brand-muted block truncate">
                              {acc.name} &bull; <span className="font-mono">{acc.email}</span>
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 text-brand-accent text-[11px] font-bold group-hover:translate-x-0.5 transition-transform">
                          {isDemoLoggingIn === acc.email ? (
                            <span className="text-[10px] text-brand-muted animate-pulse">Đang vào...</span>
                          ) : (
                            <>
                              <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Đăng nhập</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <span className="text-[10px] text-brand-muted">
                  Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách của Novyn Wear.
                </span>
              </div>
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
                  onClick={() => {
                    setTrackingOrderId(null);
                    setActiveTab('orders');
                  }}
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
                  onClick={() => {
                    setTrackingOrderId(null);
                    setActiveTab('addresses');
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border-l-2 ${
                    activeTab === 'addresses'
                      ? 'bg-neutral-50 text-brand-text shadow-sm border-brand-text'
                      : 'text-brand-muted hover:text-brand-text hover:bg-neutral-50 border-transparent'
                  }`}
                >
                  <span className="text-xs shrink-0 select-none">📍</span>
                  Sổ địa chỉ giao hàng ({addresses.length})
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

                  {/* Change Password Block */}
                  <div className="mt-8 border border-brand-border rounded-2xl p-6 bg-neutral-50/50 shadow-xs text-left">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="flex justify-between items-center w-full text-left font-bold text-xs uppercase tracking-widest text-brand-text"
                    >
                      <span>🔒 Đổi mật khẩu tài khoản</span>
                      <span>{showChangePassword ? '▲' : '▼'}</span>
                    </button>
                    <AnimatePresence>
                      {showChangePassword && (
                        <motion.form
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          onSubmit={handleChangePasswordSubmit}
                          className="mt-6 space-y-4 overflow-hidden"
                        >
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">Mật khẩu hiện tại</label>
                            <input
                              type="password"
                              required
                              placeholder="Nhập mật khẩu hiện tại"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">Mật khẩu mới</label>
                              <input
                                type="password"
                                required
                                placeholder="Tối thiểu 8 ký tự"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">Xác nhận mật khẩu mới</label>
                              <input
                                type="password"
                                required
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-brand-border focus:outline-none focus:border-brand-accent text-xs bg-white"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="bg-brand-accent hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 mt-2"
                          >
                            Cập nhật mật khẩu
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
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
                  {trackingOrderId ? (
                    <div>
                      {/* Tracking Detail Panel */}
                      <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-6 text-left">
                        <div>
                          <button
                            type="button"
                            onClick={() => setTrackingOrderId(null)}
                            className="text-[9px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            ← Quay lại danh sách
                          </button>
                          <h4 className="text-lg font-bold text-brand-text uppercase tracking-tight mt-1.5 font-mono">
                            Theo dõi vận đơn: {trackingOrderId}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-100 text-brand-text border border-brand-border px-3 py-1.5 rounded-full font-mono shrink-0">
                          Mã vận đơn: GHN-{trackingOrderId.split('-')[1] || '58190'}
                        </span>
                      </div>

                      {/* Timeline steps */}
                      <div className="bg-neutral-50/40 border border-brand-border p-6 rounded-2xl relative overflow-hidden flex flex-col gap-8 max-w-xl mx-auto">
                        {(() => {
                          const matchedOrder = customerOrders.find(o => o.id === trackingOrderId);
                          if (!matchedOrder) {
                            return <p className="text-xs text-brand-muted text-center">Không tìm thấy thông tin đơn hàng này.</p>;
                          }
                          return getTimelineSteps(matchedOrder).map((step, idx, arr) => {
                            const isLast = idx === arr.length - 1;
                            return (
                              <div key={idx} className="flex gap-4 relative text-left">
                                {/* Left line segment connecting nodes */}
                                {!isLast && (
                                  <div className={`absolute left-2.5 top-5 bottom-[-24px] w-[1.5px] ${
                                    step.status === 'completed' ? 'bg-brand-text' : 'bg-neutral-200'
                                  }`} />
                                )}
                                
                                {/* Node dot */}
                                <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center shrink-0 z-10 ${
                                  step.status === 'completed' 
                                    ? 'bg-brand-text border-brand-text text-white'
                                    : step.status === 'active'
                                    ? 'bg-amber-500 border-amber-500 text-white animate-pulse'
                                    : 'bg-white border-neutral-300 text-neutral-400'
                                }`}>
                                  <span className="text-[9px] font-bold">✓</span>
                                </div>

                                {/* Content description */}
                                <div className="text-left py-0.5">
                                  <h5 className={`text-xs font-bold uppercase tracking-wider ${
                                    step.status === 'completed' ? 'text-brand-text' : step.status === 'active' ? 'text-amber-600' : 'text-neutral-400'
                                  }`}>
                                    {step.title}
                                  </h5>
                                  <p className="text-xs text-brand-muted font-light mt-1">{step.desc}</p>
                                  <span className="text-[9px] text-brand-muted block mt-1 font-mono">{step.time}</span>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-normal text-brand-text tracking-widest mb-6 uppercase pb-3 border-b border-brand-border">Lịch sử mua hàng</h3>
                      
                      <div className="space-y-4">
                        {customerOrders.length === 0 ? (
                          <div className="text-center py-12 border border-dashed border-brand-border rounded-xl">
                            <p className="text-xs text-brand-muted font-normal">Bạn chưa có đơn hàng nào.</p>
                          </div>
                        ) : (
                          customerOrders.map((ord: any) => {
                            const itemsSummary = ord.items.map((it: any) => `${it.productName} (Màu: ${it.selectedColor.name} | Size: ${it.selectedSize}) x ${it.quantity}`).join(', ');
                            return (
                              <div key={ord.id} className="bg-neutral-50/40 hover:bg-white border border-brand-border p-5 rounded-xl transition-all shadow-sm text-left">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-brand-border mb-3 gap-2">
                                  <div>
                                    <span className="text-[8px] font-bold text-brand-muted block tracking-widest">MÃ ĐƠN HÀNG</span>
                                    <h4 className="text-xs font-bold text-brand-text font-mono uppercase">{ord.id}</h4>
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <span className="text-[8px] font-bold text-brand-muted block tracking-widest">NGÀY MUA</span>
                                    <p className="text-xs text-brand-text font-bold">{ord.createdAt}</p>
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <span className="text-[8px] font-bold text-brand-muted block tracking-widest mb-0.5">TRẠNG THÁI</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                      ord.status === 'pending' || ord.status === 'shipping'
                                        ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                        : ord.status === 'completed'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                      {getStatusLabel(ord.status)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-xs text-brand-muted font-light mb-3">Sản phẩm: {itemsSummary}</p>
                                <div className="flex justify-between items-center pt-3 border-t border-brand-border">
                                  <button
                                    type="button"
                                    onClick={() => setTrackingOrderId(ord.id)}
                                    className="text-[9px] font-bold text-brand-accent uppercase tracking-widest hover:underline cursor-pointer"
                                  >
                                    📍 Theo dõi vận đơn
                                  </button>
                                  <span className="text-xs font-bold text-brand-text">{formatPrice(ord.total)}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
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

                  </div>
                );
              })()}

              {/* Address Book Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-brand-border mb-6 gap-4 text-left">
                    <div>
                      <h3 className="text-xl font-normal text-brand-text tracking-widest uppercase mb-1">Sổ địa chỉ nhận hàng</h3>
                      <p className="text-xs text-brand-muted font-light">Quản lý các địa chỉ nhận hàng để thanh toán nhanh chóng.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        setAddrName('');
                        setAddrPhone('');
                        setAddrDetail('');
                        setAddrCity('TP. Hồ Chí Minh');
                        setAddrDefault(addresses.length === 0);
                        setShowAddressForm(!showAddressForm);
                      }}
                      className="bg-brand-accent hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      {showAddressForm ? 'Hủy bỏ' : '+ Thêm địa chỉ mới'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAddressForm && (
                      <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleSaveAddress}
                        className="bg-neutral-50 p-5 border border-brand-border rounded-2xl mb-8 flex flex-col gap-4 overflow-hidden text-left"
                      >
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-widest">
                          {editingAddress ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Họ và tên người nhận *</label>
                            <input
                              type="text"
                              required
                              value={addrName}
                              onChange={(e) => setAddrName(e.target.value)}
                              placeholder="Ví dụ: Nguyễn Văn A..."
                              className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Số điện thoại liên hệ *</label>
                            <input
                              type="tel"
                              required
                              value={addrPhone}
                              onChange={(e) => setAddrPhone(e.target.value)}
                              placeholder="Ví dụ: 0909xxxxxx..."
                              className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="col-span-2 flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Địa chỉ chi tiết (Số nhà, tên đường, phường/xã, quận/huyện) *</label>
                            <input
                              type="text"
                              required
                              value={addrDetail}
                              onChange={(e) => setAddrDetail(e.target.value)}
                              placeholder="Ví dụ: 120 Lê Lợi..."
                              className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs text-brand-text focus:outline-none focus:border-brand-accent"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-brand-muted uppercase">Tỉnh / Thành phố *</label>
                            <select
                              value={addrCity}
                              onChange={(e) => setAddrCity(e.target.value)}
                              className="bg-white border border-brand-border rounded-xl px-3 py-2.5 text-xs text-brand-text font-bold focus:outline-none cursor-pointer"
                            >
                              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                              <option value="Hà Nội">Hà Nội</option>
                              <option value="Đà Nẵng">Đà Nẵng</option>
                              <option value="Cần Thơ">Cần Thơ</option>
                              <option value="Hải Phòng">Hải Phòng</option>
                            </select>
                          </div>
                        </div>

                        <label className="flex items-center gap-2.5 cursor-pointer mt-2 w-fit text-xs text-brand-muted font-bold">
                          <input
                            type="checkbox"
                            checked={addrDefault}
                            disabled={editingAddress?.isDefault && addrDefault}
                            onChange={(e) => setAddrDefault(e.target.checked)}
                            className="w-4 h-4 rounded border-brand-border accent-brand-accent"
                          />
                          <span>Đặt làm địa chỉ nhận hàng mặc định</span>
                        </label>

                        <button
                          type="submit"
                          className="bg-brand-accent hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 w-fit px-8 mt-2"
                        >
                          Lưu địa chỉ
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Addresses List */}
                  {addresses.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-brand-border flex flex-col items-center">
                      <span className="text-3xl mb-3">📍</span>
                      <p className="text-xs text-brand-muted font-bold">Sổ địa chỉ của bạn đang trống.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="p-5 border border-brand-border rounded-xl bg-neutral-50/45 hover:bg-white transition-all shadow-xs flex flex-col sm:flex-row justify-between gap-4 text-left">
                          <div className="flex-grow">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="text-xs font-bold uppercase text-brand-text">{addr.fullName}</h4>
                              {addr.isDefault && (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shrink-0">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-brand-text font-medium leading-relaxed">{addr.detailAddress}, {addr.city}</p>
                            <span className="text-[10px] text-brand-muted block mt-1 tracking-wider">Sđt: {addr.phone}</span>
                          </div>

                          <div className="flex sm:flex-col gap-2 justify-end sm:items-end shrink-0">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditAddressClick(addr)}
                                className="px-3 py-1.5 border border-brand-border bg-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:border-brand-text transition-colors cursor-pointer"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="px-3 py-1.5 border border-rose-100 bg-white text-[9px] font-bold uppercase tracking-widest text-rose-600 rounded-lg hover:border-rose-300 transition-colors cursor-pointer"
                              >
                                Xóa
                              </button>
                            </div>
                            {!addr.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-[9px] font-bold text-brand-muted hover:text-brand-text uppercase tracking-widest cursor-pointer mt-1"
                              >
                                Đặt mặc định
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
