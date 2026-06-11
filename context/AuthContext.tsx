'use client';
/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AttendanceLog, LeaveRequest, Product, SalaryRequest, DailyReport, Order, CustomerInfo, PayrollRecord, ExpenseItem, RestockRecord, CartItem, ShiftRequest, Announcement, ShiftSwapRequest, OfficeReservation, WorkspaceTask, WorkspacePost, WikiDoc } from '../types';
import { MOCK_PRODUCTS } from '../data/products';
import { useToast } from './ToastContext';
import { authService } from '../lib/services/authService';
import { productService } from '../lib/services/productService';
import { inventoryService } from '../lib/services/inventoryService';
import { orderService } from '../lib/services/orderService';
import { financeService } from '../lib/services/financeService';
import {
  getAttendanceLogsAction,
  getLeaveRequestsAction,
  requestLeaveAction,
  approveLeaveRequestAction,
  rejectLeaveRequestAction,
  getSalaryRequestsAction,
  requestSalaryIncreaseAction,
  approveSalaryRequestAction,
  rejectSalaryRequestAction,
  getDailyReportsAction,
  submitDailyReportAction,
  markReportAsReadAction,
  getShiftRequestsAction,
  requestShiftAction,
  approveShiftRequestAction,
  rejectShiftRequestAction,
  getAnnouncementsAction,
  addAnnouncementAction,
  getShiftSwapsAction,
  requestShiftSwapAction,
  approveShiftSwapAction,
  rejectShiftSwapAction,
  getReservationsAction,
  reserveDeskOrRoomAction,
  cancelReservationAction,
  getWorkspaceTasksAction,
  addWorkspaceTaskAction,
  updateWorkspaceTaskColumnAction,
  deleteWorkspaceTaskAction,
  getWorkspacePostsAction,
  addWorkspacePostAction,
  reactToPostAction,
  commentOnPostAction,
  getWikiDocsAction,
  addWikiDocAction,
  updateWikiDocAction,
  checkInAction,
  checkOutAction,
  getAuditLogsAction,
  addShiftDirectlyAction,
  deleteShiftRequestAction
} from '../lib/actions/staffActions';

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  productsList: Product[];
  attendanceLogs: AttendanceLog[];
  leaveRequests: LeaveRequest[];
  salaryRequests: SalaryRequest[];
  branchStock: Record<string, Record<string, number>>; // productId -> branchName -> stockCount
  branchSizeStock: Record<string, Record<string, Record<string, number>>>; // productId -> branchName -> size -> stockCount
  branchColorStock: Record<string, Record<string, Record<string, number>>>; // productId -> branchName -> color -> stockCount
  isAuthLoaded: boolean;
  restockRecords: RestockRecord[];
  shiftRequests: ShiftRequest[];
  announcements: Announcement[];
  shiftSwapRequests: ShiftSwapRequest[];
  
  // Auth Handlers
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole, branch?: string, phone?: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteUser: (userId: string) => void;
  logout: () => void;

  // Employee Handlers
  checkIn: () => void;
  checkOut: () => void;
  submitLeaveRequest: (reason: string, startDate: string, endDate: string) => void;
  submitSalaryRequest: (proposedSalary: number, reason: string) => void;
  submitShiftRequest: (date: string, shiftType: 'morning' | 'afternoon' | 'evening') => void;
  submitSwapRequest: (fromShiftId: string, toShiftId: string) => void;
  respondToSwapRequest: (swapId: string, status: 'approved' | 'rejected') => void;

  // Manager Handlers
  approveLeaveRequest: (requestId: string, status: 'approved' | 'rejected', comment?: string) => void;
  restockBranchProduct: (productId: string, amount: number, size: string, targetBranch?: string) => void;
  approveShiftRequest: (requestId: string, status: 'approved' | 'rejected', comment?: string) => void;
  approveRestockRequest: (requestId: string) => void;
  rejectRestockRequest: (requestId: string) => void;

  // Director Handlers
  updateGlobalProductPrice: (productId: string, newPrice: number) => void;
  updateGlobalProductDetails: (
    productId: string,
    name: string,
    description: string,
    category: string,
    price: number,
    colors?: { name: string; hex: string }[],
    sizes?: string[],
    images?: string[],
    isActive?: boolean
  ) => void;
  approveSalaryRequest: (requestId: string, status: 'approved' | 'rejected', comment?: string) => void;

  // Daily Report Handlers
  dailyReports: DailyReport[];
  submitDailyReport: (title: string, content: string) => void;
  markReportAsRead: (reportId: string) => void;

  // Loyalty Program Handlers
  addCustomerSpending: (userId: string, amount: number) => void;

  // Order & Revenue Handlers
  allOrders: Order[];
  createOrder: (customerInfo: CustomerInfo, items: CartItem[], subtotal: number, discount: number, shipping: number, total: number, paymentMethod: 'cod' | 'transfer' | 'card', branch: string, status?: 'pending' | 'shipping' | 'completed' | 'cancelled') => string;
  updateOrderStatus: (orderId: string, status: 'pending' | 'shipping' | 'completed' | 'cancelled') => void;

  // Accountant Handlers
  payrollRecords: PayrollRecord[];
  paySalary: (recordId: string) => void;
  expensesList: ExpenseItem[];
  addExpense: (title: string, amount: number, category: 'marketing' | 'operations' | 'equipment' | 'other', date: string) => void;
  deleteExpense: (id: string) => void;
  addPayrollRecord: (userId: string, month: string, salary: number) => void;
  
  // Product CRUD
  addGlobalProduct: (name: string, category: string, price: number, description: string, images: string[], colors: { name: string; hex: string }[], sizes: string[], initialStock?: number) => void;
  deleteGlobalProduct: (productId: string) => void;

  // Announcements
  sendAnnouncement: (title: string, content: string, recipientType: 'all' | 'accountant' | 'branch_q1' | 'branch_td') => void;

  // Direct Shift Scheduling
  addShiftDirectly: (userId: string, date: string, shiftType: 'morning' | 'afternoon' | 'evening', comment?: string) => void;
  deleteShiftRequest: (requestId: string) => void;

  // Digital Intranet & Workspace Suite
  officeReservations: OfficeReservation[];
  workspaceTasks: WorkspaceTask[];
  workspacePosts: WorkspacePost[];
  wikiDocs: WikiDoc[];
  reserveDeskOrRoom: (type: 'desk' | 'room_a' | 'room_b', resourceId: string, date: string, slot: 'morning' | 'afternoon' | 'full') => void;
  cancelReservation: (id: string) => void;
  addWorkspaceTask: (title: string, description: string, priority: 'low' | 'medium' | 'high', assigneeId: string, dueDate: string) => void;
  updateWorkspaceTaskColumn: (taskId: string, column: 'todo' | 'in_progress' | 'review' | 'done') => void;
  deleteWorkspaceTask: (taskId: string) => void;
  addWorkspacePost: (content: string, type: 'general' | 'birthday' | 'announcement') => void;
  reactToPost: (postId: string, reaction: 'like' | 'heart') => void;
  commentOnPost: (postId: string, commentText: string) => void;
  addWikiDoc: (title: string, category: 'hr' | 'operations' | 'benefits', content: string) => void;
  updateWikiDoc: (docId: string, title: string, category: 'hr' | 'operations' | 'benefits', content: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Users Database Seed
const DEFAULT_USERS: User[] = [
  { id: 'usr-dir', name: 'Trần Quốc Bảo', email: 'director@novynwear.com', role: 'director', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 'usr-mgr1', name: 'Nguyễn Huy Hoàng', email: 'manager.q1@novynwear.com', role: 'manager', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', salary: 15000000 },
  { id: 'usr-mgr2', name: 'Đỗ Thu Trang', email: 'manager.td@novynwear.com', role: 'manager', branch: 'Chi nhánh Thảo Điền', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', salary: 16000000 },
  { id: 'usr-emp1', name: 'Phạm Minh Đức', email: 'employee.q1@novynwear.com', role: 'employee', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', salary: 8500000 },
  { id: 'usr-emp2', name: 'Lê Quỳnh Chi', email: 'employee.td@novynwear.com', role: 'employee', branch: 'Chi nhánh Thảo Điền', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', salary: 9000000 },
  { id: 'usr-acc', name: 'Phạm Thu Thảo', email: 'accountant@novynwear.com', role: 'accountant', salary: 12000000, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop' },
  { id: 'usr-cskh', name: 'Mai An CSKH', email: 'cskh@novynwear.com', role: 'cskh', salary: 9500000, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: 'usr-cskh2', name: 'Lê Thùy Dương', email: 'duong.cskh@novynwear.com', role: 'cskh', salary: 9200000, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  { id: 'usr-cust', name: 'Lâm Khánh Vy', email: 'customer@novynwear.com', role: 'customer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', totalSpent: 22500000 },
  { id: 'usr-emp3', name: 'Trần Minh Tâm', email: 'tam.employee.q1@novynwear.com', role: 'employee', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop', salary: 8500000 },
  { id: 'usr-emp4', name: 'Nguyễn Hoàng Nam', email: 'nam.employee.td@novynwear.com', role: 'employee', branch: 'Chi nhánh Thảo Điền', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', salary: 8800000 },
  { id: 'usr-cashier1', name: 'Nguyễn Thuỳ Lan', email: 'cashier.q1@novynwear.com', role: 'cashier', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', salary: 8000000 },
  { id: 'usr-stocker1', name: 'Trần Minh Hải', email: 'stocker.q1@novynwear.com', role: 'stocker', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', salary: 8200000 },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(DEFAULT_USERS);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [salaryRequests, setSalaryRequests] = useState<SalaryRequest[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [branchStock, setBranchStock] = useState<Record<string, Record<string, number>>>({});
  const [branchSizeStock, setBranchSizeStock] = useState<Record<string, Record<string, Record<string, number>>>>({});
  const [branchColorStock, setBranchColorStock] = useState<Record<string, Record<string, Record<string, number>>>>({});
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [expensesList, setExpensesList] = useState<ExpenseItem[]>([]);
  const [restockRecords, setRestockRecords] = useState<RestockRecord[]>([]);
  const [shiftRequests, setShiftRequests] = useState<ShiftRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [shiftSwapRequests, setShiftSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [officeReservations, setOfficeReservations] = useState<OfficeReservation[]>([]);
  const [workspaceTasks, setWorkspaceTasks] = useState<WorkspaceTask[]>([]);
  const [workspacePosts, setWorkspacePosts] = useState<WorkspacePost[]>([]);
  const [wikiDocs, setWikiDocs] = useState<WikiDoc[]>([]);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const { showToast } = useToast();

  const branches = ['Chi nhánh Quận 1', 'Chi nhánh Thảo Điền'];

  // Initialize and load databases from server-side database actions and services
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Current User
        const storedUser = localStorage.getItem('novyn_curr_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }

        // 2. Fetch all other states from DB via Services/Actions
        const users = await authService.getUsers();
        setUsersList(users);

        const products = await productService.getProducts();
        setProductsList(products);

        const attendance = await getAttendanceLogsAction();
        setAttendanceLogs(attendance as any);

        const leaves = await getLeaveRequestsAction();
        setLeaveRequests(leaves as any);

        const salaries = await getSalaryRequestsAction();
        setSalaryRequests(salaries as any);

        const reports = await getDailyReportsAction();
        setDailyReports(reports as any);

        const orders = await orderService.getOrders();
        setAllOrders(orders);

        const stock = await inventoryService.getBranchStock();
        setBranchStock(stock);

        const sizeStock = await inventoryService.getBranchSizeStock();
        setBranchSizeStock(sizeStock);

        const colorStock = await inventoryService.getBranchColorStock();
        setBranchColorStock(colorStock);

        const payroll = await financeService.getPayrollRecords();
        setPayrollRecords(payroll);

        const expenses = await financeService.getExpensesList();
        setExpensesList(expenses);

        const restocks = await inventoryService.getRestockRecords();
        setRestockRecords(restocks);

        const shifts = await getShiftRequestsAction();
        setShiftRequests(shifts as any);

        const anns = await getAnnouncementsAction();
        setAnnouncements(anns as any);

        const swaps = await getShiftSwapsAction();
        setShiftSwapRequests(swaps as any);

        const reservations = await getReservationsAction();
        setOfficeReservations(reservations as any);

        const tasks = await getWorkspaceTasksAction();
        setWorkspaceTasks(tasks as any);

        const posts = await getWorkspacePostsAction();
        setWorkspacePosts(posts as any);

        const docs = await getWikiDocsAction();
        setWikiDocs(docs as any);

      } catch (err) {
        console.error("Failed to load initial data from database in AuthContext:", err);
      } finally {
        setIsAuthLoaded(true);
      }
    };

    initData();
  }, []);

  // Sync current user to local storage for SPA session state
  useEffect(() => {
    if (!isAuthLoaded) return;
    if (currentUser) {
      localStorage.setItem('novyn_curr_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('novyn_curr_user');
    }
  }, [currentUser, isAuthLoaded]);

  // ----------------------------------------------------
  // AUTHENTICATION LOGIC
  // ----------------------------------------------------
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await authService.login(email, password);
      if (user) {
        setCurrentUser(user);
        showToast(`Chào mừng quay lại, ${user.name}!`, 'success');
        return true;
      }
    } catch (err: any) {
      console.error('Login error:', err);
    }
    showToast('Tài khoản hoặc mật khẩu không đúng!', 'error');
    return false;
  };

  const register = async (name: string, email: string, password: string, role: UserRole, branch?: string, phone?: string): Promise<boolean> => {
    const exists = usersList.some((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (exists) {
      showToast('Email này đã được đăng ký sử dụng!', 'error');
      return false;
    }

    try {
      const success = await authService.register(name, email, password, role, branch, phone);
      if (success) {
        const users = await authService.getUsers();
        setUsersList(users);

        const registeredUser = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
        if (!currentUser || currentUser.role !== 'accountant') {
          if (registeredUser) {
            setCurrentUser(registeredUser);
            await authService.saveCurrentUser(registeredUser);
          }
        }
        showToast(currentUser?.role === 'accountant' ? `Đã tạo tài khoản cho ${name} thành công!` : `Đăng ký thành công! Chào mừng ${name}.`, 'success');
        return true;
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi đăng ký tài khoản!', 'error');
      return false;
    }

    showToast('Đăng ký không thành công!', 'error');
    return false;
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập trước khi đổi mật khẩu.', 'error');
      return false;
    }

    const result = await authService.changePassword(currentUser.id, currentPassword, newPassword);
    if (result.success) {
      showToast('Đã thay đổi mật khẩu tài khoản thành công!', 'success');
      return true;
    }

    showToast(result.message || 'Đổi mật khẩu không thành công!', 'error');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    authService.saveCurrentUser(null);
    showToast('Đã đăng xuất khỏi tài khoản.', 'info');
  };

  // ----------------------------------------------------
  // EMPLOYEE PROCEDURES
  // ----------------------------------------------------
  
  const checkIn = async () => {
    if (!currentUser || !currentUser.branch) return;
    const result = await checkInAction(currentUser.id, currentUser.name, currentUser.role, currentUser.branch);
    if (result.success && result.log) {
      setAttendanceLogs((prev) => [result.log as any, ...prev]);
      showToast('Chấm công VÀO thành công!', 'success');
    } else {
      showToast(result.message || 'Lỗi chấm công vào', 'error');
    }
  };

  const checkOut = async () => {
    if (!currentUser) return;
    const result = await checkOutAction(currentUser.id);
    if (result.success && result.log) {
      setAttendanceLogs((prev) => prev.map(l => l.id === result.log.id ? result.log as any : l));
      showToast('Chấm công RA thành công!', 'success');
    } else {
      showToast(result.message || 'Lỗi chấm công ra', 'error');
    }
  };

  const submitLeaveRequest = async (reason: string, startDate: string, endDate: string) => {
    if (!currentUser || !currentUser.branch) return;
    const result = await requestLeaveAction(currentUser.id, currentUser.name, currentUser.role, currentUser.branch, startDate, endDate, reason);
    if (result.success && result.request) {
      setLeaveRequests((prev) => [result.request as any, ...prev]);
      showToast('Gửi đơn xin nghỉ phép thành công. Chờ quản lý duyệt!', 'success');
    } else {
      showToast(result.message || 'Lỗi gửi yêu cầu nghỉ phép', 'error');
    }
  };

  const approveLeaveRequest = async (requestId: string, status: 'approved' | 'rejected', comment?: string) => {
    const success = status === 'approved' 
      ? await approveLeaveRequestAction(requestId, comment)
      : await rejectLeaveRequestAction(requestId, comment);
    
    if (success) {
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status, managerComment: comment || (status === 'approved' ? 'Đã duyệt đơn.' : 'Không được phê duyệt.') }
            : req
        )
      );
      showToast(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn xin nghỉ của nhân sự`, 'info');
    } else {
      showToast('Lỗi xử lý yêu cầu nghỉ phép', 'error');
    }
  };

  const restockBranchProduct = async (productId: string, amount: number, size: string, targetBranch?: string) => {
    const branchToRestock = targetBranch || (currentUser && currentUser.branch);
    if (!branchToRestock) return;

    const result = await inventoryService.restockBranchProduct(productId, amount, size, undefined, branchToRestock);
    
    if (amount < 0) {
      // Refresh stock representations from DB
      const stock = await inventoryService.getBranchStock();
      setBranchStock(stock);
      const prods = await productService.getProducts();
      setProductsList(prods);
    } else {
      if (result) {
        setRestockRecords((prev) => [result, ...prev]);
        showToast(`Đã gửi đề xuất nhập hàng size ${size} lên Kế toán chờ duyệt.`, 'info');
      }
    }
  };

  const approveRestockRequest = async (requestId: string) => {
    await inventoryService.approveRestockRequest(requestId, currentUser?.id);
    
    // Refresh states
    const restocks = await inventoryService.getRestockRecords();
    setRestockRecords(restocks);
    const stock = await inventoryService.getBranchStock();
    setBranchStock(stock);
    const sizeStock = await inventoryService.getBranchSizeStock();
    setBranchSizeStock(sizeStock);
    const colorStock = await inventoryService.getBranchColorStock();
    setBranchColorStock(colorStock);
    const prods = await productService.getProducts();
    setProductsList(prods);
  };

  const rejectRestockRequest = async (requestId: string) => {
    await inventoryService.rejectRestockRequest(requestId, currentUser?.id);
    
    // Refresh states
    const restocks = await inventoryService.getRestockRecords();
    setRestockRecords(restocks);
  };

  const updateGlobalProductPrice = async (productId: string, newPrice: number) => {
    const success = await productService.updateGlobalProductPrice(productId, newPrice);
    if (success) {
      const prods = await productService.getProducts();
      setProductsList(prods);
      showToast('Đã điều chỉnh giá sản phẩm thành công!', 'success');
    } else {
      showToast('Lỗi cập nhật giá sản phẩm', 'error');
    }
  };

  const updateGlobalProductDetails = async (
    productId: string,
    name: string,
    description: string,
    category: string,
    price: number,
    colors?: { name: string; hex: string }[],
    sizes?: string[],
    images?: string[],
    isActive?: boolean
  ) => {
    const success = await productService.updateGlobalProductDetails(productId, name, description, category, price, colors, sizes, images, isActive);
    if (success) {
      const prods = await productService.getProducts();
      setProductsList(prods);
      showToast(`Đã cập nhật sản phẩm "${name}" thành công!`, 'success');
    } else {
      showToast('Lỗi cập nhật sản phẩm', 'error');
    }
  };

  const addGlobalProduct = async (
    name: string,
    category: string,
    price: number,
    description: string,
    images: string[],
    colors: { name: string; hex: string }[],
    sizes: string[],
    initialStock: number = 20
  ) => {
    try {
      const newProduct = await productService.addGlobalProduct(name, category, price, description, images, colors, sizes, initialStock);
      setProductsList((prev) => [newProduct, ...prev]);
      
      const stock = await inventoryService.getBranchStock();
      setBranchStock(stock);
      
      showToast(`Đã thêm sản phẩm mới thành công: ${name}`, 'success');
    } catch {
      showToast('Lỗi thêm sản phẩm mới', 'error');
    }
  };

  const deleteGlobalProduct = async (productId: string) => {
    const success = await productService.deleteGlobalProduct(productId);
    if (success) {
      setProductsList((prev) => prev.filter((p) => p.id !== productId));
      showToast('Đã xóa sản phẩm thành công khỏi cửa hàng!', 'info');
    } else {
      showToast('Lỗi xóa sản phẩm', 'error');
    }
  };

  const sendAnnouncement = async (title: string, content: string, recipientType: 'all' | 'accountant' | 'branch_q1' | 'branch_td') => {
    if (!currentUser) return;
    const result = await addAnnouncementAction(title, content, recipientType, currentUser.name);
    if (result.success && result.announcement) {
      setAnnouncements((prev) => [result.announcement as any, ...prev]);
      showToast('Đã gửi thông báo thành công toàn hệ thống!', 'success');
    } else {
      showToast('Lỗi gửi thông báo', 'error');
    }
  };

  const submitSalaryRequest = async (proposedSalary: number, reason: string) => {
    if (!currentUser || !currentUser.branch || !currentUser.salary) return;
    const result = await requestSalaryIncreaseAction(currentUser.id, currentUser.name, currentUser.role, currentUser.branch, currentUser.salary, proposedSalary, reason);
    if (result.success && result.request) {
      setSalaryRequests((prev) => [result.request as any, ...prev]);
      showToast('Gửi đề xuất tăng lương thành công tới Giám đốc!', 'success');
    } else {
      showToast('Lỗi gửi đề xuất tăng lương', 'error');
    }
  };

  const approveSalaryRequest = async (requestId: string, status: 'approved' | 'rejected', comment?: string) => {
    const success = status === 'approved'
      ? await approveSalaryRequestAction(requestId, comment)
      : await rejectSalaryRequestAction(requestId, comment);

    if (success) {
      const salaries = await getSalaryRequestsAction();
      setSalaryRequests(salaries as any);
      
      const users = await authService.getUsers();
      setUsersList(users);
      
      const updatedUser = users.find(u => u.id === currentUser?.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
      
      showToast(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đề xuất tăng lương`, 'info');
    } else {
      showToast('Lỗi xử lý đề xuất lương', 'error');
    }
  };

  const submitDailyReport = async (title: string, content: string) => {
    if (!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'accountant' && currentUser.role !== 'cskh')) return;
    const result = await submitDailyReportAction(currentUser.id, currentUser.name, currentUser.role, currentUser.branch || 'Văn phòng chính', title, content);
    if (result.success && result.report) {
      setDailyReports((prev) => [result.report as any, ...prev]);
      showToast('Gửi báo cáo hằng ngày thành công!', 'success');
    } else {
      showToast('Lỗi gửi báo cáo ngày', 'error');
    }
  };

  const markReportAsRead = async (reportId: string) => {
    const success = await markReportAsReadAction(reportId);
    if (success) {
      const reports = await getDailyReportsAction();
      setDailyReports(reports as any);
      showToast('Đã xem báo cáo', 'info');
    } else {
      showToast('Lỗi cập nhật báo cáo', 'error');
    }
  };

  const addCustomerSpending = async (userId: string, amount: number) => {
    await authService.updateUserSpent(userId, amount);
    const users = await authService.getUsers();
    setUsersList(users);
    
    if (currentUser && currentUser.id === userId) {
      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) setCurrentUser(updatedUser);
    }
  };

  const createOrder = (
    customerInfo: CustomerInfo,
    items: CartItem[],
    subtotal: number,
    discount: number,
    shipping: number,
    total: number,
    paymentMethod: 'cod' | 'transfer' | 'card',
    branch: string,
    status: 'pending' | 'shipping' | 'completed' | 'cancelled' = 'pending'
  ): string => {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    
    orderService.createOrder(customerInfo, items, subtotal, discount, shipping, total, paymentMethod, branch, status, currentUser?.role === 'customer' ? currentUser.id : undefined)
      .then(async () => {
        // Refresh orders & users (spent amount) & stock levels!
        const orders = await orderService.getOrders();
        setAllOrders(orders);
        
        const users = await authService.getUsers();
        setUsersList(users);
        
        if (currentUser && currentUser.role === 'customer') {
          const updatedUser = users.find(u => u.id === currentUser.id);
          if (updatedUser) setCurrentUser(updatedUser);
        }
        
        const stock = await inventoryService.getBranchStock();
        setBranchStock(stock);
        const sizeStock = await inventoryService.getBranchSizeStock();
        setBranchSizeStock(sizeStock);
        const colorStock = await inventoryService.getBranchColorStock();
        setBranchColorStock(colorStock);
        const prods = await productService.getProducts();
        setProductsList(prods);

        showToast('Đặt hàng thành công!', 'success');
      })
      .catch((err) => {
        showToast(err.message || 'Lỗi đặt hàng', 'error');
      });

    return orderId;
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'shipping' | 'completed' | 'cancelled') => {
    try {
      await orderService.updateOrderStatus(orderId, status, currentUser?.id, currentUser?.name);
      
      // Refresh orders, users, and stocks
      const orders = await orderService.getOrders();
      setAllOrders(orders);
      
      const users = await authService.getUsers();
      setUsersList(users);
      
      if (currentUser && currentUser.role === 'customer') {
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser) setCurrentUser(updatedUser);
      }
      
      const stock = await inventoryService.getBranchStock();
      setBranchStock(stock);
      const sizeStock = await inventoryService.getBranchSizeStock();
      setBranchSizeStock(sizeStock);
      const colorStock = await inventoryService.getBranchColorStock();
      setBranchColorStock(colorStock);
      const prods = await productService.getProducts();
      setProductsList(prods);

      showToast(`Đã cập nhật trạng thái đơn hàng ${orderId} thành công!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
    }
  };

  const paySalary = async (recordId: string) => {
    await financeService.paySalary(recordId, currentUser?.id, currentUser?.name);
    const payroll = await financeService.getPayrollRecords();
    setPayrollRecords(payroll);
    showToast('Thanh toán lương thành công!', 'success');
  };

  const addExpense = async (title: string, amount: number, category: 'marketing' | 'operations' | 'equipment' | 'other', date: string) => {
    try {
      await financeService.addExpense(title, amount, category, date, currentUser?.id, currentUser?.name);
      const expenses = await financeService.getExpensesList();
      setExpensesList(expenses);
      showToast(`Đã thêm khoản chi phí "${title}" thành công!`, 'success');
    } catch {
      showToast('Lỗi thêm chi phí', 'error');
    }
  };

  const deleteExpense = async (id: string) => {
    const success = await financeService.deleteExpense(id, currentUser?.id, currentUser?.name);
    if (success) {
      const expenses = await financeService.getExpensesList();
      setExpensesList(expenses);
      showToast('Đã xóa khoản chi phí thành công!', 'info');
    } else {
      showToast('Lỗi xóa chi phí', 'error');
    }
  };

  const addPayrollRecord = async (userId: string, month: string, salary: number) => {
    const staff = usersList.find((u) => u.id === userId);
    if (!staff) return;

    const success = await financeService.addPayrollRecord(staff, month, salary, currentUser?.id, currentUser?.name);
    if (!success) {
      showToast(`Nhân viên ${staff.name} đã có bảng lương tháng ${month} rồi!`, 'error');
      return;
    }

    const payroll = await financeService.getPayrollRecords();
    setPayrollRecords(payroll);
    showToast(`Đã tạo bảng lương tháng ${month} cho ${staff.name}!`, 'success');
  };

  const deleteUser = async (userId: string) => {
    if (currentUser && currentUser.id === userId) {
      showToast('Không thể tự xóa tài khoản của chính mình!', 'error');
      return;
    }
    if (userId === 'usr-dir') {
      showToast('Không thể xóa tài khoản của Giám đốc Bảo!', 'error');
      return;
    }

    const staff = usersList.find((u) => u.id === userId);
    if (!staff) {
      showToast('Tài khoản nhân sự không tồn tại!', 'error');
      return;
    }

    await authService.deleteUser(userId);
    const users = await authService.getUsers();
    setUsersList(users);
    showToast(`Đã xóa tài khoản nhân sự và cho nghỉ việc: ${staff.name}`, 'info');
  };

  const submitShiftRequest = async (date: string, shiftType: 'morning' | 'afternoon' | 'evening') => {
    if (!currentUser) return;

    const exists = shiftRequests.some((s) => s.userId === currentUser.id && s.date === date && s.shiftType === shiftType);
    if (exists) {
      showToast('Bạn đã đăng ký ca làm này cho ngày này rồi!', 'error');
      return;
    }

    const result = await requestShiftAction(currentUser.id, currentUser.name, currentUser.role, currentUser.branch || 'Chi nhánh Quận 1', date, shiftType);
    if (result.success && result.request) {
      setShiftRequests((prev) => [result.request as any, ...prev]);
      showToast('Đã gửi thông báo đăng ký ca làm về cho quản lý chi nhánh!', 'success');
    } else {
      showToast('Lỗi đăng ký ca làm việc', 'error');
    }
  };

  const submitSwapRequest = async (fromShiftId: string, toShiftId: string) => {
    if (!currentUser || !currentUser.branch) return;

    const fromShift = shiftRequests.find((s) => s.id === fromShiftId && s.status === 'approved');
    const toShift = shiftRequests.find((s) => s.id === toShiftId && s.status === 'approved');

    if (!fromShift || !toShift) {
      showToast('Không tìm thấy ca trực hợp lệ!', 'error');
      return;
    }

    const exists = shiftSwapRequests.some(
      (s) =>
        s.status === 'pending' &&
        ((s.fromShiftId === fromShiftId && s.toShiftId === toShiftId) ||
          (s.fromShiftId === toShiftId && s.toShiftId === fromShiftId))
    );

    if (exists) {
      showToast('Yêu cầu đổi ca này đang chờ xử lý!', 'info');
      return;
    }

    const toUser = usersList.find((u) => u.id === toShift.userId);
    if (!toUser) return;

    const result = await requestShiftSwapAction(
      currentUser.id,
      currentUser.name,
      fromShiftId,
      fromShift.date,
      fromShift.shiftType,
      toShift.userId,
      toUser.name,
      toShiftId,
      toShift.date,
      toShift.shiftType,
      currentUser.branch
    );

    if (result.success && result.request) {
      setShiftSwapRequests((prev) => [result.request as any, ...prev]);
      showToast(`Đã gửi yêu cầu đổi ca trực tới đồng nghiệp ${toUser.name}!`, 'success');
    } else {
      showToast('Lỗi gửi yêu cầu đổi ca', 'error');
    }
  };

  const respondToSwapRequest = async (swapId: string, status: 'approved' | 'rejected') => {
    const success = status === 'approved'
      ? await approveShiftSwapAction(swapId)
      : await rejectShiftSwapAction(swapId);

    if (success) {
      const swaps = await getShiftSwapsAction();
      setShiftSwapRequests(swaps as any);
      
      const shifts = await getShiftRequestsAction();
      setShiftRequests(shifts as any);
      
      showToast(status === 'approved' ? 'Chấp nhận đổi ca thành công!' : 'Đã bác bỏ yêu cầu đổi ca trực.', 'success');
    } else {
      showToast('Lỗi xử lý yêu cầu đổi ca', 'error');
    }
  };

  const approveShiftRequest = async (requestId: string, status: 'approved' | 'rejected', comment?: string) => {
    const success = status === 'approved'
      ? await approveShiftRequestAction(requestId, comment)
      : await rejectShiftRequestAction(requestId, comment);

    if (success) {
      const shifts = await getShiftRequestsAction();
      setShiftRequests(shifts as any);
      showToast(status === 'approved' ? 'Đã duyệt ca làm việc!' : 'Đã từ chối ca làm việc.', 'success');
    } else {
      showToast('Lỗi xử lý ca làm việc', 'error');
    }
  };

  const addShiftDirectly = async (userId: string, date: string, shiftType: 'morning' | 'afternoon' | 'evening', comment?: string) => {
    const staff = usersList.find((u) => u.id === userId);
    if (!staff) return;

    const exists = shiftRequests.some((s) => s.userId === userId && s.date === date && s.shiftType === shiftType);
    if (exists) {
      showToast(`Ca làm này đã được xếp cho ${staff.name} vào ngày này rồi!`, 'error');
      return;
    }

    const result = await addShiftDirectlyAction(userId, staff.name, staff.role, staff.branch || 'Chi nhánh Quận 1', date, shiftType, comment);
    if (result.success && result.request) {
      setShiftRequests((prev) => [result.request as any, ...prev]);
      showToast(`Đã xếp ca làm thành công cho ${staff.name}!`, 'success');
    } else {
      showToast('Lỗi xếp ca làm trực tiếp', 'error');
    }
  };

  const deleteShiftRequest = async (requestId: string) => {
    const success = await deleteShiftRequestAction(requestId);
    if (success) {
      setShiftRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast('Đã xóa ca làm việc khỏi lịch!', 'info');
    } else {
      showToast('Lỗi xóa ca làm việc', 'error');
    }
  };

  const reserveDeskOrRoom = async (type: 'desk' | 'room_a' | 'room_b', resourceId: string, date: string, slot: 'morning' | 'afternoon' | 'full') => {
    if (!currentUser) return;
    const result = await reserveDeskOrRoomAction(currentUser.id, currentUser.name, type, resourceId, date, slot);
    if (result.success && result.reservation) {
      setOfficeReservations(prev => [result.reservation as any, ...prev]);
      showToast('Đặt chỗ văn phòng thành công!', 'success');
    } else {
      showToast(result.message || 'Lỗi đặt chỗ', 'error');
    }
  };

  const cancelReservation = async (id: string) => {
    const success = await cancelReservationAction(id);
    if (success) {
      setOfficeReservations(prev => prev.filter(r => r.id !== id));
      showToast('Đã hủy đặt chỗ thành công.', 'info');
    } else {
      showToast('Lỗi hủy đặt chỗ', 'error');
    }
  };

  const addWorkspaceTask = async (title: string, description: string, priority: 'low' | 'medium' | 'high', assigneeId: string, dueDate: string) => {
    const assignee = usersList.find(u => u.id === assigneeId);
    if (!assignee) return;
    
    const result = await addWorkspaceTaskAction(title, description, priority, assigneeId, assignee.name, dueDate);
    if (result.success && result.task) {
      setWorkspaceTasks(prev => [...prev, result.task as any]);
      showToast(`Đã giao nhiệm vụ mới cho ${assignee.name}!`, 'success');
    } else {
      showToast(result.message || 'Lỗi giao nhiệm vụ', 'error');
    }
  };

  const updateWorkspaceTaskColumn = async (taskId: string, column: 'todo' | 'in_progress' | 'review' | 'done') => {
    const success = await updateWorkspaceTaskColumnAction(taskId, column);
    if (success) {
      setWorkspaceTasks(prev => prev.map(t => t.id === taskId ? { ...t, column } : t));
      showToast('Đã cập nhật trạng thái nhiệm vụ.', 'success');
    } else {
      showToast('Lỗi cập nhật nhiệm vụ', 'error');
    }
  };

  const deleteWorkspaceTask = async (taskId: string) => {
    const success = await deleteWorkspaceTaskAction(taskId);
    if (success) {
      setWorkspaceTasks(prev => prev.filter(t => t.id !== taskId));
      showToast('Đã xóa nhiệm vụ.', 'info');
    } else {
      showToast('Lỗi xóa nhiệm vụ', 'error');
    }
  };

  const addWorkspacePost = async (content: string, type: 'general' | 'birthday' | 'announcement') => {
    if (!currentUser) return;
    const result = await addWorkspacePostAction(currentUser.name, currentUser.avatar, content, type);
    if (result.success && result.post) {
      setWorkspacePosts(prev => [result.post as any, ...prev]);
      showToast('Đăng bài chia sẻ nội bộ thành công!', 'success');
    } else {
      showToast(result.message || 'Lỗi đăng bài viết', 'error');
    }
  };

  const reactToPost = async (postId: string, reaction: 'like' | 'heart') => {
    if (!currentUser) return;
    const success = await reactToPostAction(postId, reaction, currentUser.id);
    if (success) {
      const posts = await getWorkspacePostsAction();
      setWorkspacePosts(posts as any);
    }
  };

  const commentOnPost = async (postId: string, commentText: string) => {
    if (!currentUser) return;
    const result = await commentOnPostAction(postId, currentUser.name, commentText);
    if (result.success && result.comment) {
      setWorkspacePosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, result.comment as any]
          };
        }
        return post;
      }));
      showToast('Đã bình luận thành công.', 'success');
    } else {
      showToast(result.message || 'Lỗi gửi bình luận', 'error');
    }
  };

  const addWikiDoc = async (title: string, category: 'hr' | 'operations' | 'benefits', content: string) => {
    const result = await addWikiDocAction(title, category, content);
    if (result.success && result.doc) {
      setWikiDocs(prev => [...prev, result.doc as any]);
      showToast('Đã thêm bài viết Wiki nội bộ mới!', 'success');
    } else {
      showToast(result.message || 'Lỗi thêm bài viết', 'error');
    }
  };

  const updateWikiDoc = async (docId: string, title: string, category: 'hr' | 'operations' | 'benefits', content: string) => {
    const result = await updateWikiDocAction(docId, title, category, content);
    if (result.success && result.doc) {
      setWikiDocs(prev => prev.map(d => d.id === docId ? result.doc as any : d));
      showToast('Đã cập nhật tài liệu Wiki thành công!', 'success');
    } else {
      showToast(result.message || 'Lỗi cập nhật tài liệu', 'error');
    }
  };
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        productsList,
        attendanceLogs,
        leaveRequests,
        salaryRequests,
        branchStock,
        branchSizeStock,
        branchColorStock,
        isAuthLoaded,
        login,
        register,
        changePassword,
        deleteUser,
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
        dailyReports,
        submitDailyReport,
        markReportAsRead,
        addCustomerSpending,
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
        shiftRequests,
        submitShiftRequest,
        approveShiftRequest,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
