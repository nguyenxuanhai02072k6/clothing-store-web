'use client';

import React, { useState } from 'react';
import FinancialSVGCharts from './FinancialSVGCharts';
import ExecutiveMetricsGrid from './overview/ExecutiveMetricsGrid';
import PendingActionsPanel from './overview/PendingActionsPanel';
import StaffDailyClockCard from './overview/StaffDailyClockCard';
import DirectorDailyReportsHub from './overview/DirectorDailyReportsHub';

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
  liveTime,
  isQRScanned,
  setActiveTab,
  setStaffScheduleSubTab,
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
    return (p.branchStock?.[currentBranch] || 0) < 5;
  }).length;

  // Pending Actions
  const pendingOrders = allOrders.filter(o => o.status === 'pending' && (currentBranch === 'all' || o.branch === currentBranch));
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending' && (currentBranch === 'all' || r.branch === currentBranch));
  const pendingTransfers = transfers.filter(t => t.status === 'shipping' && (currentBranch === 'all' || t.toBranch === currentBranch));

  // Personal metrics for sales employees
  const personalAttendance = attendanceLogs.filter(log => log.userId === currentUser?.id);
  const personalShifts = shiftRequests.filter(s => s.userId === currentUser?.id && s.status === 'approved');

  // KPI Target (50,000,000 ₫ target per month)
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
          <ExecutiveMetricsGrid
            totalRevenue={totalRevenue}
            netProfit={netProfit}
            completedOrdersCount={completedOrdersCount}
            aov={aov}
            totalCosts={totalCosts}
            lowStockCount={lowStockCount}
            hoveredTooltip={hoveredTooltip}
            setHoveredTooltip={setHoveredTooltip}
          />

          {/* Quick Stats Target & Action items */}
          <PendingActionsPanel
            currentBranch={currentBranch}
            kpiPercentage={kpiPercentage}
            totalRevenue={totalRevenue}
            kpiTarget={kpiTarget}
            pendingOrders={pendingOrders}
            lowStockCount={lowStockCount}
            pendingLeaves={pendingLeaves}
            pendingTransfers={pendingTransfers}
            currentUserRole={currentUser?.role}
            setActiveTab={setActiveTab}
            setStaffScheduleSubTab={setStaffScheduleSubTab}
          />

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
        <StaffDailyClockCard
          currentUser={currentUser}
          personalShifts={personalShifts}
          announcements={announcements}
          liveTime={liveTime}
          personalAttendance={personalAttendance}
          attendanceChecklist={attendanceChecklist}
          setAttendanceChecklist={setAttendanceChecklist}
          attendanceClosingChecklist={attendanceClosingChecklist}
          setAttendanceClosingChecklist={setAttendanceClosingChecklist}
          checkIn={checkIn}
          checkOut={checkOut}
          isGPSCorrect={isGPSCorrect}
          isQRScanned={isQRScanned}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Daily reports submit and read section for owners/managers/accountants */}
      <DirectorDailyReportsHub
        currentUser={currentUser}
        dailyReports={dailyReports}
        viewingReportId={viewingReportId}
        setViewingReportId={setViewingReportId}
        markReportAsRead={markReportAsRead}
        submitDailyReport={submitDailyReport}
      />
    </div>
  );
}
