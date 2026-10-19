'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Box,
  Layers,
  ArrowRightLeft,
  Users,
  Clock,
  DollarSign,
  Megaphone,
  History,
  Settings,
  X,
  ArrowRight,
  Sparkles,
  Command,
  FileSpreadsheet,
  RotateCcw,
  Crown,
  ClipboardCheck,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  setActiveTab: (tab: string) => void;
  productsList: any[];
  allOrders: any[];
  crmClients: any[];
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  onQuickAction?: (action: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  currentUser,
  setActiveTab,
  productsList = [],
  allOrders = [],
  crmClients = [],
  selectedBranch,
  setSelectedBranch,
  onQuickAction
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Navigation Items
  const navItems = [
    { id: 'pos-sales', title: 'Quầy Thu Ngân POS Bán Lẻ', category: 'Bán hàng', icon: ShoppingBag, shortcut: 'F1' },
    { id: 'sales-orders-list', title: 'Danh Sách Đơn Hàng & Vận Chuyển', category: 'Bán hàng', icon: CheckCircle2 },
    { id: 'stocker-inventory', title: 'Ma Trận Tồn Kho 2 Chi Nhánh', category: 'Kho vận', icon: Layers },
    { id: 'stocker-transfer', title: 'Điều Chuyển Kho Liên Chi Nhánh', category: 'Kho vận', icon: ArrowRightLeft },
    { id: 'restock', title: 'Phiếu Nhập Hàng Nhà Cung Cấp', category: 'Kho vận', icon: Box },
    { id: 'damaged-goods', title: 'Biên Bản Xử Lý Hàng Lỗi', category: 'Kho vận', icon: RotateCcw },
    { id: 'cskh-hub', title: 'CSKH Live Chat & Khách Hàng 360', category: 'CSKH', icon: Sparkles },
    { id: 'returns-exchange', title: 'Phiếu Đổi Trả & Khiếu Nại', category: 'CSKH', icon: RotateCcw },
    { id: 'customers-list', title: 'Hồ Sơ Khách Hàng & Hạng VIP', category: 'CSKH', icon: Crown },
    { id: 'finance-recon', title: 'Chốt Ca Két Tiền & Đối Soát POS', category: 'Tài chính', icon: ClipboardCheck },
    { id: 'finance-costs', title: 'Sổ Quỹ Thu - Chi Cửa Hàng', category: 'Tài chính', icon: DollarSign },
    { id: 'finance-payroll', title: 'Bảng Lương, Hoa Hồng & Thuế', category: 'Tài chính', icon: FileSpreadsheet },
    { id: 'finance-p-l', title: 'Báo Cáo Lợi Nhuận Doanh Nghiệp (P&L)', category: 'Tài chính', icon: TrendingUp },
    { id: 'staff-schedule', title: 'Lịch Xếp Ca Tuần & Nhân Sự', category: 'Nhân sự', icon: Calendar },
    { id: 'attendance', title: 'Chấm Công & Đi Muộn', category: 'Nhân sự', icon: Clock },
    { id: 'overview', title: 'Bảng Điều Hành Doanh Nghiệp (Overview)', category: 'Điều hành', icon: Command }
  ].filter(item => !cleanQuery || item.title.toLowerCase().includes(cleanQuery) || item.category.toLowerCase().includes(cleanQuery));

  // Products Items (Up to 4)
  const productItems = productsList
    .filter(p => !cleanQuery || p.name.toLowerCase().includes(cleanQuery) || p.category.toLowerCase().includes(cleanQuery))
    .slice(0, 4);

  // Orders Items (Up to 3)
  const orderItems = allOrders
    .filter(o => !cleanQuery || o.id.toLowerCase().includes(cleanQuery) || o.customerInfo?.fullName?.toLowerCase().includes(cleanQuery) || o.customerInfo?.phone?.includes(cleanQuery))
    .slice(0, 3);

  // Customer Items (Up to 3)
  const customerItems = crmClients
    .filter(c => !cleanQuery || c.name?.toLowerCase().includes(cleanQuery) || c.phone?.includes(cleanQuery))
    .slice(0, 3);

  const handleSelectNav = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl border border-brand-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-brand-border bg-neutral-50/50">
          <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm tính năng, mã đơn, sản phẩm, khách hàng... (Gõ để tìm)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="text-[10px] font-mono font-bold bg-neutral-200/80 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-300">ESC</span>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Branch Switcher Bar inside Command Palette */}
        <div className="px-4 py-2 bg-neutral-100/70 border-b border-brand-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-600">
            <MapPin className="w-3.5 h-3.5 text-brand-accent" />
            <span className="text-[11px] font-semibold">Chi nhánh hiện tại:</span>
          </div>
          <div className="flex items-center gap-2">
            {['Chi nhánh Quận 1', 'Chi nhánh Thảo Điền'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  selectedBranch === b 
                    ? 'bg-neutral-900 text-white shadow-2xs' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-200/60 border border-neutral-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Results */}
        <div className="overflow-y-auto p-3 space-y-4 text-xs">
          {/* Section: Features & Subsystems */}
          {navItems.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1.5">
                Chức năng điều hành ({navItems.length})
              </span>
              <div className="space-y-0.5">
                {navItems.slice(0, 8).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectNav(item.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-neutral-100/80 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                          <Icon className="w-3.5 h-3.5 text-neutral-600 group-hover:text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-neutral-900 text-xs block truncate">{item.title}</span>
                          <span className="text-[10px] text-neutral-400">{item.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.shortcut && (
                          <span className="text-[9px] font-mono bg-neutral-100 text-neutral-600 border px-1.5 py-0.5 rounded font-bold">
                            {item.shortcut}
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Products */}
          {productItems.length > 0 && (
            <div className="pt-2 border-t border-brand-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1.5">
                Sản phẩm trong kho ({productItems.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {productItems.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setActiveTab('stocker-inventory');
                      onClose();
                    }}
                    className="flex items-center gap-2.5 p-2 rounded-xl border border-neutral-200/80 hover:border-neutral-900 hover:bg-neutral-50/80 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0 relative border border-neutral-200">
                      <img src={prod.images?.[0] || ''} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <span className="font-bold text-neutral-900 text-xs block truncate">{prod.name}</span>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-0.5">
                        <span>{prod.category}</span>
                        <span className="font-bold text-neutral-900">{formatPrice(prod.price)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Orders */}
          {orderItems.length > 0 && (
            <div className="pt-2 border-t border-brand-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1.5">
                Đơn hàng ({orderItems.length})
              </span>
              <div className="space-y-1">
                {orderItems.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => {
                      setActiveTab('sales-orders-list');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-neutral-200/60 hover:bg-neutral-50 transition-colors text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-900">{order.id}</span>
                        <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-semibold uppercase">
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500 block mt-0.5">
                        {order.customerInfo?.fullName} • {order.customerInfo?.phone}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-900 text-xs">{formatPrice(order.total)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {navItems.length === 0 && productItems.length === 0 && orderItems.length === 0 && (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;</p>
              <p className="text-[10px] text-neutral-500">Hãy thử gõ tên chức năng như &quot;pos&quot;, &quot;kho&quot;, &quot;lương&quot;, hoặc tên sản phẩm.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-neutral-50 border-t border-brand-border flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span>Mẹo: Nhấn <kbd className="font-mono font-bold bg-white border px-1 rounded">Cmd</kbd> + <kbd className="font-mono font-bold bg-white border px-1 rounded">K</kbd> mở nhanh từ mọi trang</span>
          </div>
          <span className="text-[10px] font-semibold text-neutral-400">Novyn ERP & POS 2.0</span>
        </div>
      </div>
    </div>
  );
}
