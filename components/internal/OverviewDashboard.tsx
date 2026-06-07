'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Box,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Briefcase,
  HelpCircle,
  FileText,
  PlusCircle,
  Megaphone,
  UserCheck,
  Play
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { motion } from 'framer-motion';
import FinancialSVGCharts from './FinancialSVGCharts';

interface OverviewDashboardProps {
  currentUser: any;
  allOrders: any[];
  expensesList: any[];
  payrollRecords: any[];
  restockRecords: any[];
  productsList: any[];
  usersList: any[];
  selectedBranch: string;
  
  // Daily reports props
  dailyReports: any[];
  viewingReportId: string | null;
  setViewingReportId: (id: string | null) => void;
  markReportAsRead: (id: string) => void;
  submitDailyReport: (title: string, content: string) => void;

  // Staff clock in / out props
  attendanceLogs: any[];
  checkIn: (checklist: any, isGPSCorrect: boolean, isQRScanned: boolean) => void;
  checkOut: (checklist: any) => void;
  attendanceChecklist: Record<string, boolean>;
  setAttendanceChecklist: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  attendanceClosingChecklist: Record<string, boolean>;
  setAttendanceClosingChecklist: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isGPSCorrect: boolean;
  showQRScanner: boolean;
  setShowQRScanner: (v: boolean) => void;
  isQRScanned: boolean;
  setIsQRScanned: (v: boolean) => void;
  liveTime: string;

  // Navigation
  setActiveTab: (tab: string) => void;
  setSalesOrdersSubTab?: (tab: string) => void;
  setProductsInventorySubTab?: (tab: string) => void;
  setStaffScheduleSubTab?: (tab: string) => void;
  setFinanceProfitSubTab?: (tab: string) => void;

  // Shift logs & announcements
  shiftRequests: any[];
  leaveRequests: any[];
  announcements: any[];
  transfers: any[];
}

export default function OverviewDashboard({
  currentUser,
  allOrders,
  expensesList,
  payrollRecords,
  restockRecords,
  productsList,
  usersList,
  selectedBranch,
  dailyReports,
  viewingReportId,
  setViewingReportId,
  markReportAsRead,
  submitDailyReport,
  attendanceLogs,
  checkIn,
  checkOut,
  attendanceChecklist,
  setAttendanceChecklist,
  attendanceClosingChecklist,
  setAttendanceClosingChecklist,
  isGPSCorrect,
  showQRScanner,
  setShowQRScanner,
  isQRScanned,
  setIsQRScanned,
  liveTime,
  setActiveTab,
  setSalesOrdersSubTab,
  setProductsInventorySubTab,
  setStaffScheduleSubTab,
  setFinanceProfitSubTab,
  shiftRequests,
  leaveRequests,
  announcements,
  transfers
}: OverviewDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days'>('30days');
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  // Time greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const currentBranch = ['director', 'accountant'].includes(currentUser?.role)
    ? selectedBranch
    : (currentUser?.branch || 'Chi nhánh Quận 1');

  // Filter lists based on selected branch and time filters
  const getFilteredOrders = () => {
    let list = allOrders.filter(o => o.status === 'completed');
    if (currentBranch !== 'all') {
      list = list.filter(o => o.branch === currentBranch);
    }
    return list;
  };

  const getFilteredExpenses = () => {
    let list = expensesList;
    if (currentBranch !== 'all') {
      // Assuming expenses are branch bound or global
      list = list.filter(e => e.branch === currentBranch || !e.branch);
    }
    return list;
  };

  const getFilteredRestocks = () => {
    let list = restockRecords.filter(r => r.status === 'approved');
    if (currentBranch !== 'all') {
      list = list.filter(r => r.branch === currentBranch);
    }
    return list;
  };

  const getFilteredSalaries = () => {
    let list = payrollRecords.filter(p => p.status === 'paid');
    if (currentBranch !== 'all') {
      list = list.filter(p => p.branch === currentBranch);
    }
    return list;
  };

  // KPIs Calculations
  const filteredOrders = getFilteredOrders();
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const completedOrdersCount = filteredOrders.length;
  const aov = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

  const totalExpenses = getFilteredExpenses().reduce((sum, e) => sum + e.amount, 0);
  const totalRestockCost = getFilteredRestocks().reduce((sum, r) => sum + (r.cost || 0), 0);
  const totalSalaries = getFilteredSalaries().reduce((sum, p) => sum + p.salary, 0);
  const totalCosts = (totalRevenue * 0.4) + totalExpenses + totalRestockCost + totalSalaries; // 40% COGS + other costs
  const netProfit = totalRevenue - totalCosts;

  const lowStockCount = productsList.filter((p: any) => {
    if (currentBranch === 'all') {
      return p.stock < 5;
    }
    // Check branch stock
    return (p.branchStock?.[currentBranch] || 0) < 5;
  }).length;

  // Pending Actions
  const pendingOrders = allOrders.filter(o => o.status === 'pending' && (currentBranch === 'all' || o.branch === currentBranch));
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending' && (currentBranch === 'all' || r.branch === currentBranch));
  const pendingTransfers = transfers.filter(t => t.status === 'shipping' && (currentBranch === 'all' || t.toBranch === currentBranch));
  const pendingReports = dailyReports.filter(r => r.status === 'unread' && (currentBranch === 'all' || r.branch === currentBranch));

  // Personal metrics for sales employees
  const personalAttendance = attendanceLogs.filter(log => log.userId === currentUser?.id);
  const personalShifts = shiftRequests.filter(s => s.userId === currentUser?.id && s.status === 'approved');

  // KPI Target (e.g. 50,000,000 ₫ target per month)
  const kpiTarget = 50000000;
  const kpiPercentage = Math.min(100, (totalRevenue / kpiTarget) * 100);

  return (
    <div className="space-y-6 text-brand-text">
      {/* Time & Greeting Bar */}
      <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-brand-accent uppercase tracking-tight">
            {getGreeting()}, {currentUser?.name}!
          </h2>
          <p className="text-xs text-brand-muted mt-1 font-bold">
            Hôm nay là ngày {new Date().toLocaleDateString('vi-VN')} • Chi nhánh đang theo dõi:{' '}
            <span className="text-brand-accent-secondary uppercase">
              {currentBranch === 'all' ? 'Toàn chuỗi' : currentBranch}
            </span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {['today', '7days', '30days'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeFilter === filter
                  ? 'bg-brand-accent text-white shadow-sm'
                  : 'bg-brand-bg text-brand-muted hover:text-brand-text hover:bg-brand-border'
              }`}
            >
              {filter === 'today' ? 'Hôm nay' : filter === '7days' ? '7 ngày' : '30 ngày'}
            </button>
          ))}
        </div>
      </div>

      {/* Owner / Accountant Dashboard overview */}
      {['director', 'accountant', 'manager'].includes(currentUser?.role) ? (
        <>
          {/* Bento Grid: 6 metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* 1. Doanh thu */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider">Doanh thu</span>
                <div className="p-1 rounded-lg bg-brand-success/10 text-brand-success">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-sm font-black font-mono text-brand-accent block truncate">{formatPrice(totalRevenue)}</span>
                <span className="text-[9px] text-brand-success font-bold mt-0.5 block flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12% vs kỳ trước
                </span>
              </div>
            </div>

            {/* 2. Lợi nhuận ước tính */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider flex items-center gap-1">
                  Lợi nhuận
                  <button
                    onMouseEnter={() => setHoveredTooltip('profit')}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="cursor-help"
                  >
                    <HelpCircle className="w-3 h-3 text-brand-muted" />
                  </button>
                </span>
                <div className={`p-1 rounded-lg ${netProfit >= 0 ? 'bg-brand-success/10 text-brand-success' : 'bg-brand-danger/10 text-brand-danger'}`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className={`text-sm font-black font-mono block truncate ${netProfit >= 0 ? 'text-brand-accent' : 'text-brand-danger'}`}>
                  {formatPrice(netProfit)}
                </span>
                <span className={`text-[9px] font-bold mt-0.5 block ${netProfit >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {netProfit >= 0 ? 'Lợi nhuận ròng thặng dư' : 'Cần tối ưu chi phí'}
                </span>
              </div>

              {/* Tooltip Popup */}
              {hoveredTooltip === 'profit' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-brand-accent text-white text-[10px] p-2.5 rounded-xl shadow-xl leading-relaxed z-10">
                  Lợi nhuận ước tính = Doanh thu - Giá vốn (40%) - Phí mặt bằng - Chi phí lương - Chi phí nhập kho.
                </div>
              )}
            </div>

            {/* 3. Tổng đơn hàng */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider">Tổng đơn hàng</span>
                <div className="p-1 rounded-lg bg-brand-info/10 text-brand-info">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-sm font-black font-mono text-brand-accent block truncate">{completedOrdersCount} đơn</span>
                <span className="text-[9px] text-brand-muted font-bold mt-0.5 block">Đã giao thành công</span>
              </div>
            </div>

            {/* 4. Giá trị đơn trung bình */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider flex items-center gap-1">
                  Giá trị TB (AOV)
                </span>
                <div className="p-1 rounded-lg bg-brand-accent-secondary/15 text-brand-accent-secondary">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-sm font-black font-mono text-brand-accent block truncate">{formatPrice(aov)}</span>
                <span className="text-[9px] text-brand-muted font-bold mt-0.5 block">Bình quân / Giao dịch</span>
              </div>
            </div>

            {/* 5. Chi phí vận hành */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider flex items-center gap-1">
                  Chi phí
                  <button
                    onMouseEnter={() => setHoveredTooltip('costs')}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="cursor-help"
                  >
                    <HelpCircle className="w-3 h-3 text-brand-muted" />
                  </button>
                </span>
                <div className="p-1 rounded-lg bg-brand-warning/10 text-brand-warning">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-sm font-black font-mono text-brand-accent block truncate">{formatPrice(totalCosts)}</span>
                <span className="text-[9px] text-brand-muted font-bold mt-0.5 block">Nhập hàng + Lương + Phí</span>
              </div>

              {hoveredTooltip === 'costs' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-brand-accent text-white text-[10px] p-2.5 rounded-xl shadow-xl leading-relaxed z-10">
                  Tổng chi phí bao gồm giá vốn hàng bán, chi phí tiếp thị, phí vận hành khác, quỹ lương nhân sự và tiền nhập hàng.
                </div>
              )}
            </div>

            {/* 6. Sản phẩm sắp hết */}
            <div className="bg-white p-5 rounded-2xl border border-brand-border flex flex-col justify-between shadow-sm relative group hover:border-brand-accent transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider">Hàng sắp hết</span>
                <div className={`p-1 rounded-lg ${lowStockCount > 0 ? 'bg-brand-danger/10 text-brand-danger animate-pulse' : 'bg-brand-bg text-brand-muted'}`}>
                  <Box className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <span className="text-sm font-black font-mono text-brand-accent block truncate">{lowStockCount} sản phẩm</span>
                <span className={`text-[9px] font-bold mt-0.5 block ${lowStockCount > 0 ? 'text-brand-danger' : 'text-brand-muted'}`}>
                  {lowStockCount > 0 ? 'Cần bổ sung tồn kho' : 'Tồn kho ổn định'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Target & Action items */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* KPI Progress bar */}
            <div className="lg:col-span-8 bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-3 text-xs font-bold">
                <span className="uppercase tracking-wider">Tiến trình doanh số tháng</span>
                <span>{kpiPercentage.toFixed(1)}% ({formatPrice(totalRevenue)} / {formatPrice(kpiTarget)})</span>
              </div>
              <div className="w-full bg-brand-bg h-3 rounded-full border border-brand-border overflow-hidden">
                <div className="bg-brand-success h-full transition-all duration-500" style={{ width: `${kpiPercentage}%` }} />
              </div>
              <p className="text-[10px] text-brand-muted mt-2 font-medium">
                Mục tiêu tháng của {currentBranch === 'all' ? 'hệ thống' : currentBranch} là {formatPrice(kpiTarget)}. Hãy đẩy mạnh bán hàng và các chiến dịch khuyến mãi!
              </p>
            </div>

            {/* Area: "Cần xử lý" (Pending Panel) */}
            <div className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-brand-warning shrink-0" />
                Công việc cần xử lý
              </h3>
              <div className="space-y-3">
                {/* 1. Đơn hàng chờ xử lý */}
                {pendingOrders.length > 0 && (
                  <div className="flex items-center justify-between text-xs border-b border-brand-bg pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-brand-accent">Đơn hàng chờ xử lý</span>
                      <span className="block text-[10px] text-brand-muted">{pendingOrders.length} đơn cần xác nhận</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('sales-orders-list');
                      }}
                      className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Xử lý ngay
                    </button>
                  </div>
                )}

                {/* 2. Sản phẩm sắp hết hàng */}
                {lowStockCount > 0 && (
                  <div className="flex items-center justify-between text-xs border-b border-brand-bg pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-brand-accent">Hàng sắp hết trong kho</span>
                      <span className="block text-[10px] text-brand-muted">{lowStockCount} mã tồn thấp (&lt; 5 chiếc)</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('restock');
                      }}
                      className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Nhập hàng
                    </button>
                  </div>
                )}

                {/* 3. Đơn xin nghỉ phép cần duyệt */}
                {currentUser.role !== 'accountant' && pendingLeaves.length > 0 && (
                  <div className="flex items-center justify-between text-xs border-b border-brand-bg pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-brand-accent">Đơn xin nghỉ phép</span>
                      <span className="block text-[10px] text-brand-muted">{pendingLeaves.length} nhân sự xin nghỉ ca</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('shifts');
                        if (setStaffScheduleSubTab) setStaffScheduleSubTab('approval');
                      }}
                      className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Phê duyệt
                    </button>
                  </div>
                )}

                {/* 4. Yêu cầu chuyển hàng */}
                {pendingTransfers.length > 0 && (
                  <div className="flex items-center justify-between text-xs border-b border-brand-bg pb-2 last:border-0 last:pb-0">
                    <div>
                      <span className="font-bold text-brand-accent">Yêu cầu điều chuyển</span>
                      <span className="block text-[10px] text-brand-muted">{pendingTransfers.length} phiếu đang vận chuyển</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('stocker-transfer');
                      }}
                      className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-border rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Nhận hàng
                    </button>
                  </div>
                )}

                {pendingOrders.length === 0 &&
                lowStockCount === 0 &&
                pendingLeaves.length === 0 &&
                pendingTransfers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center select-none">
                    <CheckCircle2 className="w-8 h-8 text-brand-success/50 mb-2" />
                    <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">Hệ thống an toàn</p>
                    <p className="text-[9px] text-brand-muted mt-0.5">Không có công việc nào khẩn cấp.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SVG Charts display */}
          <FinancialSVGCharts
            allOrders={allOrders}
            restockRecords={restockRecords}
            expensesList={expensesList}
            usersList={usersList}
            currentUser={currentUser}
          />
        </>
      ) : (
        /* Employee / Cashier / Staff Dashboard view */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Quick stats for sales employee */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Shortcut Pos buttons & Performance */}
            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-4">Lối tắt bán hàng POS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('pos-sales')}
                  className="p-6 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl flex items-center justify-between group transition-all duration-300 shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <div className="text-left">
                    <span className="text-sm font-black uppercase tracking-wider block">Mở quầy bán POS</span>
                    <span className="text-[10px] text-brand-accent-secondary font-bold block mt-1">Lập hóa đơn và thanh toán nhanh</span>
                  </div>
                  <Play className="w-6 h-6 text-brand-accent-secondary group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="bg-brand-bg p-5 rounded-xl border border-brand-border flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider block mb-1">Ca trực hôm nay</span>
                    <span className="text-xs font-black text-brand-accent">
                      {personalShifts.length > 0 
                        ? `${personalShifts[0].date} (Ca: ${personalShifts[0].shiftType})` 
                        : 'Không có ca làm hôm nay'}
                    </span>
                  </div>
                  <div className="border-t border-brand-border pt-2.5 mt-2.5 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-brand-muted">Mã nhân sự:</span>
                    <span className="font-black font-mono text-brand-accent">{currentUser.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements Panel */}
            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-brand-warning shrink-0" />
                Thông báo từ ban quản lý
              </h3>
              <div className="space-y-4">
                {announcements
                  .filter((ann: any) => {
                    if (ann.recipientType === 'all') return true;
                    if (ann.recipientType === 'branch_q1' && currentUser.branch === 'Chi nhánh Quận 1') return true;
                    if (ann.recipientType === 'branch_td' && currentUser.branch === 'Chi nhánh Thảo Điền') return true;
                    return false;
                  })
                  .slice(0, 3)
                  .map((ann: any) => (
                    <div key={ann.id} className="bg-brand-bg/50 border border-brand-border p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-brand-accent mb-1">{ann.title}</h4>
                      <p className="text-[11px] text-brand-muted leading-relaxed whitespace-pre-line">{ann.content}</p>
                      <span className="text-[8px] text-brand-muted font-bold block mt-2">
                        Người gửi: {ann.senderName} • {ann.createdAt}
                      </span>
                    </div>
                  ))}
                {announcements.filter((ann: any) => {
                  if (ann.recipientType === 'all') return true;
                  if (ann.recipientType === 'branch_q1' && currentUser.branch === 'Chi nhánh Quận 1') return true;
                  if (ann.recipientType === 'branch_td' && currentUser.branch === 'Chi nhánh Thảo Điền') return true;
                  return false;
                }).length === 0 && (
                  <p className="text-xs text-brand-muted italic text-center py-6">Hôm nay không có thông tri mới.</p>
                )}
              </div>
            </div>

          </div>

          {/* Clock In / Out Area */}
          <div className="lg:col-span-4 bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-accent-secondary" />
              Điểm danh & Chấm công
            </h3>
            
            <div className="text-center py-4 space-y-4">
              <span className="text-2xl font-black font-mono text-brand-accent tracking-widest block">{liveTime}</span>
              <p className="text-[10px] text-brand-muted font-bold uppercase">Thời gian thực tế hệ thống</p>

              {/* Active attendance log state */}
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const todayLog = personalAttendance.find(log => log.date === todayStr);

                if (!todayLog) {
                  return (
                    <div className="space-y-4">
                      {/* Check-in Checklist */}
                      <div className="text-left bg-brand-bg border border-brand-border p-3.5 rounded-xl text-xs space-y-2">
                        <span className="text-[9px] font-black uppercase text-brand-muted block mb-1">Checklist đầu ca</span>
                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendanceChecklist.cleanShelves}
                            onChange={(e) => setAttendanceChecklist(prev => ({ ...prev, cleanShelves: e.target.checked }))}
                            className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                          />
                          <span>Vệ sinh quầy kệ và khu trưng bày</span>
                        </label>
                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendanceChecklist.alignProducts}
                            onChange={(e) => setAttendanceChecklist(prev => ({ ...prev, alignProducts: e.target.checked }))}
                            className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                          />
                          <span>Chỉnh đốn phom sản phẩm treo móc</span>
                        </label>
                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendanceChecklist.checkDrawer}
                            onChange={(e) => setAttendanceChecklist(prev => ({ ...prev, checkDrawer: e.target.checked }))}
                            className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                          />
                          <span>Kiểm đếm tiền lẻ két bàn thu ngân</span>
                        </label>
                      </div>

                      <button
                        onClick={() => checkIn(attendanceChecklist, isGPSCorrect, isQRScanned)}
                        className="w-full py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-brand-accent/10"
                      >
                        ✓ Chấm công VÀO ca
                      </button>
                    </div>
                  );
                } else if (todayLog && !todayLog.checkOut) {
                  return (
                    <div className="space-y-4">
                      <div className="bg-brand-success/5 border border-brand-success/20 p-3.5 rounded-xl text-left text-xs">
                        <span className="font-bold text-brand-success flex items-center gap-1.5 mb-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Đã CHẤM VÀO lúc: {todayLog.checkIn}
                        </span>
                        {todayLog.status === 'late' && (
                          <span className="text-[10px] text-brand-warning font-bold bg-brand-warning/10 px-2 py-0.5 rounded border border-brand-warning/20 inline-block mt-0.5">
                            ⏰ Đi trễ: Đối chiếu ca trực trễ giờ
                          </span>
                        )}
                      </div>

                      {/* Check-out Checklist */}
                      <div className="text-left bg-brand-bg border border-brand-border p-3.5 rounded-xl text-xs space-y-2">
                        <span className="text-[9px] font-black uppercase text-brand-muted block mb-1">Checklist cuối ca</span>
                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendanceClosingChecklist.cashAudit}
                            onChange={(e) => setAttendanceClosingChecklist(prev => ({ ...prev, cashAudit: e.target.checked }))}
                            className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                          />
                          <span>Quyết toán tiền và đối soát két bán hàng</span>
                        </label>
                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendanceClosingChecklist.cleanWorkspace}
                            onChange={(e) => setAttendanceClosingChecklist(prev => ({ ...prev, cleanWorkspace: e.target.checked }))}
                            className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                          />
                          <span>Dọn dẹp vệ sinh khu vực làm việc</span>
                        </label>
                        <label className="flex items-center gap-2 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendanceClosingChecklist.turnOffAppliances}
                            onChange={(e) => setAttendanceClosingChecklist(prev => ({ ...prev, turnOffAppliances: e.target.checked }))}
                            className="rounded text-brand-accent accent-brand-accent cursor-pointer"
                          />
                          <span>Tắt đèn, máy lạnh và các thiết bị điện</span>
                        </label>
                      </div>

                      <button
                        onClick={() => checkOut(attendanceClosingChecklist)}
                        className="w-full py-3 bg-brand-danger hover:bg-brand-danger/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-brand-danger/10"
                      >
                        ✗ Chấm công RA ca
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-brand-success/10 border border-brand-success/30 p-5 rounded-xl text-xs space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-brand-success mx-auto mb-1" />
                      <span className="font-black text-brand-success block">ĐÃ HOÀN THÀNH CHẤM CÔNG HÔM NAY!</span>
                      <p className="text-[10px] text-brand-muted leading-relaxed">
                        Thời gian check-in: {todayLog.checkIn} <br />
                        Thời gian check-out: {todayLog.checkOut}
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

        </div>
      )}

      {/* Daily reports submit and read section for owners/managers */}
      {currentUser.role === 'director' && (
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
          <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-accent-secondary" />
            Báo cáo vận hành tổng hợp toàn công ty
          </h3>
          <p className="text-[10px] text-brand-muted mb-4">Các báo cáo cuối ca từ Quản lý chi nhánh và Kế toán trưởng.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unread */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-brand-warning uppercase tracking-widest block">Chưa đọc ({dailyReports.filter(r => r.status === 'unread').length})</span>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {dailyReports.filter(r => r.status === 'unread').map((rep) => {
                  const isExpanded = viewingReportId === rep.id;
                  return (
                    <div key={rep.id} className="bg-brand-bg border border-brand-border rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] bg-brand-accent text-white px-2 py-0.5 rounded font-black tracking-wider uppercase">{rep.branch}</span>
                          <h4 className="text-xs font-bold text-brand-accent mt-1.5">{rep.title}</h4>
                        </div>
                        <button
                          onClick={() => {
                            if (isExpanded) setViewingReportId(null);
                            else {
                              setViewingReportId(rep.id);
                              markReportAsRead(rep.id);
                            }
                          }}
                          className="px-2.5 py-1 bg-brand-accent text-white text-[9px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                        >
                          {isExpanded ? 'Đóng' : 'Đọc'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-brand-border/60 text-xs text-brand-text whitespace-pre-line leading-relaxed font-medium">
                          {rep.content}
                        </div>
                      )}
                    </div>
                  );
                })}
                {dailyReports.filter(r => r.status === 'unread').length === 0 && (
                  <p className="text-xs text-brand-muted italic py-6 text-center">Đã xem hết báo cáo!</p>
                )}
              </div>
            </div>

            {/* Read */}
            <div className="space-y-3">
              <span className="text-[9px] font-black text-brand-success uppercase tracking-widest block">Đã đọc ({dailyReports.filter(r => r.status === 'read').length})</span>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {dailyReports.filter(r => r.status === 'read').map((rep) => {
                  const isExpanded = viewingReportId === rep.id;
                  return (
                    <div key={rep.id} className="bg-brand-bg/40 border border-brand-border/60 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] bg-brand-muted text-white px-2 py-0.5 rounded font-black tracking-wider uppercase">{rep.branch}</span>
                          <h4 className="text-xs font-bold text-brand-muted mt-1.5">{rep.title}</h4>
                        </div>
                        <button
                          onClick={() => setViewingReportId(isExpanded ? null : rep.id)}
                          className="px-2.5 py-1 bg-brand-bg text-brand-muted text-[9px] font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                        >
                          {isExpanded ? 'Đóng' : 'Xem'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-brand-border/60 text-xs text-brand-text whitespace-pre-line leading-relaxed font-medium">
                          {rep.content}
                          <p className="text-[8px] text-brand-success font-black mt-2">Đã xem lúc: {rep.readAt}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff View: Submit reports to Boss */}
      {['manager', 'accountant', 'cskh'].includes(currentUser.role) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm">
            <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-brand-accent-secondary" />
              Gửi báo cáo vận hành cuối ca
            </h3>
            <p className="text-[10px] text-brand-muted mb-4">Soạn báo cáo tổng hợp công việc để sếp Bảo kiểm duyệt.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('reportTitle') as HTMLInputElement).value;
                const content = (form.elements.namedItem('reportContent') as HTMLTextAreaElement).value;
                if (title && content) {
                  submitDailyReport(title, content);
                  form.reset();
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[9px] font-black uppercase text-brand-muted block mb-1">Tiêu đề báo cáo</label>
                <input
                  name="reportTitle"
                  required
                  placeholder="Ví dụ: Báo cáo tài chính hoặc tình hình kho Quận 1..."
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-brand-accent bg-brand-bg font-bold text-brand-text focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-brand-muted block mb-1">Nội dung báo cáo chi tiết</label>
                <textarea
                  name="reportContent"
                  required
                  rows={4}
                  placeholder="Điền chi tiết các sự vụ phát sinh, số liệu quyết toán két, đề xuất điều chuyển..."
                  className="w-full px-3 py-2.5 border border-brand-border rounded-xl text-xs focus:outline-none focus:border-brand-accent bg-brand-bg text-brand-text focus:bg-white resize-none font-medium transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Gửi báo cáo lên Giám đốc
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col">
            <h3 className="text-xs font-black text-brand-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-success" />
              Lịch sử báo cáo đã nộp
            </h3>
            <p className="text-[10px] text-brand-muted mb-4">Các báo cáo đã gửi từ tài khoản của bạn.</p>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 flex-grow">
              {dailyReports
                .filter(r => r.userId === currentUser.id)
                .map((rep) => (
                  <div key={rep.id} className="p-3 bg-brand-bg border border-brand-border rounded-xl text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-brand-accent">{rep.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${rep.status === 'unread' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-success/10 text-brand-success'}`}>
                        {rep.status === 'unread' ? 'Chưa đọc' : 'Đã xem'}
                      </span>
                    </div>
                    <p className="text-[9px] text-brand-muted mt-1">Ngày gửi: {rep.createdAt}</p>
                    {rep.readAt && (
                      <p className="text-[9px] text-brand-success font-bold mt-1">Đã xem lúc: {rep.readAt}</p>
                    )}
                  </div>
                ))}
              {dailyReports.filter(r => r.userId === currentUser.id).length === 0 && (
                <p className="text-xs text-brand-muted italic py-12 text-center">Bạn chưa nộp báo cáo nào.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
