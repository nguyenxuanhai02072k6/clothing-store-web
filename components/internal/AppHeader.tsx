'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { menuGroups, MenuItem } from './AppSidebar';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    orders: any[];
    products: any[];
    customers: any[];
  }>({ orders: [], products: [], customers: [] });

  const quickMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ orders: [], products: [], customers: [] });
      return;
    }

    const query = searchQuery.toLowerCase().trim();

    // Filter orders (up to 3)
    const filteredOrders = allOrders
      .filter((o) => o.id.toLowerCase().includes(query) || o.customerInfo?.fullName?.toLowerCase().includes(query))
      .slice(0, 3);

    // Filter products (up to 3)
    const filteredProducts = productsList
      .filter((p) => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query))
      .slice(0, 3);

    // Filter customers (up to 3)
    const filteredCustomers = crmClients
      .filter((c) => c.name.toLowerCase().includes(query) || c.phone.includes(query))
      .slice(0, 3);

    setSearchResults({
      orders: filteredOrders,
      products: filteredProducts,
      customers: filteredCustomers
    });
  }, [searchQuery, allOrders, productsList, crmClients]);

  // Find page title from menuGroups
  const getPageTitle = () => {
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

  const handleSearchResultClick = (type: 'order' | 'product' | 'customer', item: any) => {
    setShowSearchResults(false);
    setSearchQuery('');
    
    if (type === 'order') {
      setActiveTab('sales-orders-list');
      // Set timer to trigger viewing details
      setTimeout(() => {
        const viewBtn = document.querySelector(`[title*="${item.id}"]`) || document.querySelector(`button[title*="chi tiết"]`);
        if (viewBtn) (viewBtn as HTMLElement).click();
      }, 300);
    } else if (type === 'product') {
      setActiveTab('products-database');
    } else if (type === 'customer') {
      setActiveTab('customers');
    }
  };

  const isGlobalView = ['director', 'accountant'].includes(currentUser?.role);

  return (
    <header className="bg-white border-b border-brand-border py-4 px-6 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none text-brand-text">
      {/* Title & Breadcrumbs */}
      <div>
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

        {/* Global Autocomplete Search */}
        <div ref={searchRef} className="relative w-full max-w-xs shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm đơn hàng, sản phẩm, khách hàng..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-accent focus:bg-white bg-brand-bg font-semibold transition-all"
            />
            <Search className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Results Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-brand-border rounded-xl shadow-2xl p-3 max-h-96 overflow-y-auto z-50 text-xs">
              {searchResults.orders.length === 0 &&
              searchResults.products.length === 0 &&
              searchResults.customers.length === 0 ? (
                <p className="text-center py-4 text-brand-muted italic">Không tìm thấy kết quả</p>
              ) : (
                <div className="space-y-4">
                  {/* Orders */}
                  {searchResults.orders.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest block px-1">Đơn hàng</span>
                      {searchResults.orders.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => handleSearchResultClick('order', o)}
                          className="w-full p-2 hover:bg-brand-bg rounded-lg text-left flex justify-between items-center cursor-pointer"
                        >
                          <span className="font-mono font-bold text-brand-accent">{o.id}</span>
                          <span className="text-[10px] text-brand-muted truncate max-w-[120px]">{o.customerInfo?.fullName || 'Khách lẻ'}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {searchResults.products.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest block px-1">Sản phẩm</span>
                      {searchResults.products.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSearchResultClick('product', p)}
                          className="w-full p-2 hover:bg-brand-bg rounded-lg text-left flex justify-between items-center cursor-pointer"
                        >
                          <span className="font-bold text-brand-accent truncate max-w-[150px]">{p.name}</span>
                          <span className="text-[10px] text-brand-muted">{p.category}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Customers */}
                  {searchResults.customers.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest block px-1">Khách hàng</span>
                      {searchResults.customers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleSearchResultClick('customer', c)}
                          className="w-full p-2 hover:bg-brand-bg rounded-lg text-left flex justify-between items-center cursor-pointer"
                        >
                          <span className="font-bold text-brand-accent">{c.name}</span>
                          <span className="text-[10px] text-brand-muted font-mono">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
            <div className="w-7 h-7 rounded-full overflow-hidden border border-brand-border bg-white shrink-0">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
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
    </header>
  );
}
