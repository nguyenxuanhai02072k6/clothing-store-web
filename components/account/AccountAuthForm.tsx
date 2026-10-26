'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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

        <div className="mt-6 text-center">
          <span className="text-[10px] text-brand-muted">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản và Chính sách của Novyn Wear.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
