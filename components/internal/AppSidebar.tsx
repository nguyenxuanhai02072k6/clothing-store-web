'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LayoutGrid,
  ShoppingBag,
  FileText,
  Box,
  Layers,
  ArrowRightLeft,
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
  ClipboardCheck,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildSidebarGroups, NAV_ALIAS } from './nav/nav-registry';

// Map icon theo TÊN string từ NavRegistry (registry là pure data, không giữ
// component React) — Task 3: sidebar render từ nguồn sự thật duy nhất.
const ICONS: Record<string, LucideIcon> = {
  LayoutGrid,
  ShoppingBag,
  FileText,
  MessageSquare,
  RotateCcw,
  Crown,
  Star,
  Sparkles,
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  FileDown,
  DollarSign,
  FileSpreadsheet,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  Clock,
  Box,
  Megaphone,
  History,
  Settings,
  LogOut
};

export interface AppSidebarProps {
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

// `menuGroups` cũ đã thay thế: dữ liệu sidebar giờ đến từ NavRegistry
// (buildSidebarGroups) + nhóm POS/CSKH/KHO legacy giữ nguyên trong registry module.
// AppHeader đọc title/breadcrumbs từ cùng một nguồn (nav-registry).

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
  const [selectedWorkspace, setSelectedWorkspace] = useState<'all' | 'pos' | 'cskh' | 'warehouse' | 'finance' | 'management'>('all');

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

  // Source: NavRegistry (Task 3) — danh sách nhóm/item + quyền được lọc sẵn
  // theo role bên registry (thay cho menuGroups + hasAccess + group.allowedRoles).
  const sidebarGroups = currentUser ? buildSidebarGroups(currentUser.role) : [];

  // Active-state theo nguồn sự thật duy nhất: mọi alias activeTab → item id
  // chuẩn qua NAV_ALIAS (thay ~30 if-chains cũ). Item active khi
  // id của nó bằng item chuẩn mà activeTab trỏ tới.
  const activeItemTarget = NAV_ALIAS[activeTab] ?? activeTab;
  const isItemActive = (itemId: string) => itemId === activeItemTarget;

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
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
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

      {/* Workspace Filter Pills */}
      {!isCollapsed && (
        <div className="px-3 py-2.5 border-b border-[#322A26] bg-[#1a1715]/60">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pos', label: 'POS' },
              { id: 'cskh', label: 'CSKH' },
              { id: 'warehouse', label: 'Kho WMS' },
              { id: 'finance', label: 'Tài chính' },
              { id: 'management', label: 'Quản trị' }
            ].map((ws) => (
              <button
                key={ws.id}
                onClick={() => setSelectedWorkspace(ws.id as any)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedWorkspace === ws.id
                    ? 'bg-[#B19C89] text-[#211D1A] shadow-xs'
                    : 'bg-[#28221e] text-[#8c8077] hover:text-white'
                }`}
              >
                {ws.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Groups — render từ NavRegistry (buildSidebarGroups đã lọc theo role) */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin scrollbar-thumb-[#322A26] scrollbar-track-transparent">
        {sidebarGroups
          .filter(group => selectedWorkspace === 'all' || group.workspace === selectedWorkspace)
          .map((group) => {
          const visibleItems = group.items;
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
                      const Icon = ICONS[item.icon] ?? LayoutGrid;
                      const isActive = isItemActive(item.id);
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
