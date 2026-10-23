'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { getAuditLogsAction } from '../../lib/actions/staffActions';

// Layout & Subsystem Components
import AppSidebar from '../../components/internal/AppSidebar';
import AppHeader from '../../components/internal/AppHeader';
import ConfirmDialog from '../../components/internal/ConfirmDialog';
import OverviewDashboard from '../../components/internal/OverviewDashboard';
import { InternalTabRenderer } from '../../components/internal/tabs/InternalTabRenderer';

// Custom Domain Hooks
import { useInternalNavigationState } from '../../components/internal/hooks/useInternalNavigationState';
import { useInternalSubsystemsState } from '../../components/internal/hooks/useInternalSubsystemsState';
import { useInternalFinanceCalculations } from '../../components/internal/hooks/useInternalFinanceCalculations';

import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InternalDashboardPage() {
  const {
    currentUser,
    isAuthLoaded,
    usersList,
    productsList,
    attendanceLogs,
    leaveRequests,
    salaryRequests,
    dailyReports,
    branchStock,
    branchSizeStock,
    refreshInventoryStocks,
    logout,
    checkIn,
    checkOut,
    submitLeaveRequest,
    approveLeaveRequest,
    restockBranchProduct,
    approveRestockRequest,
    rejectRestockRequest,
    updateGlobalProductPrice,
    updateGlobalProductDetails,
    submitSalaryRequest,
    approveSalaryRequest,
    submitDailyReport,
    markReportAsRead,
    allOrders,
    createOrder,
    updateOrderStatus,
    payrollRecords,
    paySalary,
    expensesList,
    addExpense,
    deleteExpense,
    addPayrollRecord,
    restockRecords,
    register,
    deleteUser,
    shiftRequests,
    announcements,
    sendAnnouncement,
    deleteAnnouncement,
    addGlobalProduct,
    deleteGlobalProduct,
    addShiftDirectly,
    deleteShiftRequest,
    shiftSwapRequests,
    submitSwapRequest,
    respondToSwapRequest,
  } = useAuth() as any;

  const router = useRouter();
  const { chatSessions, waitingSessions, activeSessions, acceptSession, sendCskhMessage, closeSession, unreadCount } = useChat();
  const { showToast } = useToast();

  // Navigation & Sub-tabs State
  const nav = useInternalNavigationState({ currentUser });

  // Subsystems State (POS, Transfers, Damaged Goods, CRM, Reconciliations, AI Marketing)
  const subsystemsState = useInternalSubsystemsState();

  // Finance Calculations & Tax Records
  const finance = useInternalFinanceCalculations({
    allOrders,
    expensesList,
    restockRecords,
    payrollRecords,
  });

  // Overview Report State
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);

  // GPS / Attendance States for Overview
  const [attendanceChecklist, setAttendanceChecklist] = useState<Record<string, boolean>>({
    cleanShelves: false,
    alignProducts: false,
    checkDrawer: false,
  });
  const [attendanceClosingChecklist, setAttendanceClosingChecklist] = useState<Record<string, boolean>>({
    cashAudit: false,
    cleanWorkspace: false,
    turnOffAppliances: false,
  });
  const [isGPSCorrect] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isQRScanned, setIsQRScanned] = useState(false);

  // Live Clock State
  const [liveTime, setLiveTime] = useState('');
  useEffect(() => {
    setLiveTime(new Date().toLocaleTimeString('vi-VN'));
    const interval = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (reason?: string) => void;
    requireReason?: boolean;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    requireReason: false,
    isDanger: false,
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const fetchAuditLogs = async () => {
    try {
      const logs = await getAuditLogsAction();
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Lỗi tải nhật ký:', err);
    }
  };

  useEffect(() => {
    if (
      (nav.activeTab === 'audit-logs' ||
        (nav.activeTab === 'settings-roles' && nav.settingsRolesSubTab === 'audit-logs')) &&
      currentUser?.role === 'director'
    ) {
      fetchAuditLogs();
    }
  }, [nav.activeTab, nav.settingsRolesSubTab, currentUser?.role]);

  // Redirect guest or customer users back to /account storefront
  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!currentUser || currentUser.role === 'customer') {
      router.push('/account');
    }
  }, [currentUser, isAuthLoaded, router]);

  // KPI calculations for Overview Tab
  const completedOrders = allOrders.filter((o: any) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum: number, o: any) => sum + o.total, 0);
  const completedOrdersCount = completedOrders.length;
  const conversionRate = '3.4%';
  const totalExpenses = expensesList.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalSalaries = payrollRecords.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.salary, 0);
  const totalCOGS = totalRevenue * 0.4;
  const totalImportCost = restockRecords.filter((r: any) => r.status === 'approved').reduce((sum: number, r: any) => sum + (r.cost || 0), 0);
  const netProfit = totalRevenue - totalCOGS - totalExpenses - totalImportCost - totalSalaries;

  const productSales: Record<string, number> = {};
  completedOrders.forEach((o: any) => {
    o.items?.forEach((item: any) => {
      const name = item.product?.name || item.name || 'Sản phẩm';
      productSales[name] = (productSales[name] || 0) + item.quantity;
    });
  });
  let bestSellerName = 'Áo Thun Premium';
  let maxSalesQty = 0;
  Object.entries(productSales).forEach(([name, qty]) => {
    if (qty > maxSalesQty) {
      maxSalesQty = qty;
      bestSellerName = name;
    }
  });

  const lowStockCount = productsList.filter((p: any) => p.stock < 5).length;
  const pendingOrdersCount = allOrders.filter((o: any) => o.status === 'pending').length;
  const pendingHrCount =
    (leaveRequests || []).filter((r: any) => r.status === 'pending').length +
    (shiftRequests || []).filter((r: any) => r.status === 'pending').length;
  const announcementsCount = (announcements || []).length;
  const returnRate = '1.2%';

  if (!isAuthLoaded || !currentUser || currentUser.role === 'customer') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-brand-bg flex flex-col lg:flex-row text-brand-text">
      <AppSidebar
        currentUser={currentUser}
        activeTab={nav.activeTab}
        setActiveTab={nav.handleSidebarChange}
        isCollapsed={nav.isSidebarCollapsed}
        setIsCollapsed={nav.setIsSidebarCollapsed}
        isMobileOpen={nav.isMobileMenuOpen}
        setIsMobileOpen={nav.setIsMobileMenuOpen}
        logout={logout}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
        pendingHrCount={pendingHrCount}
        announcementsCount={announcementsCount}
      />

      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        <AppHeader
          currentUser={currentUser}
          activeTab={nav.activeTab}
          setActiveTab={nav.handleSidebarChange}
          selectedBranch={nav.selectedBranch}
          setSelectedBranch={nav.setSelectedBranch}
          allOrders={allOrders}
          productsList={productsList}
          crmClients={subsystemsState.crmClients}
          logout={logout}
          onQuickAction={nav.handleQuickAction}
        />

        <main className="flex-1 p-6 md:p-8 space-y-8 w-full max-w-[1700px] mx-auto px-4 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={nav.activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {nav.activeTab === 'overview' ? (
                <OverviewDashboard
                  currentUser={currentUser}
                  allOrders={allOrders}
                  expensesList={expensesList}
                  payrollRecords={payrollRecords}
                  restockRecords={restockRecords}
                  productsList={productsList}
                  usersList={usersList}
                  selectedBranch={nav.selectedBranch}
                  dailyReports={dailyReports}
                  viewingReportId={viewingReportId}
                  setViewingReportId={setViewingReportId}
                  markReportAsRead={markReportAsRead}
                  submitDailyReport={submitDailyReport}
                  attendanceLogs={attendanceLogs}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  attendanceChecklist={attendanceChecklist}
                  setAttendanceChecklist={setAttendanceChecklist}
                  attendanceClosingChecklist={attendanceClosingChecklist}
                  setAttendanceClosingChecklist={setAttendanceClosingChecklist}
                  isGPSCorrect={isGPSCorrect}
                  showQRScanner={showQRScanner}
                  setShowQRScanner={setShowQRScanner}
                  isQRScanned={isQRScanned}
                  setIsQRScanned={setIsQRScanned}
                  liveTime={liveTime}
                  setActiveTab={nav.handleSidebarChange}
                  shiftRequests={shiftRequests}
                  leaveRequests={leaveRequests}
                  announcements={announcements}
                  transfers={subsystemsState.transfers}
                />
              ) : (
                <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 min-h-[600px] flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div>
                    {/* Horizontal Sub-tabs Navigation */}
                    {(() => {
                      const subTabs = nav.getSubTabs();
                      const currentSubTab =
                        nav.activeTab === 'sales-orders'
                          ? nav.salesOrdersSubTab
                          : nav.activeTab === 'products-inventory' ||
                            nav.activeTab === 'stocker-inventory' ||
                            nav.activeTab === 'stocker-transfer' ||
                            nav.activeTab === 'damaged-goods' ||
                            nav.activeTab === 'restock' ||
                            nav.activeTab === 'products-database'
                          ? nav.activeTab === 'stocker-inventory'
                            ? 'matrix'
                            : nav.activeTab === 'stocker-transfer'
                            ? 'transfer'
                            : nav.activeTab === 'damaged-goods'
                            ? 'damaged'
                            : nav.activeTab === 'restock'
                            ? 'restock'
                            : nav.activeTab === 'products-database'
                            ? 'list'
                            : nav.productsInventorySubTab
                          : nav.activeTab === 'staff-schedule'
                          ? nav.staffScheduleSubTab
                          : nav.activeTab === 'attendance'
                          ? nav.attendanceSubTab
                          : nav.activeTab === 'finance-profit'
                          ? nav.financeProfitSubTab
                          : nav.activeTab === 'promotions'
                          ? nav.promotionsSubTab
                          : nav.activeTab === 'settings-roles' ||
                            nav.activeTab === 'settings' ||
                            nav.activeTab === 'announcements' ||
                            nav.activeTab === 'audit-logs'
                          ? nav.activeTab === 'announcements'
                            ? 'announcements'
                            : nav.activeTab === 'audit-logs'
                            ? 'audit-logs'
                            : nav.activeTab === 'settings'
                            ? 'brand'
                            : nav.settingsRolesSubTab
                          : nav.activeTab === 'customers'
                          ? nav.customersSubTab
                          : '';

                      if (subTabs.length === 0) return null;
                      return (
                        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-neutral-100/70 select-none">
                          {subTabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => nav.setCurrentSubTab(tab.id)}
                              className={`px-4 py-2 border text-xs font-bold transition-all text-center rounded-xl cursor-pointer active:scale-95 ${
                                currentSubTab === tab.id
                                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                                  : 'bg-white text-neutral-500 border-neutral-200 hover:text-neutral-800'
                              }`}
                            >
                              {tab.name}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Tab and Subsystem Domain Content Renderer */}
                    <InternalTabRenderer
                      activeTab={nav.activeTab}
                      salesOrdersSubTab={nav.salesOrdersSubTab}
                      productsInventorySubTab={nav.productsInventorySubTab}
                      staffScheduleSubTab={nav.staffScheduleSubTab}
                      attendanceSubTab={nav.attendanceSubTab}
                      financeProfitSubTab={nav.financeProfitSubTab}
                      promotionsSubTab={nav.promotionsSubTab}
                      settingsRolesSubTab={nav.settingsRolesSubTab}
                      customersSubTab={nav.customersSubTab}
                      currentUser={currentUser}
                      usersList={usersList}
                      productsList={productsList}
                      branchStock={branchStock}
                      branchSizeStock={branchSizeStock}
                      restockBranchProduct={restockBranchProduct}
                      refreshInventoryStocks={refreshInventoryStocks}
                      onSwitchToTransferTab={() => {
                        nav.setActiveTab('stocker-transfer');
                        nav.setProductsInventorySubTab('transfer');
                      }}
                      allOrders={allOrders}
                      createOrder={createOrder}
                      payrollRecords={payrollRecords}
                      paySalary={paySalary}
                      expensesList={expensesList}
                      addExpense={addExpense}
                      deleteExpense={deleteExpense}
                      addPayrollRecord={addPayrollRecord}
                      restockRecords={restockRecords}
                      attendanceLogs={attendanceLogs}
                      shiftRequests={shiftRequests}
                      shiftSwapRequests={shiftSwapRequests}
                      leaveRequests={leaveRequests}
                      salaryRequests={salaryRequests}
                      dailyReports={dailyReports}
                      viewingReportId={viewingReportId}
                      setViewingReportId={setViewingReportId}
                      markReportAsRead={markReportAsRead}
                      submitDailyReport={submitDailyReport}
                      submitLeaveRequest={submitLeaveRequest}
                      submitSalaryRequest={submitSalaryRequest}
                      approveLeaveRequest={approveLeaveRequest}
                      approveSalaryRequest={approveSalaryRequest}
                      approveRestockRequest={approveRestockRequest}
                      rejectRestockRequest={rejectRestockRequest}
                      updateGlobalProductPrice={updateGlobalProductPrice}
                      updateGlobalProductDetails={updateGlobalProductDetails}
                      addGlobalProduct={addGlobalProduct}
                      deleteGlobalProduct={deleteGlobalProduct}
                      addShiftDirectly={addShiftDirectly}
                      deleteShiftRequest={deleteShiftRequest}
                      submitSwapRequest={submitSwapRequest}
                      respondToSwapRequest={respondToSwapRequest}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      register={register}
                      deleteUser={deleteUser}
                      sendAnnouncement={sendAnnouncement}
                      deleteAnnouncement={deleteAnnouncement}
                      announcements={announcements}
                      updateOrderStatus={updateOrderStatus}
                      showToast={showToast}
                      selectedBranch={nav.selectedBranch}
                      liveTime={liveTime}
                      auditLogs={auditLogs}
                      fetchAuditLogs={fetchAuditLogs}
                      taxRecords={finance.taxRecords}
                      getDailyFinances={finance.getDailyFinances}
                      getPeriodFinances={finance.getPeriodFinances}
                      calculateDynamicPITForSalary={finance.calculateDynamicPITForSalary}
                      handleSaveTaxRecord={finance.handleSaveTaxRecord}
                      handleDeleteTaxRecord={finance.handleDeleteTaxRecord}
                      exportTaxRecordsToCSV={finance.exportTaxRecordsToCSV}
                      exportDailyPLToCSV={finance.exportDailyPLToCSV}
                      exportPLToCSV={finance.exportPLToCSV}
                      subsystemsState={subsystemsState}
                      chatSessions={chatSessions}
                      waitingSessions={waitingSessions}
                      activeSessions={activeSessions}
                      acceptSession={acceptSession}
                      sendCskhMessage={sendCskhMessage}
                      closeSession={closeSession}
                      unreadCount={unreadCount}
                      totalRevenue={totalRevenue}
                      completedOrdersCount={completedOrdersCount}
                      conversionRate={conversionRate}
                      netProfit={netProfit}
                      bestSellerName={bestSellerName}
                      lowStockCount={lowStockCount}
                      pendingOrdersCount={pendingOrdersCount}
                      returnRate={returnRate}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        requireReason={confirmState.requireReason}
        isDanger={confirmState.isDanger}
      />
    </div>
  );
}
