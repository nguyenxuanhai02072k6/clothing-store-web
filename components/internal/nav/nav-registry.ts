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
  | 'manager-reports'
  // Slice 2: vùng POS / CSKH / KHO — mỗi node là 1 component key riêng.
  | 'pos-sales'
  | 'sales-orders-list'
  | 'cskh-hub'
  | 'returns-exchange'
  | 'customers-list'
  | 'reviews'
  | 'ai-copilot'
  | 'stocker-inventory'
  | 'stocker-transfer'
  | 'damaged-goods'
  | 'restock';

// Contract guard (Task 4): renderer truy vấn getActiveNode(activeTab).component và
// render theo map TabComponentKey → component React. Mọi node.component PHẢI thuộc
// danh sách này — nếu node trả ra key lạ, renderer render rỗng → test bắt ngay.
export const COMPONENT_KEYS: readonly TabComponentKey[] = [
  'overview',
  'director-pl',
  'expenses',
  'finance-payroll',
  'staff-schedule',
  'attendance',
  'announcements',
  'audit-logs',
  'settings',
  'products-database',
  'finance-recon',
  'manager-reports',
  // Slice 2: region POS / CSKH / KHO (11 keys — mỗi node là 1 component key)
  'pos-sales',
  'sales-orders-list',
  'cskh-hub',
  'returns-exchange',
  'customers-list',
  'reviews',
  'ai-copilot',
  'stocker-inventory',
  'stocker-transfer',
  'damaged-goods',
  'restock',
];

export type GroupKey = 'management' | 'finance' | 'pos' | 'cskh' | 'warehouse';

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

  // -------------------------------------------------------------------------
  // Slice 2: vùng POS / CSKH / KHO nâng lên thành node thật trong NAV_NODES.
  // Roles / badge / icon / name copy VERBATIM từ LEGACY_GROUPS (nav-registry
  // cũ) — không suy đoán, không "fix". Sub-tab: [] vì các nút này hiện không
  // có thanh pill riêng (vùng KHO dùng thanh 5-pill của products-inventory,
  // giữ nguyên ở hook — xem Global Constraints của plan slice 2).
  // -------------------------------------------------------------------------
  {
    id: 'pos-sales',
    name: 'Quầy POS Bán Lẻ',
    icon: 'ShoppingBag',
    group: 'pos',
    allowedRoles: ['director', 'manager', 'employee', 'cashier'],
    // Landing của cashier/employee mở sub-tab 'pos' (khớp setSalesOrdersSubTab('pos') cũ).
    defaultSubTab: 'pos',
    subTabs: [],
    component: 'pos-sales',
  },
  {
    id: 'sales-orders-list',
    name: 'Danh sách đơn hàng',
    icon: 'FileText',
    group: 'pos',
    // LEGACY_GROUPS không khai báo allowedRoles → hiện cho mọi staff trong nhóm.
    allowedRoles: ALL,
    badge: 'pendingOrders',
    subTabs: [],
    component: 'sales-orders-list',
  },
  {
    id: 'cskh-hub',
    name: 'CSKH Console (Live Chat)',
    icon: 'MessageSquare',
    group: 'cskh',
    allowedRoles: ['director', 'manager', 'cskh'],
    subTabs: [],
    component: 'cskh-hub',
  },
  {
    id: 'returns-exchange',
    name: 'Phiếu đổi trả & Khiếu nại',
    icon: 'RotateCcw',
    group: 'cskh',
    allowedRoles: ['director', 'manager', 'cskh', 'employee', 'cashier'],
    subTabs: [],
    component: 'returns-exchange',
  },
  {
    id: 'customers-list',
    name: 'Khách hàng & Hạng VIP',
    icon: 'Crown',
    group: 'cskh',
    allowedRoles: ['director', 'manager', 'cskh', 'employee', 'cashier'],
    subTabs: [],
    component: 'customers-list',
  },
  {
    id: 'reviews',
    name: 'Đánh giá từ khách',
    icon: 'Star',
    group: 'cskh',
    allowedRoles: ['director', 'cskh', 'manager'],
    subTabs: [],
    component: 'reviews',
  },
  {
    id: 'ai-copilot',
    name: 'Trợ lý AI Marketing',
    icon: 'Sparkles',
    group: 'cskh',
    allowedRoles: ['director', 'manager', 'cskh'],
    subTabs: [],
    component: 'ai-copilot',
  },
  {
    id: 'stocker-inventory',
    name: 'Tồn kho 2 chi nhánh',
    icon: 'Layers',
    group: 'warehouse',
    allowedRoles: ['director', 'manager', 'stocker', 'accountant', 'cashier', 'employee'],
    badge: 'lowStock',
    // Landing của vai stocker mở sub-tab 'matrix' (khớp setProductsInventorySubTab('matrix') cũ).
    defaultSubTab: 'matrix',
    subTabs: [],
    component: 'stocker-inventory',
  },
  {
    id: 'stocker-transfer',
    name: 'Điều chuyển kho',
    icon: 'ArrowRightLeft',
    group: 'warehouse',
    allowedRoles: ['director', 'manager', 'stocker', 'accountant'],
    subTabs: [],
    component: 'stocker-transfer',
  },
  {
    id: 'damaged-goods',
    name: 'Biên bản hàng lỗi',
    icon: 'AlertTriangle',
    group: 'warehouse',
    allowedRoles: ['director', 'manager', 'stocker', 'cskh', 'accountant'],
    subTabs: [],
    component: 'damaged-goods',
  },
  {
    id: 'restock',
    name: 'Phiếu nhập hàng',
    icon: 'FileDown',
    group: 'warehouse',
    allowedRoles: ['director', 'manager', 'stocker', 'accountant'],
    subTabs: [],
    component: 'restock',
  },
];

// Vai nào thì rớt vào nút nào (thay useEffect hardcode dòng 38-55 hook).
// Slice 2: phủ MỌI vai — mọi landing đọc từ đây, hook không còn if/else.
export const DEFAULT_PER_ROLE: Partial<Record<UserRole, string>> = {
  director: 'overview',
  manager: 'overview',
  cashier: 'pos-sales',
  employee: 'pos-sales',
  cskh: 'cskh-hub',
  stocker: 'stocker-inventory',
  accountant: 'finance-costs',
};

// Map alias cũ (activeTab giá trị) -> node.id gốc.
// Slice 2: superset của LEGACY_ROUTE_MAP cũ — thêm mọi id lá vùng POS/CSKH/KHO
// trỏ về chính nó (nay đã là node thật trong NAV_NODES).
// Dùng bởi resolveNav() để chuẩn hoá mọi activeTab về node gốc.
export const NAV_ALIAS: Record<string, string> = {
  'finance-p-l': 'finance-p-l',
  'finance-profit': 'finance-p-l',
  'director-global-finance': 'finance-p-l',
  'accountant-global-finance': 'finance-p-l',
  'finance-costs': 'finance-costs',
  'costs': 'finance-costs',
  'finance-payroll': 'finance-payroll',
  'staff': 'finance-payroll',
  'director-hr-payroll': 'finance-payroll',
  'accountant-hr-payroll': 'finance-payroll',
  'accountant-kpi-payroll': 'finance-payroll',
  'finance-recon': 'finance-recon',
  'recon': 'finance-recon',
  'accountant-finance-recon': 'finance-recon',
  'staff-schedule': 'staff-schedule',
  'shifts': 'staff-schedule',
  'manager-shift-overview': 'staff-schedule',
  'manager-staff-console': 'staff-schedule',
  'attendance': 'attendance',
  'employee-shifts-clock': 'attendance',
  'employee-hr-requests': 'attendance',
  'products-database': 'products-database',
  'announcements': 'announcements',
  'audit-logs': 'audit-logs',
  'settings': 'settings',
  'settings-tab': 'settings',
  'overview': 'overview',
  // Alias item legacy POS/CSKH/KHO (giữ active-state đúng như isItemActive cũ)
  'pos': 'pos-sales',
  'cskh-orders': 'sales-orders-list',
  'cskh-live-chat': 'cskh-hub',
  'cskh-customers-tickets': 'returns-exchange',
  'customers': 'customers-list',
  'cskh-customers': 'customers-list',
  'customers-vip': 'customers-list',
  'cskh-customers-vip': 'customers-list',
  'branch-stock': 'stocker-inventory',
  'manager-stock': 'restock',
  'accountant-operations': 'restock',
  // Slice 2: id lá vùng POS/CSKH/KHO — giờ là node thật, trỏ về chính nó.
  'pos-sales': 'pos-sales',
  'sales-orders-list': 'sales-orders-list',
  'cskh-hub': 'cskh-hub',
  'returns-exchange': 'returns-exchange',
  'customers-list': 'customers-list',
  'reviews': 'reviews',
  'ai-copilot': 'ai-copilot',
  'stocker-inventory': 'stocker-inventory',
  'stocker-transfer': 'stocker-transfer',
  'damaged-goods': 'damaged-goods',
  'restock': 'restock',
};

/**
 * Chuẩn hoá activeTab (id lá hoặc alias cũ) về node gốc trong NAV_NODES.
 * - `node`: node tương ứng, hoặc undefined nếu id không xác định (graceful).
 * - `subTab`: sub-tab mặc định của node (dùng để highlight pill / landing).
 *   'shifts' → staff-schedule (defaultSubTab 'shifts' của node) — không cần
 *   special-case vì defaultSubTab đã được set ở NAV_NODES.
 */
export function resolveNav(activeTab: string): { node?: NavNode; subTab?: string } {
  const canonical = NAV_ALIAS[activeTab] ?? activeTab;
  const node = getActiveNode(canonical);
  return { node, subTab: node?.defaultSubTab };
}

export function getNodesForRole(role: UserRole): NavNode[] {
  return NAV_NODES.filter((n) => n.allowedRoles.includes(role));
}

export function getActiveNode(id: string): NavNode | undefined {
  return NAV_NODES.find((n) => n.id === id);
}

// ---------------------------------------------------------------------------
// Sidebar builder (Task 3) — nguồn sự thật cho sidebar + AppHeader.
// Nhóm vùng quản trị/tài chính lấy items từ NAV_NODES (dedupe finance-recon);
// nhóm POS/CSKH/KHO giữ nguyên dữ liệu legacy (không đổi behavior — lát sau).
// icon ở dạng string; AppSidebar map sang lucide.
// ---------------------------------------------------------------------------

export interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  badgeKey?: 'pendingOrders' | 'lowStock' | 'announcements' | 'pendingHr';
  workspace?: string;
}

export interface SidebarGroup {
  title: string;
  workspace: string;
  items: SidebarItem[];
}

type LegacyItem = SidebarItem & { allowedRoles?: UserRole[] };

const LEGACY_GROUPS: Array<{ title: string; workspace: string; groupRoles?: UserRole[]; items: LegacyItem[] }> = [
  {
    title: 'BÁN HÀNG & POS',
    workspace: 'pos',
    groupRoles: ['director', 'manager', 'employee', 'cashier'],
    items: [
      { id: 'pos-sales', name: 'Quầy POS Bán Lẻ', icon: 'ShoppingBag', allowedRoles: ['director', 'manager', 'employee', 'cashier'], workspace: 'pos' },
      { id: 'sales-orders-list', name: 'Danh sách đơn hàng', icon: 'FileText', badgeKey: 'pendingOrders', workspace: 'pos' },
      // finance-recon ĐÃ BỎ: gộp về nút tài chính (registry), tránh trùng 2 lần.
    ],
  },
  {
    title: 'CSKH & CRM',
    workspace: 'cskh',
    groupRoles: ['director', 'manager', 'cskh'],
    items: [
      { id: 'cskh-hub', name: 'CSKH Console (Live Chat)', icon: 'MessageSquare', allowedRoles: ['director', 'manager', 'cskh'], workspace: 'cskh' },
      { id: 'returns-exchange', name: 'Phiếu đổi trả & Khiếu nại', icon: 'RotateCcw', allowedRoles: ['director', 'manager', 'cskh', 'employee', 'cashier'], workspace: 'cskh' },
      { id: 'customers-list', name: 'Khách hàng & Hạng VIP', icon: 'Crown', allowedRoles: ['director', 'manager', 'cskh', 'employee', 'cashier'], workspace: 'cskh' },
      { id: 'reviews', name: 'Đánh giá từ khách', icon: 'Star', allowedRoles: ['director', 'cskh', 'manager'], workspace: 'cskh' },
      { id: 'ai-copilot', name: 'Trợ lý AI Marketing', icon: 'Sparkles', allowedRoles: ['director', 'manager', 'cskh'], workspace: 'cskh' },
    ],
  },
  {
    title: 'KHO VẬN & HÀNG HÓA',
    workspace: 'warehouse',
    groupRoles: ['director', 'manager', 'stocker', 'accountant'],
    items: [
      { id: 'stocker-inventory', name: 'Tồn kho 2 chi nhánh', icon: 'Layers', badgeKey: 'lowStock', allowedRoles: ['director', 'manager', 'stocker', 'accountant', 'cashier', 'employee'], workspace: 'warehouse' },
      { id: 'stocker-transfer', name: 'Điều chuyển kho', icon: 'ArrowRightLeft', allowedRoles: ['director', 'manager', 'stocker', 'accountant'], workspace: 'warehouse' },
      { id: 'damaged-goods', name: 'Biên bản hàng lỗi', icon: 'AlertTriangle', allowedRoles: ['director', 'manager', 'stocker', 'cskh', 'accountant'], workspace: 'warehouse' },
      { id: 'restock', name: 'Phiếu nhập hàng', icon: 'FileDown', allowedRoles: ['director', 'manager', 'stocker', 'accountant'], workspace: 'warehouse' },
    ],
  },
];

// Nhóm quản trị/tài chính: items từ NAV_NODES (name/role/badge lấy đúng từ node).
// groupRoles giữ gate nhóm Y HOOI menuGroups cũ (TỔNG QUAN [d,m], VẬN HÀNH không gate,
// QUẢN TRỊ [d,m,a] — logout cũng bị gate bởi nhóm này, đúng hiện trạng).
// TÀI CHÍNH thêm cashier: gộp finance-recon về đây nên phải giữ đường vào của cashier.
const REGISTRY_GROUPS: Array<{ title: string; workspace: string; groupRoles?: UserRole[]; nodeIds: string[] }> = [
  { title: 'TỔNG QUAN', workspace: 'management', groupRoles: ['director', 'manager'], nodeIds: ['overview'] },
  { title: 'TÀI CHÍNH & KẾ TOÁN', workspace: 'finance', groupRoles: ['director', 'manager', 'accountant', 'cashier'], nodeIds: ['finance-costs', 'finance-payroll', 'finance-recon', 'finance-p-l'] },
  { title: 'VẬN HÀNH & NHÂN SỰ', workspace: 'management', nodeIds: ['staff-schedule', 'attendance'] },
  { title: 'QUẢN TRỊ HỆ THỐNG', workspace: 'management', groupRoles: ['director', 'manager', 'accountant'], nodeIds: ['products-database', 'announcements', 'audit-logs', 'settings'] },
];

// Thứ tự nhóm giữ y hệt menuGroups hiện tại.
const GROUP_ORDER = [
  'TỔNG QUAN',
  'BÁN HÀNG & POS',
  'CSKH & CRM',
  'KHO VẬN & HÀNG HÓA',
  'TÀI CHÍNH & KẾ TOÁN',
  'VẬN HÀNH & NHÂN SỰ',
  'QUẢN TRỊ HỆ THỐNG',
];

export function buildSidebarGroups(role: UserRole): SidebarGroup[] {
  const out: SidebarGroup[] = [];
  for (const title of GROUP_ORDER) {
    const reg = REGISTRY_GROUPS.find((g) => g.title === title);
    const leg = LEGACY_GROUPS.find((g) => g.title === title);
    const groupRoles = reg?.groupRoles ?? leg?.groupRoles;
    if (groupRoles && !groupRoles.includes(role)) continue;

    const items: SidebarItem[] = [];
    if (reg) {
      for (const id of reg.nodeIds) {
        const n = getActiveNode(id);
        if (!n || !n.allowedRoles.includes(role)) continue;
        items.push({ id: n.id, name: n.name, icon: n.icon, badgeKey: n.badge, workspace: reg.workspace });
      }
    }
    if (leg) {
      for (const it of leg.items) {
        if (it.allowedRoles && !it.allowedRoles.includes(role)) continue;
        items.push({ id: it.id, name: it.name, icon: it.icon, badgeKey: it.badgeKey, workspace: leg.workspace });
      }
    }
    if (title === 'QUẢN TRỊ HỆ THỐNG') {
      items.push({ id: 'logout', name: 'Đăng xuất', icon: 'LogOut', workspace: 'management' });
    }
    if (items.length > 0) {
      out.push({ title, workspace: reg?.workspace ?? leg?.workspace ?? 'management', items });
    }
  }
  return out;
}
