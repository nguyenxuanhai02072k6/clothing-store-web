'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountProfileTabProps {
  currentUser: any;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AccountProfileTab({
  currentUser,
  changePassword,
  showToast
}: AccountProfileTabProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

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

  return (
    <div>
      <h3 className="text-xl font-normal text-brand-text tracking-widest mb-6 uppercase pb-3 border-b border-brand-border">
        Hồ sơ tài khoản
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-50 p-5 rounded-xl border border-brand-border">
          <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block mb-1">Họ và tên</span>
          <p className="text-sm font-semibold text-brand-text uppercase">{currentUser?.name}</p>
        </div>
        <div className="bg-neutral-50 p-5 rounded-xl border border-brand-border">
          <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block mb-1">Email đăng nhập</span>
          <p className="text-sm font-bold text-brand-text">{currentUser?.email}</p>
        </div>
        <div className="bg-neutral-50 p-5 rounded-xl border border-brand-border">
          <span className="text-[9px] font-bold text-brand-muted uppercase tracking-wider block mb-1">Quyền hạn</span>
          <p className="text-xs font-bold text-brand-text uppercase tracking-widest mt-1">Khách hàng</p>
        </div>
        {currentUser?.phone && (
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
          className="flex justify-between items-center w-full text-left font-bold text-xs uppercase tracking-widest text-brand-text cursor-pointer"
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
                <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">
                  Mật khẩu hiện tại
                </label>
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
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">
                    Mật khẩu mới
                  </label>
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
                  <label className="text-[9px] font-bold uppercase tracking-widest text-brand-muted block mb-1">
                    Xác nhận mật khẩu mới
                  </label>
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
  );
}
