'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { calculatePIT } from '../../types';
import { getAuditLogsAction } from '../../lib/actions/staffActions';
import {
  getCRMClientsAction,
  getCSKHTicketsAction,
  getInventoryTransfersAction,
  getDamagedGoodsAction,
  getCashReconciliationsAction,
} from '../../lib/actions/erpActions';

// Core Layout & Subsystem Components
import CampaignCopilot from '../../components/internal/CampaignCopilot';
import { ERPSubsystems } from '../../components/internal/ERPSubsystems';
import AppSidebar from '../../components/internal/AppSidebar';
import AppHeader from '../../components/internal/AppHeader';
import ConfirmDialog from '../../components/internal/ConfirmDialog';
import OverviewDashboard from '../../components/internal/OverviewDashboard';
import PermissionGuard from '../../components/internal/PermissionGuard';

// Domain-Driven Tab Components
import StaffShiftOverviewTab from '@/components/internal/tabs/StaffShiftOverviewTab';
import ManagerStaffApprovalTab from '@/components/internal/tabs/ManagerStaffApprovalTab';
import StaffAccountDirectoryTab from '@/components/internal/tabs/StaffAccountDirectoryTab';
import AnnouncementsTab from '@/components/internal/tabs/AnnouncementsTab';
import DirectorOperationsTab from '@/components/internal/tabs/DirectorOperationsTab';
import DirectorPLViewTab from '@/components/internal/tabs/DirectorPLViewTab';
import SalesOrdersManagerTab from '@/components/internal/tabs/SalesOrdersManagerTab';
import CustomerReviewsTab from '@/components/internal/tabs/CustomerReviewsTab';
import ExpensesManagementTab from '@/components/internal/tabs/ExpensesManagementTab';
import RestockOperationsTab from '@/components/internal/tabs/RestockOperationsTab';
import CSKHLiveChatHubTab from '@/components/internal/tabs/CSKHLiveChatHubTab';
import EmployeeTimeClockTab from '@/components/internal/tabs/EmployeeTimeClockTab';
import EmployeeRequestsTab from '@/components/internal/tabs/EmployeeRequestsTab';
import BranchStockViewTab from '@/components/internal/tabs/BranchStockViewTab';
import ManagerReportsTab from '@/components/internal/tabs/ManagerReportsTab';
import AccountantPayrollTab from '@/components/internal/tabs/AccountantPayrollTab';
import AccountantFinancePLTab from '@/components/internal/tabs/AccountantFinancePLTab';
import CustomersLoyaltyTab from '@/components/internal/tabs/CustomersLoyaltyTab';
import UserProfileOverviewTab from '@/components/internal/tabs/UserProfileOverviewTab';

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
  const { dynamicPromos, addDynamicPromoCode, deleteDynamicPromoCode } = useCart() as any;

  // Active Tab & Subtabs
  const [activeTab, setActiveTab] = useState('overview');
  const [salesOrdersSubTab, setSalesOrdersSubTab] = useState('pos');
  const [productsInventorySubTab, setProductsInventorySubTab] = useState('list');
  const [staffScheduleSubTab, setStaffScheduleSubTab] = useState('shifts');
  const [attendanceSubTab, setAttendanceSubTab] = useState('clock');
  const [financeProfitSubTab, setFinanceProfitSubTab] = useState('p-l');
  const [promotionsSubTab, setPromotionsSubTab] = useState('coupons');
  const [settingsRolesSubTab, setSettingsRolesSubTab] = useState('brand');
  const [customersSubTab, setCustomersSubTab] = useState('list');

  const setCurrentSubTab = (id: string) => {
    if (activeTab === 'sales-orders') setSalesOrdersSubTab(id);
    else if (
      activeTab === 'products-inventory' ||
      activeTab === 'stocker-inventory' ||
      activeTab === 'stocker-transfer' ||
      activeTab === 'damaged-goods' ||
      activeTab === 'restock' ||
      activeTab === 'products-database'
    ) {
      setProductsInventorySubTab(id);
      if (id === 'matrix') setActiveTab('stocker-inventory');
      else if (id === 'transfer') setActiveTab('stocker-transfer');
      else if (id === 'damaged') setActiveTab('damaged-goods');
      else if (id === 'restock') setActiveTab('restock');
      else if (id === 'list') setActiveTab('products-database');
    }
    else if (activeTab === 'staff-schedule') setStaffScheduleSubTab(id);
    else if (activeTab === 'attendance') setAttendanceSubTab(id);
    else if (activeTab === 'finance-profit') setFinanceProfitSubTab(id);
    else if (activeTab === 'promotions') setPromotionsSubTab(id);
    else if (
      activeTab === 'settings-roles' ||
      activeTab === 'settings' ||
      activeTab === 'announcements' ||
      activeTab === 'audit-logs'
    ) {
      setSettingsRolesSubTab(id);
      if (id === 'announcements') setActiveTab('announcements');
      else if (id === 'brand') setActiveTab('settings');
      else if (id === 'channels') setActiveTab('settings-roles');
      else if (id === 'audit-logs') setActiveTab('audit-logs');
    }
    else if (activeTab === 'customers') setCustomersSubTab(id);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistent branch selection
  const [selectedBranch, setSelectedBranch] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('novyn_selected_branch') || 'all';
    }
    return 'all';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('novyn_selected_branch', selectedBranch);
    }
  }, [selectedBranch]);

  // Confirm dialog
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

  // Audit Logs
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
    if ((activeTab === 'audit-logs' || (activeTab === 'settings-roles' && settingsRolesSubTab === 'audit-logs')) && currentUser?.role === 'director') {
      fetchAuditLogs();
    }
  }, [activeTab, settingsRolesSubTab, currentUser?.role]);

  // Smart initial workspace routing based on role
  const hasInitializedRoleTab = useRef(false);
  useEffect(() => {
    if (!currentUser?.role || hasInitializedRoleTab.current) return;
    hasInitializedRoleTab.current = true;
    if (activeTab === 'overview') {
      if (['cashier', 'employee'].includes(currentUser.role)) {
        setActiveTab('pos-sales');
        setSalesOrdersSubTab('pos');
      } else if (currentUser.role === 'cskh') {
        setActiveTab('cskh-hub');
      } else if (currentUser.role === 'stocker') {
        setActiveTab('stocker-inventory');
        setProductsInventorySubTab('matrix');
      } else if (currentUser.role === 'accountant') {
        setActiveTab('finance-costs');
        setFinanceProfitSubTab('costs');
      }
    }
  }, [currentUser?.role, activeTab]);

  const getSubTabs = () => {
    switch (activeTab) {
      case 'sales-orders': {
        const tabs = [];
        if (['director', 'manager', 'employee', 'cashier'].includes(currentUser?.role)) {
          tabs.push({ id: 'pos', name: 'Quầy bán hàng POS' });
        }
        tabs.push({ id: 'list', name: 'Danh sách đơn hàng' });
        if (['director', 'manager', 'cskh', 'employee', 'cashier'].includes(currentUser?.role)) {
          tabs.push({ id: 'returns', name: 'Đổi trả & Khiếu nại' });
        }
        if (currentUser?.role === 'cskh') {
          tabs.push({ id: 'chat', name: 'Chat Trực tiếp' });
        }
        return tabs;
      }
      case 'products-inventory':
      case 'stocker-inventory':
      case 'stocker-transfer':
      case 'damaged-goods':
      case 'restock':
      case 'products-database': {
        const tabs = [
          { id: 'matrix', name: 'Tồn kho chi nhánh' },
          { id: 'transfer', name: 'Điều chuyển kho' },
          { id: 'damaged', name: 'Biên bản hàng lỗi' },
        ];
        if (['director', 'accountant', 'manager', 'stocker'].includes(currentUser?.role)) {
          tabs.push({ id: 'restock', name: 'Phiếu nhập hàng (Restock)' });
        }
        tabs.push({ id: 'list', name: 'Danh mục & Bảng giá' });
        return tabs;
      }
      case 'attendance': {
        if (['director', 'manager', 'accountant'].includes(currentUser?.role)) {
          return [
            { id: 'approval', name: 'Duyệt phép & Nhật ký chấm công' },
            { id: 'shifts', name: 'Lịch ca toàn chi nhánh' },
            { id: 'clock', name: 'Trạm chấm công cá nhân' },
          ];
        }
        return [
          { id: 'clock', name: 'Chấm công & Ca trực' },
          { id: 'requests', name: 'Đơn từ nghỉ phép' },
        ];
      }
      case 'staff-schedule': {
        const tabs = [
          { id: 'shifts', name: 'Lịch ca làm việc' },
        ];
        if (['director', 'manager', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'approval', name: 'Xếp lịch & Duyệt phép' });
          tabs.push({ id: 'staff', name: 'Nhân sự & Tạo tài khoản' });
        }
        if (['director', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'payroll', name: 'Lương & Hoa hồng' });
        }
        if (['employee', 'cashier', 'stocker', 'cskh'].includes(currentUser?.role)) {
          tabs.push({ id: 'requests', name: 'Đơn từ yêu cầu' });
        }
        return tabs;
      }
      case 'finance-profit': {
        const tabs = [];
        if (['director', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'p-l', name: 'Báo cáo P&L & Thuế' });
        }
        if (['director', 'accountant', 'cashier'].includes(currentUser?.role)) {
          tabs.push({ id: 'recon', name: 'Đối soát két tiền' });
        }
        if (['director', 'accountant', 'manager'].includes(currentUser?.role)) {
          tabs.push({ id: 'costs', name: 'Chi phí vận hành' });
        }
        return tabs;
      }
      case 'promotions': {
        const tabs = [
          { id: 'coupons', name: 'Mã giảm giá' },
        ];
        if (['director', 'accountant', 'cskh'].includes(currentUser?.role)) {
          tabs.push({ id: 'ai-marketing', name: 'Chiến dịch & Trợ lý AI' });
        }
        return tabs;
      }
      case 'settings-roles':
      case 'settings':
      case 'announcements':
      case 'audit-logs': {
        const tabs = [];
        if (['director', 'manager'].includes(currentUser?.role)) {
          tabs.push({ id: 'announcements', name: 'Thông báo & Chỉ đạo' });
        }
        tabs.push({ id: 'brand', name: 'Cấu hình chi nhánh' });
        if (['director', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'channels', name: 'Đồng bộ đa kênh' });
        }
        if (['director'].includes(currentUser?.role)) {
          tabs.push({ id: 'audit-logs', name: 'Nhật ký hoạt động' });
        }
        return tabs;
      }
      case 'customers': {
        const tabs = [
          { id: 'list', name: 'Danh sách khách' },
          { id: 'vip', name: 'Thành viên VIP' },
        ];
        if (['director', 'manager', 'cskh'].includes(currentUser?.role)) {
          tabs.push({ id: 'reviews', name: 'Phản hồi đánh giá' });
        }
        return tabs;
      }
      default:
        return [];
    }
  };

  // State needed for ERPSubsystems / Overview
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posBarcodeScan, setPosBarcodeScan] = useState('');
  const [posCart, setPosCart] = useState<any[]>([]);
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posSelectedCustomer, setPosSelectedCustomer] = useState<any | null>(null);
  const [posPaymentMethod, setPosPaymentMethod] = useState<'cash' | 'transfer' | 'wallet'>('cash');
  const [posPromoCode, setPosPromoCode] = useState('');
  const [posPromoDiscount, setPosPromoDiscount] = useState(0);
  const [posPrintedReceipt, setPosPrintedReceipt] = useState<any | null>(null);
  const [posReceiptMail, setPosReceiptMail] = useState('');
  const [posHistory, setPosHistory] = useState<any[]>([]);

  const [transfers, setTransfers] = useState<any[]>([]);
  const [newTransferProductId, setNewTransferProductId] = useState('');
  const [newTransferSize, setNewTransferSize] = useState('S');
  const [newTransferColor, setNewTransferColor] = useState('');
  const [newTransferQty, setNewTransferQty] = useState(5);
  const [newTransferFrom, setNewTransferFrom] = useState('Chi nhánh Quận 1');
  const [newTransferTo, setNewTransferTo] = useState('Chi nhánh Thảo Điền');

  const [damagedGoods, setDamagedGoods] = useState<any[]>([]);
  const [newDamageProductId, setNewDamageProductId] = useState('');
  const [newDamageSize, setNewDamageSize] = useState('S');
  const [newDamageColor, setNewDamageColor] = useState('');
  const [newDamageQty, setNewDamageQty] = useState(1);
  const [newDamageIssue, setNewDamageIssue] = useState('Rách vải');

  // GPS/QR Chấm Công States
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
  const [isGPSCorrect, setIsGPSCorrect] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isQRScanned, setIsQRScanned] = useState(false);

  // Live ticking clock state
  const [liveTime, setLiveTime] = useState('');
  useEffect(() => {
    setLiveTime(new Date().toLocaleTimeString('vi-VN'));
    const interval = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // CRM & CSKH Ticket States
  const [crmClients, setCrmClients] = useState<any[]>([]);
  const [cskhTickets, setCskhTickets] = useState<any[]>([]);
  const [newTicketCustomerName, setNewTicketCustomerName] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState<'Đổi size' | 'Trả hàng lỗi' | 'Khiếu nại dịch vụ'>('Đổi size');
  const [newTicketDesc, setNewTicketDesc] = useState('');

  // Cash Reconciliation States
  const [cashReconciliations, setCashReconciliations] = useState<any[]>([]);
  const [posReconciliationExpected, setPosReconciliationExpected] = useState(3850000);
  const [posReconciliationActual, setPosReconciliationActual] = useState(3850000);
  const [posReconciliationNotes, setPosReconciliationNotes] = useState('');

  // AI Assist & Marketing States
  const [aiSEOProductAttributes, setAiSEOProductAttributes] = useState({
    material: 'Linen Cao Cấp',
    fit: 'Relaxed Fit',
    color: 'Oatmeal',
    season: 'Summer 2026',
  });
  const [aiGeneratedSEODesc, setAiGeneratedSEODesc] = useState('');
  const [aiGeneratedCaption, setAiGeneratedCaption] = useState('');
  const [aiSelectedChannel, setAiSelectedChannel] = useState<'facebook' | 'tiktok' | 'instagram'>('facebook');
  const [aiSelectedTone, setAiSelectedTone] = useState<'trendy' | 'elegant' | 'minimalist'>('elegant');
  const [aiCannedReplyOutput, setAiCannedReplyOutput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // ERP Seeds & Storage Load Effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCrm = localStorage.getItem('novyn_crm_clients');
      if (storedCrm) setCrmClients(JSON.parse(storedCrm));

      const storedTickets = localStorage.getItem('novyn_cskh_tickets');
      if (storedTickets) setCskhTickets(JSON.parse(storedTickets));

      const storedTransfers = localStorage.getItem('novyn_stock_transfers');
      if (storedTransfers) setTransfers(JSON.parse(storedTransfers));

      const storedDamages = localStorage.getItem('novyn_damaged_goods');
      if (storedDamages) setDamagedGoods(JSON.parse(storedDamages));

      const storedRecon = localStorage.getItem('novyn_cash_reconciliation');
      if (storedRecon) setCashReconciliations(JSON.parse(storedRecon));

      const storedPosHist = localStorage.getItem('novyn_pos_history');
      if (storedPosHist) setPosHistory(JSON.parse(storedPosHist));

      (async () => {
        try {
          const [crmRes, ticketsRes, transfersRes, damagesRes, reconsRes] = await Promise.all([
            getCRMClientsAction(),
            getCSKHTicketsAction(),
            getInventoryTransfersAction(),
            getDamagedGoodsAction(),
            getCashReconciliationsAction(),
          ]);

          if (crmRes.success && crmRes.data && crmRes.data.length > 0) {
            setCrmClients(crmRes.data);
            localStorage.setItem('novyn_crm_clients', JSON.stringify(crmRes.data));
          }
          if (ticketsRes.success && ticketsRes.data && ticketsRes.data.length > 0) {
            setCskhTickets(ticketsRes.data);
            localStorage.setItem('novyn_cskh_tickets', JSON.stringify(ticketsRes.data));
          }
          if (transfersRes.success && transfersRes.data && transfersRes.data.length > 0) {
            setTransfers(transfersRes.data);
            localStorage.setItem('novyn_stock_transfers', JSON.stringify(transfersRes.data));
          }
          if (damagesRes.success && damagesRes.data && damagesRes.data.length > 0) {
            setDamagedGoods(damagesRes.data);
            localStorage.setItem('novyn_damaged_goods', JSON.stringify(damagesRes.data));
          }
          if (reconsRes.success && reconsRes.data && reconsRes.data.length > 0) {
            setCashReconciliations(reconsRes.data);
            localStorage.setItem('novyn_cash_reconciliation', JSON.stringify(reconsRes.data));
          }
        } catch (error) {
          console.error('Failed to sync ERP records from DB:', error);
        }
      })();
    }
  }, []);

  const [viewingReportId, setViewingReportId] = useState<string | null>(null);

  // Tax records for director & accountant
  const [taxRecords, setTaxRecords] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTax = localStorage.getItem('novyn_tax_records');
      if (storedTax) {
        try {
          setTaxRecords(JSON.parse(storedTax));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const calculateDynamicPITForSalary = (gross: number, personalDeduct: number, depDeduct: number, dependents: number): number => {
    const totalDeduction = personalDeduct + (dependents * depDeduct);
    if (gross <= totalDeduction) return 0;
    const taxableIncome = gross - totalDeduction;
    
    if (taxableIncome <= 5000000) {
      return taxableIncome * 0.05;
    } else if (taxableIncome <= 10000000) {
      return 5000000 * 0.05 + (taxableIncome - 5000000) * 0.10;
    } else if (taxableIncome <= 18000000) {
      return 5000000 * 0.05 + 5000000 * 0.10 + (taxableIncome - 10000000) * 0.15;
    } else if (taxableIncome <= 32000000) {
      return 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + (taxableIncome - 18000000) * 0.20;
    } else {
      return 5000000 * 0.05 + 5000000 * 0.10 + 8000000 * 0.15 + 14000000 * 0.20 + (taxableIncome - 32000000) * 0.25;
    }
  };

  const getPeriodFinances = (period: string) => {
    let revenue = 0;
    let cogs = 0;
    let expenses = 0;
    let restockCost = 0;
    let salaries = 0;

    allOrders.forEach((o: any) => {
      if (o.status !== 'completed') return;
      const date = o.createdAt.split(' ')[0];
      if (date.startsWith(period)) {
        revenue += o.total;
        cogs += o.total * 0.4;
      }
    });

    expensesList.forEach((e: any) => {
      if (e.date.startsWith(period)) {
        expenses += e.amount;
      }
    });

    restockRecords.forEach((r: any) => {
      if (r.status !== 'approved') return;
      const date = r.createdAt.split(' ')[0];
      if (date.startsWith(period)) {
        restockCost += r.cost;
      }
    });

    payrollRecords.forEach((p: any) => {
      if (p.status !== 'paid') return;
      if (p.month === period) {
        salaries += p.salary;
      }
    });

    const ebt = revenue - cogs - expenses - restockCost - salaries;

    return {
      revenue,
      cogs,
      expenses,
      restockCost,
      salaries,
      ebt,
    };
  };

  const handleSaveTaxRecord = (record: any) => {
    const exists = taxRecords.some(r => r.period === record.period);
    if (exists) {
      if (!confirm(`Kỳ thuế ${record.period} đã có tờ khai quyết toán thuế trước đó. Bạn có muốn ghi đè lên bản ghi cũ không?`)) {
        return;
      }
    }
    const filtered = taxRecords.filter(r => r.period !== record.period);
    const updated = [record, ...filtered];
    setTaxRecords(updated);
    localStorage.setItem('novyn_tax_records', JSON.stringify(updated));
    showToast(`Khóa sổ và lưu tờ khai quyết toán thuế kỳ ${record.period} thành công!`, 'success');
  };

  const handleDeleteTaxRecord = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch sử khóa sổ thuế này?')) {
      const updated = taxRecords.filter(r => r.id !== id);
      setTaxRecords(updated);
      localStorage.setItem('novyn_tax_records', JSON.stringify(updated));
      showToast('Đã xóa bản ghi thuế.', 'info');
    }
  };

  const exportTaxRecordsToCSV = (records: any[]) => {
    const headers = [
      'Ky thue',
      'Doanh thu gop',
      'Gia von COGS',
      'Chi phi van hanh',
      'Chi phi luong',
      'Chi phi nhap hang',
      'LNTT (EBT)',
      'Thue suat CIT',
      'Thue CIT',
      'Thue PIT nhan su',
      'Loi nhuan sau thue',
      'Ngay khoa so',
      'Ke toan truong',
    ];
    const rows = records.map(r => [
      r.period,
      r.revenue,
      r.cogs,
      r.expenses,
      r.salaries,
      r.restockCost,
      r.ebt,
      r.citRate + '%',
      r.citAmount,
      r.pitAmount,
      r.netProfit,
      r.settledAt,
      r.accountantName,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'NOVYN_WEAR_Bao_Cao_Quyet_Toan_Thue.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Redirect guest or customer users back to /account storefront
  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!currentUser || currentUser.role === 'customer') {
      router.push('/account');
    }
  }, [currentUser, isAuthLoaded, router]);

  // Set default tab on role switch
  useEffect(() => {
    if (currentUser) {
      setActiveTab('overview');
    }
  }, [currentUser]);

  // Set default sub-tabs based on role
  useEffect(() => {
    if (currentUser) {
      if (['director', 'manager', 'employee', 'cashier'].includes(currentUser.role)) {
        setSalesOrdersSubTab('pos');
      } else {
        setSalesOrdersSubTab('list');
      }
      setProductsInventorySubTab('list');
      setStaffScheduleSubTab('shifts');
      if (['director', 'accountant'].includes(currentUser.role)) {
        setFinanceProfitSubTab('p-l');
      } else if (currentUser.role === 'manager') {
        setFinanceProfitSubTab('costs');
      } else {
        setFinanceProfitSubTab('recon');
      }
      setPromotionsSubTab('coupons');
      setSettingsRolesSubTab('brand');
    }
  }, [currentUser]);

  // CSV Exporter for Product P&L
  const exportPLToCSV = (ledger: any[]) => {
    const headers = ['Tên sản phẩm', 'Danh mục', 'Đã bán (chiếc)', 'Doanh thu (VND)', 'Đã nhập (chiếc)', 'Vốn nhập (VND)', 'Lợi nhuận ròng (VND)'];
    const rows = ledger.map(item => [
      item.product.name,
      item.product.category,
      item.soldQty,
      item.revenue,
      item.stockedQty,
      item.importCost,
      item.netProfit,
    ]);
    
    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NOVYN_WEAR_Product_PL_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Daily Finances Aggregator for Accountant & Director
  const getDailyFinances = () => {
    const dailyData: Record<string, {
      date: string;
      revenue: number;
      cogs: number;
      expenses: number;
      restockCost: number;
      salaryPaid: number;
      profit: number;
      orderCount: number;
    }> = {};

    allOrders.forEach((o: any) => {
      if (o.status !== 'completed') return;
      const date = o.createdAt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].revenue += o.total;
      dailyData[date].cogs += o.total * 0.4;
      dailyData[date].orderCount += 1;
    });

    expensesList.forEach((e: any) => {
      const date = e.date;
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].expenses += e.amount;
    });

    restockRecords.forEach((r: any) => {
      if (r.status && r.status !== 'approved') return;
      const date = r.createdAt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].restockCost += r.cost;
    });

    payrollRecords.forEach((p: any) => {
      if (p.status !== 'paid' || !p.paymentDate) return;
      const date = p.paymentDate.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].salaryPaid += p.salary;
    });

    const dates = Object.keys(dailyData).sort((a, b) => b.localeCompare(a));
    return dates.map((date) => {
      const day = dailyData[date];
      day.profit = day.revenue - day.cogs - day.expenses - day.restockCost - day.salaryPaid;
      return day;
    });
  };

  // CSV Exporter for Daily P&L
  const exportDailyPLToCSV = (dailyLedger: any[]) => {
    const headers = ['Ngày', 'Số đơn hàng', 'Doanh thu (+)', 'Giá vốn COGS (-)', 'Chi phí vận hành (-)', 'Chi phí nhập kho (-)', 'Lương đã trả (-)', 'Lợi nhuận ròng (=)'];
    const rows = dailyLedger.map(item => [
      item.date,
      item.orderCount,
      item.revenue,
      item.cogs,
      item.expenses,
      item.restockCost,
      item.salaryPaid,
      item.profit,
    ]);
    
    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NOVYN_WEAR_Daily_Profit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 8 KPI calculations for Overview Tab
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
  const pendingHrCount = (leaveRequests || []).filter((r: any) => r.status === 'pending').length +
                         (shiftRequests || []).filter((r: any) => r.status === 'pending').length;
  const announcementsCount = (announcements || []).length;
  const returnRate = '1.2%';

  const handleSidebarChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'pos-sales') {
      setSalesOrdersSubTab('pos');
    } else if (tabId === 'sales-orders-list') {
      setSalesOrdersSubTab('list');
    } else if (tabId === 'returns-exchange') {
      setSalesOrdersSubTab('returns');
    } else if (tabId === 'cskh-hub') {
      setSalesOrdersSubTab('chat');
    } else if (tabId === 'customers-list') {
      setCustomersSubTab('list');
    } else if (tabId === 'customers-vip') {
      setCustomersSubTab('vip');
    } else if (tabId === 'reviews') {
      setCustomersSubTab('reviews');
    } else if (tabId === 'products-database') {
      setProductsInventorySubTab('list');
    } else if (tabId === 'stocker-inventory') {
      setProductsInventorySubTab('matrix');
    } else if (tabId === 'restock') {
      setProductsInventorySubTab('restock');
    } else if (tabId === 'stocker-transfer') {
      setProductsInventorySubTab('transfer');
    } else if (tabId === 'damaged-goods') {
      setProductsInventorySubTab('damaged');
    } else if (tabId === 'finance-costs' || tabId === 'costs') {
      setFinanceProfitSubTab('costs');
    } else if (tabId === 'finance-payroll' || tabId === 'staff') {
      setStaffScheduleSubTab('payroll');
    } else if (tabId === 'finance-recon' || tabId === 'recon') {
      setFinanceProfitSubTab('recon');
    } else if (tabId === 'finance-p-l' || tabId === 'finance-profit') {
      setFinanceProfitSubTab('p-l');
    } else if (tabId === 'staff-schedule' || tabId === 'shifts') {
      setStaffScheduleSubTab('shifts');
    } else if (tabId === 'attendance') {
      if (['director', 'manager', 'accountant'].includes(currentUser?.role)) {
        setAttendanceSubTab('approval');
        setStaffScheduleSubTab('approval');
      } else {
        setAttendanceSubTab('clock');
        setStaffScheduleSubTab('shifts');
      }
    } else if (tabId === 'announcements') {
      setSettingsRolesSubTab('announcements');
    } else if (tabId === 'audit-logs') {
      setSettingsRolesSubTab('audit-logs');
    } else if (tabId === 'settings') {
      setSettingsRolesSubTab('brand');
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'create-order') {
      setActiveTab('pos-sales');
    } else if (action === 'add-product') {
      setActiveTab('products-database');
    } else if (action === 'add-staff') {
      setActiveTab('staff-schedule');
      setStaffScheduleSubTab('staff');
    } else if (action === 'restock') {
      setActiveTab('restock');
    } else if (action === 'add-expense') {
      setActiveTab('finance-costs');
    } else if (action === 'add-customer') {
      setActiveTab('customers-list');
    }
  };

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
        activeTab={activeTab}
        setActiveTab={handleSidebarChange}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        logout={logout}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
        pendingHrCount={pendingHrCount}
        announcementsCount={announcementsCount}
      />
      
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        <AppHeader
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={handleSidebarChange}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          allOrders={allOrders}
          productsList={productsList}
          crmClients={crmClients}
          logout={logout}
          onQuickAction={handleQuickAction}
        />

        <main className="flex-1 p-6 md:p-8 space-y-8 w-full max-w-[1700px] mx-auto px-4 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeTab === 'overview' ? (
                <OverviewDashboard
                  currentUser={currentUser}
                  allOrders={allOrders}
                  expensesList={expensesList}
                  payrollRecords={payrollRecords}
                  restockRecords={restockRecords}
                  productsList={productsList}
                  usersList={usersList}
                  selectedBranch={selectedBranch}
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
                  setActiveTab={handleSidebarChange}
                  shiftRequests={shiftRequests}
                  leaveRequests={leaveRequests}
                  announcements={announcements}
                  transfers={transfers}
                />
              ) : (
                <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 min-h-[600px] flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div>
                    {/* Horizontal Sub-tabs Navigation */}
                    {(() => {
                      const subTabs = getSubTabs();
                      const currentSubTab = 
                        activeTab === 'sales-orders' ? salesOrdersSubTab :
                        (activeTab === 'products-inventory' || activeTab === 'stocker-inventory' || activeTab === 'stocker-transfer' || activeTab === 'damaged-goods' || activeTab === 'restock' || activeTab === 'products-database') ? (
                          activeTab === 'stocker-inventory' ? 'matrix' :
                          activeTab === 'stocker-transfer' ? 'transfer' :
                          activeTab === 'damaged-goods' ? 'damaged' :
                          activeTab === 'restock' ? 'restock' :
                          activeTab === 'products-database' ? 'list' :
                          productsInventorySubTab
                        ) :
                        activeTab === 'staff-schedule' ? staffScheduleSubTab :
                        activeTab === 'attendance' ? attendanceSubTab :
                        activeTab === 'finance-profit' ? financeProfitSubTab :
                        activeTab === 'promotions' ? promotionsSubTab :
                        (activeTab === 'settings-roles' || activeTab === 'settings' || activeTab === 'announcements' || activeTab === 'audit-logs') ? (
                          activeTab === 'announcements' ? 'announcements' :
                          activeTab === 'audit-logs' ? 'audit-logs' :
                          activeTab === 'settings' ? 'brand' :
                          settingsRolesSubTab
                        ) :
                        activeTab === 'customers' ? customersSubTab : '';
                      
                      if (subTabs.length === 0) return null;
                      return (
                        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-neutral-100/70 select-none">
                          {subTabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setCurrentSubTab(tab.id)}
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
                      onSwitchToTransferTab={() => {
                        setActiveTab('stocker-transfer');
                        setProductsInventorySubTab('transfer');
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
                      showToast={showToast}
                      posSearchQuery={posSearchQuery}
                      setPosSearchQuery={setPosSearchQuery}
                      posBarcodeScan={posBarcodeScan}
                      setPosBarcodeScan={setPosBarcodeScan}
                      posCart={posCart}
                      setPosCart={setPosCart}
                      posCustomerPhone={posCustomerPhone}
                      setPosCustomerPhone={setPosCustomerPhone}
                      posSelectedCustomer={posSelectedCustomer}
                      setPosSelectedCustomer={setPosSelectedCustomer}
                      posPaymentMethod={posPaymentMethod}
                      setPosPaymentMethod={setPosPaymentMethod}
                      posPromoCode={posPromoCode}
                      setPosPromoCode={setPosPromoCode}
                      posPromoDiscount={posPromoDiscount}
                      setPosPromoDiscount={setPosPromoDiscount}
                      posPrintedReceipt={posPrintedReceipt}
                      setPosPrintedReceipt={setPosPrintedReceipt}
                      posReceiptMail={posReceiptMail}
                      setPosReceiptMail={setPosReceiptMail}
                      posHistory={posHistory}
                      setPosHistory={setPosHistory}
                      transfers={transfers}
                      setTransfers={setTransfers}
                      newTransferProductId={newTransferProductId}
                      setNewTransferProductId={setNewTransferProductId}
                      newTransferSize={newTransferSize}
                      setNewTransferSize={setNewTransferSize}
                      newTransferColor={newTransferColor}
                      setNewTransferColor={setNewTransferColor}
                      newTransferQty={newTransferQty}
                      setNewTransferQty={setNewTransferQty}
                      newTransferFrom={newTransferFrom}
                      setNewTransferFrom={setNewTransferFrom}
                      newTransferTo={newTransferTo}
                      setNewTransferTo={setNewTransferTo}
                      damagedGoods={damagedGoods}
                      setDamagedGoods={setDamagedGoods}
                      newDamageProductId={newDamageProductId}
                      setNewDamageProductId={setNewDamageProductId}
                      newDamageSize={newDamageSize}
                      setNewDamageSize={setNewDamageSize}
                      newDamageColor={newDamageColor}
                      setNewDamageColor={setNewDamageColor}
                      newDamageQty={newDamageQty}
                      setNewDamageQty={setNewDamageQty}
                      newDamageIssue={newDamageIssue}
                      setNewDamageIssue={setNewDamageIssue}
                      crmClients={crmClients}
                      setCrmClients={setCrmClients}
                      cskhTickets={cskhTickets}
                      setCskhTickets={setCskhTickets}
                      newTicketCustomerName={newTicketCustomerName}
                      setNewTicketCustomerName={setNewTicketCustomerName}
                      newTicketCategory={newTicketCategory}
                      setNewTicketCategory={setNewTicketCategory}
                      newTicketDesc={newTicketDesc}
                      setNewTicketDesc={setNewTicketDesc}
                      cashReconciliations={cashReconciliations}
                      setCashReconciliations={setCashReconciliations}
                      posReconciliationExpected={posReconciliationExpected}
                      setPosReconciliationExpected={setPosReconciliationExpected}
                      posReconciliationActual={posReconciliationActual}
                      setPosReconciliationActual={setPosReconciliationActual}
                      posReconciliationNotes={posReconciliationNotes}
                      setPosReconciliationNotes={setPosReconciliationNotes}
                      aiSEOProductAttributes={aiSEOProductAttributes}
                      setAiSEOProductAttributes={setAiSEOProductAttributes}
                      aiGeneratedSEODesc={aiGeneratedSEODesc}
                      setAiGeneratedSEODesc={setAiGeneratedSEODesc}
                      aiGeneratedCaption={aiGeneratedCaption}
                      setAiGeneratedCaption={setAiGeneratedCaption}
                      aiSelectedChannel={aiSelectedChannel}
                      setAiSelectedChannel={setAiSelectedChannel}
                      aiSelectedTone={aiSelectedTone}
                      setAiSelectedTone={setAiSelectedTone}
                      aiCannedReplyOutput={aiCannedReplyOutput}
                      setAiCannedReplyOutput={setAiCannedReplyOutput}
                      aiGenerating={aiGenerating}
                      setAiGenerating={setAiGenerating}
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
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        requireReason={confirmState.requireReason}
        isDanger={confirmState.isDanger}
      />
    </div>
  );
}
