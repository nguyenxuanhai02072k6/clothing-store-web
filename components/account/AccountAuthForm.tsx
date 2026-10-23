'use client';

import React, { useState } from 'react';
import { Sparkles, ChevronUp, ChevronDown, Key, Copy, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface AccountAuthFormProps {
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role: any, branch?: string, phone?: string) => Promise<boolean>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onSuccessRedirect: (email: string) => void;
}

export default function AccountAuthForm({
  login,
  register,
  showToast,
  onSuccessRedirect
}: AccountAuthFormProps) {
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
        onSuccessRedirect(demoEmail);
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const success = await login(email, password);
      if (success) {
        onSuccessRedirect(email);
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
  );
}
