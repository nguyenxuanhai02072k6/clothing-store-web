'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  User,
  LogOut,
  MapPin,
  ShoppingBag,
  Box,
  FileDown,
  DollarSign,
  UserPlus,
  ArrowRight,
  MessageSquare,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { menuGroups, MenuItem } from './AppSidebar';
import CommandPalette from './CommandPalette';

interface AppHeaderProps {
  currentUser: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  allOrders: any[];
  productsList: any[];
  crmClients: any[];
  logout: () => void;
  onQuickAction: (action: string) => void; // 'create-order' | 'add-product' | 'restock' | 'add-expense' | 'add-customer'
}

export default function AppHeader({
  currentUser,
  activeTab,
  setActiveTab,
  selectedBranch,
  setSelectedBranch,
  allOrders,
  productsList,
  crmClients,
  logout,
  onQuickAction
}: AppHeaderProps) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const workspaces = [
    { id: 'management', label: 'Tổng Chỉ Huy', icon: LayoutGrid, defaultTab: 'overview' },
    { id: 'pos', label: 'Quầy POS', icon: ShoppingBag, defaultTab: 'pos-sales' },
    { id: 'cskh', label: 'CSKH Hub', icon: MessageSquare, defaultTab: 'cskh-hub' },
    { id: 'warehouse', label: 'Kho Vận', icon: Layers, defaultTab: 'stocker-inventory' },
    { id: 'finance', label: 'Kế Toán', icon: DollarSign, defaultTab: 'finance-costs' },
  ];

  const getActiveWorkspace = (tab: string) => {
    if (['pos-sales', 'pos', 'sales-orders-list'].includes(tab)) return 'pos';
    if (['cskh-hub', 'cskh-live-chat', 'returns-exchange', 'customers-list', 'customers', 'reviews', 'ai-copilot'].includes(tab)) return 'cskh';
    if (['stocker-inventory', 'stocker-transfer', 'damaged-goods', 'restock'].includes(tab)) return 'warehouse';
    if (['finance-costs', 'costs', 'finance-payroll', 'finance-recon', 'recon', 'finance-p-l', 'finance-profit'].includes(tab)) return 'finance';
    return 'management';
  };

  const currentWorkspace = getActiveWorkspace(activeTab);

  // Find page title from menuGroups
  const getPageTitle = () => {
    if (activeTab === 'cskh-hub' || activeTab === 'cskh-live-chat') return 'CSKH Console (Live Chat)';
    if (activeTab === 'sales-orders-list' || activeTab === 'cskh-orders') return 'Danh sách đơn hàng';
    if (activeTab === 'finance-costs' || activeTab === 'costs') return 'Sổ quỹ Thu - Chi';
    if (activeTab === 'finance-payroll' || activeTab === 'staff') return 'Bảng lương & Hoa hồng';
    if (activeTab === 'finance-recon' || activeTab === 'recon') return 'Chốt ca & Đối soát két';
    if (activeTab === 'finance-p-l' || activeTab === 'finance-profit') return 'Báo cáo Lợi nhuận P&L';
    if (activeTab === 'staff-schedule' || activeTab === 'shifts') return 'Lịch ca & Nhân sự';
    if (activeTab === 'damaged-goods') return 'Biên bản hàng lỗi';

    let title = 'Hệ thống vận hành';
    menuGroups.forEach((g) => {
      const match = g.items.find((i) => i.id === activeTab);
      if (match) title = match.name;
    });
    return title;
  };

  const getBreadcrumbs = () => {
    let groupTitle = 'Vận hành';
    menuGroups.forEach((g) => {
      const match = g.items.find((i) => i.id === activeTab);
      if (match) groupTitle = g.title;
    });
    return ['NOVYN.WEAR', groupTitle, getPageTitle()];
  };


  const isGlobalView = ['director', 'accountant'].includes(currentUser?.role);
  const isExecutive = ['director', 'manager'].includes(currentUser?.role);

  return (
    <header className="bg-white border-b border-brand-border py-3.5 px-6 sticky top-0 z-20 flex flex-col gap-3 select-none text-brand-text">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Breadcrumbs */}
        <div className="shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] text-brand-muted font-bold uppercase tracking-wider mb-1">
            {getBreadcrumbs().map((b, i) => (
              <React.Fragment key={b}>
                {i > 0 && <span className="opacity-50">/</span>}
                <span>{b}</span>
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-lg font-black text-brand-accent uppercase tracking-tight leading-none">{getPageTitle()}</h1>
        </div>

        {/* Executive Workspace Switcher (Desktop XL) */}
        {isExecutive && (
          <div className="hidden xl:flex items-center gap-1 bg-[#211D1A]/5 p-1 rounded-2xl border border-brand-border/80">
            {workspaces.map((ws) => {
              const Icon = ws.icon;
              const isWsActive = currentWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveTab(ws.defaultTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isWsActive
                      ? 'bg-[#211D1A] text-white shadow-sm shadow-[#211D1A]/20 scale-[1.02]'
                      : 'text-brand-muted hover:text-brand-text hover:bg-white/60'
                  }`}
                  title={`Chuyển sang không gian ${ws.label}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isWsActive ? 'text-[#B19C89]' : 'text-inherit'}`} />
                  <span>{ws.label}</span>
                </button>
              );
            })}
          </div>
        )}

      {/* Middle/Right Widgets */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Branch Selector */}
        <div className="flex items-center gap-2 bg-brand-bg px-3.5 py-2 rounded-xl border border-brand-border">
          <MapPin className="w-3.5 h-3.5 text-brand-accent-secondary" />
          {isGlobalView ? (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-black uppercase tracking-wider outline-none bg-transparent cursor-pointer pr-4"
            >
              <option value="all">Tất cả chi nhánh</option>
              <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
              <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
            </select>
          ) : (
            <span className="text-xs font-black uppercase tracking-wider">
              {currentUser?.branch || 'Chi nhánh Quận 1'}
            </span>
          )}
        </div>

        {/* Linear-Style Command Palette Trigger (Cmd+K) */}
        <div className="relative w-full max-w-xs shrink-0">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between pl-3 pr-2 py-2 rounded-xl border border-brand-border text-xs bg-brand-bg hover:bg-white hover:border-brand-accent text-neutral-500 font-medium transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-brand-muted group-hover:text-brand-accent transition-colors" />
              <span className="truncate">Tìm kiếm, thao tác...</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-mono font-bold text-neutral-600 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Quick Create Dropdown Menu */}
        <div ref={quickMenuRef} className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm shadow-brand-accent/10"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo nhanh
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-brand-border rounded-xl shadow-2xl p-1.5 z-50">
              {[
                { label: 'Tạo đơn hàng', action: 'create-order', icon: ShoppingBag, allowedRoles: ['director', 'manager', 'employee', 'cashier'] },
                { label: 'Thêm sản phẩm', action: 'add-product', icon: Box, allowedRoles: ['director', 'accountant', 'manager'] },
                { label: 'Nhập hàng', action: 'restock', icon: FileDown, allowedRoles: ['director', 'manager', 'accountant'] },
                { label: 'Tạo khoản chi', action: 'add-expense', icon: DollarSign, allowedRoles: ['director', 'manager', 'accountant'] },
                { label: 'Thêm khách hàng', action: 'add-customer', icon: UserPlus, allowedRoles: ['director', 'manager', 'employee', 'cskh', 'accountant'] }
              ]
                .filter(item => !item.allowedRoles || item.allowedRoles.includes(currentUser?.role))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.action}
                      onClick={() => {
                        onQuickAction(item.action);
                        setShowQuickMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-xs text-brand-text hover:bg-brand-bg font-bold cursor-pointer transition-colors"
                    >
                      <Icon className="w-4 h-4 text-brand-muted shrink-0" />
                      <span>{item.label}</span>
                      <ArrowRight className="w-3 h-3 text-brand-muted ml-auto opacity-0 hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Notifications Center */}
        <div className="relative">
          <button className="p-2 bg-brand-bg hover:bg-brand-border rounded-xl border border-brand-border text-brand-accent transition-colors relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-danger animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-danger" />
          </button>
        </div>

        {/* User Account Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 bg-brand-bg hover:bg-brand-border rounded-xl border border-brand-border p-1.5 transition-colors cursor-pointer"
          >
            <div className="relative w-7 h-7 rounded-full overflow-hidden border border-brand-border bg-white shrink-0">
              {currentUser?.avatar ? (
                <Image
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  fill
                  sizes="28px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-accent font-black text-xs">
                  {currentUser?.name?.charAt(0)}
                </div>
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-brand-muted mr-1" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-brand-border rounded-xl shadow-2xl p-1.5 z-50">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-brand-text hover:bg-brand-bg font-bold cursor-pointer transition-colors"
              >
                <User className="w-4 h-4 text-brand-muted" />
                <span>Hồ sơ cá nhân</span>
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs text-brand-danger hover:bg-brand-danger/5 font-bold cursor-pointer transition-colors border-t border-brand-border/60 mt-1"
              >
                <LogOut className="w-4 h-4 text-brand-danger" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Mobile/Tablet Workspace Quick Switcher */}
      {isExecutive && (
        <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
          {workspaces.map((ws) => {
            const Icon = ws.icon;
            const isWsActive = currentWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => setActiveTab(ws.defaultTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  isWsActive
                    ? 'bg-[#211D1A] text-white shadow-sm'
                    : 'bg-brand-bg text-brand-muted border border-brand-border'
                }`}
              >
                <Icon className={`w-3 h-3 ${isWsActive ? 'text-[#B19C89]' : 'text-inherit'}`} />
                <span>{ws.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Global Linear-style Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        currentUser={currentUser}
        setActiveTab={setActiveTab}
        productsList={productsList}
        allOrders={allOrders}
        crmClients={crmClients}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        onQuickAction={onQuickAction}
      />
    </header>
  );
}
