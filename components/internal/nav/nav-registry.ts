import type { UserRole } from '@/types';

// ---------------------------------------------------------------------------
// NavRegistry — nguồn sự thật duy nhất cho điều hướng bảng quản trị (Slice 1)
// Thuần dữ liệu: KHÔNG import React / lucide. icon là TÊN string, AppSidebar
// (Task 3) sẽ map sang component lucide.
// ---------------------------------------------------------------------------

export interface SubTabDef {
  id: string;
  name: string;
  visibleFor: UserRole[];
}

export type TabComponentKey =
  | 'overview'
  | 'director-pl'
  | 'expenses'
  | 'finance-payroll'
  | 'staff-schedule'
  | 'attendance'
  | 'announcements'
  | 'audit-logs'
  | 'settings'
  | 'products-database'
  | 'finance-recon'
  | 'manager-reports';

export type GroupKey = 'management' | 'finance';

export interface NavNode {
  id: string;
  name: string;
  icon: string; // tên icon lucide
  group: GroupKey;
  allowedRoles: UserRole[];
  subTabs: SubTabDef[];
  component: TabComponentKey;
  badge?: 'pendingHr' | 'announcements' | 'lowStock' | 'pendingOrders';
  defaultSubTab?: string;
}

// Nhân sự (loại customer — /internal chuyển hướng customer đi, page.tsx:164).
const ALL: UserRole[] = [
  'employee', 'manager', 'director',
  'accountant', 'cskh', 'cashier', 'stocker',
];

// Nhóm Quản trị / Nhân sự
const ADMIN: UserRole[] = ['director', 'manager', 'accountant'];

export const NAV_NODES: NavNode[] = [
  {
    id: 'overview',
    name: 'Dashboard',
    icon: 'LayoutGrid',
    group: 'management',
    allowedRoles: ['director', 'manager'],
    subTabs: [],
    component: 'overview',
  },
  {
    id: 'staff-schedule',
    name: 'Lịch ca & Nhân sự',
    icon: 'Calendar',
    group: 'management',
    allowedRoles: ADMIN,
    badge: 'pendingHr',
    defaultSubTab: 'shifts',
    subTabs: [
      { id: 'shifts', name: 'Lịch ca làm việc', visibleFor: ADMIN },
      { id: 'approval', name: 'Xếp lịch & Duyệt phép', visibleFor: ADMIN },
      { id: 'staff', name: 'Nhân sự & Tạo tài khoản', visibleFor: ADMIN },
      { id: 'payroll', name: 'Lương & Hoa hồng', visibleFor: ['director', 'accountant'] },
      { id: 'requests', name: 'Đơn từ yêu cầu', visibleFor: ['employee', 'cashier', 'stocker', 'cskh'] },
    ],
    component: 'staff-schedule',
  },
  {
    id: 'attendance',
    name: 'Chấm công & Ca trực',
    icon: 'Clock',
    group: 'management',
    allowedRoles: ALL,
    defaultSubTab: 'clock',
    subTabs: [
      { id: 'approval', name: 'Duyệt phép & Nhật ký chấm công', visibleFor: ADMIN },
      { id: 'shifts', name: 'Lịch ca toàn chi nhánh', visibleFor: ADMIN },
      { id: 'clock', name: 'Trạm chấm công cá nhân', visibleFor: ALL },
      { id: 'requests', name: 'Đơn từ nghỉ phép', visibleFor: ['employee', 'cashier', 'stocker', 'cskh'] },
    ],
    component: 'attendance',
  },
  {
    id: 'products-database',
    name: 'Danh mục & Bảng giá',
    icon: 'Box',
    group: 'management',
    allowedRoles: ALL,
    // Thanh 5 sub-tab KHO (khớp getSubTabs case 134: products-database dùng chung thanh
    // warehouse matrix/transfer/damaged/restock/list, state productsInventorySubTab).
    // Giữ 100% tính năng: item quản trị này cũng mở được các panel kho như item KHO.
    defaultSubTab: 'list',
    subTabs: [
      { id: 'matrix', name: 'Tồn kho chi nhánh', visibleFor: ALL },
      { id: 'transfer', name: 'Điều chuyển kho', visibleFor: ALL },
      { id: 'damaged', name: 'Biên bản hàng lỗi', visibleFor: ALL },
      { id: 'restock', name: 'Phiếu nhập hàng (Restock)', visibleFor: ['director', 'accountant', 'manager', 'stocker'] },
      { id: 'list', name: 'Danh mục & Bảng giá', visibleFor: ALL },
    ],
    component: 'products-database',
  },
  {
    id: 'announcements',
    name: 'Thông báo điều hành',
    icon: 'Megaphone',
    group: 'management',
    allowedRoles: ADMIN,
    badge: 'announcements',
    defaultSubTab: 'announcements',
    subTabs: [{ id: 'announcements', name: 'Thông báo & Chỉ đạo', visibleFor: ['director', 'manager'] }],
    component: 'announcements',
  },
  {
    id: 'audit-logs',
    name: 'Nhật ký an ninh',
    icon: 'History',
    group: 'management',
    allowedRoles: ['director'],
    // Panel đơn (DirectorOperationsTab: sub 'audit') — trùng khớp getSubTabs (item audit-logs)
    subTabs: [],
    component: 'audit-logs',
  },
  {
    id: 'settings',
    name: 'Cài đặt thương hiệu',
    icon: 'Settings',
    group: 'management',
    // Mở rộng thêm accountant: hôm nay họ đạt config brand/channels qua thanh gia đình
    // (item announcements có accountant, menuGroups:136). Tách ra riêng nên phải giữ quyền.
    allowedRoles: ['director', 'manager', 'accountant'],
    defaultSubTab: 'brand',
    subTabs: [
      { id: 'brand', name: 'Cấu hình chi nhánh', visibleFor: ['director', 'manager', 'accountant'] },
      { id: 'channels', name: 'Đồng bộ đa kênh', visibleFor: ['director', 'accountant'] },
    ],
    component: 'settings',
  },
  {
    id: 'finance-costs',
    name: 'Sổ quỹ Thu - Chi',
    icon: 'DollarSign',
    group: 'finance',
    allowedRoles: ADMIN,
    // Panel đơn (ExpensesManagementTab) — getSubTabs KHÔNG có case riêng → default []
    subTabs: [],
    component: 'expenses',
  },
  {
    id: 'finance-payroll',
    name: 'Bảng lương & Hoa hồng',
    icon: 'FileSpreadsheet',
    group: 'finance',
    allowedRoles: ADMIN,
    // Panel đơn (AccountantPayrollSubsystem) — getSubTabs default → []
    subTabs: [],
    component: 'finance-payroll',
  },
  // GỘP: hiện `finance-recon` nằm ở cả POS lẫn Tài chính (menuGroups 85 & 118).
  // Registry gộp về 1 nút, group Tài chính, giữ đủ quyền (union, có cashier).
  {
    id: 'finance-recon',
    name: 'Chốt ca & Đối soát két',
    icon: 'ClipboardCheck',
    group: 'finance',
    allowedRoles: ['director', 'manager', 'accountant', 'cashier'],
    // Panel đơn (FinanceReconSubsystem) — getSubTabs default → []
    subTabs: [],
    component: 'finance-recon',
  },
  {
    id: 'finance-p-l',
    name: 'Báo cáo Lợi nhuận P&L',
    icon: 'TrendingUp',
    group: 'finance',
    allowedRoles: ADMIN,
    // Panel đơn (DirectorPLViewTab / AccountantFinancePLTab) — getSubTabs default → []
    subTabs: [],
    component: 'director-pl',
  },
];

// Vai nào thì rớt vào nút nào (thay useEffect hardcode dòng 38-55 hook).
// Chỉ định nghĩa nhóm quản trị; POS/CSKH/Kho giữ ở lượt sau.
export const DEFAULT_PER_ROLE: Partial<Record<UserRole, string>> = {
  director: 'overview',
  manager: 'overview',
};

// Map alias cũ (activeTab giá trị) -> node.id. Dùng bởi sidebar/renderer khi
// chưa migrates hoàn toàn (legacy fallback, Task 5).
export const LEGACY_ROUTE_MAP: Record<string, string> = {
  'director-global-finance': 'finance-p-l',
  'finance-p-l': 'finance-p-l',
  'finance-costs': 'finance-costs',
  'costs': 'finance-costs',
  'finance-payroll': 'finance-payroll',
  'finance-recon': 'finance-recon',
  'recon': 'finance-recon',
  'staff-schedule': 'staff-schedule',
  'shifts': 'staff-schedule',
  'attendance': 'attendance',
  'products-database': 'products-database',
  'announcements': 'announcements',
  'audit-logs': 'audit-logs',
  'settings': 'settings',
  'overview': 'overview',
};

export function getNodesForRole(role: UserRole): NavNode[] {
  return NAV_NODES.filter((n) => n.allowedRoles.includes(role));
}

export function getActiveNode(id: string): NavNode | undefined {
  return NAV_NODES.find((n) => n.id === id);
}
