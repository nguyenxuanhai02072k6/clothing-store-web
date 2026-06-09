'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  ShoppingBag,
  FileText,
  Box,
  Layers,
  ArrowRightLeft,
  Users,
  Clock,
  DollarSign,
  Megaphone,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  FileDown,
  RotateCcw,
  Crown,
  Star,
  Calendar,
  TrendingUp,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MenuItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  allowedRoles?: string[];
  badgeKey?: 'pendingOrders' | 'lowStock' | 'announcements' | 'pendingHr';
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface AppSidebarProps {
  currentUser: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  logout: () => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
  announcementsCount?: number;
  pendingHrCount?: number;
}

export const menuGroups: MenuGroup[] = [
  {
    title: 'TỔNG QUAN',
    items: [
      { id: 'overview', name: 'Dashboard', icon: LayoutGrid }
    ]
  },
  {
    title: 'BÁN HÀNG',
    items: [
      { id: 'pos-sales', name: 'Tạo đơn hàng', icon: ShoppingBag, allowedRoles: ['director', 'manager', 'employee', 'cashier'] },
      { id: 'sales-orders-list', name: 'Danh sách đơn hàng', icon: FileText, badgeKey: 'pendingOrders' },
      { id: 'returns-exchange', name: 'Đổi trả', icon: RotateCcw, allowedRoles: ['director', 'manager', 'cskh', 'employee', 'cashier'] }
    ]
  },
  {
    title: 'HÀNG HÓA',
    items: [
      { id: 'products-database', name: 'Sản phẩm', icon: Box },
      { id: 'stocker-inventory', name: 'Tồn kho', icon: Layers, badgeKey: 'lowStock' },
      { id: 'restock', name: 'Nhập hàng', icon: FileDown, allowedRoles: ['director', 'manager', 'accountant'] },
      { id: 'stocker-transfer', name: 'Điều chuyển', icon: ArrowRightLeft, allowedRoles: ['director', 'manager', 'stocker', 'accountant'] }
    ]
  },
  {
    title: 'KHÁCH HÀNG',
    items: [
      { id: 'customers-list', name: 'Danh sách khách', icon: Users },
      { id: 'customers-vip', name: 'Thành viên', icon: Crown },
      { id: 'reviews', name: 'Đánh giá', icon: Star, allowedRoles: ['director', 'cskh'] }
    ]
  },
  {
    title: 'VẬN HÀNH',
    items: [
      { id: 'staff', name: 'Nhân viên', icon: Users, allowedRoles: ['director', 'manager', 'accountant'] },
      { id: 'shifts', name: 'Lịch làm việc', icon: Calendar, badgeKey: 'pendingHr' },
      { id: 'attendance', name: 'Chấm công', icon: Clock }
    ]
  },
  {
    title: 'TÀI CHÍNH',
    items: [
      { id: 'costs', name: 'Thu chi', icon: DollarSign, allowedRoles: ['director', 'manager', 'accountant'] },
      { id: 'finance-profit', name: 'Lợi nhuận', icon: TrendingUp, allowedRoles: ['director', 'manager', 'accountant'] },
      { id: 'recon', name: 'Đối soát', icon: ClipboardCheck, allowedRoles: ['director', 'accountant', 'cashier'] }
    ]
  },
  {
    title: 'HỆ THỐNG',
    items: [
      { id: 'announcements', name: 'Thông báo', icon: Megaphone, allowedRoles: ['director', 'manager'], badgeKey: 'announcements' },
      { id: 'settings', name: 'Cài đặt', icon: Settings, allowedRoles: ['director', 'manager', 'accountant'] },
      { id: 'audit-logs', name: 'Nhật ký hoạt động', icon: History, allowedRoles: ['director'] },
      { id: 'logout', name: 'Đăng xuất', icon: LogOut }
    ]
  }
];

export default function AppSidebar({
  currentUser,
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  logout,
  pendingOrdersCount = 0,
  lowStockCount = 0,
  announcementsCount = 0,
  pendingHrCount = 0
}: AppSidebarProps) {
  
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Scroll Lock when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const hasAccess = (item: MenuItem) => {
    if (!item.allowedRoles) return true;
    return currentUser && item.allowedRoles.includes(currentUser.role);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'director': return 'Giám đốc';
      case 'manager': return 'Quản lý';
      case 'accountant': return 'Kế toán trưởng';
      case 'cskh': return 'Trưởng CSKH';
      case 'employee': return 'Nhân viên bán hàng';
      case 'cashier': return 'Thu ngân';
      case 'stocker': return 'Thủ kho';
      default: return 'Khách hàng';
    }
  };

  const getBadgeValue = (key?: string) => {
    if (!key) return 0;
    switch (key) {
      case 'pendingOrders': return pendingOrdersCount;
      case 'lowStock': return lowStockCount;
      case 'announcements': return announcementsCount;
      case 'pendingHr': return pendingHrCount;
      default: return 0;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#211D1A] text-[#766B63] select-none">
      {/* Brand Header */}
      <div className={`p-6 border-b border-[#322A26] flex items-center justify-between gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-[#322A26] flex items-center justify-center p-1 border border-[#443833] shrink-0">
            <span className="font-sans font-black text-xs text-[#FFFFFF] tracking-wider">NV</span>
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-black tracking-widest text-[#FFFFFF] uppercase">NOVYN.WEAR</span>
                <span className="text-[8px] font-black text-[#B19C89] uppercase tracking-wider">Retail Manager</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden lg:flex p-1 hover:bg-[#322A26] hover:text-[#FFFFFF] rounded-lg transition-colors cursor-pointer"
            title="Thu gọn menu"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Profile info if not collapsed */}
      <AnimatePresence initial={false}>
        {!isCollapsed && currentUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 border-b border-[#322A26] bg-[#1a1715] flex items-center gap-3 overflow-hidden"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#443833] shrink-0 bg-[#322A26]">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#FFFFFF] font-black text-sm">
                  {currentUser.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#FFFFFF] block truncate">{currentUser.name}</span>
              <span className="text-[9px] font-extrabold uppercase text-[#B19C89] tracking-wider block mt-0.5 animate-pulse">
                {getRoleName(currentUser.role)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Groups */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin scrollbar-thumb-[#322A26] scrollbar-track-transparent">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(hasAccess);
          if (visibleItems.length === 0) return null;

          const isCollapsedGroup = collapsedGroups[group.title] && !isCollapsed;

          return (
            <div key={group.title} className="space-y-1.5">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between text-[9px] font-black text-[#5c4f48] tracking-widest px-3 py-1.5 uppercase hover:text-white transition-colors cursor-pointer"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 shrink-0 ${
                      collapsedGroups[group.title] ? '-rotate-90' : ''
                    }`}
                  />
                </button>
              )}
              
              <AnimatePresence initial={false}>
                {!isCollapsedGroup && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const badgeValue = getBadgeValue(item.badgeKey);
                      const isLogout = item.id === 'logout';

                      return (
                        <div key={item.id} className="relative group flex items-center w-full">
                          <button
                            onClick={() => {
                              if (isLogout) {
                                logout();
                              } else {
                                setActiveTab(item.id);
                                setIsMobileOpen(false);
                              }
                            }}
                            className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-lg text-xs font-bold transition-all text-left cursor-pointer active:scale-[0.98] min-h-[48px] lg:min-h-[40px] relative hover:translate-x-1 duration-200 ${
                              isActive
                                ? 'bg-[#B19C89] text-[#211D1A] font-extrabold shadow-md shadow-[#B19C89]/10'
                                : isLogout
                                  ? 'text-rose-500 hover:text-[#FFFFFF] hover:bg-rose-950/30'
                                  : 'text-[#766B63] hover:text-[#FFFFFF] hover:bg-[#322A26]/50'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                          >
                            {/* Sliding active indicator */}
                            {isActive && (
                              <motion.div
                                layoutId="active-indicator"
                                className="absolute left-0 top-2 bottom-2 w-1 bg-[#211D1A] rounded-r-md"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              />
                            )}

                            <div className="relative shrink-0 flex items-center justify-center">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-[#211D1A]' : 'text-inherit'}`} />
                              {isCollapsed && badgeValue > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[#211D1A] animate-pulse" />
                              )}
                            </div>

                            <AnimatePresence initial={false}>
                              {!isCollapsed && (
                                <motion.span
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: 'auto' }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden whitespace-nowrap flex-grow"
                                >
                                  {item.name}
                                </motion.span>
                              )}
                            </AnimatePresence>

                            {!isCollapsed && badgeValue > 0 && (
                              <span className="ml-auto px-2 py-0.5 text-[9px] font-black rounded-full bg-rose-600 text-white animate-pulse">
                                {badgeValue}
                              </span>
                            )}
                          </button>

                          {/* CSS Hover Tooltip in Collapsed state */}
                          {isCollapsed && (
                            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#211D1A] text-[#FFFFFF] text-[10px] font-black uppercase tracking-wider rounded-lg border border-[#322A26] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl pointer-events-none">
                              {item.name}
                              {badgeValue > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[8px]">
                                  {badgeValue}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Expand for Collapsed sidebar */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden lg:flex w-10 h-10 items-center justify-center hover:bg-[#322A26] hover:text-[#FFFFFF] transition-all border-t border-[#322A26] cursor-pointer self-center"
          title="Mở rộng menu"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-[#322A26] z-30 shrink-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="w-12 h-12 rounded-full bg-[#211D1A] border border-[#322A26] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile sliding Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-[#211D1A]/50 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full shadow-2xl overflow-y-auto border-r border-[#322A26] z-10"
            >
              {sidebarContent}
              {/* Close Button on Mobile Drawer */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-5 right-5 p-1 text-[#766B63] hover:text-white hover:bg-[#322A26] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
