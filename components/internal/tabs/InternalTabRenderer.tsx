'use client';

import React from 'react';
import { ERPSubsystems } from '../ERPSubsystems';
import PermissionGuard from '../PermissionGuard';
import CampaignCopilot from '../CampaignCopilot';

// Domain-Driven Tab Components
import StaffShiftOverviewTab from './StaffShiftOverviewTab';
import ManagerStaffApprovalTab from './ManagerStaffApprovalTab';
import StaffAccountDirectoryTab from './StaffAccountDirectoryTab';
import AnnouncementsTab from './AnnouncementsTab';
import DirectorOperationsTab from './DirectorOperationsTab';
import DirectorPLViewTab from './DirectorPLViewTab';
import SalesOrdersManagerTab from './SalesOrdersManagerTab';
import CustomerReviewsTab from './CustomerReviewsTab';
import ExpensesManagementTab from './ExpensesManagementTab';
import RestockOperationsTab from './RestockOperationsTab';
import CSKHLiveChatHubTab from './CSKHLiveChatHubTab';
import EmployeeTimeClockTab from './EmployeeTimeClockTab';
import EmployeeRequestsTab from './EmployeeRequestsTab';
import BranchStockViewTab from './BranchStockViewTab';
import ManagerReportsTab from './ManagerReportsTab';
import AccountantPayrollTab from './AccountantPayrollTab';
import AccountantFinancePLTab from './AccountantFinancePLTab';
import CustomersLoyaltyTab from './CustomersLoyaltyTab';
import UserProfileOverviewTab from './UserProfileOverviewTab';
import { calculatePIT } from '../../../types';

interface InternalTabRendererProps {
  activeTab: string;
  salesOrdersSubTab: string;
  productsInventorySubTab: string;
  staffScheduleSubTab: string;
  attendanceSubTab: string;
  financeProfitSubTab: string;
  promotionsSubTab: string;
  settingsRolesSubTab: string;
  customersSubTab: string;
  currentUser: any;
  usersList: any[];
  productsList: any[];
  branchStock: any;
  branchSizeStock: any;
  restockBranchProduct: any;
  refreshInventoryStocks: any;
  onSwitchToTransferTab: () => void;
  allOrders: any[];
  createOrder: any;
  payrollRecords: any[];
  paySalary: any;
  expensesList: any[];
  addExpense: any;
  deleteExpense: any;
  addPayrollRecord: any;
  restockRecords: any[];
  attendanceLogs: any[];
  shiftRequests: any[];
  shiftSwapRequests: any[];
  leaveRequests: any[];
  salaryRequests: any[];
  dailyReports: any[];
  viewingReportId: string | null;
  setViewingReportId: (id: string | null) => void;
  markReportAsRead: any;
  submitDailyReport: any;
  submitLeaveRequest: any;
  submitSalaryRequest: any;
  approveLeaveRequest: any;
  approveSalaryRequest: any;
  approveRestockRequest: any;
  rejectRestockRequest: any;
  updateGlobalProductPrice: any;
  updateGlobalProductDetails: any;
  addGlobalProduct: any;
  deleteGlobalProduct: any;
  addShiftDirectly: any;
  deleteShiftRequest: any;
  submitSwapRequest: any;
  respondToSwapRequest: any;
  checkIn: any;
  checkOut: any;
  register: any;
  deleteUser: any;
  sendAnnouncement: any;
  deleteAnnouncement: any;
  announcements: any[];
  updateOrderStatus: any;
  showToast: any;
  selectedBranch: string;
  liveTime: string;
  auditLogs: any[];
  fetchAuditLogs: () => Promise<void>;
  taxRecords: any[];
  getDailyFinances: () => any[];
  getPeriodFinances: (period: string) => any;
  calculateDynamicPITForSalary: (gross: number, personalDeduct: number, depDeduct: number, dependents: number) => number;
  handleSaveTaxRecord: (record: any) => void;
  handleDeleteTaxRecord: (id: string) => void;
  exportTaxRecordsToCSV: (records: any[]) => void;
  exportDailyPLToCSV: (records: any[]) => void;
  exportPLToCSV: (records: any[]) => void;
  // Subsystem states
  subsystemsState: any;
  // Chat context
  chatSessions: any[];
  waitingSessions: any[];
  activeSessions: any[];
  acceptSession: any;
  sendCskhMessage: any;
  closeSession: any;
  unreadCount: number;
  // KPI Metrics
  totalRevenue: number;
  completedOrdersCount: number;
  conversionRate: string;
  netProfit: number;
  bestSellerName: string;
  lowStockCount: number;
  pendingOrdersCount: number;
  returnRate: string;
}

export const InternalTabRenderer: React.FC<InternalTabRendererProps> = ({
  activeTab,
  salesOrdersSubTab,
  productsInventorySubTab,
  staffScheduleSubTab,
  attendanceSubTab,
  financeProfitSubTab,
  promotionsSubTab,
  settingsRolesSubTab,
  customersSubTab,
  currentUser,
  usersList,
  productsList,
  branchStock,
  branchSizeStock,
  restockBranchProduct,
  refreshInventoryStocks,
  onSwitchToTransferTab,
  allOrders,
  createOrder,
  payrollRecords,
  paySalary,
  expensesList,
  addExpense,
  deleteExpense,
  addPayrollRecord,
  restockRecords,
  attendanceLogs,
  shiftRequests,
  shiftSwapRequests,
  leaveRequests,
  salaryRequests,
  dailyReports,
  viewingReportId,
  setViewingReportId,
  markReportAsRead,
  submitDailyReport,
  submitLeaveRequest,
  submitSalaryRequest,
  approveLeaveRequest,
  approveSalaryRequest,
  approveRestockRequest,
  rejectRestockRequest,
  updateGlobalProductPrice,
  updateGlobalProductDetails,
  addGlobalProduct,
  deleteGlobalProduct,
  addShiftDirectly,
  deleteShiftRequest,
  submitSwapRequest,
  respondToSwapRequest,
  checkIn,
  checkOut,
  register,
  deleteUser,
  sendAnnouncement,
  deleteAnnouncement,
  announcements,
  updateOrderStatus,
  showToast,
  selectedBranch,
  liveTime,
  auditLogs,
  fetchAuditLogs,
  taxRecords,
  getDailyFinances,
  getPeriodFinances,
  calculateDynamicPITForSalary,
  handleSaveTaxRecord,
  handleDeleteTaxRecord,
  exportTaxRecordsToCSV,
  exportDailyPLToCSV,
  exportPLToCSV,
  subsystemsState,
  chatSessions,
  waitingSessions,
  activeSessions,
  acceptSession,
  sendCskhMessage,
  closeSession,
  unreadCount,
  totalRevenue,
  completedOrdersCount,
  conversionRate,
  netProfit,
  bestSellerName,
  lowStockCount,
  pendingOrdersCount,
  returnRate,
}) => {
  return (
    <>
      {/* Tab Level Permission Guards */}
      {activeTab === 'finance-profit' && !['director', 'accountant', 'manager'].includes(currentUser.role) && (
        <PermissionGuard allowedRoles={['director', 'accountant', 'manager']} currentUser={currentUser}>
          <div />
        </PermissionGuard>
      )}
      {activeTab === 'settings-roles' && !['director', 'accountant', 'manager'].includes(currentUser.role) && (
        <PermissionGuard allowedRoles={['director', 'accountant', 'manager']} currentUser={currentUser}>
          <div />
        </PermissionGuard>
      )}

      {/* --- ERP SUBSYSTEMS INTEGRATION HUB --- */}
      <ERPSubsystems
        activeTab={
          activeTab === 'pos-sales' || (activeTab === 'sales-orders' && salesOrdersSubTab === 'pos') ? 'pos-sales' :
          activeTab === 'stocker-inventory' || (activeTab === 'products-inventory' && productsInventorySubTab === 'matrix') ? 'stocker-inventory' :
          activeTab === 'stocker-transfer' || (activeTab === 'products-inventory' && productsInventorySubTab === 'transfer') ? 'stocker-transfer' :
          activeTab === 'damaged-goods' || (activeTab === 'products-inventory' && productsInventorySubTab === 'damaged') ? 'damaged-goods' :
          activeTab === 'products-database' || (activeTab === 'products-inventory' && productsInventorySubTab === 'list') ? 'products-database' :
          activeTab === 'returns-exchange' || (activeTab === 'sales-orders' && salesOrdersSubTab === 'returns') ? 'returns-exchange' :
          activeTab === 'customers-list' || activeTab === 'cskh-hub' || activeTab === 'customers' || activeTab === 'cskh-customers' ? 'customers-list' :
          activeTab === 'customers-vip' ? 'cskh-customers-vip' :
          activeTab === 'finance-recon' || activeTab === 'recon' || (activeTab === 'finance-profit' && financeProfitSubTab === 'recon') ? 'accountant-finance-recon' :
          activeTab === 'finance-payroll' ? 'accountant-kpi-payroll' :
          activeTab === 'ai-copilot' || (activeTab === 'promotions' && promotionsSubTab === 'ai-marketing') ? 'ai-copilot' :
          activeTab === 'coupons-management' || (activeTab === 'promotions' && promotionsSubTab === 'coupons') ? 'coupons-management' :
          activeTab === 'settings' || activeTab === 'settings-tab' || (activeTab === 'settings-roles' && settingsRolesSubTab === 'brand') ? 'settings-tab' :
          activeTab === 'settings-roles' && settingsRolesSubTab === 'channels' ? 'omnichannel' :
          activeTab
        }
        currentUser={currentUser}
        usersList={usersList}
        productsList={productsList}
        branchStock={branchStock}
        restockBranchProduct={restockBranchProduct}
        refreshInventoryStocks={refreshInventoryStocks}
        onSwitchToTransferTab={onSwitchToTransferTab}
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
        showToast={showToast}
        {...subsystemsState}
      />

      {/* --- DOMAIN TABS IMPLEMENTATION --- */}

      {/* 1. Staff Shift Overview Grid */}
      {(activeTab === 'manager-shift-overview' || activeTab === 'shifts' || (activeTab === 'attendance' && attendanceSubTab === 'shifts') || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'shifts')) && ['director', 'manager', 'accountant'].includes(currentUser.role) && (
        <StaffShiftOverviewTab
          currentUser={currentUser}
          usersList={usersList}
          shiftRequests={shiftRequests}
          leaveRequests={leaveRequests}
          addShiftDirectly={addShiftDirectly}
          deleteShiftRequest={deleteShiftRequest}
        />
      )}

      {/* 2. AI Marketing Copilot */}
      {(activeTab === 'campaigns' || (activeTab === 'promotions' && promotionsSubTab === 'ai-marketing')) && currentUser.role === 'cskh' && (
        <CampaignCopilot currentUser={currentUser} usersList={usersList} />
      )}

      {/* 3. User Profile & Intranet Overview */}
      {(activeTab === 'profile' || (activeTab === 'overview' && ['director', 'accountant', 'manager', 'cskh'].includes(currentUser.role))) && (
        <UserProfileOverviewTab
          currentUser={currentUser}
          announcements={announcements}
          allOrders={allOrders}
          expensesList={expensesList}
          productsList={productsList}
          dailyReports={dailyReports}
          viewingReportId={viewingReportId}
          setViewingReportId={setViewingReportId}
          markReportAsRead={markReportAsRead}
          submitDailyReport={submitDailyReport}
          totalRevenue={totalRevenue}
          completedOrdersCount={completedOrdersCount}
          conversionRate={conversionRate}
          netProfit={netProfit}
          bestSellerName={bestSellerName}
          lowStockCount={lowStockCount}
          pendingOrdersCount={pendingOrdersCount}
          returnRate={returnRate}
        />
      )}

      {/* 4. Employee Time Clock & Attendance Radar */}
      {(activeTab === 'employee-shifts-clock' || 
        (activeTab === 'attendance' && (attendanceSubTab === 'clock' || (!['director', 'manager', 'accountant'].includes(currentUser.role) && attendanceSubTab !== 'requests'))) || 
        (activeTab === 'overview' && ['employee', 'cashier', 'stocker', 'cskh'].includes(currentUser.role)) || 
        (activeTab === 'staff-schedule' && ['employee', 'cashier', 'stocker', 'cskh'].includes(currentUser.role) && staffScheduleSubTab === 'shifts')) && (
        <EmployeeTimeClockTab
          currentUser={currentUser}
          selectedBranch={selectedBranch}
          shiftRequests={shiftRequests}
          shiftSwapRequests={shiftSwapRequests}
          attendanceLogs={attendanceLogs}
          checkIn={checkIn}
          checkOut={checkOut}
          submitSwapRequest={submitSwapRequest}
          respondToSwapRequest={respondToSwapRequest}
          showToast={showToast}
          liveTime={liveTime}
        />
      )}

      {/* 5. Branch Stock View */}
      {(activeTab === 'branch-stock' || (activeTab === 'products-inventory' && productsInventorySubTab === 'matrix')) && ['employee', 'cashier'].includes(currentUser.role) && currentUser.branch && (
        <BranchStockViewTab
          currentUser={currentUser}
          productsList={productsList}
          branchStock={branchStock}
          branchSizeStock={branchSizeStock}
        />
      )}

      {/* 6. Employee HR Requests */}
      {(activeTab === 'employee-hr-requests' || (activeTab === 'attendance' && attendanceSubTab === 'requests') || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'requests')) && ['employee', 'cashier', 'stocker', 'cskh'].includes(currentUser.role) && (
        <EmployeeRequestsTab
          currentUser={currentUser}
          leaveRequests={leaveRequests}
          salaryRequests={salaryRequests}
          submitLeaveRequest={submitLeaveRequest}
          submitSalaryRequest={submitSalaryRequest}
        />
      )}

      {/* 7. Manager Staff Approval Console */}
      {(activeTab === 'manager-staff-console' || 
        (activeTab === 'attendance' && (attendanceSubTab === 'approval' || (['director', 'manager', 'accountant'].includes(currentUser.role) && attendanceSubTab !== 'clock' && attendanceSubTab !== 'shifts'))) || 
        (activeTab === 'staff-schedule' && staffScheduleSubTab === 'approval')) && 
       ['director', 'manager', 'accountant'].includes(currentUser.role) && (
        <ManagerStaffApprovalTab
          currentUser={currentUser}
          selectedBranch={selectedBranch}
          leaveRequests={leaveRequests}
          attendanceLogs={attendanceLogs}
          shiftRequests={shiftRequests}
          approveLeaveRequest={approveLeaveRequest}
        />
      )}

      {/* 8. Restock Operations */}
      {((activeTab === 'manager-stock' || activeTab === 'accountant-operations' || activeTab === 'restock' || (activeTab === 'products-inventory' && productsInventorySubTab === 'restock')) && ['director', 'manager', 'accountant', 'stocker'].includes(currentUser.role)) && (
        <RestockOperationsTab
          currentUser={currentUser}
          productsList={productsList}
          branchStock={branchStock}
          branchSizeStock={branchSizeStock}
          restockRecords={restockRecords}
          restockBranchProduct={restockBranchProduct}
          approveRestockRequest={approveRestockRequest}
          rejectRestockRequest={rejectRestockRequest}
          submitDailyReport={submitDailyReport}
          showToast={showToast}
        />
      )}

      {/* 9. Staff Account Directory */}
      {(activeTab === 'staff-schedule' && staffScheduleSubTab === 'staff') && ['director', 'manager', 'accountant'].includes(currentUser.role) && (
        <StaffAccountDirectoryTab
          currentUser={currentUser}
          usersList={usersList}
          selectedBranch={selectedBranch}
          register={register}
          showToast={showToast}
        />
      )}

      {/* 10. Manager Reports */}
      {(activeTab === 'manager-reports-requests' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'directives')) && currentUser.role === 'manager' && (
        <ManagerReportsTab submitDailyReport={submitDailyReport} />
      )}

      {/* 11. Announcements & Directives Hub */}
      {(activeTab === 'announcements' || (activeTab === 'settings-roles' && settingsRolesSubTab === 'announcements')) && ['director', 'manager', 'accountant'].includes(currentUser.role) && (
        <AnnouncementsTab
          currentUser={currentUser}
          announcements={announcements}
          sendAnnouncement={sendAnnouncement}
          deleteAnnouncement={deleteAnnouncement}
          showToast={showToast}
        />
      )}

      {/* 12. Director Operations, Global Price Editor, Audit Logs */}
      {(activeTab === 'director-operations' || (activeTab === 'audit-logs' || (activeTab === 'settings-roles' && settingsRolesSubTab === 'audit-logs')) || (activeTab === 'director-hr-payroll' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'payroll' && currentUser.role === 'director'))) && currentUser.role === 'director' && (
        <DirectorOperationsTab
          currentUser={currentUser}
          subTab={
            activeTab === 'audit-logs' || (activeTab === 'settings-roles' && settingsRolesSubTab === 'audit-logs')
              ? 'audit'
              : activeTab === 'director-hr-payroll' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'payroll')
              ? 'payroll'
              : 'pricing'
          }
          productsList={productsList}
          auditLogs={auditLogs}
          fetchAuditLogs={fetchAuditLogs}
          updateGlobalProductPrice={updateGlobalProductPrice}
          updateGlobalProductDetails={updateGlobalProductDetails}
          deleteGlobalProduct={deleteGlobalProduct}
          salaryRequests={salaryRequests}
          approveSalaryRequest={approveSalaryRequest}
          usersList={usersList}
          payrollRecords={payrollRecords}
        />
      )}

      {/* 13. Director Global Finance & P&L */}
      {(activeTab === 'director-global-finance' || activeTab === 'finance-p-l' || (activeTab === 'finance-profit' && financeProfitSubTab === 'p-l')) && currentUser.role === 'director' && (
        <DirectorPLViewTab
          currentUser={currentUser}
          allOrders={allOrders}
          restockRecords={restockRecords}
          expensesList={expensesList}
          usersList={usersList}
          productsList={productsList}
          taxRecords={taxRecords}
          getDailyFinances={getDailyFinances}
          calculatePIT={calculatePIT}
          exportTaxRecordsToCSV={exportTaxRecordsToCSV}
          exportDailyPLToCSV={exportDailyPLToCSV}
          exportPLToCSV={exportPLToCSV}
        />
      )}

      {/* 14. Accountant Payroll & Staff Operations */}
      {(activeTab === 'accountant-hr-payroll' || activeTab === 'finance-payroll' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'payroll')) && currentUser.role === 'accountant' && (
        <AccountantPayrollTab
          currentUser={currentUser}
          usersList={usersList}
          attendanceLogs={attendanceLogs}
          shiftRequests={shiftRequests}
          payrollRecords={payrollRecords}
          register={register}
          deleteUser={deleteUser}
          addPayrollRecord={addPayrollRecord}
          paySalary={paySalary}
        />
      )}

      {/* 15. Accountant Global Finance, Tax Settlement & Product CRUD */}
      {(activeTab === 'accountant-global-finance' || activeTab === 'finance-p-l' || (activeTab === 'finance-profit' && financeProfitSubTab === 'p-l')) && currentUser.role === 'accountant' && (
        <AccountantFinancePLTab
          currentUser={currentUser}
          allOrders={allOrders}
          restockRecords={restockRecords}
          expensesList={expensesList}
          usersList={usersList}
          productsList={productsList}
          taxRecords={taxRecords}
          getDailyFinances={getDailyFinances}
          getPeriodFinances={getPeriodFinances}
          calculateDynamicPITForSalary={calculateDynamicPITForSalary}
          handleSaveTaxRecord={handleSaveTaxRecord}
          handleDeleteTaxRecord={handleDeleteTaxRecord}
          exportTaxRecordsToCSV={exportTaxRecordsToCSV}
          exportDailyPLToCSV={exportDailyPLToCSV}
          exportPLToCSV={exportPLToCSV}
          updateGlobalProductPrice={updateGlobalProductPrice}
          updateGlobalProductDetails={updateGlobalProductDetails}
          deleteGlobalProduct={deleteGlobalProduct}
          addGlobalProduct={addGlobalProduct}
        />
      )}

      {/* 16. Expenses Management */}
      {((activeTab === 'finance-profit' && financeProfitSubTab === 'costs') || activeTab === 'costs' || activeTab === 'finance-costs') && ['director', 'accountant', 'manager'].includes(currentUser.role) && (
        <ExpensesManagementTab
          expensesList={expensesList}
          addExpense={addExpense}
          deleteExpense={deleteExpense}
          showToast={showToast}
        />
      )}

      {/* 17. CSKH Live Chat Hub */}
      {(activeTab === 'cskh-hub' || activeTab === 'cskh-live-chat' || (activeTab === 'sales-orders' && salesOrdersSubTab === 'chat')) && ['cskh', 'director', 'manager'].includes(currentUser.role) && (
        <CSKHLiveChatHubTab
          currentUser={currentUser}
          chatSessions={chatSessions}
          waitingSessions={waitingSessions}
          activeSessions={activeSessions}
          acceptSession={acceptSession}
          sendCskhMessage={sendCskhMessage}
          closeSession={closeSession}
          unreadCount={unreadCount}
        />
      )}

      {/* 18. Customer Loyalty & VIP Profiles */}
      {(activeTab === 'customers-list' || activeTab === 'cskh-customers' || (activeTab === 'customers' && customersSubTab === 'list')) && ['director', 'manager', 'accountant', 'cskh'].includes(currentUser.role) && (
        <CustomersLoyaltyTab usersList={usersList} />
      )}

      {/* 19. Sales Orders Directory & Modal Timeline */}
      {(activeTab === 'sales-orders-list' || activeTab === 'cskh-orders' || (activeTab === 'sales-orders' && salesOrdersSubTab === 'list')) && ['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier'].includes(currentUser.role) && (
        <SalesOrdersManagerTab
          allOrders={allOrders}
          updateOrderStatus={updateOrderStatus}
          showToast={showToast}
        />
      )}

      {/* 20. Customer Reviews Moderation */}
      {(activeTab === 'reviews' || activeTab === 'cskh-reviews' || (activeTab === 'customers' && customersSubTab === 'reviews')) && ['director', 'manager', 'cskh'].includes(currentUser.role) && (
        <CustomerReviewsTab showToast={showToast} />
      )}
    </>
  );
};
