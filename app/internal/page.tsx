'use client';
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../lib/utils';
import { calculatePIT } from '../../types';
import { useCart } from '../../context/CartContext';
import { getAuditLogsAction } from '../../lib/actions/staffActions';
import CampaignCopilot from '../../components/internal/CampaignCopilot';
import FinancialSVGCharts from '../../components/internal/FinancialSVGCharts';
import { ERPSubsystems } from '../../components/internal/ERPSubsystems';
import AppSidebar from '../../components/internal/AppSidebar';
import AppHeader from '../../components/internal/AppHeader';
import ConfirmDialog from '../../components/internal/ConfirmDialog';
import OverviewDashboard from '../../components/internal/OverviewDashboard';
import {
  Clock,
  Briefcase,
  Calendar,
  DollarSign,
  CheckCircle2,
  PlusCircle,
  LogOut,
  UserCheck,
  FileText,
  Layers,
  TrendingUp,
  User as UserIcon,
  Search,
  Edit2,
  Box,
  Download,
  Loader2,
  Megaphone,
  Star,
  MessageSquare,
  Plus,
  Send,
  Bell,
  X,
  Phone,
  LayoutGrid,
  Sliders,
  Trash2,
  AlertCircle,
  Sparkles,
  Palette,
  Smile,
  Meh,
  Frown,
  Mail,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Check,
  Filter,
  QrCode,
  MapPin,
  TrendingDown,
  ShoppingBag,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  Tag,
  Settings,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PermissionGuard = ({ allowedRoles, children, currentUser }: { allowedRoles: string[], children: React.ReactNode, currentUser: any }) => {
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center select-none bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4 animate-bounce shrink-0" />
        <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider mb-2">Không có quyền truy cập</h3>
        <p className="text-xs text-neutral-450 max-w-sm">
          Tài khoản của bạn ({currentUser?.name} - {currentUser?.role}) không được phân quyền truy cập chức năng này. Vui lòng liên hệ Admin để được cấp quyền.
        </p>
      </div>
    );
  }
  return <>{children}</>;
};

export default function InternalDashboardPage() {
  const {
    currentUser,
    usersList,
    productsList,
    attendanceLogs,
    leaveRequests,
    salaryRequests,
    dailyReports,
    branchStock,
    branchSizeStock,
    logout,
    quickLogin,
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
    addGlobalProduct,
    deleteGlobalProduct,
    addShiftDirectly,
    deleteShiftRequest,
    shiftSwapRequests,
    submitSwapRequest,
    respondToSwapRequest,
    officeReservations,
    workspaceTasks,
    workspacePosts,
    wikiDocs,
    reserveDeskOrRoom,
    cancelReservation,
    addWorkspaceTask,
    updateWorkspaceTaskColumn,
    deleteWorkspaceTask,
    addWorkspacePost,
    reactToPost,
    commentOnPost,
    addWikiDoc,
    updateWikiDoc
  } = useAuth() as any;

  const router = useRouter();
  const { chatSessions, waitingSessions, activeSessions, acceptSession, sendCskhMessage, closeSession, unreadCount } = useChat();
  const { showToast } = useToast();
  const { dynamicPromos, addDynamicPromoCode, deleteDynamicPromoCode } = useCart() as any;

  // Tab Control
  const [activeTab, setActiveTab] = useState('overview');
  const setCurrentSubTab = (id: string) => {
    if (activeTab === 'sales-orders') setSalesOrdersSubTab(id);
    else if (activeTab === 'products-inventory') setProductsInventorySubTab(id);
    else if (activeTab === 'staff-schedule') setStaffScheduleSubTab(id);
    else if (activeTab === 'finance-profit') setFinanceProfitSubTab(id);
    else if (activeTab === 'promotions') setPromotionsSubTab(id);
    else if (activeTab === 'settings-roles') setSettingsRolesSubTab(id);
    else if (activeTab === 'customers') setCustomersSubTab(id);
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Unified persistent branch selection
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

  // Generic ConfirmDialog state
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
    isDanger: false
  });

  // Sub-tabs Control
  const [salesOrdersSubTab, setSalesOrdersSubTab] = useState('pos');
  const [productsInventorySubTab, setProductsInventorySubTab] = useState('list');
  const [staffScheduleSubTab, setStaffScheduleSubTab] = useState('shifts');
  const [financeProfitSubTab, setFinanceProfitSubTab] = useState('p-l');
  const [promotionsSubTab, setPromotionsSubTab] = useState('coupons');
  const [settingsRolesSubTab, setSettingsRolesSubTab] = useState('brand');
  const [customersSubTab, setCustomersSubTab] = useState('list');
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
    if (activeTab === 'settings-roles' && settingsRolesSubTab === 'audit-logs' && currentUser?.role === 'director') {
      fetchAuditLogs();
    }
  }, [activeTab, settingsRolesSubTab, currentUser?.role]);

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
      case 'products-inventory': {
        const tabs = [
          { id: 'list', name: 'Danh sách sản phẩm' },
          { id: 'matrix', name: 'Tồn kho chi nhánh' },
        ];
        if (['director', 'accountant', 'manager'].includes(currentUser?.role)) {
          tabs.push({ id: 'restock', name: 'Nhập hàng & Restock' });
        }
        if (['director', 'accountant', 'manager', 'stocker'].includes(currentUser?.role)) {
          tabs.push({ id: 'transfer', name: 'Điều chuyển & Hàng lỗi' });
        }
        return tabs;
      }
      case 'staff-schedule': {
        const tabs = [
          { id: 'shifts', name: 'Lịch ca làm việc' },
        ];
        if (['director', 'manager'].includes(currentUser?.role)) {
          tabs.push({ id: 'approval', name: 'Xếp lịch & Duyệt phép' });
        }
        if (['director', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'payroll', name: 'Lương & Hoa hồng' });
        }
        if (['employee', 'cashier', 'stocker'].includes(currentUser?.role)) {
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
      case 'settings-roles': {
        const tabs = [
          { id: 'brand', name: 'Cấu hình chi nhánh' },
        ];
        if (['director', 'accountant'].includes(currentUser?.role)) {
          tabs.push({ id: 'channels', name: 'Đồng bộ đa kênh' });
        }
        if (['director'].includes(currentUser?.role)) {
          tabs.push({ id: 'announcements', name: 'Thông báo & Chỉ đạo' });
          tabs.push({ id: 'audit-logs', name: 'Nhật ký hoạt động' });
        } else if (['manager'].includes(currentUser?.role)) {
          tabs.push({ id: 'announcements', name: 'Thông báo & Chỉ đạo' });
        }
        return tabs;
      }
      case 'customers': {
        const tabs = [
          { id: 'list', name: 'Danh sách khách' },
          { id: 'vip', name: 'Thành viên VIP' },
        ];
        if (['director', 'cskh'].includes(currentUser?.role)) {
          tabs.push({ id: 'reviews', name: 'Phản hồi đánh giá' });
        }
        return tabs;
      }
      default:
        return [];
    }
  };

  // POS States
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

  // Inventory & Transfer States
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
      // 1. Load CRM clients
      const storedCrm = localStorage.getItem('novyn_crm_clients');
      if (storedCrm) {
        setCrmClients(JSON.parse(storedCrm));
      } else {
        const defaultClients = [
          { id: 'crm-1', name: 'Lâm Khánh Vy', email: 'customer@gmail.com', phone: '0912345678', totalSpent: 22500000, points: 225, tier: 'Gold', createdAt: '2026-05-10' },
          { id: 'crm-2', name: 'Đoàn Phương Linh', email: 'linh.dp@gmail.com', phone: '0987654321', totalSpent: 35000000, points: 350, tier: 'Platinum', createdAt: '2026-05-12' },
          { id: 'crm-3', name: 'Nguyễn Bích Thuỷ', email: 'thuy.nb@gmail.com', phone: '0909090909', totalSpent: 58000000, points: 580, tier: 'VVIP', createdAt: '2026-05-15' },
          { id: 'crm-4', name: 'Hoàng Hải Nam', email: 'nam.hh@gmail.com', phone: '0933221100', totalSpent: 1200000, points: 12, tier: 'Regular', createdAt: '2026-05-18' }
        ];
        setCrmClients(defaultClients);
        localStorage.setItem('novyn_crm_clients', JSON.stringify(defaultClients));
      }

      // 2. Load CSKH Tickets
      const storedTickets = localStorage.getItem('novyn_cskh_tickets');
      if (storedTickets) {
        setCskhTickets(JSON.parse(storedTickets));
      } else {
        const defaultTickets = [
          { id: 'tk-1', customerName: 'Lâm Khánh Vy', category: 'Đổi size', description: 'Đổi quần Linen size M sang size S do mặc bị rộng eo.', status: 'pending', createdAt: '2026-06-01 10:00' },
          { id: 'tk-2', customerName: 'Đoàn Phương Linh', category: 'Trả hàng lỗi', description: 'Áo khoác Blazer tuyết mưa bị sứt chỉ cánh tay phải.', status: 'resolved', createdAt: '2026-05-28 14:30' }
        ];
        setCskhTickets(defaultTickets);
        localStorage.setItem('novyn_cskh_tickets', JSON.stringify(defaultTickets));
      }

      // 3. Load Transfers
      const storedTransfers = localStorage.getItem('novyn_stock_transfers');
      if (storedTransfers) {
        setTransfers(JSON.parse(storedTransfers));
      } else {
        const defaultTransfers = [
          { id: 'tr-1', productId: 'prod-01', productName: 'Áo Thun Premium Cotton', size: 'M', color: 'Trắng', fromBranch: 'Chi nhánh Quận 1', toBranch: 'Chi nhánh Thảo Điền', quantity: 10, status: 'received', createdAt: '2026-05-28 09:00' },
          { id: 'tr-2', productId: 'prod-02', productName: 'Áo Khoác Blazer Relaxed', size: 'L', color: 'Nâu Oatmeal', fromBranch: 'Chi nhánh Quận 1', toBranch: 'Chi nhánh Thảo Điền', quantity: 5, status: 'shipping', createdAt: '2026-06-01 15:20' }
        ];
        setTransfers(defaultTransfers);
        localStorage.setItem('novyn_stock_transfers', JSON.stringify(defaultTransfers));
      }

      // 4. Load Damaged Goods
      const storedDamages = localStorage.getItem('novyn_damaged_goods');
      if (storedDamages) {
        setDamagedGoods(JSON.parse(storedDamages));
      } else {
        const defaultDamages = [
          { id: 'dm-1', productId: 'prod-03', productName: 'Áo Sơ Mi Linen Cao Cấp', size: 'S', color: 'Màu Cát', branch: 'Chi nhánh Quận 1', quantity: 2, issue: 'Bị ố vàng cổ áo', createdAt: '2026-05-30 11:15' }
        ];
        setDamagedGoods(defaultDamages);
        localStorage.setItem('novyn_damaged_goods', JSON.stringify(defaultDamages));
      }

      // 5. Load Cash Reconciliation
      const storedRecon = localStorage.getItem('novyn_cash_reconciliation');
      if (storedRecon) {
        setCashReconciliations(JSON.parse(storedRecon));
      } else {
        const defaultRecon = [
          { id: 'rc-1', date: '2026-05-30', branch: 'Chi nhánh Quận 1', cashierName: 'Nguyễn Thuỳ Lan', expectedCash: 5200000, actualCash: 5200000, discrepancy: 0, notes: 'Đối soát két chuẩn khớp', status: 'approved', createdAt: '2026-05-30 22:30' }
        ];
        setCashReconciliations(defaultRecon);
        localStorage.setItem('novyn_cash_reconciliation', JSON.stringify(defaultRecon));
      }

      // 6. Load POS History
      const storedPosHist = localStorage.getItem('novyn_pos_history');
      if (storedPosHist) {
        setPosHistory(JSON.parse(storedPosHist));
      }
    }
  }, []);

  // Intranet & Workspace Sub-Tab States
  const [intranetSubTab, setIntranetSubTab] = useState<'booking' | 'kanban' | 'social' | 'wiki'>('booking');
  const [bookingDate, setBookingDate] = useState('2026-06-01');
  const [bookingSlot, setBookingSlot] = useState<'morning' | 'afternoon' | 'full'>('full');
  
  // Kanban task modal states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-06-05');

  // Social feed states
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'general' | 'birthday' | 'announcement'>('general');
  const [postCommentsText, setPostCommentsText] = useState<Record<string, string>>({});

  // Wiki policy states
  const [selectedWikiDocId, setSelectedWikiDocId] = useState<string | null>(null);
  const [showAddWikiModal, setShowAddWikiModal] = useState(false);
  const [newWikiTitle, setNewWikiTitle] = useState('');
  const [newWikiCat, setNewWikiCat] = useState<'hr' | 'operations' | 'benefits'>('hr');
  const [newWikiContent, setNewWikiContent] = useState('');
  const [wikiSearch, setWikiSearch] = useState('');

  // Search filter for CSKH
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  // CSKH Live Chat States
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Shift schedule week view
  const [schedWeekOffset, setSchedWeekOffset] = useState(0);

  // Inline shift assignment modal state (for weekly overview grid)
  const [shiftModal, setShiftModal] = useState<{
    date: string;        // YYYY-MM-DD
    shiftType: 'morning' | 'afternoon' | 'evening';
    employeeId: string;
    comment: string;
  } | null>(null);

  // Shift swap modal state (for employees to request swap)
  const [swapModal, setSwapModal] = useState<{
    fromShiftId: string;
  } | null>(null);

  // Director announcements Form States
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annRecipient, setAnnRecipient] = useState<'all' | 'accountant' | 'branch_q1' | 'branch_td'>('all');

  // Accountant Product CRUD States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Tops');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImages, setNewProductImages] = useState(''); // Comma-separated URLs
  const [newProductColors, setNewProductColors] = useState(''); // e.g. "Trắng|#FFFFFF, Đen|#111827"
  const [newProductSizes, setNewProductSizes] = useState<string[]>([]);
  const [newProductInitialStock, setNewProductInitialStock] = useState(20);

  // Manager Direct Scheduling States
  const [schedEmployeeId, setSchedEmployeeId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedShiftType, setSchedShiftType] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [schedComment, setSchedComment] = useState('');

  // Employee/HR States
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [stockSearch, setStockSearch] = useState('');

  // Manager restock
  const [selectedRestockProduct, setSelectedRestockProduct] = useState('');
  const [restockAmount, setRestockAmount] = useState(10);
  const [selectedRestockSize, setSelectedRestockSize] = useState('S');
  const [selectedRestockBranch, setSelectedRestockBranch] = useState('');
  const [managerComment, setManagerComment] = useState('');

  // Director price/info edit
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCat, setEditCat] = useState('');

  // Daily reports states
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [viewingReportId, setViewingReportId] = useState<string | null>(null);
  const [reportFilterTab, setReportFilterTab] = useState<'unread' | 'read'>('unread');

  // Revenue filters
  const [revenueSearch, setRevenueSearch] = useState('');
  const [revenueFilterBranch, setRevenueFilterBranch] = useState('all');

  // Accountant Salary & Payroll
  const [selectedPayrollUser, setSelectedPayrollUser] = useState('');
  const [newPayrollMonth, setNewPayrollMonth] = useState('2026-06');
  const [newPayrollSalary, setNewPayrollSalary] = useState(0);

  // Accountant Expenses
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState(0);
  const [newExpenseCategory, setNewExpenseCategory] = useState<'marketing' | 'operations' | 'equipment' | 'other'>('operations');

  // Accountant HR Staffing
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'employee' | 'manager' | 'accountant' | 'director' | 'cskh'>('employee');
  const [newStaffBranch, setNewStaffBranch] = useState('Chi nhánh Quận 1');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Accountant Tax Settlement
  const [taxPeriod, setTaxPeriod] = useState('2026-05');
  const [customCitRate, setCustomCitRate] = useState(20);
  const [personalDeduction, setPersonalDeduction] = useState(11000000);
  const [dependentDeduction, setDependentDeduction] = useState(4400000);
  const [employeeDependents, setEmployeeDependents] = useState<Record<string, number>>({});
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
      ebt
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
    alert(`Khóa sổ và lưu tờ khai quyết toán thuế kỳ ${record.period} thành công!`);
  };

  const handleDeleteTaxRecord = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch sử khóa sổ thuế này?')) {
      const updated = taxRecords.filter(r => r.id !== id);
      setTaxRecords(updated);
      localStorage.setItem('novyn_tax_records', JSON.stringify(updated));
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
      'Ke toan truong'
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
      r.accountantName
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NOVYN_WEAR_Bao_Cao_Quyet_Toan_Thue.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  // Redirect guest or customer users back to /account storefront
  useEffect(() => {
    if (!currentUser || currentUser.role === 'customer') {
      router.push('/account');
    }
  }, [currentUser, router]);

  // Set default tab on role switch
  useEffect(() => {
    if (currentUser) {
      setActiveTab('overview');
    }
  }, [currentUser]);

  // Set default sub-tabs based on role on role switch
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

  // Auto-scroll chat messages
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChatSessionId, chatSessions]);

  // Auto-select first waiting session for CSKH
  useEffect(() => {
    if (currentUser?.role === 'cskh' && !selectedChatSessionId && waitingSessions.length > 0) {
      setSelectedChatSessionId(waitingSessions[0].id);
    }
  }, [waitingSessions, selectedChatSessionId, currentUser]);

  if (!currentUser || currentUser.role === 'customer') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // Quick Switch accounts helper for local testing
  const demoAccounts = [
    { name: 'Giám đốc Bảo', email: 'director@novynwear.com', role: 'director', desc: 'Chủ doanh nghiệp' },
    { name: 'Kế toán Thảo', email: 'accountant@novynwear.com', role: 'accountant', desc: 'Kế toán trưởng' },
    { name: 'CSKH Mai An', email: 'cskh@novynwear.com', role: 'cskh', desc: 'CSKH Trưởng' },
    { name: 'CSKH Thùy Dương', email: 'duong.cskh@novynwear.com', role: 'cskh', desc: 'CSKH Viên' },
    { name: 'Quản lý Hoàng', email: 'manager.q1@novynwear.com', role: 'manager', desc: 'Quản lý Quận 1' },
    { name: 'Thu ngân Lan', email: 'cashier.q1@novynwear.com', role: 'cashier', desc: 'Thu ngân Q.1' },
    { name: 'Thủ kho Hải', email: 'stocker.q1@novynwear.com', role: 'stocker', desc: 'Thủ kho Q.1' },
    { name: 'Nhân viên Đức', email: 'employee.q1@novynwear.com', role: 'employee', desc: 'Nhân viên Quận 1' },
    { name: 'Nhân viên Tâm', email: 'tam.employee.q1@novynwear.com', role: 'employee', desc: 'Nhân viên Quận 1' },
    { name: 'Nhân viên Nam', email: 'nam.employee.td@novynwear.com', role: 'employee', desc: 'Nhân viên T.Đ' }
  ];

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
      item.netProfit
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

    // 1. Process Orders (Revenue & COGS)
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

    // 2. Process Expenses
    expensesList.forEach((e: any) => {
      const date = e.date;
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].expenses += e.amount;
    });

    // 3. Process Restocking
    restockRecords.forEach((r: any) => {
      if (r.status && r.status !== 'approved') return;
      const date = r.createdAt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].restockCost += r.cost;
    });

    // 4. Process Salaries paid
    payrollRecords.forEach((p: any) => {
      if (p.status !== 'paid' || !p.paymentDate) return;
      const date = p.paymentDate.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, revenue: 0, cogs: 0, expenses: 0, restockCost: 0, salaryPaid: 0, profit: 0, orderCount: 0 };
      }
      dailyData[date].salaryPaid += p.salary;
    });

    // 5. Calculate Profit
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
      item.profit
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

  // Sidebar active state mapping
  const getSidebarActiveTab = () => {
    if (activeTab === 'overview') return 'overview';
    if (activeTab === 'customers') {
      if (customersSubTab === 'list') return 'customers-list';
      if (customersSubTab === 'vip') return 'customers-vip';
      if (customersSubTab === 'reviews') return 'reviews';
      return 'customers-list';
    }
    if (activeTab === 'sales-orders') {
      if (salesOrdersSubTab === 'pos') return 'pos-sales';
      if (salesOrdersSubTab === 'list') return 'sales-orders-list';
      if (salesOrdersSubTab === 'returns') return 'returns-exchange';
    }
    if (activeTab === 'products-inventory') {
      if (productsInventorySubTab === 'list') return 'products-database';
      if (productsInventorySubTab === 'matrix') return 'stocker-inventory';
      if (productsInventorySubTab === 'restock') return 'restock';
      if (productsInventorySubTab === 'transfer') return 'stocker-transfer';
    }
    if (activeTab === 'staff-schedule') {
      if (staffScheduleSubTab === 'payroll') return 'staff';
      if (staffScheduleSubTab === 'shifts') return 'shifts';
      if (staffScheduleSubTab === 'approval') return 'attendance';
      if (staffScheduleSubTab === 'requests') return 'attendance';
    }
    if (activeTab === 'finance-profit') {
      if (financeProfitSubTab === 'costs') return 'costs';
      if (financeProfitSubTab === 'p-l') return 'finance-profit';
      if (financeProfitSubTab === 'recon') return 'recon';
    }
    if (activeTab === 'settings-roles') {
      if (settingsRolesSubTab === 'brand') return 'settings';
      if (settingsRolesSubTab === 'announcements') return 'announcements';
      if (settingsRolesSubTab === 'audit-logs') return 'audit-logs';
      if (settingsRolesSubTab === 'directives') {
        return currentUser.role === 'director' ? 'audit-logs' : 'announcements';
      }
    }
    return activeTab;
  };

  const handleSidebarChange = (tabId: string) => {
    if (tabId === 'overview') {
      setActiveTab('overview');
    } else if (tabId === 'pos-sales') {
      setActiveTab('sales-orders');
      setSalesOrdersSubTab('pos');
    } else if (tabId === 'sales-orders-list') {
      setActiveTab('sales-orders');
      setSalesOrdersSubTab('list');
    } else if (tabId === 'returns-exchange') {
      setActiveTab('sales-orders');
      setSalesOrdersSubTab('returns');
    } else if (tabId === 'customers-list') {
      setActiveTab('customers');
      setCustomersSubTab('list');
    } else if (tabId === 'customers-vip') {
      setActiveTab('customers');
      setCustomersSubTab('vip');
    } else if (tabId === 'reviews') {
      setActiveTab('customers');
      setCustomersSubTab('reviews');
    } else if (tabId === 'products-database') {
      setActiveTab('products-inventory');
      setProductsInventorySubTab('list');
    } else if (tabId === 'stocker-inventory') {
      setActiveTab('products-inventory');
      setProductsInventorySubTab('matrix');
    } else if (tabId === 'restock') {
      setActiveTab('products-inventory');
      setProductsInventorySubTab('restock');
    } else if (tabId === 'stocker-transfer') {
      setActiveTab('products-inventory');
      setProductsInventorySubTab('transfer');
    } else if (tabId === 'staff') {
      setActiveTab('staff-schedule');
      setStaffScheduleSubTab('payroll');
    } else if (tabId === 'shifts') {
      setActiveTab('staff-schedule');
      setStaffScheduleSubTab('shifts');
    } else if (tabId === 'attendance') {
      setActiveTab('staff-schedule');
      if (['director', 'manager', 'accountant'].includes(currentUser?.role)) {
        setStaffScheduleSubTab('approval');
      } else {
        setStaffScheduleSubTab('requests');
      }
    } else if (tabId === 'costs') {
      setActiveTab('finance-profit');
      setFinanceProfitSubTab('costs');
    } else if (tabId === 'finance-profit') {
      setActiveTab('finance-profit');
      setFinanceProfitSubTab('p-l');
    } else if (tabId === 'recon') {
      setActiveTab('finance-profit');
      setFinanceProfitSubTab('recon');
    } else if (tabId === 'announcements') {
      setActiveTab('settings-roles');
      setSettingsRolesSubTab('announcements');
    } else if (tabId === 'audit-logs') {
      setActiveTab('settings-roles');
      setSettingsRolesSubTab('audit-logs');
    } else if (tabId === 'settings') {
      setActiveTab('settings-roles');
      setSettingsRolesSubTab('brand');
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'create-order') {
      setActiveTab('sales-orders');
      setSalesOrdersSubTab('pos');
    } else if (action === 'add-product') {
      setActiveTab('products-inventory');
      setProductsInventorySubTab('list');
      setShowAddProductModal(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-brand-bg flex flex-col lg:flex-row text-brand-text">
      <AppSidebar
        currentUser={currentUser}
        activeTab={getSidebarActiveTab()}
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
          
          {/* Demo Quick Switcher Banner */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-brand-border p-4 shadow-sm">
            <h4 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-brand-accent-secondary" />
              Bộ chuyển đổi quyền ERP nhanh (Demo Switcher)
            </h4>
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-3 min-w-max">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => quickLogin(acc.email)}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between w-40 cursor-pointer active:scale-95 ${
                      currentUser?.email === acc.email
                        ? 'bg-brand-accent text-white border-brand-accent shadow-md'
                        : 'bg-white text-brand-text border-brand-border hover:bg-brand-bg'
                    }`}
                  >
                    <span className="truncate">{acc.name}</span>
                    <span className={`text-[8px] mt-0.5 ${currentUser?.email === acc.email ? 'text-white/60' : 'text-brand-muted'}`}>
                      {acc.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                  activeTab === 'products-inventory' ? productsInventorySubTab :
                  activeTab === 'staff-schedule' ? staffScheduleSubTab :
                  activeTab === 'finance-profit' ? financeProfitSubTab :
                  activeTab === 'promotions' ? promotionsSubTab :
                  activeTab === 'settings-roles' ? settingsRolesSubTab :
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
                  activeTab === 'customers' ? (
                    customersSubTab === 'list' ? 'cskh-customers-list' :
                    customersSubTab === 'vip' ? 'cskh-customers-vip' :
                    'none'
                  ) :
                  activeTab === 'sales-orders' && salesOrdersSubTab === 'pos' ? 'pos-sales' :
                  activeTab === 'sales-orders' && salesOrdersSubTab === 'returns' ? 'cskh-customers-tickets' :
                  activeTab === 'products-inventory' && productsInventorySubTab === 'list' ? 'products-database' :
                  activeTab === 'products-inventory' && productsInventorySubTab === 'matrix' ? 'stocker-inventory' :
                  activeTab === 'products-inventory' && productsInventorySubTab === 'transfer' ? 'stocker-transfer' :
                  activeTab === 'finance-profit' && financeProfitSubTab === 'recon' ? 'accountant-finance-recon' :
                  activeTab === 'promotions' && promotionsSubTab === 'coupons' ? 'coupons-management' :
                  activeTab === 'promotions' && promotionsSubTab === 'ai-marketing' ? 'ai-copilot' :
                  activeTab === 'settings-roles' && settingsRolesSubTab === 'brand' ? 'settings-tab' :
                  activeTab === 'settings-roles' && settingsRolesSubTab === 'channels' ? 'omnichannel' :
                  'none'
                }
                currentUser={currentUser}
                usersList={usersList}
                productsList={productsList}
                branchStock={branchStock}
                restockBranchProduct={restockBranchProduct}
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
                updateGlobalProductDetails={updateGlobalProductDetails}
                addGlobalProduct={addGlobalProduct}
                deleteGlobalProduct={deleteGlobalProduct}
              />

              {/* --- MANAGER SHIFT WEEKLY OVERVIEW --- */}
              {(activeTab === 'manager-shift-overview' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'shifts')) && ['director', 'manager', 'accountant'].includes(currentUser.role) && (() => {
                const today = new Date();
                today.setDate(today.getDate() + schedWeekOffset * 7);
                const startOfWeek = new Date(today);
                const dayOfWeek = today.getDay();
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                startOfWeek.setDate(today.getDate() + diffToMonday);

                const weekDays = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(startOfWeek);
                  d.setDate(startOfWeek.getDate() + i);
                  return d;
                });

                const shiftTypes = ['morning', 'afternoon', 'evening'] as const;
                const shiftColors: Record<string, string> = {
                  morning: 'bg-sky-50 border-sky-200 text-sky-700',
                  afternoon: 'bg-amber-50 border-amber-200 text-amber-700',
                  evening: 'bg-indigo-900 border-indigo-700 text-indigo-100',
                };
                const shiftEmoji: Record<string, string> = { morning: '🌅', afternoon: '☀️', evening: '🌙' };
                const shiftLabel: Record<string, string> = { morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối' };
                const shiftTime: Record<string, string> = { morning: '08–13h', afternoon: '13–18h', evening: '18–23h' };
                const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

                const branchEmployees = usersList.filter((u: any) => u.role === 'employee' && u.branch === currentUser.branch);
                const approvedShifts = shiftRequests.filter((s: any) => s.branch === currentUser.branch && s.status === 'approved');

                const getShiftsForSlot = (date: Date, type: string) => {
                  const dateStr = date.toISOString().split('T')[0];
                  return approvedShifts.filter((s: any) => s.date === dateStr && s.shiftType === type);
                };

                const openModal = (date: Date, type: 'morning' | 'afternoon' | 'evening') => {
                  setShiftModal({
                    date: date.toISOString().split('T')[0],
                    shiftType: type,
                    employeeId: branchEmployees[0]?.id || '',
                    comment: '',
                  });
                };

                const handleSubmitShift = () => {
                  if (!shiftModal || !shiftModal.employeeId) return;
                  addShiftDirectly(shiftModal.employeeId, shiftModal.date, shiftModal.shiftType, shiftModal.comment);
                  setShiftModal(null);
                };

                const weekAssigned = approvedShifts.filter((s: any) => weekDays.some(d => d.toISOString().split('T')[0] === s.date)).length;

                return (
                  <div>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                      <div>
                        <h3 className="text-lg font-black text-neutral-950 tracking-tight uppercase">Tổng quan lịch ca tuần</h3>
                        <p className="text-xs text-neutral-400 mt-1">Chi nhánh: <span className="font-bold text-neutral-700">{currentUser.branch}</span> • Click ô trống để xếp ca ngay</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSchedWeekOffset(w => w - 1)} className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold hover:bg-neutral-50 transition-all cursor-pointer">← Trước</button>
                        <button onClick={() => setSchedWeekOffset(0)} className="px-3 py-1.5 rounded-xl bg-neutral-950 text-white text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer">Tuần này</button>
                        <button onClick={() => setSchedWeekOffset(w => w + 1)} className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold hover:bg-neutral-50 transition-all cursor-pointer">Sau →</button>
                      </div>
                    </div>

                    {/* Summary widgets */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {[
                        { label: 'Ca đã xếp tuần này', value: weekAssigned, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Nhân viên chi nhánh', value: branchEmployees.length, color: 'text-sky-600', bg: 'bg-sky-50' },
                        { label: 'Ca còn trống', value: Math.max(0, 7 * 3 - weekAssigned), color: 'text-rose-600', bg: 'bg-rose-50' },
                        { label: 'Đơn nghỉ chờ duyệt', value: leaveRequests.filter((r: any) => r.branch === currentUser.branch && r.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                      ].map((w) => (
                        <div key={w.label} className={`${w.bg} rounded-2xl p-4 border border-white`}>
                          <span className={`text-2xl font-black ${w.color}`}>{w.value}</span>
                          <span className="block text-[9px] font-bold text-neutral-500 mt-0.5 uppercase tracking-wide">{w.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* ===== INLINE SHIFT MODAL ===== */}
                    <AnimatePresence>
                      {shiftModal && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                          onClick={(e) => { if (e.target === e.currentTarget) setShiftModal(null); }}
                        >
                          <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                            className="bg-white rounded-3xl shadow-2xl border border-neutral-100 w-full max-w-md overflow-hidden"
                          >
                            {/* Modal header */}
                            <div className={`px-6 py-5 flex items-center justify-between ${
                              shiftModal.shiftType === 'morning' ? 'bg-sky-50 border-b border-sky-100' :
                              shiftModal.shiftType === 'afternoon' ? 'bg-amber-50 border-b border-amber-100' :
                              'bg-indigo-950 border-b border-indigo-900'
                            }`}>
                              <div>
                                <h4 className={`text-sm font-black uppercase tracking-wide ${shiftModal.shiftType === 'evening' ? 'text-white' : 'text-neutral-900'}`}>
                                  {shiftEmoji[shiftModal.shiftType]} Xếp Ca {shiftLabel[shiftModal.shiftType]}
                                </h4>
                                <p className={`text-[10px] mt-0.5 font-semibold ${shiftModal.shiftType === 'evening' ? 'text-indigo-300' : 'text-neutral-500'}`}>
                                  {shiftModal.date} • {shiftTime[shiftModal.shiftType]}
                                </p>
                              </div>
                              <button
                                onClick={() => setShiftModal(null)}
                                className={`p-1.5 rounded-full transition-all cursor-pointer ${shiftModal.shiftType === 'evening' ? 'text-indigo-300 hover:bg-indigo-800' : 'text-neutral-400 hover:bg-neutral-200'}`}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Modal body */}
                            <div className="px-6 py-5 space-y-4">
                              {branchEmployees.length === 0 ? (
                                <p className="text-sm text-neutral-400 text-center py-4">Chưa có nhân viên nào thuộc chi nhánh này.</p>
                              ) : (
                                <>
                                  <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Chọn nhân viên trực</label>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                      {branchEmployees.map((emp: any) => (
                                        <button
                                          key={emp.id}
                                          type="button"
                                          onClick={() => setShiftModal(prev => prev ? { ...prev, employeeId: emp.id } : null)}
                                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                                            shiftModal.employeeId === emp.id
                                              ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                                              : 'border-neutral-100 hover:border-neutral-300 bg-white'
                                          }`}
                                        >
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                            {emp.name.split(' ').pop()?.charAt(0)}
                                          </div>
                                          <div className="min-w-0">
                                            <span className="text-xs font-bold text-neutral-900 block truncate">{emp.name}</span>
                                            <span className="text-[9px] text-neutral-400 font-mono">{emp.id}</span>
                                          </div>
                                          {shiftModal.employeeId === emp.id && (
                                            <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 ml-auto" />
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">Ghi chú (tuỳ chọn)</label>
                                    <input
                                      type="text"
                                      placeholder="Nhắc nhở nhân viên về ca này..."
                                      value={shiftModal.comment}
                                      onChange={(e) => setShiftModal(prev => prev ? { ...prev, comment: e.target.value } : null)}
                                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-neutral-500 bg-neutral-50 focus:bg-white transition-all"
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Modal footer */}
                            <div className="px-6 pb-5 flex gap-2">
                              <button
                                onClick={() => setShiftModal(null)}
                                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={handleSubmitShift}
                                disabled={!shiftModal.employeeId}
                                className="flex-1 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                              >
                                ✓ Chốt ca ngay
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ===== WEEKLY GRID ===== */}
                    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100">
                              <th className="p-3 text-left text-[9px] font-black text-neutral-400 uppercase tracking-wider w-[110px]">Ca / Ngày</th>
                              {weekDays.map((d, i) => {
                                const isToday = d.toDateString() === new Date().toDateString();
                                return (
                                  <th key={i} className={`p-3 text-center text-[9px] font-black uppercase tracking-wider ${isToday ? 'bg-amber-50 text-amber-700' : 'text-neutral-400'}`}>
                                    <span className="block">{dayNames[i]}</span>
                                    <span className={`text-sm font-black block mt-0.5 ${isToday ? 'text-amber-600' : 'text-neutral-700'}`}>{d.getDate()}/{d.getMonth() + 1}</span>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {shiftTypes.map((type) => (
                              <tr key={type} className="border-b border-neutral-50 last:border-0">
                                {/* Row label */}
                                <td className="p-2 border-r border-neutral-50 align-middle">
                                  <div className={`inline-flex flex-col items-center px-2 py-1.5 rounded-xl border text-center w-full ${shiftColors[type]}`}>
                                    <span className="text-sm leading-none">{shiftEmoji[type]}</span>
                                    <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">{shiftLabel[type]}</span>
                                    <span className="text-[7px] opacity-70 font-mono">{shiftTime[type]}</span>
                                  </div>
                                </td>

                                {/* Day cells */}
                                {weekDays.map((d, di) => {
                                  const shifts = getShiftsForSlot(d, type);
                                  const isEmpty = shifts.length === 0;
                                  return (
                                    <td key={di} className="p-1.5 align-top">
                                      {isEmpty ? (
                                        /* ---- EMPTY CELL: click to open modal ---- */
                                        <button
                                          type="button"
                                          onClick={() => openModal(d, type)}
                                          className="w-full h-full min-h-[60px] rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-rose-50 hover:border-rose-400 active:scale-95 transition-all group"
                                          title={`Xếp ca ${shiftLabel[type]} ngày ${d.getDate()}/${d.getMonth() + 1}`}
                                        >
                                          <Plus className="w-3.5 h-3.5 text-rose-300 group-hover:text-rose-500 transition-colors" />
                                          <span className="text-[7px] text-rose-300 group-hover:text-rose-500 font-bold">Trống</span>
                                        </button>
                                      ) : (
                                        /* ---- FILLED CELL: show assigned employee(s) + delete on hover ---- */
                                        <div className="min-h-[60px] space-y-1">
                                          {shifts.map((s: any) => (
                                            <div key={s.id} className={`relative group rounded-xl border px-2 py-1.5 ${shiftColors[type]}`}>
                                              <span className="text-[8px] font-bold block truncate">{s.name.split(' ').pop()}</span>
                                              <span className="text-[7px] opacity-70 block truncate">{s.name.split(' ').slice(0, -1).join(' ')}</span>
                                              {/* Delete on hover */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (confirm(`Hủy ca ${shiftLabel[type]} ngày ${s.date} của ${s.name}?`)) {
                                                    deleteShiftRequest(s.id);
                                                  }
                                                }}
                                                className="absolute inset-0 w-full h-full rounded-xl bg-rose-600/90 text-white text-[8px] font-black items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex"
                                                title="Xóa ca này"
                                              >
                                                <X className="w-3 h-3" /> Hủy ca
                                              </button>
                                            </div>
                                          ))}
                                          {/* Add another person to same slot */}
                                          <button
                                            type="button"
                                            onClick={() => openModal(d, type)}
                                            className="w-full mt-0.5 py-1 rounded-lg border border-dashed border-neutral-200 text-neutral-300 hover:border-neutral-400 hover:text-neutral-500 text-[7px] font-bold flex items-center justify-center gap-0.5 cursor-pointer transition-all"
                                            title="Thêm nhân viên vào ca này"
                                          >
                                            <Plus className="w-2.5 h-2.5" /> thêm
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-4 text-[9px] font-bold text-neutral-400">
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-dashed border-rose-300 bg-rose-50" /> Click ô trống → xếp ca</span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-sky-100 border border-sky-200" /> Ca sáng 08:00–13:00</span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /> Ca chiều 13:00–18:00</span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-indigo-900" /> Ca tối 18:00–23:00</span>
                      <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-500" /> Hover vào nhân viên → hủy ca</span>
                    </div>
                  </div>
                );
              })()}



              {/* --- CENTRALIZED DIGITAL INTRANET & WORKSPACE SUITE --- */}
              {/* --- AI MARKETING CAMPAIGN COPILOT & DISPATCH DESK --- */}
              {(activeTab === 'campaigns' || (activeTab === 'promotions' && promotionsSubTab === 'ai-marketing')) && currentUser.role === 'cskh' && (
                <CampaignCopilot currentUser={currentUser} usersList={usersList} />
              )}


              {/* --- SHARED TABS: PROFILE & ANNOUNCEMENTS VIEW --- */}
              {(activeTab === 'profile' || (activeTab === 'overview' && ['director', 'accountant', 'manager', 'cskh'].includes(currentUser.role))) && (
                <div>
                  <h3 className="text-lg font-black text-neutral-950 tracking-tight mb-2 uppercase">Thông báo từ ban giám đốc</h3>
                  <p className="text-xs text-neutral-450 mb-8">Nơi cập nhật kịp thời các văn bản, thông tri chỉ đạo và kế hoạch triển khai của NOVYN WEAR.</p>

                  <div className="space-y-6 mb-10">
                    {announcements
                      .filter((ann: any) => {
                        if (ann.recipientType === 'all') return true;
                        if (ann.recipientType === 'accountant' && currentUser.role === 'accountant') return true;
                        if (ann.recipientType === 'branch_q1' && currentUser.branch === 'Chi nhánh Quận 1') return true;
                        if (ann.recipientType === 'branch_td' && currentUser.branch === 'Chi nhánh Thảo Điền') return true;
                        return false;
                      })
                      .map((ann: any) => (
                        <div key={ann.id} className="bg-gradient-to-br from-amber-50/60 to-amber-100/30 p-5 rounded-3xl border border-amber-250/70 shadow-sm flex items-start gap-4 animate-pulse">
                          <Megaphone className="w-5 h-5 text-amber-550 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-black text-neutral-900 mb-1">{ann.title}</h4>
                            <p className="text-xs font-medium text-neutral-700 leading-relaxed whitespace-pre-line mb-3">{ann.content}</p>
                            <span className="text-[9px] text-neutral-450 font-bold">Người gửi: {ann.senderName} • lúc {ann.createdAt}</span>
                          </div>
                        </div>
                      ))}
                    {announcements.filter((ann: any) => {
                      if (ann.recipientType === 'all') return true;
                      if (ann.recipientType === 'accountant' && currentUser.role === 'accountant') return true;
                      if (ann.recipientType === 'branch_q1' && currentUser.branch === 'Chi nhánh Quận 1') return true;
                      if (ann.recipientType === 'branch_td' && currentUser.branch === 'Chi nhánh Thảo Điền') return true;
                      return false;
                    }).length === 0 && (
                      <p className="text-xs text-neutral-450 italic text-center py-12 bg-neutral-50 rounded-2xl border">Hôm nay hệ thống không có thông tri mới.</p>
                    )}
                  </div>

                  {/* --- BENTO GRID OF 8 KPI CARDS --- */}
                  <h3 className="text-sm font-black text-neutral-900 tracking-tight mb-4 uppercase">Chỉ số vận hành hệ thống (KPIs)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* 1. Doanh thu gộp */}
                    <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-2 md:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Doanh thu gộp</span>
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                          <DollarSign className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{formatPrice(totalRevenue)}</span>
                        <span className="text-[8px] text-emerald-600 font-bold mt-1 block">Hoàn tất thanh toán</span>
                      </div>
                    </div>

                    {/* 2. Đơn hàng hoàn thành */}
                    <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-1 md:col-span-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Đơn thành công</span>
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{completedOrdersCount} đơn</span>
                        <span className="text-[8px] text-indigo-600 font-bold mt-1 block">Đã đối soát kho</span>
                      </div>
                    </div>

                    {/* 3. Tỷ lệ chuyển đổi */}
                    <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-1 md:col-span-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Tỷ lệ chuyển đổi</span>
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                          <BarChart2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{conversionRate}</span>
                        <span className="text-[8px] text-amber-600 font-bold mt-1 block">Trung bình hệ thống</span>
                      </div>
                    </div>

                    {/* 4. Lợi nhuận ròng */}
                    <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-2 md:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Lợi nhuận ròng</span>
                        <div className={`p-1.5 rounded-lg ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <span className={`text-sm md:text-base font-black font-mono block ${netProfit >= 0 ? 'text-neutral-900' : 'text-rose-600'}`}>
                          {netProfit >= 0 ? '+' : ''}{formatPrice(netProfit)}
                        </span>
                        <span className={`text-[8px] font-bold mt-1 block ${netProfit >= 0 ? 'text-emerald-650' : 'text-rose-655'}`}>
                          {netProfit >= 0 ? 'Khấu trừ thuế & lương' : 'Cần tối ưu chi phí'}
                        </span>
                      </div>
                    </div>

                    {/* 5. Sản phẩm bán chạy */}
                    <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-2 md:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Sản phẩm bán chạy</span>
                        <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-black text-neutral-900 block truncate">{bestSellerName}</span>
                        <span className="text-[8px] text-rose-600 font-bold mt-1 block">Xếp hạng theo sản lượng bán ra</span>
                      </div>
                    </div>

                    {/* 6. Tồn kho thấp */}
                    <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-1 md:col-span-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Tồn kho thấp</span>
                        <div className={`p-1.5 rounded-lg ${lowStockCount > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-neutral-50 text-neutral-450'}`}>
                          <Box className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{lowStockCount} mặt hàng</span>
                        <span className={`text-[8px] font-bold mt-1 block ${lowStockCount > 0 ? 'text-amber-600' : 'text-neutral-450'}`}>
                          {lowStockCount > 0 ? 'Cần lập kế hoạch restock' : 'Tồn kho ổn định'}
                        </span>
                      </div>
                    </div>

                    {/* 7. Đơn chờ xử lý */}
                    <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-1 md:col-span-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Đơn chờ xử lý</span>
                        <div className={`p-1.5 rounded-lg ${pendingOrdersCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-neutral-50 text-neutral-400'}`}>
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{pendingOrdersCount} đơn</span>
                        <span className="text-[8px] text-neutral-400 font-bold mt-1 block">Đang chờ xác nhận POS</span>
                      </div>
                    </div>

                    {/* 8. Tỷ lệ hoàn hàng */}
                    <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-neutral-100/70 hover:shadow-md transition-all flex flex-col justify-between col-span-2 md:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider">Tỷ lệ hoàn hàng</span>
                        <div className="p-1.5 rounded-lg bg-neutral-100 text-neutral-500">
                          <TrendingDown className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div>
                        <span className="text-sm md:text-base font-black text-neutral-900 block font-mono">{returnRate}</span>
                        <span className="text-[8px] text-neutral-400 font-bold mt-1 block">Mục tiêu kiểm soát &lt; 2.0%</span>
                      </div>
                    </div>
                  </div>

                  {/* personal overview widgets */}
                  <h3 className="text-sm font-black text-neutral-950 tracking-tight mb-4 uppercase">Thông tin cá nhân & Nhân sự</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                      <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Mức lương cơ bản</span>
                      <span className="text-base font-black text-neutral-900">{currentUser.salary ? formatPrice(currentUser.salary) : 'Mức lương thoả thuận'}</span>
                    </div>
                    <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-100">
                      <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Mã định danh nhân viên</span>
                      <span className="text-base font-black text-neutral-900 font-mono">{currentUser.id}</span>
                    </div>
                  </div>

                  {/* --- CENTRALIZED DAILY OPERATIONS REPORT SYSTEM --- */}
                  {(currentUser.role === 'director' || currentUser.role === 'manager' || currentUser.role === 'accountant' || currentUser.role === 'cskh') && (
                    <div className="mt-8 border-t border-neutral-100 pt-8">
                      {currentUser.role === 'director' ? (
                        /* Director View: Read all reports split visually into two sections */
                        <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                          <h4 className="text-xs font-black text-neutral-900 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-rose-500" />
                            Báo cáo vận hành tổng hợp toàn công ty
                          </h4>
                          <p className="text-[10px] text-neutral-450 mb-6">Tập hợp các báo cáo cuối ca từ quản lý các chi nhánh, bộ phận CSKH, và kế toán trưởng.</p>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Cột trái: Báo cáo chưa đọc */}
                            <div className="flex flex-col bg-amber-50/10 rounded-2xl border border-amber-200/30 p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="text-[10px] font-black text-amber-900 tracking-wider uppercase flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                                  Chưa đọc ({dailyReports.filter((r: any) => r.status === 'unread').length})
                                </h5>
                              </div>
                              
                              <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1 flex-grow">
                                {(() => {
                                  const unreadReports = dailyReports.filter((r: any) => r.status === 'unread');
                                  if (unreadReports.length === 0) {
                                    return (
                                      <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                                        <CheckCircle2 className="w-8 h-8 text-amber-500/50 mb-2" />
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Tuyệt vời! Đã xem hết báo cáo</p>
                                        <p className="text-[9px] text-neutral-400 mt-1">Không có báo cáo nào chưa đọc.</p>
                                      </div>
                                    );
                                  }
                                  return unreadReports.map((rep: any) => {
                                    const isExpanded = viewingReportId === rep.id;
                                    return (
                                      <div
                                        key={rep.id}
                                        className="bg-white border border-amber-250/65 rounded-xl p-4 transition-all duration-300 shadow-sm hover:shadow-md hover:border-amber-350/80 ring-1 ring-amber-50/50"
                                      >
                                        <div className="flex justify-between items-start gap-2">
                                          <div className="min-w-0 flex-grow">
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider text-white ${
                                                rep.branch.includes('Quận 1') 
                                                  ? 'bg-rose-500' 
                                                  : rep.branch.includes('Thảo Điền') 
                                                  ? 'bg-amber-500'
                                                  : rep.role === 'cskh'
                                                  ? 'bg-purple-500'
                                                  : 'bg-indigo-500'
                                              }`}>
                                                {rep.branch}
                                              </span>
                                              <span className="text-[9px] text-neutral-450 font-bold">{rep.name}</span>
                                            </div>
                                            <h6 className="text-[11px] font-black text-neutral-900 leading-snug">{rep.title}</h6>
                                          </div>
                                          
                                          <button
                                            onClick={() => {
                                              if (isExpanded) {
                                                setViewingReportId(null);
                                              } else {
                                                setViewingReportId(rep.id);
                                                markReportAsRead(rep.id);
                                              }
                                            }}
                                            className="bg-neutral-950 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg hover:bg-neutral-850 transition-colors shrink-0 cursor-pointer active:scale-95 shadow-sm"
                                          >
                                            {isExpanded ? 'Đóng' : 'Xem & Đọc'}
                                          </button>
                                        </div>

                                        {isExpanded && (
                                          <div className="mt-3 pt-3 border-t border-dashed border-neutral-200">
                                            <p className="text-[9px] text-neutral-400 font-bold uppercase mb-1">Nội dung chi tiết:</p>
                                            <div className="bg-neutral-50/50 p-3 rounded-lg border text-[11px] text-neutral-700 leading-relaxed whitespace-pre-line font-medium">
                                              {rep.content}
                                            </div>
                                            <div className="flex justify-between items-center mt-2.5 text-[8px] text-neutral-450 font-semibold">
                                              <span>Gửi lúc: {rep.createdAt}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>

                            {/* Cột phải: Báo cáo đã đọc */}
                            <div className="flex flex-col bg-neutral-50/50 rounded-2xl border border-neutral-200/40 p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="text-[10px] font-black text-neutral-600 tracking-wider uppercase flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  Đã đọc ({dailyReports.filter((r: any) => r.status === 'read').length})
                                </h5>
                              </div>
                              
                              <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1 flex-grow">
                                {(() => {
                                  const readReports = dailyReports.filter((r: any) => r.status === 'read');
                                  if (readReports.length === 0) {
                                    return (
                                      <div className="flex flex-col items-center justify-center py-12 text-center select-none">
                                        <FileText className="w-8 h-8 text-neutral-300 mb-2" />
                                        <p className="text-[10px] text-neutral-455 font-bold uppercase tracking-wide">Chưa đọc báo cáo nào</p>
                                        <p className="text-[9px] text-neutral-400 mt-1">Các báo cáo sau khi đọc sẽ chuyển vào đây.</p>
                                      </div>
                                    );
                                  }
                                  return readReports.map((rep: any) => {
                                    const isExpanded = viewingReportId === rep.id;
                                    return (
                                      <div
                                        key={rep.id}
                                        className="bg-white border border-neutral-200/50 rounded-xl p-4 transition-all duration-300 hover:border-neutral-300 hover:shadow-sm"
                                      >
                                        <div className="flex justify-between items-start gap-2">
                                          <div className="min-w-0 flex-grow">
                                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                              <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider text-white opacity-75 ${
                                                rep.branch.includes('Quận 1') 
                                                  ? 'bg-rose-500' 
                                                  : rep.branch.includes('Thảo Điền') 
                                                  ? 'bg-amber-500'
                                                  : rep.role === 'cskh'
                                                  ? 'bg-purple-500'
                                                  : 'bg-indigo-500'
                                              }`}>
                                                {rep.branch}
                                              </span>
                                              <span className="text-[9px] text-neutral-450 font-bold">{rep.name}</span>
                                            </div>
                                            <h6 className="text-[11px] font-bold text-neutral-700 leading-snug line-clamp-1">{rep.title}</h6>
                                          </div>
                                          
                                          <button
                                            onClick={() => {
                                              setViewingReportId(isExpanded ? null : rep.id);
                                            }}
                                            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer active:scale-95"
                                          >
                                            {isExpanded ? 'Đóng' : 'Xem'}
                                          </button>
                                        </div>

                                        {isExpanded && (
                                          <div className="mt-3 pt-3 border-t border-dashed border-neutral-200">
                                            <p className="text-[9px] text-neutral-400 font-bold uppercase mb-1">Nội dung chi tiết:</p>
                                            <div className="bg-neutral-50/50 p-3 rounded-lg border text-[11px] text-neutral-700 leading-relaxed whitespace-pre-line font-medium">
                                              {rep.content}
                                            </div>
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2.5 gap-1.5 text-[8px] text-neutral-450 font-semibold border-t border-neutral-100 pt-2.5">
                                              <span>Gửi lúc: {rep.createdAt}</span>
                                              {rep.readAt && (
                                                <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                                  Đã xem lúc: {rep.readAt}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Staff Views: Manager, Accountant, CSKH: Submit report & see history */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Panel: Submit Form */}
                          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                            <h4 className="text-xs font-black text-neutral-900 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                              <PlusCircle className="w-4 h-4 text-neutral-800 animate-pulse" />
                              Soạn báo cáo gửi Giám đốc
                            </h4>
                            <p className="text-[10px] text-neutral-450 mb-6">Gửi thông số vận hành, sự vụ hoặc tổng hợp công việc trong ngày lên sếp Bảo.</p>
                            
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (reportTitle && reportContent) {
                                  submitDailyReport(reportTitle, reportContent);
                                  setReportTitle('');
                                  setReportContent('');
                                }
                              }}
                              className="space-y-4"
                            >
                              <div>
                                <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Tiêu đề báo cáo</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ví dụ: Báo cáo CSKH cuối ngày hoặc doanh số chi nhánh..."
                                  value={reportTitle}
                                  onChange={(e) => setReportTitle(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white font-semibold text-neutral-800"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Nội dung chi tiết</label>
                                <textarea
                                  required
                                  rows={5}
                                  placeholder="Nội dung cụ thể công việc đã xử lý, phát sinh, đề xuất ý kiến..."
                                  value={reportContent}
                                  onChange={(e) => setReportContent(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white resize-none font-medium"
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                              >
                                Gửi báo cáo vận hành lên sếp Bảo
                              </button>
                            </form>
                          </div>

                          {/* Right Panel: History Logs */}
                          <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm flex flex-col">
                            <h4 className="text-xs font-black text-neutral-900 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-emerald-500" />
                              Lịch sử báo cáo đã nộp
                            </h4>
                            <p className="text-[10px] text-neutral-450 mb-6">Theo dõi tiến độ xem báo cáo từ Giám đốc Bảo.</p>

                            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 flex-grow">
                              {dailyReports
                                .filter((rep: any) => rep.userId === currentUser.id)
                                .map((rep: any) => {
                                  const isUnread = rep.status === 'unread';
                                  return (
                                    <div key={rep.id} className="p-3 bg-neutral-50/50 border border-neutral-200/40 rounded-xl text-xs leading-normal">
                                      <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-bold text-neutral-800 tracking-wide truncate max-w-[150px]">{rep.title}</h5>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shrink-0 ${
                                          isUnread
                                            ? 'bg-amber-50 text-amber-500 border border-amber-100 animate-pulse'
                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        }`}>
                                          {isUnread ? 'Chưa đọc' : 'Sếp đã đọc'}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-neutral-400">Ngày gửi: {rep.createdAt}</p>
                                      {rep.readAt && (
                                        <p className="text-[9px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                          Đã xem: {rep.readAt}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              {dailyReports.filter((rep: any) => rep.userId === currentUser.id).length === 0 && (
                                <p className="text-xs text-neutral-400 italic text-center py-12 select-none">Bạn chưa gửi báo cáo nào.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* --- EMPLOYEE SHIFTS & CLOCK IN/OUT --- */}
              {(activeTab === 'employee-shifts-clock' || (activeTab === 'overview' && ['employee', 'cashier', 'stocker'].includes(currentUser.role)) || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'shifts' && ['employee', 'cashier', 'stocker'].includes(currentUser.role))) && ['employee', 'cashier', 'stocker'].includes(currentUser.role) && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Ca làm việc & Điểm danh</h3>
                  <p className="text-xs text-neutral-400 mb-8">Theo dõi lịch làm việc chính thức do Quản lý phân công và thực hiện chấm công định kỳ.</p>

                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
                    {(() => {
                      const today = new Date();
                      today.setDate(today.getDate() + schedWeekOffset * 7);
                      const startOfWeek = new Date(today);
                      const dayOfWeek = today.getDay();
                      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                      startOfWeek.setDate(today.getDate() + diffToMonday);

                      const weekDays = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(startOfWeek);
                        d.setDate(startOfWeek.getDate() + i);
                        return d;
                      });

                      const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                      const shiftTypes = ['morning', 'afternoon', 'evening'] as const;
                      const shiftEmoji: Record<string, string> = { morning: '🌅', afternoon: '☀️', evening: '🌙' };
                      const shiftLabel: Record<string, string> = { morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối' };
                      const shiftTime: Record<string, string> = { morning: '08–13h', afternoon: '13–18h', evening: '18–23h' };

                      const approvedShifts = shiftRequests.filter(
                        (s: any) => s.branch === currentUser.branch && s.status === 'approved'
                      );

                      const getShiftsForSlot = (date: Date, type: string) => {
                        const dateStr = date.toISOString().split('T')[0];
                        return approvedShifts.filter((s: any) => s.date === dateStr && s.shiftType === type);
                      };

                      const weekDatesStr = weekDays.map(d => d.toISOString().split('T')[0]);
                      const swapCandidates = approvedShifts.filter(
                        (s: any) => s.userId !== currentUser.id && weekDatesStr.includes(s.date)
                      );

                      return (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            <div>
                              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide">Tổng quan lịch làm toàn chi nhánh</h4>
                              <p className="text-[10px] text-neutral-450 mt-1">Chi nhánh: <span className="font-bold text-neutral-700">{currentUser.branch}</span> • Rà soát lịch làm đồng nghiệp & Gửi yêu cầu đổi ca trực tiếp</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setSchedWeekOffset(w => w - 1)} className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white text-[10px] font-bold hover:bg-neutral-50 cursor-pointer">← Trước</button>
                              <button onClick={() => setSchedWeekOffset(0)} className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-[10px] font-bold hover:bg-neutral-800 cursor-pointer">Tuần này</button>
                              <button onClick={() => setSchedWeekOffset(w => w + 1)} className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white text-[10px] font-bold hover:bg-neutral-50 cursor-pointer">Sau →</button>
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-neutral-100 rounded-2xl mb-6">
                            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                              <thead>
                                <tr className="bg-neutral-50 text-neutral-550 font-bold border-b border-neutral-150 uppercase tracking-wider text-[8px]">
                                  <th className="p-3 w-1/8 text-center bg-neutral-100/50">Ca làm</th>
                                  {weekDays.map((d, i) => (
                                    <th key={i} className="p-3 text-center w-1/8 border-l border-neutral-100">
                                      <span className="block text-[8px] text-neutral-450 font-black">{dayNames[i]}</span>
                                      <span className="block text-[10px] font-mono mt-0.5 text-neutral-800">{d.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' })}</span>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-100 font-medium">
                                {shiftTypes.map((type) => (
                                  <tr key={type} className="hover:bg-neutral-50/10">
                                    <td className="p-3 text-center font-bold bg-neutral-50/30">
                                      <span className="block text-[10px] font-black">{shiftEmoji[type]} {shiftLabel[type]}</span>
                                      <span className="block text-[8px] text-neutral-400 font-mono mt-0.5">{shiftTime[type]}</span>
                                    </td>
                                    {weekDays.map((d, i) => {
                                      const slots = getShiftsForSlot(d, type);
                                      return (
                                        <td key={i} className="p-2 border-l border-neutral-100 align-top min-h-[70px]">
                                          <div className="space-y-1">
                                            {slots.map((s: any) => {
                                              const isMe = s.userId === currentUser.id;
                                              return (
                                                <div
                                                  key={s.id}
                                                  className={`group relative p-1.5 rounded-xl border text-[9px] font-bold text-center transition-all ${
                                                    isMe ? 'bg-sky-500 border-sky-600 text-white shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                                                  }`}
                                                >
                                                  <span className="block truncate">{s.name}</span>
                                                  {isMe && (
                                                    <button
                                                      type="button"
                                                      onClick={() => setSwapModal({ fromShiftId: s.id })}
                                                      className="absolute inset-0 w-full h-full rounded-xl bg-neutral-900/90 text-white text-[8px] font-black items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex"
                                                      title="Yêu cầu đổi ca trực này"
                                                    >
                                                      🔄 Xin đổi ca
                                                    </button>
                                                  )}
                                                </div>
                                              );
                                            })}
                                            {slots.length === 0 && (
                                              <span className="block text-center text-[8px] text-neutral-350 italic py-2">Trống</span>
                                            )}
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <p className="text-[9px] text-neutral-400 font-medium mb-6 leading-relaxed bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                            💡 **Mẹo đổi ca**: Hover và nhấp chọn nút **&quot;🔄 Xin đổi ca&quot;** ở ca trực của bạn trong lưới tuần. Chọn ca muốn đổi của đồng nghiệp khác, hệ thống sẽ gửi yêu cầu trực tiếp đến tài khoản của họ để duyệt tráo đổi ca trực tự động.
                          </p>

                          <AnimatePresence>
                            {swapModal && (() => {
                              const myShift = shiftRequests.find((s: any) => s.id === swapModal.fromShiftId);
                              if (!myShift) return null;

                              return (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                                  onClick={(e) => { if (e.target === e.currentTarget) setSwapModal(null); }}
                                >
                                  <motion.div
                                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.92, opacity: 0, y: 20 }}
                                    className="bg-white rounded-3xl shadow-2xl border border-neutral-100 w-full max-w-md overflow-hidden"
                                  >
                                    <div className="px-6 py-5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-white">
                                      <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider">🔄 Yêu cầu đổi ca làm việc</h4>
                                        <p className="text-[9px] text-neutral-400 mt-0.5">Tráo ca {shiftLabel[myShift.shiftType]} ({myShift.date}) của bạn</p>
                                      </div>
                                      <button onClick={() => setSwapModal(null)} className="p-1 rounded-full hover:bg-neutral-800 text-neutral-405 hover:text-white cursor-pointer">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                      <div>
                                        <label className="text-[8px] font-bold text-neutral-450 uppercase block mb-2">Chọn ca trực của đồng nghiệp muốn đổi lấy</label>
                                        <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2">
                                          {swapCandidates.map((cand: any) => (
                                            <button
                                              key={cand.id}
                                              type="button"
                                              onClick={() => {
                                                submitSwapRequest(myShift.id, cand.id);
                                                setSwapModal(null);
                                              }}
                                              className="w-full p-3 rounded-2xl border border-neutral-100 hover:border-neutral-350 hover:bg-neutral-50/50 text-left transition-all text-xs font-medium block cursor-pointer"
                                            >
                                              <div className="flex justify-between font-bold text-neutral-900">
                                                <span>{cand.name}</span>
                                                <span className="text-[10px] font-mono text-neutral-500">{cand.date}</span>
                                              </div>
                                              <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-1">
                                                <span>Ca {shiftLabel[cand.shiftType]} ({shiftTime[cand.shiftType]})</span>
                                                <span className="text-[8px] px-2 py-0.5 rounded-full bg-neutral-100 font-bold uppercase tracking-wider">Chọn đổi ca →</span>
                                              </div>
                                            </button>
                                          ))}
                                          {swapCandidates.length === 0 && (
                                            <p className="text-center py-6 text-neutral-450 italic text-[11px]">Không có ca trực nào của đồng nghiệp khác trong tuần này.</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                </motion.div>
                              );
                            })()}
                          </AnimatePresence>

                          <div className="mt-8 border-t border-neutral-50 pt-6">
                            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Danh sách các yêu cầu đổi ca</h4>
                            <div className="space-y-3">
                              {shiftSwapRequests
                                .filter((s: any) => s.toUserId === currentUser.id && s.status === 'pending')
                                .map((req: any) => (
                                  <div key={req.id} className="bg-gradient-to-br from-amber-50/50 to-amber-100/10 p-4 rounded-2xl border border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="text-xs font-medium text-neutral-700">
                                      <span className="font-bold text-neutral-900">{req.fromUserName}</span> muốn đổi ca{' '}
                                      <span className="font-black text-indigo-700 font-mono">Ca {shiftLabel[req.fromShiftType]} ({req.fromShiftDate})</span>{' '}
                                      lấy ca{' '}
                                      <span className="font-black text-sky-600 font-mono">Ca {shiftLabel[req.toShiftType]} ({req.toShiftDate})</span>{' '}
                                      của bạn.
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() => respondToSwapRequest(req.id, 'approved')}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase cursor-pointer"
                                      >
                                        Đồng ý
                                      </button>
                                      <button
                                        onClick={() => respondToSwapRequest(req.id, 'rejected')}
                                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[10px] font-bold uppercase cursor-pointer"
                                      >
                                        Từ chối
                                      </button>
                                    </div>
                                  </div>
                                ))}

                              {shiftSwapRequests
                                .filter((s: any) => s.fromUserId === currentUser.id && s.status === 'pending')
                                .map((req: any) => (
                                  <div key={req.id} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/50 flex items-center justify-between text-xs font-medium text-neutral-600">
                                    <div>
                                      Bạn đã đề xuất đổi ca{' '}
                                      <span className="font-bold text-sky-600">Ca {shiftLabel[req.fromShiftType]} ({req.fromShiftDate})</span>{' '}
                                      lấy ca{' '}
                                      <span className="font-bold text-indigo-700">Ca {shiftLabel[req.toShiftType]} ({req.toShiftDate})</span>{' '}
                                      của đồng nghiệp <span className="font-bold text-neutral-900">{req.toUserName}</span>.
                                    </div>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-250 uppercase font-black tracking-wider">⏳ Chờ phản hồi</span>
                                  </div>
                                ))}

                              {shiftSwapRequests
                                .filter(
                                  (s: any) =>
                                    (s.fromUserId === currentUser.id || s.toUserId === currentUser.id) &&
                                    s.status !== 'pending'
                                )
                                .slice(0, 3)
                                .map((req: any) => {
                                  const isApproved = req.status === 'approved';
                                  return (
                                    <div key={req.id} className="bg-white p-3 rounded-xl border border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-medium">
                                      <div>
                                        Yêu cầu đổi ca giữa bạn và <span className="font-bold text-neutral-900">{req.fromUserId === currentUser.id ? req.toUserName : req.fromUserName}</span> ({req.fromShiftDate} 🔄 {req.toShiftDate}).
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                                        isApproved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                      }`}>
                                        {isApproved ? '✓ Đã hoàn tất' : '✗ Bị từ chối'}
                                      </span>
                                    </div>
                                  );
                                })}

                              {shiftSwapRequests.filter((s: any) => (s.fromUserId === currentUser.id || s.toUserId === currentUser.id)).length === 0 && (
                                <p className="text-center py-6 text-neutral-450 italic text-[11px]">Chưa phát sinh yêu cầu đổi ca trực nào.</p>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Inline Style for scan line & radar animations */}
                  <style>{`
                    @keyframes scanLaser {
                      0%, 100% { top: 0%; opacity: 0.3; }
                      50% { top: 100%; opacity: 1; }
                    }
                    @keyframes mapPulse {
                      0% { transform: scale(0.9); opacity: 0.8; }
                      50% { transform: scale(1.15); opacity: 0.3; }
                      100% { transform: scale(1.35); opacity: 0; }
                    }
                    .animate-scan-laser {
                      position: absolute;
                      width: 100%;
                      height: 4px;
                      background: linear-gradient(to right, transparent, #10b981, transparent);
                      box-shadow: 0 0 10px #10b981, 0 0 20px #10b981;
                      animation: scanLaser 2.2s ease-in-out infinite;
                    }
                    .animate-map-pulse {
                      animation: mapPulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
                    }
                  `}</style>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    
                    {/* BENTO BLOCK 1: GPS Range & Store QR Scanner & Checklists (Col Span 8) */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                        <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-5 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-neutral-600" />
                          Trung tâm kiểm soát chấm công thông minh (GPS & QR)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* GPS Validation Panel with pulsing radar mini-map */}
                          <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-neutral-150/70 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Tọa độ GPS Showroom</span>
                                {isGPSCorrect ? (
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" /> TRONG PHẠM VI
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
                                    <AlertTriangle className="w-2.5 h-2.5" /> NGOÀI PHẠM VI
                                  </span>
                                )}
                              </div>

                              {/* Mini-map illustration using beautiful SVG */}
                              <div className="relative h-28 rounded-xl bg-neutral-900 overflow-hidden flex items-center justify-center border border-neutral-800 shadow-inner mb-3">
                                {/* Grid lines background */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:14px_24px]" />
                                
                                {/* Concentric circles */}
                                <div className="absolute w-24 h-24 rounded-full border border-neutral-850" />
                                <div className="absolute w-16 h-16 rounded-full border border-neutral-800" />
                                <div className="absolute w-8 h-8 rounded-full border border-neutral-750" />
                                
                                {/* Radar pulse */}
                                {isGPSCorrect && (
                                  <div className="absolute w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 animate-map-pulse" />
                                )}
                                
                                {/* Coordinates text */}
                                <div className="absolute top-2 left-2 text-[8px] font-mono text-neutral-500">
                                  LAT: {currentUser.branch === 'Chi nhánh Thảo Điền' ? '10.8015° N' : '10.7712° N'}<br />
                                  LNG: {currentUser.branch === 'Chi nhánh Thảo Điền' ? '106.7288° E' : '106.6901° E'}
                                </div>
                                <div className="absolute bottom-2 right-2 text-[8px] font-bold text-neutral-450">
                                  Chi nhánh: {currentUser.branch}
                                </div>

                                {/* Target pins */}
                                <div className="relative flex items-center justify-center">
                                  {isGPSCorrect ? (
                                    <>
                                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                      </div>
                                      <span className="absolute -bottom-5 text-[8px] font-black text-emerald-450 uppercase whitespace-nowrap bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">NOVYN STORE (OK)</span>
                                    </>
                                  ) : (
                                    <>
                                      {/* Showroom location */}
                                      <div className="absolute w-2 h-2 rounded-full bg-emerald-500/50" />
                                      {/* Simulated out-of-bounds user location */}
                                      <div className="translate-x-12 -translate-y-4 relative flex items-center justify-center">
                                        <div className="w-3.5 h-3.5 rounded-full bg-rose-500/20 flex items-center justify-center">
                                          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
                                        </div>
                                        <span className="absolute -bottom-5 text-[8px] font-black text-rose-400 uppercase whitespace-nowrap bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">LỆCH TỌA ĐỘ (120m)</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsGPSCorrect(true);
                                  showToast('Đã hiệu chỉnh & đồng bộ GPS trùng khớp tọa độ showroom!', 'success');
                                }}
                                className="flex-1 py-2 rounded-xl text-[10px] font-bold border border-neutral-250 hover:bg-neutral-50 bg-white text-neutral-800 transition-all cursor-pointer text-center"
                              >
                                🎯 Đồng bộ GPS
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsGPSCorrect(!isGPSCorrect);
                                  showToast(isGPSCorrect ? 'Đã giả lập di chuyển ra xa showroom (Lệch tọa độ)' : 'Đã đưa thiết bị trở về vùng phủ sóng showroom', 'info');
                                }}
                                className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                                  !isGPSCorrect ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                                }`}
                                title="Giả lập di chuyển ra ngoài showroom để test cảnh báo"
                              >
                                🚙 Giả lập
                              </button>
                            </div>
                          </div>

                          {/* QR Code Scanner terminal simulator */}
                          <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-neutral-150/70 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Quét QR tại Showroom</span>
                                {isQRScanned ? (
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                                    <Check className="w-2.5 h-2.5" /> ĐÃ QUÉT
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                                    <QrCode className="w-2.5 h-2.5" /> CHƯA QUÉT
                                  </span>
                                )}
                              </div>

                              <div className="h-28 rounded-xl bg-white border border-neutral-150 flex flex-col items-center justify-center p-3 text-center mb-3">
                                {isQRScanned ? (
                                  <>
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 shadow-sm">
                                      <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <p className="text-[9px] font-bold text-neutral-750">Mã QR Ca Trực Đã Được Xác Minh</p>
                                    <p className="text-[7px] text-neutral-400 mt-0.5">Thời gian quét: {new Date().toLocaleTimeString('vi-VN')}</p>
                                  </>
                                ) : (
                                  <>
                                    <QrCode className="w-8 h-8 text-neutral-350 stroke-1 mb-1.5 animate-pulse" />
                                    <p className="text-[9px] font-bold text-neutral-700">Yêu cầu quét QR tại quầy trưng bày</p>
                                    <p className="text-[7px] text-neutral-400 mt-0.5">Xác nhận đúng ca làm & địa điểm vật lý</p>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (isQRScanned) {
                                  setIsQRScanned(false);
                                  showToast('Đã xóa phiên quét QR cũ. Vui lòng quét lại!', 'info');
                                } else {
                                  setShowQRScanner(true);
                                }
                              }}
                              className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                                isQRScanned 
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200' 
                                  : 'bg-neutral-950 hover:bg-neutral-850 text-white shadow-sm'
                              }`}
                            >
                              {isQRScanned ? 'Reset quét mã' : '📸 Quét mã QR ca làm'}
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Interactive opening/closing checklists */}
                      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                        <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                          Checklist kiểm kê trước và sau ca làm
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          
                          {/* Opening Checklist */}
                          <div>
                            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block mb-3.5 pb-1.5 border-b border-neutral-100">
                              🌅 CHECKLIST ĐẦU CA (Yêu cầu trước Check-In)
                            </span>
                            <div className="space-y-3">
                              <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attendanceChecklist.cleanShelves || false}
                                  onChange={(e) => setAttendanceChecklist(prev => ({ ...prev, cleanShelves: e.target.checked }))}
                                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                                />
                                <div>
                                  <span className="block font-bold text-neutral-800">Dọn dẹp quầy kệ & ma-nơ-canh</span>
                                  <span className="block text-[9px] text-neutral-400 mt-0.5">Vệ sinh mặt bàn POS, lau chùi kính, phủi bụi tủ</span>
                                </div>
                              </label>

                              <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attendanceChecklist.alignProducts || false}
                                  onChange={(e) => setAttendanceChecklist(prev => ({ ...prev, alignProducts: e.target.checked }))}
                                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                                />
                                <div>
                                  <span className="block font-bold text-neutral-800">Cân chỉnh móc áo & form sản phẩm</span>
                                  <span className="block text-[9px] text-neutral-400 mt-0.5">Sắp xếp các size áo quần gọn gàng, ngay ngắn</span>
                                </div>
                              </label>

                              <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attendanceChecklist.checkDrawer || false}
                                  onChange={(e) => setAttendanceChecklist(prev => ({ ...prev, checkDrawer: e.target.checked }))}
                                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                                />
                                <div>
                                  <span className="block font-bold text-neutral-800">Đếm tiền két & bàn giao tiền lẻ</span>
                                  <span className="block text-[9px] text-neutral-400 mt-0.5">Đảm bảo két mặc định có 3,000,000đ tiền lẻ để trả khách</span>
                                </div>
                              </label>
                            </div>
                          </div>

                          {/* Closing Checklist */}
                          <div>
                            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block mb-3.5 pb-1.5 border-b border-neutral-100">
                              🌙 CHECKLIST CUỐI CA (Yêu cầu trước Check-Out)
                            </span>
                            <div className="space-y-3">
                              <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attendanceClosingChecklist.cashAudit || false}
                                  onChange={(e) => setAttendanceClosingChecklist(prev => ({ ...prev, cashAudit: e.target.checked }))}
                                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                                />
                                <div>
                                  <span className="block font-bold text-neutral-800">Kiểm két đối soát tiền mặt cuối ca</span>
                                  <span className="block text-[9px] text-neutral-400 mt-0.5">Đếm tiền mặt thực tế trùng khớp với doanh số báo trên hệ thống POS</span>
                                </div>
                              </label>

                              <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attendanceClosingChecklist.cleanWorkspace || false}
                                  onChange={(e) => setAttendanceClosingChecklist(prev => ({ ...prev, cleanWorkspace: e.target.checked }))}
                                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                                />
                                <div>
                                  <span className="block font-bold text-neutral-800">Sắp xếp quầy & trả đồ thừa</span>
                                  <span className="block text-[9px] text-neutral-400 mt-0.5">Thu gom đồ trả thử của khách móc lại vị trí cũ</span>
                                </div>
                              </label>

                              <label className="flex items-start gap-3 p-3 rounded-2xl border border-neutral-100 hover:bg-neutral-50/50 transition-all text-xs font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={attendanceClosingChecklist.turnOffAppliances || false}
                                  onChange={(e) => setAttendanceClosingChecklist(prev => ({ ...prev, turnOffAppliances: e.target.checked }))}
                                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                                />
                                <div>
                                  <span className="block font-bold text-neutral-800">Tắt máy POS, đèn & điều hòa showroom</span>
                                  <span className="block text-[9px] text-neutral-400 mt-0.5">Đảm bảo an toàn phòng chống cháy nổ & tiết kiệm điện</span>
                                </div>
                              </label>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* BENTO BLOCK 2: Clock Action Widget & Rules Checklist (Col Span 4) */}
                    <div className="lg:col-span-4 bg-neutral-950 text-white p-6 rounded-3xl border border-neutral-800 shadow-md flex flex-col justify-between gap-6 min-h-[480px]">
                      
                      <div>
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-850">
                          <div>
                            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest block mb-0.5">HỆ THỐNG ERP NOVYN</span>
                            <h4 className="text-sm font-black uppercase tracking-wide">Trạm chấm công điện tử</h4>
                          </div>
                          <Clock className="w-5 h-5 text-sky-400 animate-spin" />
                        </div>

                        {/* Huge Premium Digital Clock */}
                        <div className="my-8 text-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                          <span className="text-3xl font-black font-mono tracking-wider text-sky-400">
                            {liveTime || new Date().toLocaleTimeString('vi-VN')}
                          </span>
                          <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Clock-in validation criteria list */}
                        <div className="space-y-3.5">
                          <span className="text-[8px] text-neutral-450 font-bold uppercase tracking-widest block">Điều kiện Check-In (Vào Ca)</span>
                          
                          <div className="flex items-center gap-2.5 text-xs font-medium">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              isGPSCorrect ? 'bg-emerald-500 text-neutral-950' : 'bg-rose-500 text-white'
                            }`}>
                              {isGPSCorrect ? '✓' : '✗'}
                            </span>
                            <span className={isGPSCorrect ? 'text-neutral-200' : 'text-neutral-450 line-through'}>
                              Đồng bộ tọa độ GPS showroom
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs font-medium">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              isQRScanned ? 'bg-emerald-500 text-neutral-950' : 'bg-rose-500 text-white'
                            }`}>
                              {isQRScanned ? '✓' : '✗'}
                            </span>
                            <span className={isQRScanned ? 'text-neutral-200' : 'text-neutral-450 line-through'}>
                              Quét xác nhận mã QR ca trực
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs font-medium">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              Object.values(attendanceChecklist).every(v => v) ? 'bg-emerald-500 text-neutral-950' : 'bg-rose-500 text-white'
                            }`}>
                              {Object.values(attendanceChecklist).every(v => v) ? '✓' : '✗'}
                            </span>
                            <span className={Object.values(attendanceChecklist).every(v => v) ? 'text-neutral-200' : 'text-neutral-450 line-through'}>
                              Hoàn thành checklist mở ca ({Object.values(attendanceChecklist).filter(Boolean).length}/3)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-neutral-850 pt-5">
                        
                        {/* Check-In Button */}
                        {(() => {
                          const isCheckInEnabled = isGPSCorrect && isQRScanned && Object.values(attendanceChecklist).every(v => v);
                          return (
                            <div className="relative group">
                              <button
                                type="button"
                                disabled={!isCheckInEnabled}
                                onClick={checkIn}
                                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center block ${
                                  isCheckInEnabled 
                                    ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/10 cursor-pointer' 
                                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-750'
                                }`}
                              >
                                Điểm danh VÀO (Check-In)
                              </button>
                              {!isCheckInEnabled && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg text-[9px] font-bold text-neutral-400 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all text-center leading-normal">
                                  ⚠️ Cần khớp GPS, quét QR cửa hàng & tích chọn đủ checklist để được chấm công vào.
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Check-Out Button */}
                        {(() => {
                          const isCheckOutEnabled = Object.values(attendanceClosingChecklist).every(v => v);
                          return (
                            <div className="relative group">
                              <button
                                type="button"
                                disabled={!isCheckOutEnabled}
                                onClick={checkOut}
                                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 text-center block border ${
                                  isCheckOutEnabled 
                                    ? 'bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800 cursor-pointer' 
                                    : 'bg-neutral-900 border-neutral-850 text-neutral-600 cursor-not-allowed'
                                }`}
                              >
                                Điểm danh RA (Check-Out)
                              </button>
                              {!isCheckOutEnabled && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg text-[9px] font-bold text-neutral-400 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all text-center leading-normal z-10">
                                  ⚠️ Cần tích chọn hoàn thành Checklist cuối ca để chốt sổ ra về.
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        
                      </div>

                    </div>
                  </div>

                  {/* QR SCANNER SIMULATOR FULL OVERLAY MODAL */}
                  <AnimatePresence>
                    {showQRScanner && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowQRScanner(false); }}
                      >
                        <motion.div
                          initial={{ scale: 0.92, opacity: 0, y: 20 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.92, opacity: 0, y: 20 }}
                          className="bg-neutral-950 text-white rounded-3xl shadow-2xl border border-neutral-850 w-full max-w-sm overflow-hidden p-6 text-center"
                        >
                          <div className="flex justify-between items-center pb-4 border-b border-neutral-850 mb-5">
                            <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">NOVYN QR SCANNER v2.0</span>
                            <button onClick={() => setShowQRScanner(false)} className="p-1 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-neutral-400 mb-6">Di chuyển camera điện thoại hướng vào mã QR dán trên quầy cashier để nhận diện ca làm.</p>

                          {/* Animated Viewfinder */}
                          <div className="relative w-48 h-48 mx-auto bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden flex items-center justify-center mb-6">
                            
                            {/* Scanning green line animation */}
                            <div className="animate-scan-laser" />

                            {/* Faux camera corners */}
                            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
                            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
                            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
                            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />

                            {/* Simulated QR Code graphic */}
                            <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-md select-none opacity-80 hover:opacity-100 transition-opacity">
                              <Image 
                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NOVYN_WEAR_POS_CHECKIN_TOKEN" 
                                alt="Faux QR Token" 
                                width={120} 
                                height={120} 
                                className="object-contain"
                                unoptimized
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsQRScanned(true);
                                setShowQRScanner(false);
                                showToast('Đã quét mã QR và xác nhận ca trực thành công!', 'success');
                              }}
                              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md shadow-emerald-500/10"
                            >
                              ✓ Xác nhận Quét Mã (Simulate)
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowQRScanner(false)}
                              className="w-full py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Hủy bỏ
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Attendance Log history — with status logic */}
                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                    {(() => {
                      const SHIFT_START: Record<string, string> = {
                        morning: '08:00',
                        afternoon: '13:00',
                        evening: '18:00',
                      };

                      const getStatus = (log: any) => {
                        if (!log.timeIn || !log.timeOut) return 'invalid';
                        const assignedShift = shiftRequests.find(
                          (s: any) => s.userId === log.userId && s.date === log.date && s.status === 'approved'
                        );
                        if (!assignedShift) return 'no_shift';
                        const startRequired = SHIFT_START[assignedShift.shiftType] || '08:00';
                        return log.timeIn > startRequired ? 'late' : 'on_time';
                      };

                      const myLogs = attendanceLogs
                        .filter((log: any) => log.userId === currentUser.id)
                        .sort((a: any, b: any) => b.date.localeCompare(a.date));

                      const statusBadge = (status: string) => {
                        switch (status) {
                          case 'late':     return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">⏰ Đi muộn</span>;
                          case 'invalid':  return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">✗ Không tính</span>;
                          case 'no_shift': return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-neutral-100 text-neutral-500 border border-neutral-200 uppercase tracking-wider">— Chưa xếp ca</span>;
                          default:         return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">✓ Đúng giờ</span>;
                        }
                      };

                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide">Lịch sử chấm công chấm vân tay thực tế</h4>
                            <div className="flex gap-2 text-[8px] font-bold">
                              <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">✓ Đúng giờ</span>
                              <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">⏰ Muộn</span>
                              <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100">✗ Không tính</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-neutral-400 mb-3 font-medium">• Đi sau giờ quy định → Đi muộn &nbsp;• Thiếu check-in hoặc check-out → Không tính công</p>
                          <div className="overflow-x-auto max-h-[300px] pr-1">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                                  <th className="p-3">Ngày trực</th>
                                  <th className="p-3 text-center">Giờ Check-in</th>
                                  <th className="p-3 text-center">Giờ Check-out</th>
                                  <th className="p-3 text-right">Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                                {myLogs.length === 0 && (
                                  <tr><td colSpan={4} className="text-center py-6 text-neutral-400 italic">Chưa phát sinh dữ liệu chấm công.</td></tr>
                                )}
                                {myLogs.map((log: any) => {
                                  const status = getStatus(log);
                                  const isInvalid = status === 'invalid';
                                  return (
                                    <tr key={log.id} className={`hover:bg-neutral-50/20 transition-colors ${isInvalid ? 'opacity-50' : ''}`}>
                                      <td className="p-3 font-bold text-neutral-900">{log.date}</td>
                                      <td className="p-3 text-center">
                                        {log.timeIn
                                          ? <span className={`font-bold font-mono ${status === 'late' ? 'text-amber-600' : 'text-emerald-600'}`}>{log.timeIn}</span>
                                          : <span className="text-rose-400 font-bold italic text-[9px]">Thiếu</span>
                                        }
                                      </td>
                                      <td className="p-3 text-center">
                                        {log.timeOut
                                          ? <span className="font-bold font-mono text-neutral-600">{log.timeOut}</span>
                                          : <span className="text-rose-400 font-bold italic text-[9px]">Thiếu</span>
                                        }
                                      </td>
                                      <td className="p-3 text-right">{statusBadge(status)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* --- SHARED TABS: BRANCH STOCK VIEW --- */}
              {(activeTab === 'branch-stock' || (activeTab === 'products-inventory' && productsInventorySubTab === 'matrix')) && ['employee', 'cashier'].includes(currentUser.role) && currentUser.branch && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Tồn kho của chi nhánh</h3>
                  <p className="text-xs text-neutral-400 mb-8">Tra cứu số lượng tồn của 28 sản phẩm cao cấp hiện khả dụng tại {currentUser.branch}.</p>

                  <div className="mb-6 max-w-md relative">
                    <input
                      type="text"
                      placeholder="Tìm sản phẩm theo tên..."
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                    <div className="overflow-x-auto max-h-[500px] pr-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                            <th className="p-3">Sản phẩm</th>
                            <th className="p-3">Danh mục</th>
                            <th className="p-3 text-center">Tồn kho chi nhánh</th>
                            <th className="p-3 text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                          {productsList
                            .filter((prod: any) => prod.name.toLowerCase().includes(stockSearch.toLowerCase()))
                            .map((prod: any) => {
                              const stockCount = branchStock[prod.id]?.[currentUser.branch || ''] || 0;
                              const sizeStock = branchSizeStock[prod.id]?.[currentUser.branch || ''] || {};
                              const sizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'];
                              return (
                                <tr key={prod.id} className="hover:bg-neutral-50/20 transition-colors">
                                  <td className="p-3">
                                    <span className="font-bold text-neutral-900 block">{prod.name}</span>
                                    <span className="text-[9px] text-neutral-455 uppercase font-bold tracking-wider font-mono">{prod.id}</span>
                                  </td>
                                  <td className="p-3">{prod.category}</td>
                                  <td className="p-3 text-center">
                                    <span className="font-mono font-black text-neutral-900 block">{stockCount} chiếc</span>
                                    <div className="flex gap-1 justify-center mt-1.5 flex-wrap">
                                      {sizes.map((sz: string) => {
                                        const qty = sizeStock[sz] || 0;
                                        return (
                                          <span key={sz} className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${qty < 2 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-neutral-100 text-neutral-600'}`}>
                                            {sz}: {qty}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                      stockCount < 5 ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' : 'bg-emerald-50 text-emerald-650'
                                    }`}>
                                      {stockCount < 5 ? 'Hết hàng / Sắp hết' : 'Đầy đủ'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- EMPLOYEE HR REQUESTS (LEAVE & SALARY) --- */}
              {(activeTab === 'employee-hr-requests' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'requests')) && currentUser.role === 'employee' && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Đơn từ & Đề xuất hành chính</h3>
                  <p className="text-xs text-neutral-400 mb-8">Soạn đơn xin nghỉ phép gửi Quản lý chi nhánh duyệt hoặc gửi đề xuất xin tăng lương lên Ban giám đốc.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    {/* Leave proposal form */}
                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between gap-5">
                      <div>
                        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-neutral-600" />
                          Soạn đơn xin nghỉ phép
                        </h4>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (leaveReason && leaveStart && leaveEnd) {
                              submitLeaveRequest(leaveReason, leaveStart, leaveEnd);
                              setLeaveReason('');
                              setLeaveStart('');
                              setLeaveEnd('');
                            }
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Từ ngày</label>
                              <input
                                type="date"
                                required
                                value={leaveStart}
                                onChange={(e) => setLeaveStart(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Đến ngày</label>
                              <input
                                type="date"
                                required
                                value={leaveEnd}
                                onChange={(e) => setLeaveEnd(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Lý do xin nghỉ</label>
                            <textarea
                              required
                              rows={3}
                              placeholder="Ghi rõ lý do chi tiết..."
                              value={leaveReason}
                              onChange={(e) => setLeaveReason(e.target.value)}
                              className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white resize-none focus:outline-none font-medium"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                          >
                            Gửi đơn xin nghỉ phép
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Salary Proposal form */}
                    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between gap-5">
                      <div>
                        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-neutral-600" />
                          Đề xuất nguyện vọng tăng lương
                        </h4>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const propSal = (e.currentTarget.elements as any).proposedSal.value;
                            const reason = (e.currentTarget.elements as any).reason.value;
                            if (propSal > 0 && reason) {
                              submitSalaryRequest(Number(propSal), reason);
                              e.currentTarget.reset();
                            }
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Mức lương mong muốn (VND)</label>
                            <input
                              type="number"
                              name="proposedSal"
                              required
                              placeholder="Ví dụ: 10000000"
                              className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Lý do & căn cứ đề xuất</label>
                            <textarea
                              name="reason"
                              required
                              rows={3}
                              placeholder="Liệt kê thành tích làm việc xuất sắc..."
                              className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white resize-none focus:outline-none font-medium"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                          >
                            Gửi đề xuất tăng lương
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Historic personal HR requests list */}
                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Lịch sử đơn từ & Đề xuất lương của cá nhân</h4>
                    <div className="overflow-x-auto max-h-[300px] pr-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                            <th className="p-3">Loại đơn</th>
                            <th className="p-3">Nội dung đề xuất</th>
                            <th className="p-3">Ngày gửi</th>
                            <th className="p-3 text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                          {/* Leaves */}
                          {leaveRequests
                            .filter((req: any) => req.userId === currentUser.id)
                            .map((req: any) => (
                              <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3 font-bold text-neutral-900">Xin nghỉ phép</td>
                                <td className="p-3">
                                  <span className="font-bold text-neutral-800">Từ {req.startDate} đến {req.endDate}</span>
                                  <span className="text-[10px] text-neutral-455 block italic mt-0.5">{req.reason}</span>
                                </td>
                                <td className="p-3 font-mono text-[10px] text-neutral-400">{req.createdAt}</td>
                                <td className="p-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                    req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-rose-50 text-rose-600 border-rose-100'
                                  }`}>
                                    {req.status === 'approved' ? 'Đã duyệt' : req.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          {/* Salaries */}
                          {salaryRequests
                            .filter((req: any) => req.userId === currentUser.id)
                            .map((req: any) => (
                              <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3 font-bold text-neutral-900">Đề xuất tăng lương</td>
                                <td className="p-3">
                                  <span className="font-bold text-emerald-600">Đề xuất: {formatPrice(req.proposedSalary)}</span>
                                  <span className="text-[10px] text-neutral-455 block italic mt-0.5">{req.reason}</span>
                                </td>
                                <td className="p-3 font-mono text-[10px] text-neutral-400">{req.createdAt}</td>
                                <td className="p-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                    req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-rose-50 text-rose-600 border-rose-100'
                                  }`}>
                                    {req.status === 'approved' ? 'Đã duyệt' : req.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- MANAGER STAFF & SHIFTS DIRECT CONSOLE --- */}
              {(activeTab === 'manager-staff-console' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'approval')) && ['director', 'manager'].includes(currentUser.role) && (
                <div>
                  <h3 className="text-lg font-black text-neutral-950 tracking-tight mb-2 uppercase">Lập lịch Ca trực & Duyệt hành chính</h3>
                  <p className="text-xs text-neutral-400 mb-8">Chủ động phân công ca làm chính thức cho nhân viên chi nhánh (chốt ngay) và xét duyệt đơn xin nghỉ phép.</p>


                  {/* Manager Leave request approval */}
                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
                    <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Đơn xin nghỉ phép của nhân sự chi nhánh chờ duyệt</h4>
                    <div className="overflow-x-auto max-h-[300px] pr-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                            <th className="p-3">Nhân sự</th>
                            <th className="p-3">Ngày xin nghỉ</th>
                            <th className="p-3">Lý do</th>
                            <th className="p-3 text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                          {leaveRequests
                            .filter((req: any) => {
                              if (currentUser.role === 'director') {
                                return selectedBranch === 'all' || req.branch === selectedBranch;
                              }
                              return req.branch === currentUser.branch;
                            })
                            .filter((req: any) => req.status === 'pending')
                            .map((req: any) => (
                              <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3">
                                  <span className="font-bold text-neutral-900 block">{req.name}</span>
                                  <span className="text-[8px] text-neutral-400 uppercase font-mono">{req.role}</span>
                                </td>
                                <td className="p-3 font-mono">{req.startDate} đến {req.endDate}</td>
                                <td className="p-3 text-neutral-600 italic font-medium">{req.reason}</td>
                                <td className="p-3 text-right flex justify-end gap-2 pt-4">
                                  <button
                                    onClick={() => approveLeaveRequest(req.id, 'approved', 'Đồng ý đơn xin nghỉ')}
                                    className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                                  >
                                    Phê duyệt
                                  </button>
                                  <button
                                    onClick={() => approveLeaveRequest(req.id, 'rejected', 'Không phê duyệt')}
                                    className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-250 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                                  >
                                    Bác bỏ
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {leaveRequests.filter((req: any) => {
                            if (currentUser.role === 'director') {
                              return selectedBranch === 'all' || req.branch === selectedBranch;
                            }
                            return req.branch === currentUser.branch;
                          }).filter((req: any) => req.status === 'pending').length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center py-6 text-neutral-400 italic">Không có đơn xin phép nào đang chờ duyệt.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Attendance history log for branch — with late / invalid logic */}
                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">{
                    (() => {
                      // Shift start times (HH:MM) for comparison
                      const SHIFT_START: Record<string, string> = {
                        morning: '08:00',
                        afternoon: '13:00',
                        evening: '18:00',
                      };

                      const getStatus = (log: any) => {
                        // Missing check-in or check-out → invalid, not counted
                        if (!log.timeIn || !log.timeOut) return 'invalid';
                        // Find the assigned shift for this person on this date
                        const assignedShift = shiftRequests.find(
                          (s: any) => s.userId === log.userId && s.date === log.date && s.status === 'approved'
                        );
                        if (!assignedShift) return 'no_shift';
                        const startRequired = SHIFT_START[assignedShift.shiftType] || '08:00';
                        // Compare HH:MM strings lexicographically
                        return log.timeIn > startRequired ? 'late' : 'on_time';
                      };

                      const branchLogs = attendanceLogs
                        .filter((log: any) => {
                          if (currentUser.role === 'director') {
                            return selectedBranch === 'all' || log.branch === selectedBranch;
                          }
                          return log.branch === currentUser.branch;
                        })
                        .sort((a: any, b: any) => b.date.localeCompare(a.date));

                      const statusBadge = (status: string) => {
                        switch (status) {
                          case 'late':     return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">⏰ Đi muộn</span>;
                          case 'invalid':  return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">✗ Không tính</span>;
                          case 'no_shift': return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-neutral-100 text-neutral-500 border border-neutral-200 uppercase tracking-wider">— Chưa xếp ca</span>;
                          default:         return <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider">✓ Đúng giờ</span>;
                        }
                      };

                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">
                              Nhật ký chấm công — {currentUser.role === 'director' ? (selectedBranch === 'all' ? 'Tất cả chi nhánh' : `Chi nhánh ${selectedBranch}`) : `Chi nhánh ${currentUser.branch}`}
                            </h4>
                            <div className="flex gap-2 text-[8px] font-bold">
                              <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">✓ Đúng giờ</span>
                              <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">⏰ Muộn</span>
                              <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100">✗ Không tính</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-neutral-400 mb-3 font-medium">• Đi sau giờ quy định → Đi muộn &nbsp;• Thiếu check-in hoặc check-out → Không tính công</p>
                          <div className="overflow-x-auto max-h-[300px] pr-1">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                                  <th className="p-3">Nhân sự</th>
                                  <th className="p-3">Ngày</th>
                                  <th className="p-3 text-center">Check-in</th>
                                  <th className="p-3 text-center">Check-out</th>
                                  <th className="p-3 text-right">Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                                {branchLogs.length === 0 && (
                                  <tr><td colSpan={5} className="text-center py-8 text-neutral-400 italic">Chưa có dữ liệu chấm công.</td></tr>
                                )}
                                {branchLogs.map((log: any) => {
                                  const status = getStatus(log);
                                  const isInvalid = status === 'invalid';
                                  return (
                                    <tr key={log.id} className={`hover:bg-neutral-50/20 transition-colors ${isInvalid ? 'opacity-50' : ''}`}>
                                      <td className="p-3">
                                        <span className="font-bold text-neutral-900 block">{log.name}</span>
                                        <span className="text-[8px] text-neutral-400 uppercase font-mono">{log.role}</span>
                                      </td>
                                      <td className="p-3 font-bold text-neutral-900">{log.date}</td>
                                      <td className="p-3 text-center">
                                        {log.timeIn
                                          ? <span className={`font-bold font-mono ${status === 'late' ? 'text-amber-600' : 'text-emerald-600'}`}>{log.timeIn}</span>
                                          : <span className="text-rose-400 font-bold italic text-[9px]">Thiếu</span>
                                        }
                                      </td>
                                      <td className="p-3 text-center">
                                        {log.timeOut
                                          ? <span className="font-bold font-mono text-neutral-600">{log.timeOut}</span>
                                          : <span className="text-rose-400 font-bold italic text-[9px]">Thiếu</span>
                                        }
                                      </td>
                                      <td className="p-3 text-right">{statusBadge(status)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              {(activeTab === 'manager-stock' || (activeTab === 'products-inventory' && productsInventorySubTab === 'restock')) && currentUser.role === 'manager' && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Kiểm kê kho & Nhập hàng chi nhánh</h3>
                  <p className="text-xs text-neutral-400 mb-8">Theo dõi tình hình tồn kho tại cửa hàng trực thuộc và gửi đề xuất restock khẩn cấp gửi phòng Kế toán.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Restock Request Form */}
                    <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-100 animate-fade-in">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">Gửi đề xuất nhập kho khẩn cấp</h4>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (selectedRestockProduct && restockAmount > 0) {
                            restockBranchProduct(selectedRestockProduct, restockAmount, selectedRestockSize);
                            setSelectedRestockProduct('');
                            setRestockAmount(10);
                            setSelectedRestockSize('S');
                          }
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-[9px] font-bold text-neutral-450 block mb-1">Sản phẩm cần nhập</label>
                          <select
                            required
                            value={selectedRestockProduct}
                            onChange={(e) => {
                              setSelectedRestockProduct(e.target.value);
                              const prod = productsList.find((p: any) => p.id === e.target.value);
                              if (prod && prod.sizes && prod.sizes.length > 0) {
                                setSelectedRestockSize(prod.sizes[0]);
                              } else {
                                setSelectedRestockSize('S');
                              }
                            }}
                            className="w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-400"
                          >
                            <option value="">-- Chọn sản phẩm --</option>
                            {productsList.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        {selectedRestockProduct && (
                          <div className="animate-slide-down">
                            <label className="text-[9px] font-bold text-neutral-450 block mb-1">Chọn Size cần nhập cụ thể</label>
                            <select
                              required
                              value={selectedRestockSize}
                              onChange={(e) => setSelectedRestockSize(e.target.value)}
                              className="w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-400"
                            >
                              {(() => {
                                const prod = productsList.find((p: any) => p.id === selectedRestockProduct);
                                const sizes = prod && prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'];
                                return sizes.map((sz: string) => (
                                  <option key={sz} value={sz}>Size {sz}</option>
                                ));
                              })()}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="text-[9px] font-bold text-neutral-450 block mb-1">Số lượng nhập đề xuất</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(Number(e.target.value))}
                            className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold focus:border-neutral-400"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Gửi yêu cầu restock kho
                        </button>
                      </form>
                    </div>

                    {/* Stock list */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Tình hình chi tiết tồn kho cửa hàng</h4>
                      <div className="overflow-x-auto max-h-[450px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Sản phẩm</th>
                              <th className="p-3">SKU</th>
                              <th className="p-3 text-center">Tồn kho chi nhánh (Chi tiết Size)</th>
                              <th className="p-3 text-right">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {productsList.map((prod: any) => {
                              const stockCount = branchStock[prod.id]?.[currentUser.branch || ''] || 0;
                              const sizeStock = branchSizeStock[prod.id]?.[currentUser.branch || ''] || {};
                              const sizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'];
                              return (
                                <tr key={prod.id} className="hover:bg-neutral-50/20 transition-colors">
                                  <td className="p-3 font-bold text-neutral-900">{prod.name}</td>
                                  <td className="p-3 font-mono text-[10px] text-neutral-450">{prod.id}</td>
                                  <td className="p-3 text-center">
                                    <span className="font-mono font-black text-neutral-900 text-xs">{stockCount} chiếc</span>
                                    <div className="flex gap-1 justify-center mt-1.5 flex-wrap">
                                      {sizes.map((sz: string) => {
                                        const qty = sizeStock[sz] || 0;
                                        return (
                                          <span key={sz} className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${qty < 2 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-neutral-100 text-neutral-600'}`}>
                                            {sz}: {qty}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="p-3 text-right">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                      stockCount < 5 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-emerald-50 text-emerald-650'
                                    }`}>
                                      {stockCount < 5 ? 'Cần nhập hàng' : 'Ổn định'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Restock proposal history for Manager's branch */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mt-8 lg:col-span-3">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Lịch sử đề xuất nhập kho của chi nhánh</h4>
                      
                      {restockRecords.filter((r: any) => r.branch === currentUser.branch).length === 0 ? (
                        <p className="text-xs text-neutral-400 text-center py-6">Hiện chi nhánh chưa gửi đề xuất nhập kho nào.</p>
                      ) : (
                        <div className="overflow-x-auto overflow-y-auto max-h-[350px] w-full pr-1">
                          <table className="w-full text-left text-[10px] md:text-xs border-collapse">
                            <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px] md:text-[9px]">
                                <th className="p-2.5">Sản phẩm</th>
                                <th className="p-2.5 text-center">Số lượng</th>
                                <th className="p-2.5 text-right">Chi phí nhập gốc</th>
                                <th className="p-2.5 text-center">Ngày gửi đề xuất</th>
                                <th className="p-2.5 text-right">Trạng thái duyệt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                              {restockRecords
                                .filter((r: any) => r.branch === currentUser.branch)
                                .map((r: any) => (
                                  <tr key={r.id} className="hover:bg-neutral-50/30 transition-colors">
                                    <td className="p-2.5 font-bold text-neutral-900 text-[11px] md:text-xs">{r.productName}</td>
                                    <td className="p-2.5 text-center font-mono font-bold text-neutral-805 text-[10px] md:text-[11px]">
                                      {r.amount} chiếc 
                                      {r.size && <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ml-1">Size {r.size}</span>}
                                    </td>
                                    <td className="p-2.5 text-right font-mono text-neutral-950 font-bold text-[10px] md:text-[11px]">{formatPrice(r.cost)}</td>
                                    <td className="p-2.5 text-center text-neutral-450 text-[9px] md:text-[10px] font-mono">{r.createdAt}</td>
                                    <td className="p-2.5 text-right">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                        r.status === 'approved' ? 'bg-emerald-50 text-emerald-650 border-emerald-100' :
                                        r.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                      }`}>
                                        {r.status === 'approved' ? 'Đã duyệt' : r.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* --- MANAGER DAILY REPORT --- */}
              {(activeTab === 'manager-reports-requests' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'directives')) && currentUser.role === 'manager' && (
                <div>
                  <h3 className="text-lg font-black text-neutral-950 tracking-tight mb-2 uppercase">Báo cáo tình hình vận hành chi nhánh</h3>
                  <p className="text-xs text-neutral-400 mb-8">Soạn và gửi báo cáo quyết toán doanh số, nhân sự cuối ngày hôm nay gửi Ban giám đốc đối chiếu.</p>

                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm max-w-xl mx-auto">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (reportTitle && reportContent) {
                          submitDailyReport(reportTitle, reportContent);
                          setReportTitle('');
                          setReportContent('');
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 block mb-1">Tiêu đề báo cáo vận hành</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Báo cáo vận hành & doanh số 29/05 - Chi nhánh Quận 1"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white font-semibold text-neutral-800"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 block mb-1">Nội dung báo cáo cụ thể</label>
                        <textarea
                          required
                          rows={6}
                          placeholder="Báo cáo chi tiết về: doanh số hôm nay, lượng khách tham quan, các khiếu nại CSKH, tình hình đi làm chấm công của nhân sự chi nhánh..."
                          value={reportContent}
                          onChange={(e) => setReportContent(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white resize-none font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        Gửi báo cáo lên Giám đốc
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* --- DIRECTOR OPERATIONS & PRICE UPDATE & ANNOUNCEMENT SENDER --- */}
              {(activeTab === 'director-operations' || (activeTab === 'settings-roles' && settingsRolesSubTab === 'announcements')) && currentUser.role === 'director' && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Vận hành & Gửi thông báo toàn cầu</h3>
                  <p className="text-xs text-neutral-400 mb-8">Điều hành giá bán sản phẩm, sửa đổi thông tin chi tiết và gửi chỉ đạo khẩn cấp đến toàn hệ thống.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: GLOBAL PRICE & PRODUCT UPDATER */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                        <h4 className="text-xs font-black text-neutral-950 tracking-wide mb-4">Danh sách sản phẩm & Sửa giá bán</h4>
                        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                          {productsList.map((prod: any) => (
                            <div key={prod.id} className="border border-neutral-150 p-4 rounded-2xl bg-neutral-50/40 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="relative w-12 aspect-[4/5] rounded-xl bg-neutral-100 border overflow-hidden shrink-0">
                                  <Image
                                    src={prod.images[0]}
                                    alt={prod.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="text-xs font-black text-neutral-900 truncate">{prod.name}</h5>
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block mt-0.5">{prod.category}</span>
                                  <span className="text-xs font-black text-neutral-900 mt-1 block">{formatPrice(prod.price)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {editingProductId === prod.id ? (
                                  <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border shadow-sm">
                                    <div>
                                      <label className="text-[8px] font-bold text-neutral-400 uppercase">Tên sản phẩm</label>
                                      <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-2 py-1 border text-xs font-bold rounded"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-bold text-neutral-400 uppercase">Giá bán (₫)</label>
                                      <input
                                        type="number"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(Number(e.target.value))}
                                        className="w-full px-2 py-1 border text-xs font-bold rounded"
                                      />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                      <button
                                        onClick={() => {
                                          updateGlobalProductPrice(prod.id, editPrice);
                                          updateGlobalProductDetails(prod.id, editName, editDesc, editCat);
                                          setEditingProductId(null);
                                        }}
                                        className="bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-emerald-600 transition-colors"
                                      >
                                        Lưu
                                      </button>
                                      <button
                                        onClick={() => setEditingProductId(null)}
                                        className="bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-neutral-300 transition-colors"
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingProductId(prod.id);
                                        setEditPrice(prod.price);
                                        setEditName(prod.name);
                                        setEditDesc(prod.description);
                                        setEditCat(prod.category);
                                      }}
                                      className="bg-neutral-950 text-white text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl hover:bg-neutral-850 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm shadow-neutral-950/10"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      Sửa giá
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${prod.name} không?`)) {
                                          deleteGlobalProduct(prod.id);
                                        }
                                      }}
                                      className="bg-rose-50 text-rose-605 text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer active:scale-95"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: ANNOUNCEMENT SENDER FORM */}
                    <div className="lg:col-span-1">
                      <div className="bg-neutral-950 text-white p-6 rounded-3xl border border-neutral-800 shadow-lg sticky top-6">
                        <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-amber-450 animate-bounce" />
                          Gửi thông báo toàn cục
                        </h4>
                        <p className="text-[11px] text-neutral-400 font-semibold mb-6 leading-relaxed">
                          Giám đốc soạn văn bản chỉ thị trực tiếp đến các phòng ban và chi nhánh. Nội dung sẽ hiển thị ngay lập tức trên trang chủ quản trị của người nhận.
                        </p>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (annTitle && annContent) {
                              sendAnnouncement(annTitle, annContent, annRecipient);
                              setAnnTitle('');
                              setAnnContent('');
                            }
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="text-[8px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Gửi tới ai (Người nhận)</label>
                            <select
                              value={annRecipient}
                              onChange={(e) => setAnnRecipient(e.target.value as any)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600 font-bold"
                            >
                              <option value="all">Tất cả nhân sự (All Staff)</option>
                              <option value="accountant">Phòng Kế toán (Accountant)</option>
                              <option value="branch_q1">Chi nhánh Quận 1 (Branch Q.1)</option>
                              <option value="branch_td">Chi nhánh Thảo Điền (Thảo Điền)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[8px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Tiêu đề thông báo</label>
                            <input
                              type="text"
                              required
                              placeholder="Tiêu đề khẩn cấp..."
                              value={annTitle}
                              onChange={(e) => setAnnTitle(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-black uppercase tracking-wider text-neutral-400 block mb-1">Nội dung thông báo</label>
                            <textarea
                              required
                              rows={5}
                              placeholder="Nội dung chỉ đạo..."
                              value={annContent}
                              onChange={(e) => setAnnContent(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600 resize-none font-medium"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                          >
                            <Megaphone className="w-3.5 h-3.5" />
                            Phát lệnh chỉ đạo
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- DIRECTOR AUDIT LOGS VIEW --- */}
              {activeTab === 'settings-roles' && settingsRolesSubTab === 'audit-logs' && currentUser.role === 'director' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black text-neutral-900 tracking-tight uppercase">Nhật ký hoạt động hệ thống</h3>
                      <p className="text-xs text-neutral-400 mt-1">Lịch sử ghi chép tất cả các hành động nhạy cảm hoặc thao tác dữ liệu cốt lõi trên ERP Novyn.Wear.</p>
                    </div>
                    <button
                      onClick={fetchAuditLogs}
                      className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-850 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Tải lại nhật ký
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                            <th className="p-3">Mã Log</th>
                            <th className="p-3">Thời gian</th>
                            <th className="p-3">Người thực hiện</th>
                            <th className="p-3">Hành động</th>
                            <th className="p-3">Chi tiết nội dung</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-neutral-700 font-medium">
                          {auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-neutral-400">
                                Không tìm thấy lịch sử hoạt động nào trong hệ thống.
                              </td>
                            </tr>
                          ) : (
                            auditLogs.map((log: any) => (
                              <tr key={log.id} className="hover:bg-neutral-50/10">
                                <td className="p-3 font-mono font-bold text-neutral-900">{log.id}</td>
                                <td className="p-3 font-mono text-[10px] text-neutral-500">
                                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-neutral-900 block">{log.performedByName || log.performedById || 'Hệ thống'}</span>
                                  <span className="text-[9px] text-neutral-455 font-mono block uppercase">{log.performedById ? 'Nhân viên' : 'Hệ thống'}</span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                    log.action === 'SALARY_ADJUST' || log.action === 'PAY_SALARY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    log.action === 'PRICE_EDIT' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    log.action === 'PRODUCT_DELETE' || log.action === 'USER_DELETE' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                    'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                  }`}>
                                    {log.action}
                                  </span>
                                </td>
                                <td className="p-3 text-neutral-600 font-sans max-w-md break-words">
                                  {log.details}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- DIRECTOR HR & PAYROLL MANAGEMENT (READ-ONLY VIEW) --- */}
              {(activeTab === 'director-hr-payroll' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'payroll')) && currentUser.role === 'director' && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Quản lý Nhân sự & Bảng lương toàn công ty</h3>
                  <p className="text-xs text-neutral-400 mb-8">Tra cứu danh sách nhân sự cấp cao, duyệt đề xuất tăng lương khẩn cấp và xem lịch sử giải ngân chi lương.</p>

                  {/* DUYỆT TĂNG LƯƠNG */}
                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
                    <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Các đề xuất tăng lương từ nhân viên chờ phê duyệt</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                            <th className="p-3">Nhân viên</th>
                            <th className="p-3">Mức lương cũ</th>
                            <th className="p-3 font-mono">Đề xuất mới</th>
                            <th className="p-3">Lý do trình bày</th>
                            <th className="p-3 text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                          {salaryRequests
                            .filter((req: any) => req.status === 'pending')
                            .map((req: any) => (
                              <tr key={req.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3">
                                  <span className="font-bold text-neutral-900 block">{req.name}</span>
                                  <span className="text-[8px] text-neutral-405 uppercase font-mono">{req.branch}</span>
                                </td>
                                <td className="p-3 font-mono">{formatPrice(req.currentSalary)}</td>
                                <td className="p-3 font-mono font-black text-emerald-600">{formatPrice(req.proposedSalary)}</td>
                                <td className="p-3 text-neutral-600 italic font-medium">{req.reason}</td>
                                <td className="p-3 text-right flex justify-end gap-2 pt-4">
                                  <button
                                    onClick={() => approveSalaryRequest(req.id, 'approved', 'Ban giám đốc đồng ý phê duyệt tăng lương')}
                                    className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                                  >
                                    Duyệt nâng lương
                                  </button>
                                  <button
                                    onClick={() => approveSalaryRequest(req.id, 'rejected', 'Không đồng ý đề xuất nâng lương lúc này')}
                                    className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                                  >
                                    Bác bỏ
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {salaryRequests.filter((req: any) => req.status === 'pending').length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center py-6 text-neutral-400 italic">Hiện tại không có đề xuất tăng lương nào chờ duyệt.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* STAFF REGISTER LIST */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Danh sách nhân sự hệ thống</h4>
                      <div className="overflow-x-auto max-h-[350px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Họ tên</th>
                              <th className="p-3">Lương gross</th>
                              <th className="p-3 text-right">Chi nhánh</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {usersList
                              .filter((u: any) => u.role !== 'customer')
                              .map((u: any) => (
                                <tr key={u.id} className="hover:bg-neutral-50/20 transition-colors">
                                  <td className="p-3">
                                    <span className="font-bold text-neutral-900 block">{u.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-[7px] font-black tracking-widest uppercase text-white shadow-sm ${
                                      u.role === 'director' ? 'bg-rose-500' :
                                      u.role === 'manager' ? 'bg-amber-500' :
                                      u.role === 'accountant' ? 'bg-emerald-500' : 'bg-sky-500'
                                    }`}>
                                      {u.role === 'director' ? 'Giám đốc' :
                                       u.role === 'manager' ? 'Quản lý' :
                                       u.role === 'accountant' ? 'Kế toán' : 'Nhân viên'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono font-bold text-neutral-850">{u.salary ? formatPrice(u.salary) : 'Thoả thuận'}</td>
                                  <td className="p-3 text-right text-neutral-500 font-bold">{u.branch || 'Văn phòng chính'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* PAYROLL HISTORY */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Lịch sử giải ngân lương tháng trước (Read-Only)</h4>
                      <div className="overflow-x-auto max-h-[350px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Tháng lương</th>
                              <th className="p-3">Nhân sự</th>
                              <th className="p-3 font-mono">Thực nhận</th>
                              <th className="p-3 text-right">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {payrollRecords.map((pay: any) => (
                              <tr key={pay.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3 font-mono font-bold">{pay.month}</td>
                                <td className="p-3">{pay.name}</td>
                                <td className="p-3 font-mono font-black text-neutral-900">{formatPrice(pay.salary)}</td>
                                <td className="p-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                    pay.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 animate-pulse'
                                  }`}>
                                    {pay.status === 'paid' ? 'Đã chi trả' : 'Chờ giải quỹ'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {payrollRecords.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-center py-6 text-neutral-400 italic">Chưa phát sinh giải ngân lương.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- DIRECTOR GLOBAL FINANCE --- */}
              {(activeTab === 'director-global-finance' || (activeTab === 'finance-profit' && financeProfitSubTab === 'p-l')) && currentUser.role === 'director' && (() => {
                const totalRevenue = allOrders
                  .filter((o: any) => o.status === 'completed')
                  .reduce((sum: number, o: any) => sum + o.total, 0);
                const q1Revenue = allOrders
                  .filter((o: any) => o.status === 'completed' && o.branch.includes('Quận 1'))
                  .reduce((sum: number, o: any) => sum + o.total, 0);
                const tdRevenue = allOrders
                  .filter((o: any) => o.status === 'completed' && o.branch.includes('Thảo Điền'))
                  .reduce((sum: number, o: any) => sum + o.total, 0);

                const dailyFinances = getDailyFinances();
                const totalProfit = dailyFinances.reduce((sum: number, day: any) => sum + day.profit, 0);

                const ledger = productsList.map((product: any) => {
                  const soldQty = allOrders
                    .filter((o: any) => o.status === 'completed')
                    .reduce((total: number, order: any) => {
                      const item = order.items.find((i: any) => i.product.id === product.id);
                      return total + (item ? item.quantity : 0);
                    }, 0);

                  const stockedQty = restockRecords
                    .filter((r: any) => r.productId === product.id && (!r.status || r.status === 'approved'))
                    .reduce((total: number, r: any) => total + r.amount, 0);

                  const revenue = soldQty * product.price;
                  const importCost = stockedQty * (product.price * 0.4);
                  const netProfit = revenue - importCost;

                  return {
                    product,
                    soldQty,
                    revenue,
                    stockedQty,
                    importCost,
                    netProfit,
                  };
                });

                const sortedLedger = [...ledger].sort((a, b) => b.revenue - a.revenue);

                return (
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Quyết toán tài chính toàn cầu</h3>
                    <p className="text-xs text-neutral-400 mb-8">Kiểm toán doanh số liên chi nhánh, doanh số thị phần, quyết toán thuế CIT và hạch toán P&L sản phẩm.</p>
                    
                    <div className="mb-10">
                      <FinancialSVGCharts
                        allOrders={allOrders}
                        restockRecords={restockRecords}
                        expensesList={expensesList}
                        usersList={usersList}
                        currentUser={currentUser}
                      />
                    </div>

                    {/* METRICS WIDGETS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                      <div className="p-5 rounded-3xl bg-neutral-950 text-white shadow-md border border-neutral-800 flex flex-col justify-between min-h-[120px]">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-black opacity-55 block mb-1">TỔNG DOANH THU TOÀN HỆ THỐNG</span>
                          <h4 className="text-base font-black tracking-tight">{formatPrice(totalRevenue)}</h4>
                        </div>
                        <span className="text-[8px] text-emerald-400 font-bold block mt-2">Tăng trưởng 15% so với tháng trước</span>
                      </div>
                      
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 to-teal-950 text-white shadow-md border border-emerald-800 flex flex-col justify-between min-h-[120px]">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-black opacity-75 block mb-1">TỔNG LỢI NHUẬN RÒNG TOÀN CÔNG TY</span>
                          <h4 className="text-base font-black tracking-tight">{formatPrice(totalProfit)}</h4>
                        </div>
                        <span className={`text-[8px] font-bold block mt-2 ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {totalProfit >= 0 ? '✓ Doanh nghiệp đang hoạt động có lãi' : '⚠ Doanh nghiệp đang thâm hụt dòng tiền'}
                        </span>
                      </div>

                      <div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-black text-neutral-400 block mb-1">DOANH THU CHI NHÁNH QUẬN 1</span>
                          <h4 className="text-base font-black tracking-tight text-neutral-900">{formatPrice(q1Revenue)}</h4>
                        </div>
                        <div className="w-full bg-neutral-100 h-1 rounded-full mt-3 overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(q1Revenue / (totalRevenue || 1)) * 100}%` }}></div>
                        </div>
                      </div>

                      <div className="p-5 rounded-3xl bg-white border border-neutral-100 shadow-sm flex flex-col justify-between min-h-[120px]">
                        <div>
                          <span className="text-[8px] uppercase tracking-widest font-black text-neutral-400 block mb-1">DOANH THU THẢO ĐIỀN</span>
                          <h4 className="text-base font-black tracking-tight text-neutral-900">{formatPrice(tdRevenue)}</h4>
                        </div>
                        <div className="w-full bg-neutral-100 h-1 rounded-full mt-3 overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(tdRevenue / (totalRevenue || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* TAXES WIDGET */}
                    <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 mb-8">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">Dự phóng thuế CIT & PIT toàn bộ nhân viên</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <span className="text-[8px] text-neutral-400 font-bold block uppercase mb-1">Dự phòng thuế thu nhập doanh nghiệp CIT (20%)</span>
                          <span className="text-base font-black text-rose-600">{formatPrice(totalRevenue * 0.2)}</span>
                          <span className="text-[9px] text-neutral-450 block mt-1 font-semibold">Tạm nộp định kỳ theo năm tài chính 2026.</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-neutral-400 font-bold block uppercase mb-1">Ước tính PIT thuế thu nhập cá nhân nhân sự</span>
                          <div className="space-y-1 mt-2">
                            {usersList
                              .filter((u: any) => u.salary && u.salary > 11000000)
                              .map((u: any) => (
                                <div key={u.id} className="flex justify-between items-center text-[10px] text-neutral-700 font-medium">
                                  <span>{u.name} (Gross: {formatPrice(u.salary)})</span>
                                  <span className="font-mono font-bold text-rose-500">-{formatPrice(calculatePIT(u.salary))} PIT</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* HISTORICAL TAX SETTLED LOGS (DIRECTOR READ-ONLY) */}
                    {taxRecords.length > 0 && (
                      <div className="bg-white border border-neutral-100 p-6 rounded-3xl mb-8 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">Tờ khai quyết toán thuế chính thức (Do Kế toán trưởng chốt sổ)</h4>
                            <p className="text-[10px] text-neutral-400 mt-1">Các báo cáo quyết toán thuế CIT & PIT đã được khóa sổ chính thức bởi ban kế toán.</p>
                          </div>
                          <button
                            onClick={() => exportTaxRecordsToCSV(taxRecords)}
                            className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1 font-bold text-neutral-700 bg-white"
                          >
                            <Download className="w-3.5 h-3.5 text-neutral-600" />
                            Tải file sổ thuế
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                                <th className="p-3">Kỳ thuế</th>
                                <th className="p-3 text-right">Doanh thu gộp</th>
                                <th className="p-3 text-right">LNTT (EBT)</th>
                                <th className="p-3 text-center">Thuế CIT</th>
                                <th className="p-3 text-right">Thuế PIT</th>
                                <th className="p-3 text-right font-black text-neutral-900">Lợi nhuận sau thuế</th>
                                <th className="p-3">Ngày khóa sổ</th>
                                <th className="p-3">Kế toán quyết toán</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                              {taxRecords.map((rec) => (
                                <tr key={rec.id} className="hover:bg-neutral-50/20 transition-colors text-[10px]">
                                  <td className="p-3 font-mono font-bold text-neutral-900">{rec.period}</td>
                                  <td className="p-3 text-right font-mono">{formatPrice(rec.revenue)}</td>
                                  <td className="p-3 text-right font-mono">{formatPrice(rec.ebt)}</td>
                                  <td className="p-3 text-center font-mono text-rose-550 font-semibold">
                                    {formatPrice(rec.citAmount)} <span className="text-[8px] text-neutral-400">({rec.citRate}%)</span>
                                  </td>
                                  <td className="p-3 text-right font-mono text-emerald-650 font-semibold">+{formatPrice(rec.pitAmount)}</td>
                                  <td className="p-3 text-right font-mono font-black text-emerald-700">{formatPrice(rec.netProfit)}</td>
                                  <td className="p-3 text-neutral-455 font-mono">{rec.settledAt}</td>
                                  <td className="p-3 text-neutral-600 font-bold">{rec.accountantName}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}


                    {/* DAILY FINANCIAL REPORT */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">Nhật ký doanh thu & Lợi nhuận ròng theo ngày thực tế</h4>
                          <p className="text-[10px] text-neutral-400 mt-1">• Doanh thu thực tế từ đơn hoàn thành &nbsp;• Chi phí vận hành phát sinh &nbsp;• Giá vốn hàng bán &nbsp;• Chi phí nhập hàng/Lương chi trả</p>
                        </div>
                        <button
                          onClick={() => exportDailyPLToCSV(getDailyFinances())}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1 font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Xuất CSV ngày
                        </button>
                      </div>
                      <div className="overflow-x-auto max-h-[350px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Ngày</th>
                              <th className="p-3 text-center">Số đơn</th>
                              <th className="p-3 text-right">Doanh thu (+)</th>
                              <th className="p-3 text-right">Giá vốn COGS (-)</th>
                              <th className="p-3 text-right">Chi phí vận hành (-)</th>
                              <th className="p-3 text-right">Vốn nhập kho (-)</th>
                              <th className="p-3 text-right">Lương đã trả (-)</th>
                              <th className="p-3 text-right font-black text-neutral-950">Lợi nhuận ròng (=)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {getDailyFinances().map((day) => (
                              <tr key={day.date} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3 font-mono font-bold text-neutral-900">{day.date}</td>
                                <td className="p-3 text-center font-mono text-neutral-500">{day.orderCount} đơn</td>
                                <td className="p-3 text-right font-mono font-bold text-emerald-600">+{formatPrice(day.revenue)}</td>
                                <td className="p-3 text-right font-mono text-neutral-400">-{formatPrice(day.cogs)}</td>
                                <td className="p-3 text-right font-mono text-rose-500">
                                  {day.expenses > 0 ? `-${formatPrice(day.expenses)}` : '0 ₫'}
                                </td>
                                <td className="p-3 text-right font-mono text-rose-500">
                                  {day.restockCost > 0 ? `-${formatPrice(day.restockCost)}` : '0 ₫'}
                                </td>
                                <td className="p-3 text-right font-mono text-rose-500">
                                  {day.salaryPaid > 0 ? `-${formatPrice(day.salaryPaid)}` : '0 ₫'}
                                </td>
                                <td className={`p-3 text-right font-mono font-black ${day.profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {day.profit >= 0 ? '+' : ''}{formatPrice(day.profit)}
                                </td>
                              </tr>
                            ))}
                            {getDailyFinances().length === 0 && (
                              <tr>
                                <td colSpan={8} className="text-center py-8 text-neutral-450 italic">Chưa phát sinh bất kỳ hoạt động tài chính nào.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* PRODUCT P&L FULL LEDGER */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">Sổ hạch toán kết quả kinh doanh chi tiết theo sản phẩm</h4>
                        <button
                          onClick={() => exportPLToCSV(sortedLedger)}
                          className="px-3.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-white text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Xuất CSV
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Tên sản phẩm</th>
                              <th className="p-3 text-center">Đã bán</th>
                              <th className="p-3 text-right">Thu (Doanh thu)</th>
                              <th className="p-3 text-center">Đã nhập</th>
                              <th className="p-3 text-right">Chi (Vốn nhập)</th>
                              <th className="p-3 text-right font-black text-neutral-950">Lợi nhuận ròng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {sortedLedger.map((item) => (
                              <tr key={item.product.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3">
                                  <span className="font-bold text-neutral-900 block">{item.product.name}</span>
                                  <span className="text-[9px] text-neutral-455 uppercase font-bold tracking-wider">{item.product.category}</span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-neutral-600">{item.soldQty} chiếc</td>
                                <td className="p-3 text-right font-mono font-black text-emerald-600">+{formatPrice(item.revenue)}</td>
                                <td className="p-3 text-center font-mono text-neutral-450">{item.stockedQty} chiếc</td>
                                <td className="p-3 text-right font-mono font-bold text-rose-500">-{formatPrice(item.importCost)}</td>
                                <td className={`p-3 text-right font-mono font-black ${item.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {item.netProfit >= 0 ? '+' : ''}{formatPrice(item.netProfit)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* --- ACCOUNTANT HR & PAYROLL MANAGEMENT --- */}
              {(activeTab === 'accountant-hr-payroll' || (activeTab === 'staff-schedule' && staffScheduleSubTab === 'payroll')) && currentUser.role === 'accountant' && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Nhân sự & Lương bổng toàn doanh nghiệp</h3>
                  <p className="text-xs text-neutral-400 mb-8">Đăng ký tài khoản cho nhân sự mới, cho nhân sự nghỉ việc, tạo bảng lương hàng tháng và phê duyệt thanh toán.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Register new employee form */}
                    <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wider mb-4 flex items-center gap-1">
                        <PlusCircle className="w-4 h-4 text-neutral-600" />
                        Đăng ký tài khoản nhân viên mới
                      </h4>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (newStaffName && newStaffEmail && newStaffPassword) {
                            register(newStaffName, newStaffEmail, newStaffPassword, newStaffRole, newStaffBranch, newStaffPhone);
                            setNewStaffName('');
                            setNewStaffEmail('');
                            setNewStaffPassword('');
                            setNewStaffPhone('');
                          }
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-[8px] font-bold text-neutral-450 block mb-1">Tên nhân viên</label>
                          <input
                            type="text"
                            required
                            placeholder="Ví dụ: Nguyễn Văn A"
                            value={newStaffName}
                            onChange={(e) => setNewStaffName(e.target.value)}
                            className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-800"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-neutral-455 block mb-1">Email đăng nhập</label>
                          <input
                            type="email"
                            required
                            placeholder="staff@novynwear.com"
                            value={newStaffEmail}
                            onChange={(e) => setNewStaffEmail(e.target.value)}
                            className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-805"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-neutral-455 block mb-1">Mật khẩu</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={newStaffPassword}
                            onChange={(e) => setNewStaffPassword(e.target.value)}
                            className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white focus:outline-none font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-neutral-455 block mb-1">Vai trò</label>
                          <select
                            value={newStaffRole}
                            onChange={(e) => setNewStaffRole(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-800"
                          >
                            <option value="employee">Nhân viên (Employee)</option>
                            <option value="manager">Quản lý (Manager)</option>
                            <option value="accountant">Kế toán (Accountant)</option>
                            <option value="cskh">Chăm sóc khách hàng (CSKH)</option>
                          </select>
                        </div>
                        {(newStaffRole === 'employee' || newStaffRole === 'manager') && (
                          <div>
                            <label className="text-[8px] font-bold text-neutral-455 block mb-1">Chi nhánh</label>
                            <select
                              value={newStaffBranch}
                              onChange={(e) => setNewStaffBranch(e.target.value)}
                              className="w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-800"
                            >
                              <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                              <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="text-[8px] font-bold text-neutral-455 block mb-1">Số điện thoại</label>
                          <input
                            type="text"
                            placeholder="Số điện thoại liên lạc..."
                            value={newStaffPhone}
                            onChange={(e) => setNewStaffPhone(e.target.value)}
                            className="w-full px-3 py-2.5 border rounded-xl text-xs bg-white focus:outline-none font-semibold"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Tạo tài khoản nhân viên
                        </button>
                      </form>
                    </div>

                    {/* Staff List with delete button */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Danh sách nhân sự toàn hệ thống NOVYN</h4>
                      <div className="overflow-x-auto max-h-[450px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Họ tên</th>
                              <th className="p-3 font-mono">Mức lương Gross</th>
                              <th className="p-3">Chi nhánh</th>
                              <th className="p-3 text-right">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {usersList
                              .filter((u: any) => u.role !== 'customer')
                              .map((u: any) => (
                                <tr key={u.id} className="hover:bg-neutral-50/20 transition-colors">
                                  <td className="p-3">
                                    <span className="font-bold text-neutral-900 block">{u.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-[7px] font-black tracking-widest uppercase text-white shadow-sm ${
                                      u.role === 'director' ? 'bg-rose-500' :
                                      u.role === 'manager' ? 'bg-amber-500' :
                                      u.role === 'accountant' ? 'bg-emerald-500' : 'bg-sky-500'
                                    }`}>
                                      {u.role === 'director' ? 'Giám đốc' :
                                       u.role === 'manager' ? 'Quản lý' :
                                       u.role === 'accountant' ? 'Kế toán' :
                                       u.role === 'cskh' ? 'CSKH' : 'Nhân viên'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-mono font-black text-neutral-800">{u.salary ? formatPrice(u.salary) : 'Thoả thuận'}</td>
                                  <td className="p-3 text-neutral-500">{u.branch || 'Văn phòng chính'}</td>
                                  <td className="p-3 text-right">
                                    {u.id !== currentUser.id && u.id !== 'usr-dir' ? (
                                      <button
                                        onClick={() => {
                                          if (confirm(`Bạn có chắc chắn muốn cho nhân sự ${u.name} nghỉ việc và xóa tài khoản hoàn toàn không?`)) {
                                            deleteUser(u.id);
                                          }
                                        }}
                                        className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                                      >
                                        Cho nghỉ việc
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-neutral-400 italic">Không thể tác động</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Payroll Generator & disbursement list */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Build payroll form */}
                    <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1">
                        <PlusCircle className="w-4 h-4 text-neutral-600" />
                        Tạo bảng tính lương mới
                      </h4>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (selectedPayrollUser && newPayrollMonth && newPayrollSalary > 0) {
                            addPayrollRecord(selectedPayrollUser, newPayrollMonth, newPayrollSalary);
                            setSelectedPayrollUser('');
                            setNewPayrollSalary(0);
                          }
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-[8px] font-bold text-neutral-450 block mb-1">Chọn nhân sự nhận lương</label>
                          <select
                            required
                            value={selectedPayrollUser}
                            onChange={(e) => {
                              setSelectedPayrollUser(e.target.value);
                              const selectedObj = usersList.find((u: any) => u.id === e.target.value);
                              if (selectedObj && selectedObj.salary) {
                                setNewPayrollSalary(selectedObj.salary);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 border bg-white rounded-xl text-xs font-bold text-neutral-800"
                          >
                            <option value="">-- Chọn nhân sự --</option>
                            {usersList
                              .filter((u: any) => u.role !== 'customer')
                              .map((u: any) => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                              ))}
                          </select>
                        </div>
                        
                        {/* Real-time Attendance Statistics for Selected User */}
                        {(() => {
                          if (!selectedPayrollUser) return null;
                          const SHIFT_START: Record<string, string> = {
                            morning: '08:00',
                            afternoon: '13:00',
                            evening: '18:00',
                          };

                          const logs = attendanceLogs.filter(
                            (l: any) => l.userId === selectedPayrollUser && l.date.startsWith(newPayrollMonth)
                          );

                          let onTime = 0;
                          let late = 0;
                          let invalid = 0;

                          logs.forEach((log: any) => {
                            if (!log.timeIn || !log.timeOut) {
                              invalid++;
                            } else {
                              const assignedShift = shiftRequests.find(
                                (s: any) => s.userId === log.userId && s.date === log.date && s.status === 'approved'
                              );
                              if (!assignedShift) {
                                onTime++;
                              } else {
                                const startRequired = SHIFT_START[assignedShift.shiftType] || '08:00';
                                if (log.timeIn > startRequired) {
                                  late++;
                                } else {
                                  onTime++;
                                }
                              }
                            }
                          });

                          return (
                            <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm text-xs space-y-2 mt-2">
                              <div className="font-black text-neutral-900 uppercase tracking-wider text-[9px] mb-2 text-neutral-450">Thống kê chấm công {newPayrollMonth}</div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-neutral-50 p-2 rounded-xl text-center">
                                  <span className="text-[10px] text-neutral-400 font-medium block">Tổng chấm công</span>
                                  <span className="text-sm font-black text-neutral-900">{logs.length} ngày</span>
                                </div>
                                <div className="bg-emerald-50/50 p-2 rounded-xl text-center border border-emerald-100/50">
                                  <span className="text-[10px] text-emerald-600 font-medium block">Hợp lệ (Tính công)</span>
                                  <span className="text-sm font-black text-emerald-700">{onTime + late} ngày</span>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-neutral-50 space-y-1.5 font-medium text-[10px]">
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">✓ Đúng giờ:</span>
                                  <span className="font-bold text-emerald-600">{onTime} ngày</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-neutral-500">⏰ Đi muộn:</span>
                                  <span className="font-bold text-amber-600">{late} ngày</span>
                                </div>
                                <div className="flex justify-between text-rose-600 bg-rose-50/50 p-1.5 rounded-lg border border-rose-100/30">
                                  <span>✗ Thiếu check (Không tính):</span>
                                  <span className="font-black">{invalid} ngày</span>
                                </div>
                              </div>
                              <p className="text-[8px] text-neutral-400 italic mt-1 leading-relaxed">* Dữ liệu được tính tự động từ lịch sử chấm vân tay thực tế của nhân sự trong tháng.</p>
                            </div>
                          );
                        })()}

                        <div>
                          <label className="text-[8px] font-bold text-neutral-450 block mb-1">Tháng kết toán lương</label>
                          <input
                            type="text"
                            required
                            placeholder="Ví dụ: 2026-06"
                            value={newPayrollMonth}
                            onChange={(e) => setNewPayrollMonth(e.target.value)}
                            className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-bold text-neutral-450 block mb-1">Tổng lương Gross thực nhận (VND)</label>
                          <input
                            type="number"
                            required
                            value={newPayrollSalary || ''}
                            onChange={(e) => setNewPayrollSalary(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Xác nhận phát hành phiếu lương
                        </button>
                      </form>
                    </div>

                    {/* Payroll list table with disbursement button */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                      <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide mb-4">Các khoản thanh toán lương & Giải quỹ giải ngân</h4>
                      <div className="overflow-x-auto max-h-[300px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Tháng lương</th>
                              <th className="p-3">Họ tên</th>
                              <th className="p-3 font-mono">Thực nhận</th>
                              <th className="p-3 text-right">Trạng thái / Giải ngân</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {payrollRecords.map((pay: any) => (
                              <tr key={pay.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3 font-mono font-bold">{pay.month}</td>
                                <td className="p-3">{pay.name}</td>
                                <td className="p-3 font-mono font-black text-neutral-900">{formatPrice(pay.salary)}</td>
                                <td className="p-3 text-right">
                                  {pay.status === 'paid' ? (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Đã chi trả</span>
                                  ) : (
                                    <button
                                      onClick={() => paySalary(pay.id)}
                                      className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-250 text-[9px] font-black uppercase tracking-wider cursor-pointer"
                                    >
                                      Bấm chi lương
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ACCOUNTANT GLOBAL FINANCE (EXPENSES & PRODUCT P&L & PRODUCT CRUD) --- */}
              {(activeTab === 'accountant-global-finance' || (activeTab === 'finance-profit' && financeProfitSubTab === 'p-l')) && currentUser.role === 'accountant' && (() => {
                const ledger = productsList.map((product: any) => {
                  const soldQty = allOrders
                    .filter((o: any) => o.status === 'completed')
                    .reduce((total: number, order: any) => {
                      const item = order.items.find((i: any) => i.product.id === product.id);
                      return total + (item ? item.quantity : 0);
                    }, 0);

                  const stockedQty = restockRecords
                    .filter((r: any) => r.productId === product.id && (!r.status || r.status === 'approved'))
                    .reduce((total: number, r: any) => total + r.amount, 0);

                  const revenue = soldQty * product.price;
                  const importCost = stockedQty * (product.price * 0.4);
                  const netProfit = revenue - importCost;

                  return {
                    product,
                    soldQty,
                    revenue,
                    stockedQty,
                    importCost,
                    netProfit,
                  };
                });

                const sortedLedger = [...ledger].sort((a, b) => b.revenue - a.revenue);

                return (
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Tài chính & Thu chi sản phẩm</h3>
                    <p className="text-xs text-neutral-400 mb-8">Quản lý chi phí vận hành phát sinh, theo dõi sổ hạch toán kết quả kinh doanh chi tiết theo sản phẩm, và thiết lập danh mục bán hàng.</p>
                    
                    <div className="mb-10">
                      <FinancialSVGCharts
                        allOrders={allOrders}
                        restockRecords={restockRecords}
                        expensesList={expensesList}
                        usersList={usersList}
                        currentUser={currentUser}
                      />
                    </div>



                    {/* DAILY FINANCIAL REPORT */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">Nhật ký doanh thu & Lợi nhuận ròng theo ngày thực tế</h4>
                          <p className="text-[10px] text-neutral-400 mt-1">• Doanh thu thực tế từ đơn hoàn thành &nbsp;• Chi phí vận hành phát sinh &nbsp;• Giá vốn hàng bán &nbsp;• Chi phí nhập hàng/Lương chi trả</p>
                        </div>
                        <button
                          onClick={() => exportDailyPLToCSV(getDailyFinances())}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1 font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Xuất CSV ngày
                        </button>
                      </div>
                      <div className="overflow-x-auto max-h-[350px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Ngày</th>
                              <th className="p-3 text-center">Số đơn</th>
                              <th className="p-3 text-right">Doanh thu (+)</th>
                              <th className="p-3 text-right">Giá vốn COGS (-)</th>
                              <th className="p-3 text-right">Chi phí vận hành (-)</th>
                              <th className="p-3 text-right">Vốn nhập kho (-)</th>
                              <th className="p-3 text-right">Lương đã trả (-)</th>
                              <th className="p-3 text-right font-black text-neutral-950">Lợi nhuận ròng (=)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {getDailyFinances().map((day) => (
                              <tr key={day.date} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3 font-mono font-bold text-neutral-900">{day.date}</td>
                                <td className="p-3 text-center font-mono text-neutral-500">{day.orderCount} đơn</td>
                                <td className="p-3 text-right font-mono font-bold text-emerald-600">+{formatPrice(day.revenue)}</td>
                                <td className="p-3 text-right font-mono text-neutral-400">-{formatPrice(day.cogs)}</td>
                                <td className="p-3 text-right font-mono text-rose-500">
                                  {day.expenses > 0 ? `-${formatPrice(day.expenses)}` : '0 ₫'}
                                </td>
                                <td className="p-3 text-right font-mono text-rose-500">
                                  {day.restockCost > 0 ? `-${formatPrice(day.restockCost)}` : '0 ₫'}
                                </td>
                                <td className="p-3 text-right font-mono text-rose-500">
                                  {day.salaryPaid > 0 ? `-${formatPrice(day.salaryPaid)}` : '0 ₫'}
                                </td>
                                <td className={`p-3 text-right font-mono font-black ${day.profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                  {day.profit >= 0 ? '+' : ''}{formatPrice(day.profit)}
                                </td>
                              </tr>
                            ))}
                            {getDailyFinances().length === 0 && (
                              <tr>
                                <td colSpan={8} className="text-center py-8 text-neutral-450 italic">Chưa phát sinh bất kỳ hoạt động tài chính nào.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* PRODUCT P&L FULL LEDGER */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide">Sổ hạch toán kết quả kinh doanh chi tiết theo sản phẩm</h4>
                        <button
                          onClick={() => exportPLToCSV(sortedLedger)}
                          className="px-3.5 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-white text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Xuất CSV
                        </button>
                      </div>
                      <div className="overflow-x-auto max-h-[350px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Tên sản phẩm</th>
                              <th className="p-3 text-center">Đã bán</th>
                              <th className="p-3 text-right">Thu (Doanh thu)</th>
                              <th className="p-3 text-center">Đã nhập</th>
                              <th className="p-3 text-right">Chi (Vốn nhập)</th>
                              <th className="p-3 text-right font-black text-neutral-950">Lợi nhuận ròng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {sortedLedger.map((item) => (
                              <tr key={item.product.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3">
                                  <span className="font-bold text-neutral-900 block">{item.product.name}</span>
                                  <span className="text-[9px] text-neutral-455 uppercase font-bold tracking-wider font-mono">{item.product.id}</span>
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-neutral-600">{item.soldQty} chiếc</td>
                                <td className="p-3 text-right font-mono font-black text-emerald-600">+{formatPrice(item.revenue)}</td>
                                <td className="p-3 text-center font-mono text-neutral-450">{item.stockedQty} chiếc</td>
                                <td className="p-3 text-right font-mono font-bold text-rose-500">-{formatPrice(item.importCost)}</td>
                                <td className={`p-3 text-right font-mono font-black ${item.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-605'}`}>
                                  {item.netProfit >= 0 ? '+' : ''}{formatPrice(item.netProfit)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* INTERACTIVE TAX SETTLEMENT WORKSPACE */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-neutral-50 pb-4">
                        <div>
                          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-neutral-750" />
                            Quyết toán Thuế Doanh nghiệp & Thu nhập cá nhân (CIT & PIT)
                          </h4>
                          <p className="text-[10px] text-neutral-400 mt-1">• Tính thuế thu nhập doanh nghiệp (CIT) &nbsp;• Tính thuế TNCN lũy tiến của nhân viên &nbsp;• Chốt sổ báo cáo thuế hàng tháng</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-[10px] font-bold text-neutral-450 uppercase">Kỳ quyết toán:</label>
                          <select
                            value={taxPeriod}
                            onChange={(e) => setTaxPeriod(e.target.value)}
                            className="px-3 py-1.5 rounded-xl border bg-white focus:outline-none text-xs font-black text-neutral-800"
                          >
                            <option value="2026-05">Tháng 05/2026 (Kỳ hiện tại)</option>
                            <option value="2026-04">Tháng 04/2026</option>
                            <option value="2026-03">Tháng 03/2026</option>
                            <option value="2026-02">Tháng 02/2026</option>
                            <option value="2026-01">Tháng 01/2026</option>
                          </select>
                        </div>
                      </div>

                      {/* MAIN INTERACTIVE AREA */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* PARAMETERS ADJUSTING PANEL */}
                        <div className="lg:col-span-1 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-100 space-y-6">
                          <h5 className="text-[10px] font-black text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Sliders className="w-3.5 h-3.5 text-neutral-550" />
                            Cấu hình tham số tính thuế
                          </h5>
                          
                          {/* CIT RATE SLIDER */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-bold text-neutral-455 uppercase">Thuế suất TNDN (CIT):</span>
                              <span className="text-xs font-black text-rose-650">{customCitRate}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              value={customCitRate}
                              onChange={(e) => setCustomCitRate(Number(e.target.value))}
                              className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                            />
                            <div className="flex justify-between text-[8px] text-neutral-400 font-medium mt-1">
                              <span>0%</span>
                              <span>Định mức chuẩn: 20%</span>
                              <span>30%</span>
                            </div>
                          </div>

                          {/* PERSONAL PIT DEDUCTION */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-bold text-neutral-455 uppercase">Giảm trừ bản thân:</span>
                              <span className="text-xs font-black text-neutral-800">{formatPrice(personalDeduction)}</span>
                            </div>
                            <input
                              type="range"
                              min="9000000"
                              max="15000000"
                              step="500000"
                              value={personalDeduction}
                              onChange={(e) => setPersonalDeduction(Number(e.target.value))}
                              className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                            />
                            <div className="flex justify-between text-[8px] text-neutral-400 font-medium mt-1">
                              <span>9M ₫</span>
                              <span>Mặc định: 11M ₫</span>
                              <span>15M ₫</span>
                            </div>
                          </div>

                          {/* DEPENDENT PIT DEDUCTION */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-bold text-neutral-455 uppercase">Giảm trừ người phụ thuộc:</span>
                              <span className="text-xs font-black text-neutral-800">{formatPrice(dependentDeduction)}/người</span>
                            </div>
                            <input
                              type="range"
                              min="3000000"
                              max="6000000"
                              step="200000"
                              value={dependentDeduction}
                              onChange={(e) => setDependentDeduction(Number(e.target.value))}
                              className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                            />
                            <div className="flex justify-between text-[8px] text-neutral-400 font-medium mt-1">
                              <span>3M ₫</span>
                              <span>Mặc định: 4.4M ₫</span>
                              <span>6M ₫</span>
                            </div>
                          </div>

                          {/* FINANCIAL OVERVIEW BRIEF IN CONTROLS */}
                          <div className="pt-4 border-t border-neutral-200/60 space-y-2.5 text-[10px] text-neutral-600 font-medium">
                            <div className="flex justify-between">
                              <span>Doanh thu gộp:</span>
                              <span className="font-mono font-bold text-neutral-900">{formatPrice(getPeriodFinances(taxPeriod).revenue)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Giá vốn COGS (40%):</span>
                              <span className="font-mono text-neutral-500">-{formatPrice(getPeriodFinances(taxPeriod).cogs)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Chi phí vận hành:</span>
                              <span className="font-mono text-neutral-500">-{formatPrice(getPeriodFinances(taxPeriod).expenses)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Chi phí lương nhân sự:</span>
                              <span className="font-mono text-neutral-500">-{formatPrice(getPeriodFinances(taxPeriod).salaries)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Vốn nhập kho duyệt:</span>
                              <span className="font-mono text-neutral-500">-{formatPrice(getPeriodFinances(taxPeriod).restockCost)}</span>
                            </div>
                          </div>
                        </div>

                        {/* LIVE PREVIEW & ACTIONS CARD */}
                        <div className="lg:col-span-2 space-y-6">
                          
                          {/* SUMMARY PREMIUM CARD */}
                          {(() => {
                            const finances = getPeriodFinances(taxPeriod);
                            const activeStaff = usersList.filter((u: any) => u.role !== 'customer');
                            
                            const staffPITDetails = activeStaff.map((u: any) => {
                              const gross = u.salary || 0;
                              const dependents = employeeDependents[u.id] || 0;
                              const pit = calculateDynamicPITForSalary(gross, personalDeduction, dependentDeduction, dependents);
                              return { user: u, gross, dependents, pit };
                            });
                            
                            const totalStaffPIT = staffPITDetails.reduce((sum: number, item: any) => sum + item.pit, 0);
                            const citAmount = finances.ebt > 0 ? finances.ebt * (customCitRate / 100) : 0;
                            const netProfit = finances.ebt - citAmount;

                            return (
                              <>
                                <div className="p-6 rounded-2xl bg-gradient-to-tr from-neutral-900 via-neutral-950 to-neutral-900 text-white border border-neutral-850 shadow-md flex flex-col md:flex-row justify-between gap-6 min-h-[160px]">
                                  <div className="flex flex-col justify-between flex-1">
                                    <div>
                                      <span className="text-[8px] uppercase tracking-widest font-black text-rose-400 block mb-1">
                                        Báo cáo kết quả kinh doanh trước thuế (EBT)
                                      </span>
                                      <h4 className="text-xl font-black tracking-tight font-mono">
                                        {formatPrice(finances.ebt)}
                                      </h4>
                                    </div>
                                    <div className="mt-4 space-y-1.5 text-[9px] text-neutral-350">
                                      <div className="flex justify-between max-w-[280px]">
                                        <span>Dự tính thuế doanh nghiệp CIT ({customCitRate}%):</span>
                                        <span className="font-mono font-bold text-rose-450">-{formatPrice(citAmount)}</span>
                                      </div>
                                      <div className="flex justify-between max-w-[280px]">
                                        <span>Dự tính tổng thuế PIT khấu trừ nhân viên:</span>
                                        <span className="font-mono font-bold text-emerald-400">+{formatPrice(totalStaffPIT)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-6 shrink-0 min-w-[180px]">
                                    <div className="text-right w-full">
                                      <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 block mb-1">
                                        Lợi nhuận ròng sau thuế CIT
                                      </span>
                                      <h4 className="text-base font-black tracking-tight font-mono text-emerald-450">
                                        {formatPrice(netProfit)}
                                      </h4>
                                    </div>
                                    <div className="flex gap-2 w-full mt-4 justify-end">
                                      <button
                                        onClick={() => handleSaveTaxRecord({
                                          id: `tax-${Date.now()}`,
                                          period: taxPeriod,
                                          revenue: finances.revenue,
                                          cogs: finances.cogs,
                                          expenses: finances.expenses,
                                          salaries: finances.salaries,
                                          restockCost: finances.restockCost,
                                          ebt: finances.ebt,
                                          citRate: customCitRate,
                                          citAmount,
                                          pitAmount: totalStaffPIT,
                                          netProfit,
                                          settledAt: new Date().toLocaleString(),
                                          accountantName: currentUser.name
                                        })}
                                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex-1 text-center font-bold"
                                      >
                                        Khóa sổ thuế
                                      </button>
                                      <button
                                        onClick={() => exportTaxRecordsToCSV([{
                                          period: taxPeriod,
                                          revenue: finances.revenue,
                                          cogs: finances.cogs,
                                          expenses: finances.expenses,
                                          salaries: finances.salaries,
                                          restockCost: finances.restockCost,
                                          ebt: finances.ebt,
                                          citRate: customCitRate,
                                          citAmount,
                                          pitAmount: totalStaffPIT,
                                          netProfit,
                                          settledAt: new Date().toLocaleString(),
                                          accountantName: currentUser.name
                                        }])}
                                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-[9px] font-black transition-all active:scale-95 cursor-pointer flex justify-center items-center"
                                        title="Xuất tờ khai CSV"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* PERSONNEL PIT INTERACTIVE TABLE */}
                                <div className="bg-white rounded-2xl border border-neutral-100 p-4 shadow-sm">
                                  <h5 className="text-[10px] font-black text-neutral-850 uppercase tracking-wider mb-3">
                                    Bảng kê thuế TNCN chi tiết từng nhân sự ({activeStaff.length} người)
                                  </h5>
                                  <div className="overflow-x-auto max-h-[220px]">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                                          <th className="p-2">Nhân sự</th>
                                          <th className="p-2">Lương Gross</th>
                                          <th className="p-2 text-center">Người phụ thuộc</th>
                                          <th className="p-2 text-right">Giảm trừ gia cảnh</th>
                                          <th className="p-2 text-right text-rose-600 font-bold">Thuế PIT khấu trừ</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700 text-[10px]">
                                        {staffPITDetails.map(({ user, gross, dependents, pit }: any) => {
                                          const totalDeduction = personalDeduction + (dependents * dependentDeduction);
                                          return (
                                            <tr key={user.id} className="hover:bg-neutral-50/20 transition-colors">
                                              <td className="p-2">
                                                <span className="font-bold text-neutral-900 block">{user.name}</span>
                                                <span className="text-[8px] text-neutral-400 font-semibold">{user.role} • {user.branch || 'Văn phòng'}</span>
                                              </td>
                                              <td className="p-2 font-mono font-bold">{formatPrice(gross)}</td>
                                              <td className="p-2 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                  <button
                                                    onClick={() => {
                                                      const currentDep = employeeDependents[user.id] || 0;
                                                      if (currentDep > 0) {
                                                        setEmployeeDependents({
                                                          ...employeeDependents,
                                                          [user.id]: currentDep - 1
                                                        });
                                                      }
                                                    }}
                                                    className="w-5 h-5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 active:scale-90 select-none cursor-pointer"
                                                  >
                                                    -
                                                  </button>
                                                  <span className="font-mono font-bold w-4 text-center">{dependents}</span>
                                                  <button
                                                    onClick={() => {
                                                      const currentDep = employeeDependents[user.id] || 0;
                                                      setEmployeeDependents({
                                                        ...employeeDependents,
                                                        [user.id]: currentDep + 1
                                                      });
                                                    }}
                                                    className="w-5 h-5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-600 active:scale-90 select-none cursor-pointer"
                                                  >
                                                    +
                                                  </button>
                                                </div>
                                              </td>
                                              <td className="p-2 text-right font-mono text-neutral-450">{formatPrice(totalDeduction)}</td>
                                              <td className="p-2 text-right font-mono font-black text-rose-550">
                                                {pit > 0 ? `-${formatPrice(pit)}` : '0 ₫'}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* HISTORICAL SETTLED LOGS */}
                      <div className="mt-8 border-t border-neutral-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h5 className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">Lịch sử chốt sổ & tờ khai thuế lũy kế</h5>
                            <p className="text-[9px] text-neutral-400 font-medium">Danh sách các kỳ quyết toán thuế đã chốt sổ và lưu trữ chính thức.</p>
                          </div>
                          {taxRecords.length > 0 && (
                            <button
                              onClick={() => exportTaxRecordsToCSV(taxRecords)}
                              className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1 font-bold text-neutral-700 bg-white"
                            >
                              <Download className="w-3.5 h-3.5 text-neutral-600" />
                              Xuất toàn bộ sổ thuế
                            </button>
                          )}
                        </div>

                        {taxRecords.length === 0 ? (
                          <div className="text-center py-8 text-neutral-400 italic text-xs border border-dashed rounded-2xl bg-neutral-50/20">
                            Chưa có tờ khai quyết toán thuế nào được lưu.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[8px]">
                                  <th className="p-3">Kỳ thuế</th>
                                  <th className="p-3 text-right">Doanh thu gộp</th>
                                  <th className="p-3 text-right">LNTT (EBT)</th>
                                  <th className="p-3 text-center">Thuế CIT</th>
                                  <th className="p-3 text-right">Thuế PIT</th>
                                  <th className="p-3 text-right font-black text-neutral-900">Lợi nhuận sau thuế</th>
                                  <th className="p-3">Ngày khóa sổ</th>
                                  <th className="p-3">Kế toán quyết toán</th>
                                  <th className="p-3 text-center">Hành động</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                                {taxRecords.map((rec) => (
                                  <tr key={rec.id} className="hover:bg-neutral-50/20 transition-colors text-[10px]">
                                    <td className="p-3 font-mono font-bold text-neutral-900">{rec.period}</td>
                                    <td className="p-3 text-right font-mono">{formatPrice(rec.revenue)}</td>
                                    <td className="p-3 text-right font-mono">{formatPrice(rec.ebt)}</td>
                                    <td className="p-3 text-center font-mono text-rose-550 font-semibold">
                                      {formatPrice(rec.citAmount)} <span className="text-[8px] text-neutral-400">({rec.citRate}%)</span>
                                    </td>
                                    <td className="p-3 text-right font-mono text-emerald-650 font-semibold">+{formatPrice(rec.pitAmount)}</td>
                                    <td className="p-3 text-right font-mono font-black text-emerald-700">{formatPrice(rec.netProfit)}</td>
                                    <td className="p-3 text-neutral-455 font-mono">{rec.settledAt}</td>
                                    <td className="p-3 text-neutral-600 font-bold">{rec.accountantName}</td>
                                    <td className="p-3 text-center">
                                      <button
                                        onClick={() => handleDeleteTaxRecord(rec.id)}
                                        className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 cursor-pointer active:scale-95 font-bold text-[8px] flex items-center justify-center gap-1 mx-auto"
                                        title="Xóa bản ghi"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PRODUCT CRUD MANAGER PANEL */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-black text-neutral-950 uppercase tracking-wide">Danh sách 28 sản phẩm & Điều phối danh mục</h4>
                        <button
                          onClick={() => setShowAddProductModal(true)}
                          className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-850 active:scale-95 text-white text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm sản phẩm mới
                        </button>
                      </div>

                      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                        {productsList.map((prod: any) => (
                          <div key={prod.id} className="border border-neutral-150 p-4 rounded-2xl bg-neutral-50/40 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="relative w-12 aspect-[4/5] rounded-xl bg-neutral-100 border overflow-hidden shrink-0">
                                <Image
                                  src={prod.images[0]}
                                  alt={prod.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-neutral-900 truncate">{prod.name}</h5>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-400 block mt-0.5">{prod.category}</span>
                                <span className="text-xs font-black text-neutral-900 mt-1 block">{formatPrice(prod.price)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {editingProductId === prod.id ? (
                                <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border shadow-sm">
                                  <div>
                                    <label className="text-[8px] font-bold text-neutral-400 uppercase">Tên sản phẩm</label>
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full px-2 py-1 border text-xs font-bold rounded"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-bold text-neutral-400 uppercase">Giá bán (₫)</label>
                                    <input
                                      type="number"
                                      value={editPrice}
                                      onChange={(e) => setEditPrice(Number(e.target.value))}
                                      className="w-full px-2 py-1 border text-xs font-bold rounded"
                                    />
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => {
                                        updateGlobalProductPrice(prod.id, editPrice);
                                        updateGlobalProductDetails(prod.id, editName, editDesc, editCat);
                                        setEditingProductId(null);
                                      }}
                                      className="bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-emerald-600 transition-colors"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      onClick={() => setEditingProductId(null)}
                                      className="bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-neutral-300 transition-colors"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingProductId(prod.id);
                                      setEditPrice(prod.price);
                                      setEditName(prod.name);
                                      setEditDesc(prod.description);
                                      setEditCat(prod.category);
                                    }}
                                    className="bg-neutral-950 text-white text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl hover:bg-neutral-850 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm shadow-neutral-950/10"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Sửa giá
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc chắn muốn ngừng bán sản phẩm ${prod.name} không?`)) {
                                        deleteGlobalProduct(prod.id);
                                      }
                                    }}
                                    className="bg-rose-50 text-rose-605 text-[9px] font-bold uppercase tracking-widest px-3.5 py-2 rounded-xl hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer active:scale-95"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* MODAL THÊM SẢN PHẨM MỚI (GLASSMORPHISM POPUP) */}
                    {showAddProductModal && (
                      <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white/95 border border-neutral-100 max-w-lg w-full rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                          <button
                            onClick={() => setShowAddProductModal(false)}
                            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer font-bold text-neutral-600"
                          >
                            ×
                          </button>
                          
                          <h3 className="text-sm font-black text-neutral-900 tracking-widest uppercase mb-4">Thêm sản phẩm mới cao cấp</h3>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              // Parse sizes
                              const parsedSizes = newProductSizes;
                              // Parse colors
                              const colorArray = newProductColors.split(',').map(c => {
                                const parts = c.trim().split('|');
                                return {
                                  name: parts[0] || 'Default Color',
                                  hex: parts[1] || '#999999'
                                };
                              });
                              // Parse image URLs
                              const imageArray = newProductImages.split(',').map(img => img.trim()).filter(Boolean);
                              if (imageArray.length === 0) {
                                imageArray.push('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400');
                              }

                              addGlobalProduct(
                                newProductName,
                                newProductCategory,
                                newProductPrice,
                                newProductDescription,
                                imageArray,
                                colorArray,
                                parsedSizes,
                                newProductInitialStock
                              );

                              // Reset form
                              setNewProductName('');
                              setNewProductPrice(0);
                              setNewProductDescription('');
                              setNewProductImages('');
                              setNewProductColors('');
                              setNewProductSizes([]);
                              setNewProductInitialStock(20);
                              setShowAddProductModal(false);
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="text-[9px] font-bold text-neutral-450 block mb-1">Tên sản phẩm *</label>
                              <input
                                type="text"
                                required
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-805"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Danh mục *</label>
                                <select
                                  value={newProductCategory}
                                  onChange={(e) => setNewProductCategory(e.target.value)}
                                  className="w-full px-3.5 py-2 border bg-white rounded-xl text-xs font-bold text-neutral-850"
                                >
                                  <option value="Tops">Tops (Áo)</option>
                                  <option value="Bottoms">Bottoms (Quần)</option>
                                  <option value="Dresses">Dresses (Đầm)</option>
                                  <option value="Outerwear">Outerwear (Áo khoác)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Giá bán lẻ đề xuất (₫) *</label>
                                <input
                                  type="number"
                                  required
                                  value={newProductPrice || ''}
                                  onChange={(e) => setNewProductPrice(Number(e.target.value))}
                                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-neutral-450 block mb-1">Link ảnh minh họa Unsplash (Có thể nhập nhiều link cách nhau bởi dấu phẩy) *</label>
                              <input
                                type="text"
                                required
                                placeholder="https://images.unsplash.com/photo-..., https://images.unsplash.com/photo-..."
                                value={newProductImages}
                                onChange={(e) => setNewProductImages(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-medium"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Màu sắc (Tên|Hex, Tên|Hex) *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ví dụ: Trắng|#FFFFFF, Đen|#111827"
                                  value={newProductColors}
                                  onChange={(e) => setNewProductColors(e.target.value)}
                                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-750"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-neutral-450 block mb-1">Tồn kho chi nhánh ban đầu *</label>
                                <input
                                  type="number"
                                  required
                                  value={newProductInitialStock}
                                  onChange={(e) => setNewProductInitialStock(Number(e.target.value))}
                                  className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-neutral-450 block mb-2">Hỗ trợ các kích cỡ (Sizes) *</label>
                              <div className="flex gap-4">
                                {['S', 'M', 'L', 'XL', 'F'].map(size => (
                                  <label key={size} className="flex items-center gap-1.5 text-xs font-black text-neutral-800">
                                    <input
                                      type="checkbox"
                                      checked={newProductSizes.includes(size)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setNewProductSizes(prev => [...prev, size]);
                                        } else {
                                          setNewProductSizes(prev => prev.filter(s => s !== size));
                                        }
                                      }}
                                      className="rounded border-neutral-350"
                                    />
                                    {size}
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-neutral-450 block mb-1">Mô tả sản phẩm *</label>
                              <textarea
                                required
                                value={newProductDescription}
                                onChange={(e) => setNewProductDescription(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-805"
                                rows={3}
                              />
                            </div>
                            <button
                              type="submit"
                              className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Thêm sản phẩm
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {(activeTab === 'accountant-operations' || (activeTab === 'products-inventory' && productsInventorySubTab === 'restock')) && ['director', 'accountant'].includes(currentUser.role) && (() => {
                return (
                  <div>
                    <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Kiểm kho & Báo cáo vận hành</h3>
                    <p className="text-xs text-neutral-400 mb-8">Điều phối kho hàng khẩn cấp chi tiết theo kích cỡ, duyệt yêu cầu restock từ các quản lý chi nhánh, và gửi báo cáo cuối ca.</p>

                    {/* RESTOCK FORM */}
                    <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 mb-8">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">Giải ngân nhập kho sản phẩm khẩn cấp</h4>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (selectedRestockProduct && restockAmount > 0 && selectedRestockBranch) {
                            restockBranchProduct(selectedRestockProduct, restockAmount, selectedRestockSize, selectedRestockBranch);
                            setSelectedRestockProduct('');
                            setRestockAmount(10);
                            setSelectedRestockSize('S');
                          }
                        }}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end"
                      >
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Chọn chi nhánh</label>
                          <select
                            required
                            value={selectedRestockBranch}
                            onChange={(e) => setSelectedRestockBranch(e.target.value)}
                            className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                          >
                            <option value="">-- Chọn chi nhánh --</option>
                            <option value="Chi nhánh Quận 1">Chi nhánh Quận 1</option>
                            <option value="Chi nhánh Thảo Điền">Chi nhánh Thảo Điền</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Chọn sản phẩm</label>
                          <select
                            required
                            value={selectedRestockProduct}
                            onChange={(e) => {
                              setSelectedRestockProduct(e.target.value);
                              const prod = productsList.find((p: any) => p.id === e.target.value);
                              if (prod && prod.sizes && prod.sizes.length > 0) {
                                setSelectedRestockSize(prod.sizes[0]);
                              } else {
                                setSelectedRestockSize('S');
                              }
                            }}
                            className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                          >
                            <option value="">-- Chọn sản phẩm --</option>
                            {productsList.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Chọn Size cụ thể</label>
                          <select
                            required
                            value={selectedRestockSize}
                            disabled={!selectedRestockProduct}
                            onChange={(e) => setSelectedRestockSize(e.target.value)}
                            className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold disabled:opacity-50"
                          >
                            {(() => {
                              const prod = productsList.find((p: any) => p.id === selectedRestockProduct);
                              const sizes = prod && prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'];
                              return sizes.map((sz: string) => (
                                <option key={sz} value={sz}>Size {sz}</option>
                              ));
                            })()}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Số lượng giải ngân</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(Number(e.target.value))}
                            className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Gửi đề xuất nhập kho
                        </button>
                      </form>
                    </div>

                    {/* COMPARISON TABLE */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8 animate-fade-in">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Chi tiết so sánh tồn kho các chi nhánh</h4>
                      <div className="overflow-x-auto max-h-[450px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Sản phẩm</th>
                              <th className="p-3">Mã SKU</th>
                              <th className="p-3 text-center">Tồn kho Q.1 (Size)</th>
                              <th className="p-3 text-center">Tồn kho Thảo Điền (Size)</th>
                              <th className="p-3 text-center">Tình trạng</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {productsList.map((p: any) => {
                              const q1Stock = branchStock[p.id]?.['Chi nhánh Quận 1'] || 0;
                              const tdStock = branchStock[p.id]?.['Chi nhánh Thảo Điền'] || 0;
                              const q1Sizes = branchSizeStock[p.id]?.['Chi nhánh Quận 1'] || {};
                              const tdSizes = branchSizeStock[p.id]?.['Chi nhánh Thảo Điền'] || {};
                              const sizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL'];
                              const isLow = q1Stock < 5 || tdStock < 5;
                              return (
                                <tr key={p.id} className="hover:bg-neutral-50/20 transition-colors">
                                  <td className="p-3 font-bold text-neutral-900">{p.name}</td>
                                  <td className="p-3 font-mono text-[10px] text-neutral-450">{p.id}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${q1Stock < 5 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-neutral-50 text-neutral-600'}`}>{q1Stock} chiếc</span>
                                    <div className="flex gap-1 justify-center mt-1.5 flex-wrap max-w-[150px] mx-auto">
                                      {sizes.map((sz: string) => {
                                        const qty = q1Sizes[sz] || 0;
                                        return (
                                          <span key={sz} className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold ${qty < 2 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-neutral-100 text-neutral-600'}`}>
                                            {sz}:{qty}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${tdStock < 5 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-neutral-50 text-neutral-600'}`}>{tdStock} chiếc</span>
                                    <div className="flex gap-1 justify-center mt-1.5 flex-wrap max-w-[150px] mx-auto">
                                      {sizes.map((sz: string) => {
                                        const qty = tdSizes[sz] || 0;
                                        return (
                                          <span key={sz} className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold ${qty < 2 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-neutral-100 text-neutral-600'}`}>
                                            {sz}:{qty}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                      isLow ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-650'
                                    }`}>
                                      {isLow ? 'Nhập gấp' : 'Ổn định'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RESTOCK RECORD HISTORY */}
                    <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm mb-8">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Lịch sử Yêu cầu Nhập kho</h4>
                      <div className="overflow-x-auto max-h-[300px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Chi nhánh</th>
                              <th className="p-3">Sản phẩm</th>
                              <th className="p-3 text-center">Số lượng</th>
                              <th className="p-3 text-right">Chi phí</th>
                              <th className="p-3 text-center">Ngày tạo</th>
                              <th className="p-3 text-right">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {restockRecords.map((r: any) => (
                              <tr key={r.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3 font-bold text-neutral-900">{r.branch}</td>
                                <td className="p-3 font-bold">{r.productName}</td>
                                <td className="p-3 text-center font-mono">{r.amount} chiếc</td>
                                <td className="p-3 text-right font-mono text-neutral-950">{formatPrice(r.cost)}</td>
                                <td className="p-3 text-center text-neutral-400 text-[10px] font-mono">{r.createdAt}</td>
                                <td className="p-3 text-right">
                                  {r.status !== 'approved' && r.status !== 'rejected' && ['director', 'accountant'].includes(currentUser.role) ? (
                                    <div className="flex gap-1.5 justify-end">
                                      <button
                                        onClick={async () => {
                                          try {
                                            await approveRestockRequest(r.id);
                                            showToast('✓ Đã phê duyệt yêu cầu nhập kho!', 'success');
                                          } catch (err) {
                                            showToast('Lỗi khi phê duyệt yêu cầu', 'error');
                                          }
                                        }}
                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                                      >
                                        Duyệt
                                      </button>
                                      <button
                                        onClick={async () => {
                                          try {
                                            await rejectRestockRequest(r.id);
                                            showToast('✗ Đã từ chối yêu cầu nhập kho', 'info');
                                          } catch (err) {
                                            showToast('Lỗi khi từ chối yêu cầu', 'error');
                                          }
                                        }}
                                        className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
                                      >
                                        Từ chối
                                      </button>
                                    </div>
                                  ) : (
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                      r.status === 'approved' ? 'bg-emerald-50 text-emerald-650 border-emerald-100' :
                                      r.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                      'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                    }`}>
                                      {r.status === 'approved' ? 'Đã duyệt' : r.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* DAILY REPORT SENDER FOR ACCOUNTANT */}
                    <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Gửi báo cáo thu chi / vận hành ngày hôm nay</h4>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (reportTitle && reportContent) {
                            submitDailyReport(reportTitle, reportContent);
                            setReportTitle('');
                            setReportContent('');
                          }
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-450 block mb-1">Tiêu đề báo cáo</label>
                          <input
                            type="text"
                            required
                            placeholder="Ví dụ: Báo cáo dòng tiền mặt và giải ngân nhập hàng 29/05"
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-455 block mb-1">Nội dung báo cáo chi tiết</label>
                          <textarea
                            required
                            placeholder="Liệt kê tình hình tài quỹ, đối chiếu công nợ chi nhánh..."
                            rows={4}
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          Gửi báo cáo tới Giám đốc
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })()}

              {/* --- OPERATING EXPENSES CONSOLE --- */}
              {((activeTab === 'finance-profit' && financeProfitSubTab === 'costs') || activeTab === 'costs') && ['director', 'accountant'].includes(currentUser.role) && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Ghi nhận & Quản lý chi phí vận hành</h3>
                  <p className="text-xs text-neutral-400 mb-8">Khai báo các khoản chi tiêu thực tế của chuỗi cửa hàng, quản lý dòng tiền chi ra và đối soát hoá đơn vận hành.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* EXPENSES RECORDING SECTION */}
                    <div className="lg:col-span-1 bg-neutral-50 p-6 rounded-3xl border border-neutral-100 shadow-sm">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-neutral-750" />
                        Ghi nhận chi phí vận hành mới
                      </h4>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (newExpenseTitle && newExpenseAmount > 0) {
                          addExpense(newExpenseTitle, newExpenseAmount, newExpenseCategory, new Date().toISOString().split('T')[0]);
                          setNewExpenseTitle('');
                          setNewExpenseAmount(0);
                          showToast('✓ Đã ghi nhận chi phí vận hành mới!', 'success');
                        }
                      }} className="space-y-4">
                        <div>
                          <label className="text-[9px] font-bold text-neutral-455 block mb-1">Nội dung khoản chi</label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Phí quảng cáo Facebook BST mới"
                            required
                            value={newExpenseTitle}
                            onChange={(e) => setNewExpenseTitle(e.target.value)}
                            className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-semibold text-neutral-805"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-455 block mb-1">Số tiền (VND)</label>
                          <input
                            type="number"
                            required
                            placeholder="Ví dụ: 15000000"
                            value={newExpenseAmount || ''}
                            onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
                            className="w-full px-3.5 py-2 border rounded-xl text-xs bg-white focus:outline-none font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-neutral-455 block mb-1">Phân loại chi phí</label>
                          <select
                            value={newExpenseCategory}
                            onChange={(e) => setNewExpenseCategory(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 rounded-xl border bg-white focus:outline-none text-xs font-bold text-neutral-800"
                          >
                            <option value="marketing">Marketing (Quảng cáo)</option>
                            <option value="operations">Vận hành chi nhánh (Operations)</option>
                            <option value="equipment">Trang thiết bị (Equipment)</option>
                            <option value="other">Khoản chi khác</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-neutral-950 text-white hover:bg-neutral-850 active:scale-95 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Xác nhận ghi chi phí
                        </button>
                      </form>
                    </div>

                    {/* EXPENSES HISTORIC LEDGER */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                      <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wide mb-4">Các khoản chi phí phát sinh luỹ kế</h4>
                      <div className="overflow-x-auto max-h-[350px] pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="p-3">Khoản chi</th>
                              <th className="p-3">Danh mục</th>
                              <th className="p-3">Ngày chi</th>
                              <th className="p-3 text-right">Số tiền</th>
                              <th className="p-3 text-right">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                            {expensesList.map((exp: any) => (
                              <tr key={exp.id} className="hover:bg-neutral-50/20 transition-colors">
                                <td className="p-3 font-bold text-neutral-900">{exp.title}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider text-white ${
                                    exp.category === 'marketing' ? 'bg-indigo-500' :
                                    exp.category === 'equipment' ? 'bg-amber-500' :
                                    exp.category === 'operations' ? 'bg-sky-500' : 'bg-neutral-500'
                                  }`}>
                                    {exp.category}
                                  </span>
                                </td>
                                <td className="p-3 text-neutral-500 font-mono">{exp.date}</td>
                                <td className="p-3 text-right font-black text-neutral-900 font-mono">{formatPrice(exp.amount)}</td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => deleteExpense(exp.id)}
                                    className="px-2 py-0.5 rounded text-[8px] font-bold text-rose-650 bg-rose-50 border border-rose-100 hover:bg-rose-100 cursor-pointer"
                                  >
                                    Xoá
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- CSKH CUSTOMERS & VIP TIER SEARCH --- */}
              {/* --- CSKH LIVE CHAT PANEL --- */}
              {(activeTab === 'cskh-live-chat' || (activeTab === 'sales-orders' && salesOrdersSubTab === 'chat')) && currentUser.role === 'cskh' && (() => {
                const allActiveSessions = [...waitingSessions, ...activeSessions];
                const selectedSession = selectedChatSessionId ? chatSessions.find(s => s.id === selectedChatSessionId) : null;

                const getLastCustomerMessage = (session: any) => {
                  const customerMsgs = session.messages.filter((m: any) => m.sender === 'customer');
                  return customerMsgs[customerMsgs.length - 1]?.text || '';
                };

                const getSentiment = (text: string) => {
                  if (!text) return { emoji: '💬', label: 'Trung lập', color: 'bg-neutral-100 text-neutral-700' };
                  const lower = text.toLowerCase();
                  const frustratedKeywords = ['chậm', 'tệ', 'hoàn tiền', 'lỗi', 'không đúng', 'bực', 'kém', 'quá lâu', 'lừa', 'thất vọng'];
                  const positiveKeywords = ['đẹp', 'thích', 'nhanh', 'cảm ơn', 'tốt', 'ưng', 'tuyệt', 'ok', 'iu', 'yêu'];
                  
                  if (frustratedKeywords.some(kw => lower.includes(kw))) {
                    return { emoji: '😡', label: 'Bực dọc', color: 'bg-rose-105 text-rose-700 border border-rose-250 animate-pulse font-bold' };
                  }
                  if (positiveKeywords.some(kw => lower.includes(kw))) {
                    return { emoji: '😊', label: 'Hài lòng', color: 'bg-emerald-105 text-emerald-700 border border-emerald-250 font-bold' };
                  }
                  return { emoji: '💬', label: 'Trung lập', color: 'bg-neutral-150 text-neutral-750 font-semibold' };
                };

                const getQuickReplies = (text: string) => {
                  const lower = text.toLowerCase();
                  const frustratedKeywords = ['chậm', 'tệ', 'hoàn tiền', 'lỗi', 'không đúng', 'bực', 'kém', 'quá lâu', 'lừa', 'thất vọng'];
                  const positiveKeywords = ['đẹp', 'thích', 'nhanh', 'cảm ơn', 'tốt', 'ưng', 'tuyệt', 'ok', 'iu', 'yêu'];
                  
                  if (frustratedKeywords.some(kw => lower.includes(kw))) {
                    return [
                      'Dạ NOVYN chân thành xin lỗi ạ. NOVYN xin phép gửi tặng voucher 15% bù đắp trải nghiệm nhé ạ!',
                      'NOVYN đã tiếp nhận phản hồi và đang tiến hành kiểm tra đơn hàng gấp để hoàn tiền ngay cho mình ạ.',
                      'Dạ chuyên viên quản lý của NOVYN sẽ gọi điện thoại hỗ trợ mình trực tiếp trong 5 phút nữa ạ!'
                    ];
                  }
                  if (positiveKeywords.some(kw => lower.includes(kw))) {
                    return [
                      'NOVYN chân thành cảm ơn đánh giá tuyệt vời của mình! Rất hy vọng được phục vụ mình trong BST tới ạ.',
                      'Dạ cảm ơn khách yêu! Mình đừng quên tích điểm loyalty tại tab NOVYN Circle để nhận voucher VIP nhé.',
                      'NOVYN rất vui vì mình ưng ý sản phẩm! Mình có cần hỗ trợ thêm thông tin phối đồ lookbook không ạ?'
                    ];
                  }
                  return [
                    'Dạ NOVYN có thể giúp gì cho mình về kích cỡ (size) hoặc tư vấn màu sắc sản phẩm này ạ?',
                    'Dạ sản phẩm này hiện đang có sẵn tại chi nhánh Quận 1 và Thảo Điền để mình ghé thử ạ.',
                    'Dạ mình vui lòng cung cấp mã đơn hàng để NOVYN tra cứu tiến độ vận chuyển chi tiết nhé ạ!'
                  ];
                };

                return (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <div>
                        <h3 className="text-lg font-black text-neutral-950 tracking-tight uppercase flex items-center gap-2">
                          Chat Trực tiếp
                          {unreadCount > 0 && (
                            <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                              {unreadCount} mới
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">Phản hồi trực tiếp với khách hàng đang liên hệ qua chatbox</p>
                      </div>
                    </div>

                    {allActiveSessions.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-neutral-100 p-12 text-center">
                        <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-7 h-7 text-neutral-300" />
                        </div>
                        <h4 className="text-sm font-bold text-neutral-500 mb-1">Chưa có cuộc hội thoại nào</h4>
                        <p className="text-xs text-neutral-400">Khi khách hàng liên hệ qua chat, bạn sẽ thấy thông báo ở đây.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[500px]">
                        {/* Session list */}
                        <div className="lg:col-span-4 bg-white rounded-3xl border border-neutral-100 overflow-hidden flex flex-col">
                          <div className="p-4 border-b border-neutral-50">
                            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Cuộc hội thoại ({allActiveSessions.length})</span>
                          </div>
                          <div className="flex-grow overflow-y-auto">
                            {allActiveSessions.map((session: any) => {
                              const lastMsg = session.messages[session.messages.length - 1];
                              const hasUnread = lastMsg?.sender === 'customer';
                              return (
                                <button
                                  key={session.id}
                                  onClick={() => {
                                    setSelectedChatSessionId(session.id);
                                    if (session.status === 'waiting') {
                                      acceptSession(session.id, currentUser.name);
                                    }
                                  }}
                                  className={`w-full text-left p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-all ${selectedChatSessionId === session.id ? 'bg-purple-50 border-l-2 border-l-purple-500' : ''}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="relative shrink-0">
                                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black">
                                        {session.customerName.charAt(0)}
                                      </div>
                                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${session.status === 'waiting' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className={`text-xs font-bold truncate ${hasUnread ? 'text-neutral-900' : 'text-neutral-600'}`}>{session.customerName}</span>
                                        {hasUnread && <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0" />}
                                      </div>
                                      <span className={`text-[9px] block truncate mt-0.5 ${session.status === 'waiting' ? 'text-amber-600 font-bold' : 'text-neutral-400'}`}>
                                        {session.status === 'waiting' ? '⏳ Chờ kết nối...' : lastMsg?.text || 'Bắt đầu cuộc hội thoại'}
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Chat window */}
                        <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-100 flex flex-col overflow-hidden">
                          {!selectedSession ? (
                            <div className="flex-grow flex items-center justify-center text-center p-8">
                              <div>
                                <MessageSquare className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
                                <p className="text-sm text-neutral-400 font-medium">Chọn một cuộc hội thoại để bắt đầu phản hồi</p>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Chat header */}
                              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                                    {selectedSession.customerName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-neutral-900 block">{selectedSession.customerName}</span>
                                      {(() => {
                                        const lastMsgText = getLastCustomerMessage(selectedSession);
                                        const sentiment = getSentiment(lastMsgText);
                                        return (
                                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${sentiment.color}`} title={`Cảm xúc khách hàng: ${sentiment.label}`}>
                                            <span>{sentiment.emoji}</span>
                                            <span>{sentiment.label}</span>
                                          </span>
                                        );
                                      })()}
                                    </div>
                                    <span className="text-[9px] text-neutral-400 block mt-0.5">{selectedSession.customerEmail}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase ${selectedSession.status === 'waiting' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {selectedSession.status === 'waiting' ? 'Chờ kết nối' : 'Đang hoạt động'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (confirm('Kết thúc phiên hỗ trợ này?')) {
                                        closeSession(selectedSession.id);
                                        setSelectedChatSessionId(null);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition-all"
                                    title="Kết thúc phiên"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Messages */}
                              <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-neutral-50/50">
                                {selectedSession.messages.length === 0 && (
                                  <div className="text-center py-8 text-xs text-neutral-400">Chưa có tin nhắn nào</div>
                                )}
                                {selectedSession.messages.map((msg: any) => (
                                  <div key={msg.id} className={`flex ${msg.sender === 'cskh' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                      msg.sender === 'cskh'
                                        ? 'bg-purple-600 text-white rounded-br-none'
                                        : 'bg-white text-neutral-800 border border-neutral-100 rounded-bl-none shadow-sm'
                                    }`} style={{ whiteSpace: 'pre-line' }}>
                                      {msg.text}
                                      <span className="block text-right text-[8px] opacity-50 mt-1">
                                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                <div ref={chatMessagesEndRef} />
                              </div>

                              {/* Suggested quick replies */}
                              {(() => {
                                const lastMsgText = getLastCustomerMessage(selectedSession);
                                const replies = getQuickReplies(lastMsgText);
                                return (
                                  <div className="px-4 py-2 bg-neutral-50/70 border-t border-neutral-100 flex flex-wrap gap-2 items-center text-left shrink-0">
                                    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                      AI Gợi ý trả lời nhanh:
                                    </span>
                                    {replies.map((rep, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setChatReplyText(rep)}
                                        className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-neutral-150 rounded-lg text-[9px] font-bold text-neutral-700 hover:text-purple-700 hover:border-purple-300 transition-all cursor-pointer truncate max-w-[250px]"
                                        title={rep}
                                      >
                                        {rep}
                                      </button>
                                    ))}
                                  </div>
                                );
                              })()}

                              {/* Reply input */}
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!chatReplyText.trim() || !selectedChatSessionId) return;
                                  if (selectedSession.status === 'waiting') {
                                    acceptSession(selectedChatSessionId, currentUser.name);
                                  }
                                  sendCskhMessage(selectedChatSessionId, chatReplyText, currentUser.name);
                                  setChatReplyText('');
                                }}
                                className="p-3 border-t border-neutral-100 flex items-center gap-2 bg-white shrink-0"
                              >
                                <input
                                  type="text"
                                  placeholder="Nhập phản hồi cho khách hàng..."
                                  value={chatReplyText}
                                  onChange={(e) => setChatReplyText(e.target.value)}
                                  className="flex-grow bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-purple-400 focus:bg-white transition-all"
                                />
                                <button
                                  type="submit"
                                  disabled={!chatReplyText.trim()}
                                  className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 flex items-center justify-center"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              </form>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {(activeTab === 'cskh-customers' || (activeTab === 'customers' && customersSubTab === 'list' && ['director', 'manager', 'accountant', 'cskh'].includes(currentUser.role))) && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Quản lý Khách hàng & Loyalty Tiers</h3>
                  <p className="text-xs text-neutral-400 mb-8">Tra cứu nhanh hồ sơ khách hàng, phân hạng VIP Loyalty Program và kích hoạt quyền lợi chăm sóc đặc biệt.</p>

                  <div className="mb-6 max-w-md relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm khách hàng theo tên, email, sđt..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white text-neutral-800"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usersList
                      .filter((u: any) => {
                        if (u.role !== 'customer') return false;
                        const q = customerSearch.toLowerCase();
                        return (
                          u.name.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          (u.phone && u.phone.includes(q))
                        );
                      })
                      .map((cust: any) => {
                        const spent = cust.totalSpent || 0;
                        const tier = spent >= 60000000 ? 'diamond' :
                                     spent >= 30000000 ? 'platinum' :
                                     spent >= 15000000 ? 'gold' :
                                     spent >= 5000000 ? 'silver' : 'standard';
                        const tierColors: Record<string, string> = {
                          diamond: 'from-cyan-500 to-blue-650 text-white',
                          platinum: 'from-slate-700 to-slate-900 text-white',
                          gold: 'from-amber-400 to-orange-500 text-white',
                          silver: 'from-slate-350 to-slate-450 text-neutral-800 border-slate-205',
                          standard: 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        };

                        const tierLabels: Record<string, string> = {
                          diamond: 'KIM CƯƠNG (DIAMOND)',
                          platinum: 'BẠCH KIM (PLATINUM)',
                          gold: 'VÀNG (GOLD)',
                          silver: 'BẠC (SILVER)',
                          standard: 'STANDARD MEMBER'
                        };

                        return (
                          <div key={cust.id} className="border border-neutral-100 bg-white p-5 rounded-3xl shadow-sm flex items-start justify-between gap-4 hover:border-neutral-200 transition-all duration-300">
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-neutral-900 mb-0.5 truncate">{cust.name}</h4>
                              <p className="text-[10px] text-neutral-450 font-bold mb-2">{cust.email} • {cust.phone || 'Chưa có SĐT'}</p>
                              
                              <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-gradient-to-r ${tierColors[tier]}`}>
                                {tierLabels[tier]}
                              </span>
                            </div>
                            
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase block mb-0.5">Tích lũy chi tiêu</span>
                              <span className="text-xs font-black text-neutral-950">{formatPrice(spent)}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* --- CSKH ORDERS STATUS UPDATE --- */}
              {(activeTab === 'cskh-orders' || (activeTab === 'sales-orders' && salesOrdersSubTab === 'list')) && ['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier'].includes(currentUser.role) && (
                <div>
                  <h3 className="text-lg font-black text-neutral-950 tracking-tight mb-2 uppercase">Quản lý Đơn hàng & Giao dịch</h3>
                  <p className="text-xs text-neutral-400 mb-8">Tra cứu, theo dõi và cập nhật trạng thái đơn giao nhận cho toàn hệ thống.</p>

                  <div className="mb-6 max-w-md relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm mã đơn (ORD-...) hoặc số điện thoại..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400 bg-white font-semibold text-neutral-805"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100 text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                            <th className="p-3">Mã đơn</th>
                            <th className="p-3">Khách hàng</th>
                            <th className="p-3">Chi nhánh</th>
                            <th className="p-3 font-mono">Tổng tiền</th>
                            <th className="p-3">Thanh toán</th>
                            <th className="p-3">Ngày đặt</th>
                            <th className="p-3 text-right">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50 font-medium text-neutral-700">
                          {(() => {
                            const filteredOrders = allOrders.filter((order: any) => {
                              const search = orderSearch.toLowerCase().trim();
                              if (!search) return true;
                              const matchId = order.id.toLowerCase().includes(search);
                              const matchPhone = order.customerInfo.phone?.includes(search) || false;
                              return matchId || matchPhone;
                            });

                            return (
                              <>
                                {filteredOrders.map((order: any) => (
                                  <tr key={order.id} className="hover:bg-neutral-50/20 transition-colors">
                                    <td className="p-3">
                                      <button
                                        onClick={() => setViewingOrderId(order.id)}
                                        className="text-indigo-650 hover:text-indigo-850 hover:underline font-mono font-black transition-all cursor-pointer text-xs"
                                        title="Click để xem chi tiết đơn hàng"
                                      >
                                        {order.id}
                                      </button>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-bold text-neutral-900 block">{order.customerInfo.fullName}</span>
                                      <span className="text-[9px] text-neutral-400 font-semibold">{order.customerInfo.phone}</span>
                                    </td>
                                    <td className="p-3">{order.branch}</td>
                                    <td className="p-3 font-mono font-black text-neutral-900">{formatPrice(order.total)}</td>
                                    <td className="p-3 capitalize font-bold text-neutral-500">{order.paymentMethod}</td>
                                    <td className="p-3 font-mono text-[10px] text-neutral-450">{order.createdAt}</td>
                                    <td className="p-3 text-right">
                                      <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border outline-none bg-white cursor-pointer ${
                                          order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                          order.status === 'shipping' ? 'bg-sky-50 text-sky-600 border-sky-200' :
                                          order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' :
                                          'bg-rose-50 text-rose-600 border-rose-200'
                                        }`}
                                      >
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="shipping">Đang giao</option>
                                        <option value="completed">Đã hoàn thành</option>
                                        <option value="cancelled">Đã hủy</option>
                                      </select>
                                    </td>
                                  </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                  <tr>
                                    <td colSpan={7} className="text-center py-6 text-neutral-400 italic">
                                      {allOrders.length === 0 ? "Chưa có giao dịch nào phát sinh." : "Không tìm thấy đơn hàng phù hợp."}
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* --- GLASSMORPHIC ORDER DETAIL MODAL --- */}
                  {viewingOrderId && (() => {
                    const order = allOrders.find((o: any) => o.id === viewingOrderId);
                    if (!order) return null;
                    
                    const orderId = order.id || 'ORD-UNKNOWN';
                    const orderDate = order.createdAt || 'N/A';
                    const orderStatus = order.status || 'pending';
                    const orderBranch = order.branch || 'Chi nhánh Quận 1';
                    const orderPayment = order.paymentMethod || 'cod';
                    
                    const subtotal = order.subtotal || 0;
                    const discount = order.discount || 0;
                    const shipping = order.shipping || 0;
                    const total = order.total || 0;

                    const customerName = order.customerInfo?.fullName || 'Khách vãng lai';
                    const customerPhone = order.customerInfo?.phone || 'N/A';
                    const customerEmail = order.customerInfo?.email || 'N/A';
                    const customerAddress = order.customerInfo?.address || 'Mua tại quầy';
                    const customerNotes = order.customerInfo?.notes || '';

                    const orderItems = order.items || [];

                    return (
                      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
                        <div className="bg-white/95 border border-neutral-100 max-w-4xl w-full rounded-[2rem] p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                          
                          {/* Close Button */}
                          <button
                            onClick={() => setViewingOrderId(null)}
                            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center cursor-pointer transition-all active:scale-90"
                            title="Đóng cửa sổ"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Modal Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-100">Chi tiết đơn hàng</span>
                                <span className="text-[11px] text-neutral-400 font-semibold">{orderDate}</span>
                              </div>
                              <h3 className="text-xl font-black text-neutral-900 tracking-tight font-mono">{orderId}</h3>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-neutral-500 font-bold">Trạng thái:</span>
                              <select
                                value={orderStatus}
                                onChange={(e) => updateOrderStatus(orderId, e.target.value as any)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border outline-none bg-white cursor-pointer transition-all ${
                                  orderStatus === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-50' :
                                  orderStatus === 'shipping' ? 'bg-sky-50 text-sky-600 border-sky-200 shadow-sm shadow-sky-50' :
                                  orderStatus === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-50 animate-pulse' :
                                  'bg-rose-50 text-rose-600 border-rose-200 shadow-sm shadow-rose-50'
                                }`}
                              >
                                <option value="pending">Chờ xử lý</option>
                                <option value="shipping">Đang giao</option>
                                <option value="completed">Đã hoàn thành</option>
                                <option value="cancelled">Đã hủy</option>
                              </select>
                            </div>
                          </div>

                          {/* Dynamic Timeline Tracker */}
                          <div className="bg-neutral-50/50 border border-neutral-100 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                            {[
                              { key: 'pending', label: 'Chờ xử lý', desc: 'Đơn hàng mới tạo', icon: Clock, color: 'text-amber-500 bg-amber-50 border-amber-200' },
                              { key: 'shipping', label: 'Đang giao', desc: 'Đã bàn giao vận chuyển', icon: Box, color: 'text-sky-500 bg-sky-50 border-sky-200' },
                              { key: 'completed', label: 'Hoàn thành', desc: 'Giao hàng thành công', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' }
                            ].map((step, idx) => {
                              const isCompleted = orderStatus === 'completed';
                              const isShipping = orderStatus === 'shipping';
                              const isPending = orderStatus === 'pending';
                              const isCancelled = orderStatus === 'cancelled';
                              
                              let isActive = false;
                              let isPassed = false;
                              
                              if (isCancelled) {
                                // Cancelled is a special case
                              } else if (step.key === 'pending') {
                                isActive = isPending;
                                isPassed = isShipping || isCompleted;
                              } else if (step.key === 'shipping') {
                                isActive = isShipping;
                                isPassed = isCompleted;
                              } else if (step.key === 'completed') {
                                isActive = isCompleted;
                                isPassed = isCompleted;
                              }

                              const StepIcon = step.icon;

                              return (
                                <React.Fragment key={step.key}>
                                  {idx > 0 && (
                                    <div className={`hidden md:block flex-1 h-0.5 rounded-full ${isPassed ? 'bg-indigo-500' : 'bg-neutral-200'}`} />
                                  )}
                                  <div className="flex items-center gap-3 flex-1 md:flex-none">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                      isCancelled ? 'bg-rose-50 text-rose-500 border-rose-200' :
                                      isPassed || isActive ? step.color : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                                    }`}>
                                      <StepIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className={`text-xs font-black tracking-tight ${isCancelled ? 'text-rose-600' : isPassed || isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                                        {isCancelled && step.key === orderStatus ? 'Đơn đã hủy' : step.label}
                                      </p>
                                      <p className="text-[10px] text-neutral-400 font-semibold">{step.desc}</p>
                                    </div>
                                  </div>
                                </React.Fragment>
                              );
                            })}
                            {orderStatus === 'cancelled' && (
                              <div className="flex items-center gap-3 bg-rose-50 text-rose-700 px-4 py-2.5 rounded-2xl border border-rose-100 w-full md:w-auto">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                <div>
                                  <p className="text-xs font-black uppercase tracking-wider">Đơn hàng đã hủy</p>
                                  <p className="text-[10px] text-rose-600/80 font-bold">Giao dịch bị hoàn trả hoặc hủy bởi khách hàng/CSKH.</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Main Columns Grid */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* Left Column: Customer & Transaction Info */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                              
                              {/* Customer Details Card */}
                              <div className="bg-neutral-50/30 border border-neutral-100 rounded-[2rem] p-6 flex flex-col gap-4">
                                <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                                  <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                                  Thông tin khách hàng
                                </h4>
                                <div className="space-y-3.5">
                                  <div>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Họ & Tên</p>
                                    <p className="text-xs font-extrabold text-neutral-900">{customerName}</p>
                                  </div>
                                  <div className="flex gap-6">
                                    <div>
                                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Số điện thoại</p>
                                      {customerPhone !== 'N/A' ? (
                                        <a href={`tel:${customerPhone}`} className="text-xs font-bold text-indigo-650 hover:underline flex items-center gap-1">
                                          <Phone className="w-3 h-3" />
                                          {customerPhone}
                                        </a>
                                      ) : (
                                        <span className="text-xs font-bold text-neutral-500">{customerPhone}</span>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Email</p>
                                      {customerEmail !== 'N/A' ? (
                                        <a href={`mailto:${customerEmail}`} className="text-xs font-bold text-neutral-700 flex items-center gap-1">
                                          <Mail className="w-3 h-3 text-neutral-400" />
                                          {customerEmail}
                                        </a>
                                      ) : (
                                        <span className="text-xs font-bold text-neutral-500">{customerEmail}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Địa chỉ giao hàng</p>
                                    <p className="text-xs font-semibold text-neutral-700 leading-relaxed bg-white p-3 rounded-2xl border border-neutral-50">{customerAddress}</p>
                                  </div>
                                  {customerNotes && (
                                    <div>
                                      <p className="text-[10px] text-rose-455 font-bold uppercase tracking-wider">Ghi chú từ khách hàng</p>
                                      <p className="text-xs italic text-rose-600 bg-rose-50/30 p-3 rounded-2xl border border-rose-100/50 leading-relaxed font-semibold">&ldquo;{customerNotes}&rdquo;</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Branch & Shipping Details Card */}
                              <div className="bg-neutral-50/30 border border-neutral-100 rounded-[2rem] p-6 flex flex-col gap-4">
                                <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                  Vận chuyển & Chi nhánh
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Chi nhánh xử lý</p>
                                    <p className="text-xs font-bold text-neutral-800">{orderBranch}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Hình thức thanh toán</p>
                                    <p className="text-xs font-black uppercase text-neutral-700 font-mono tracking-tight bg-white px-2.5 py-1 rounded-xl border border-neutral-100 inline-block mt-0.5">{orderPayment}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Ordered Items and Receipt Details */}
                            <div className="lg:col-span-7 flex flex-col gap-6">
                              
                              {/* Products List Card */}
                              <div className="bg-neutral-50/30 border border-neutral-100 rounded-[2rem] p-6 flex flex-col gap-4">
                                <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                                  <Box className="w-3.5 h-3.5 text-indigo-500" />
                                  Danh sách sản phẩm ({orderItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)} sản phẩm)
                                </h4>
                                
                                <div className="divide-y divide-neutral-100 max-h-[300px] overflow-y-auto pr-1">
                                  {orderItems.map((item: any, idx: number) => {
                                    const productName = item.product?.name || 'Sản phẩm không xác định';
                                    const productCategory = item.product?.category || 'Thời trang';
                                    const productImage = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400';
                                    const productPrice = item.product?.price || 0;
                                    
                                    const size = item.selectedSize || 'F';
                                    const colorName = typeof item.selectedColor === 'string' 
                                      ? item.selectedColor 
                                      : (item.selectedColor?.name || 'Màu mặc định');
                                    const colorHex = typeof item.selectedColor === 'string' 
                                      ? '#999999' 
                                      : (item.selectedColor?.hex || '#999999');
                                      
                                    return (
                                      <div key={idx} className="py-3.5 flex gap-4 first:pt-0 last:pb-0 items-center justify-between">
                                        <div className="flex gap-3 items-center">
                                          <div className="relative w-12 h-16 rounded-xl overflow-hidden border border-neutral-100 shrink-0 bg-neutral-50">
                                            <Image
                                              src={productImage}
                                              alt={productName}
                                              fill
                                              className="object-cover"
                                              unoptimized
                                            />
                                          </div>
                                          <div>
                                            <p className="text-xs font-black text-neutral-900 line-clamp-1 leading-snug">{productName}</p>
                                            <p className="text-[9px] text-neutral-400 font-semibold tracking-wider uppercase mb-1">{productCategory}</p>
                                            
                                            <div className="flex flex-wrap gap-2 items-center">
                                              <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-neutral-200/50">
                                                Size: {size}
                                              </span>
                                              
                                              <span className="flex items-center gap-1 bg-neutral-100 text-neutral-650 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-neutral-200/50">
                                                Màu: 
                                                <span 
                                                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 shadow-sm" 
                                                  style={{ backgroundColor: colorHex }} 
                                                  title={colorName}
                                                />
                                                {colorName}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="text-right shrink-0">
                                          <p className="text-xs font-black text-neutral-900 font-mono">{formatPrice(productPrice * (item.quantity || 1))}</p>
                                          <p className="text-[9px] text-neutral-400 font-bold font-mono">{formatPrice(productPrice)} x {item.quantity || 1}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Payment & Receipt Summary Card */}
                              <div className="bg-indigo-950 text-white rounded-[2rem] p-6 shadow-xl flex flex-col gap-4">
                                <h4 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                                  <DollarSign className="w-3.5 h-3.5 text-indigo-300" />
                                  Hóa đơn thanh toán
                                </h4>
                                
                                <div className="space-y-3 font-medium text-xs text-white/80 border-b border-white/10 pb-4">
                                  <div className="flex justify-between">
                                    <span>Tạm tính (hàng hóa)</span>
                                    <span className="font-mono">{formatPrice(subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Khuyến mãi / Giảm giá</span>
                                    <span className="font-mono text-emerald-300">-{formatPrice(discount)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-mono">{formatPrice(shipping)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none">Tổng thanh toán</p>
                                    <p className="text-xs text-indigo-200/80 font-bold mt-1">Đã bao gồm thuế GTGT</p>
                                  </div>
                                  <span className="text-2xl font-black font-mono text-white tracking-tight">{formatPrice(total)}</span>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="flex justify-between items-center border-t border-neutral-100 pt-5 mt-2">
                            <button
                              onClick={() => {
                                alert(`Tính năng in hóa đơn đơn hàng ${orderId} đang được kết nối với máy in nhiệt của chi nhánh...`);
                              }}
                              className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black px-4 py-2.5 rounded-xl border border-neutral-200 transition-all cursor-pointer active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              In hóa đơn (PDF)
                            </button>

                          </div>

                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* --- CSKH REVIEWS READER --- */}
              {(activeTab === 'cskh-reviews' || (activeTab === 'customers' && customersSubTab === 'reviews')) && ['director', 'cskh'].includes(currentUser.role) && (
                <div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight mb-2 uppercase">Ý kiến & Phản hồi Khách hàng</h3>
                  <p className="text-xs text-neutral-400 mb-8">Theo dõi đánh giá chất lượng sản phẩm và phản hồi của người mua thực tế để cải tiến chất lượng dịch vụ.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'rev-1', user: 'Lâm Khánh Vy', rating: 5, date: '2026-05-28', product: 'Áo Sơ Mi Linen Cao Cấp', content: 'Vải mặc cực kỳ mát, thấm hút mồ hôi tốt. Phom dáng rộng rãi thoải mái cực kỳ sang trọng!', status: 'verified' },
                      { id: 'rev-2', user: 'Trần Văn Mỹ', rating: 5, date: '2026-05-27', product: 'Áo Khoác Blazer Relaxed Fit', content: 'Blazer phom đẹp, đứng dáng. Đường may tỉ mỉ, chất lượng Quiet Luxury đúng nghĩa.', status: 'verified' },
                      { id: 'rev-3', user: 'Nguyễn Thị Lan', rating: 4, date: '2026-05-26', product: 'Quần tây nam Linen', content: 'Chất vải linen dệt thô mộc đẹp, mặc nhẹ tênh. Màu sắc nhã nhặn dễ phối đồ.', status: 'verified' },
                      { id: 'rev-4', user: 'Đỗ Hoàng Anh', rating: 5, date: '2026-05-25', product: 'Đầm lụa Premium Silk', content: 'Đầm mặc lên tôn dáng lắm ạ, lụa mềm mại cực mát mẻ. Thích hợp đi tiệc nhẹ.', status: 'verified' }
                    ].map((rev) => (
                      <div key={rev.id} className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-xs font-black text-neutral-900">{rev.user}</h4>
                              <p className="text-[9px] text-neutral-400 font-semibold">{rev.date} • {rev.product}</p>
                            </div>
                            <span className="bg-emerald-50 text-emerald-605 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">Đã mua hàng</span>
                          </div>
                          
                          <div className="flex gap-0.5 mb-2.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-xs italic text-neutral-650 leading-relaxed font-medium bg-neutral-50/50 p-3 rounded-2xl border border-neutral-50">&ldquo;{rev.content}&rdquo;</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        </motion.div>
      </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
