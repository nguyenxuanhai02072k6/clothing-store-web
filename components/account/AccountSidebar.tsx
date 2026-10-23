'use client';

import React from 'react';
import Image from 'next/image';
import { User as UserIcon, Heart, FileText, UserCheck, LogOut } from 'lucide-react';

interface AccountSidebarProps {
  currentUser: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wishlistCount: number;
  addressesCount: number;
  logout: () => void;
  onNavigateOrders: () => void;
  onNavigateAddresses: () => void;
}

export default function AccountSidebar({
  currentUser,
  activeTab,
  setActiveTab,
  wishlistCount,
  addressesCount,
  logout,
  onNavigateOrders,
  onNavigateAddresses
}: AccountSidebarProps) {
  return (
    <div className="lg:col-span-3 bg-white border border-brand-border rounded-2xl shadow-sm p-6 flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-border shadow-sm mb-4 shrink-0 bg-brand-bg">
          <Image
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
            alt={currentUser?.name || 'Khách hàng'}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <h3 className="text-base font-normal text-brand-text uppercase tracking-wider mb-1">
          {currentUser?.name}
        </h3>
        <span className="text-[10px] text-brand-muted font-bold tracking-widest uppercase mb-3">
          {currentUser?.email}
        </span>

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
          Sản phẩm yêu thích ({wishlistCount})
        </button>

        <button
          onClick={onNavigateOrders}
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
          onClick={onNavigateAddresses}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border-l-2 ${
            activeTab === 'addresses'
              ? 'bg-neutral-50 text-brand-text shadow-sm border-brand-text'
              : 'text-brand-muted hover:text-brand-text hover:bg-neutral-50 border-transparent'
          }`}
        >
          <span className="text-xs shrink-0 select-none">📍</span>
          Sổ địa chỉ giao hàng ({addressesCount})
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
  );
}
