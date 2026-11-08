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
  // Roles / badge / icon / name copy VERBATIM từ mảng sidebar legacy (slice 1)
  // — không suy đoán, không "fix". Sub-tab: [] vì các nút này hiện không
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
    // Node này không giới hạn vai → hiện cho mọi staff trong nhóm.
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
  'cskh-reviews': 'reviews',
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
// ---------------------------------------------------------------------------
// Task 5 — canonicalize + mapping đích ERP.
//
// CẢNH BÁO: không phải mọi alias nên canonicalize. Các id sau đây được loại
// khỏi canonicalize vì renderer xử lý chúng bằng điều kiện
// `activeTab === <parent> && <subTab> === <x>` — canonicalize sẽ XÓA phân biệt
// sub-tab và/hoặc tạo double-render (registry block + domain block cùng bật):
//   - id GIA ĐÌNH (parent của thanh pill): sales-orders, customers, promotions,
//     products-inventory, finance-profit
//   - 'costs' → finance-costs: registry block đã render ExpensesManagementTab,
//     block 16 cũng render → double
//   - 'director-global-finance'/'accountant-global-finance' → finance-p-l:
//     block 13/15 render PL tab → double
//   - 'director-hr-payroll'/'accountant-hr-payroll' → finance-payroll:
//     block 14 render AccountantPayrollTab → registry sẽ thêm panel thứ 2
//   - 'customers-vip'/'cskh-customers-vip' → customers-list: block 18 legacy
//     không bật cho 2 id này
//   - 'staff' → finance-payroll: legacy ERP hub render null cho id này
// ---------------------------------------------------------------------------
const NON_CANONICAL_IDS = new Set([
  'sales-orders',
  'customers',
  'promotions',
  'products-inventory',
  'finance-profit',
  'costs',
  'director-global-finance',
  'accountant-global-finance',
  'director-hr-payroll',
  'accountant-hr-payroll',
  'customers-vip',
  'cskh-customers-vip',
  'staff',
]);

/**
 * Task 5: canonicalize activeTab về node gốc (chỉ với id lá/alias hợp lệ).
 * Id GIA ĐÌNH trong NON_CANONICAL_IDS cố ý trả undefined để renderer giữ
 * nhánh `parent && subTab` cũ — xem resolveNav.
 */
export function resolveNode(activeTab: string): NavNode | undefined {
  if (NON_CANONICAL_IDS.has(activeTab)) return undefined;
  const canonical = NAV_ALIAS[activeTab] ?? activeTab;
  return getActiveNode(canonical);
}

/**
 * Chuẩn hoá activeTab (id lá hoặc alias cũ) về node gốc trong NAV_NODES.
 * - `node`: node tương ứng, hoặc undefined nếu id không xác định (graceful).
 * - `subTab`: sub-tab mặc định của node (dùng để highlight pill / landing).
 */
export function resolveNav(activeTab: string): { node?: NavNode; subTab?: string } {
  const node = resolveNode(activeTab);
  return { node, subTab: node?.defaultSubTab };
}

/**
 * Task 6: tên tiêu đề trang cho activeTab (id lá, alias, hoặc family-parent).
 * Canonical hóa alias qua NAV_ALIAS rồi trả `node.name`; family-parent
 * (settings-roles, finance-profit...) + id lạ → undefined → UI fallback
 * sang sidebar lookup / title mặc định (giữ đúng nhánh pill chạy).
 */
export function canonicalTitle(activeTab: string): string | undefined {
  // Dùng NAV_ALIAS trực tiếp, KHÔNG qua resolveNode: family-parent
  // (costs/staff/finance-profit) nằm trong NON_CANONICAL_IDS nên resolveNode
  // trả undefined — nhưng legacy AppHeader VẪN gán title cho chúng (theo node
  // mà alias trỏ tới). Title chỉ là nhãn, không cần giữ phân biệt sub-tab
  // như renderer → canonical hóa alias đầy đủ.
  const node = getActiveNode(NAV_ALIAS[activeTab] ?? activeTab);
  return node?.name;
}

/**
 * Task 6: workspace (tab header) cho activeTab. Id lá + alias → node.group;
 * family-parent + id lạ → 'management' (workspace mặc định, như return cuối
 * của getActiveWorkspace cũ). KHÔNG dùng NON_CANONICAL check: AppHeader cần
 * workspace đúng cho gia đình (finance-profit → finance).
 */
export function canonicalWorkspace(activeTab: string): string {
  const node = getActiveNode(NAV_ALIAS[activeTab] ?? activeTab);
  return node?.group ?? 'management';
}

/**
 * Task 6: activeTab có trỏ tới node 'audit-logs' hay không — dùng cho điều
 * kiện fetch audit log.
 *
 * KHÔNG dùng `resolveNav(...).node?.id` cho việc này: 'settings-roles' là
 * family-parent, KHÔNG có trong NAV_ALIAS → resolveNav trả undefined → nhánh
 * fetch dưới pill 'audit-logs' của settings-roles sẽ chết âm thầm.
 * Ở đây canonical hóa alias đầy đủ (kể cả family-parent) → 'settings-roles'
 * trỏ về node 'settings', và sub-tab quyết định có phải audit hay không.
 */
export function isAuditLogsTab(activeTab: string, settingsSubTab?: string): boolean {
  const canonical = NAV_ALIAS[activeTab] ?? activeTab;
  if (canonical === 'audit-logs') return true;
  // Nhánh gia đình: 'settings-roles' là family-parent REACHABLE (hook set khi
  // accountant bấm pill 'channels'), KHÔNG phải alias trong NAV_ALIAS → phải
  // giữ điều kiện thô activeTab === 'settings-roles' (đúng legacy page.tsx),
  // sub-tab quyết định có phải nhật ký hay không.
  if (activeTab === 'settings-roles' && settingsSubTab === 'audit-logs') return true;
  return false;
}

// Component do registry block render trực tiếp (renderer switch). ERP hub
// phải trả '' cho các id này để tránh double-render.
// CHỈ 4 component — đúng bằng 4 id mà if-chain cũ suppress ('').
// 'finance-p-l'/'finance-costs' KHÔNG nằm trong danh sách này: legacy truyền
// thẳng id xuống hub (hub không có case → default → null), nên trả '' cũng tương
// đương về RENDER nhưng khác chuỗi — pin tương đương yêu cầu giữ chuỗi.
const REGISTRY_RENDERED_COMPONENTS = new Set<TabComponentKey>([
  'finance-recon',
  'finance-payroll',
  'products-database',
  'settings',
]);

// Đích ERP hub theo id — transcription NGUYÊN VĂN từ if-chain cũ trong
// InternalTabRenderer (dòng ~341-361). Bảng này KHÔNG canonicalize: giữ đúng
// hành vi cũ cho mọi id, kể cả id đã chết.
const ERP_TARGET: Record<string, string> = {
  'pos-sales': 'pos-sales',
  'stocker-inventory': 'stocker-inventory',
  'stocker-transfer': 'stocker-transfer',
  'damaged-goods': 'damaged-goods',
  'returns-exchange': 'returns-exchange',
  'customers-list': 'customers-list',
  'cskh-hub': 'customers-list',
  'cskh-customers': 'customers-list',
  'customers-vip': 'cskh-customers-vip',
  // 'cskh-live-chat' KHÔNG nằm trong danh sách legacy (if-chain cũ chỉ có
  // customers-list/cskh-hub/customers/cskh-customers) → legacy passthrough
  // 'cskh-live-chat' → hub không có case → null. Giữ passthrough để trung
  // thành if-chain cũ (trước đây map sang 'customers-list' → sai).
  'cskh-live-chat': 'cskh-live-chat',
  'ai-copilot': 'ai-copilot',
  // Node id trực tiếp do registry block render → ERP hub render null.
  'products-database': '',
  'finance-payroll': '',
  'finance-recon': '',
  'settings': '',
  // Alias của node do registry block render → '' (registry render, chống double).
  'recon': '',
  'accountant-kpi-payroll': '',
  // Alias của node do registry block render → '' (registry render, chống
  // double). 'settings-tab' là alias của node 'settings' (NAV_ALIAS): khi
  // renderer canonicalize (Task 5 Step 2), 'settings-tab' → node settings →
  // registry block render SettingsSubsystem. Hub phải trả '' để không double-render.
  // (Legacy if-chain truyền 'settings-tab' thẳng xuống hub — nhưng 'settings-tab'
  // là id DEAD, không có producer, nên không ảnh hưởng UI live.)
  'settings-tab': '',
};

export interface ErpSubTabState {
  sales?: string;
  products?: string;
  finance?: string;
  promotions?: string;
  settings?: string;
}

/**
 * Task 5: đích tab cho ERPSubsystems — thuần dữ liệu, test được.
 * Trả về id mà ERPSubsystems switch nhận, hoặc '' (→ default → null) khi
 * node đã được registry block render (chống double-render).
 */
export function resolveErpTab(activeTab: string, subs: ErpSubTabState = {}): string {
  // Gia đình (parent) — mapping legacy, giữ nguyên.
  if (activeTab === 'sales-orders') {
    if (subs.sales === 'pos') return 'pos-sales';
    if (subs.sales === 'returns') return 'returns-exchange';
    return 'sales-orders';
  }
  if (activeTab === 'products-inventory') {
    if (subs.products === 'matrix') return 'stocker-inventory';
    if (subs.products === 'transfer') return 'stocker-transfer';
    if (subs.products === 'damaged') return 'damaged-goods';
    if (subs.products === 'list') return 'products-database';
    return 'products-inventory';
  }
  if (activeTab === 'customers') return 'customers-list';
  if (activeTab === 'promotions') {
    if (subs.promotions === 'ai-marketing') return 'ai-copilot';
    if (subs.promotions === 'coupons') return 'coupons-management';
    return 'promotions';
  }
  if (activeTab === 'finance-profit') {
    if (subs.finance === 'recon') return 'accountant-finance-recon';
    return 'finance-profit';
  }
  if (activeTab === 'settings-roles') {
    if (subs.settings === 'brand') return 'settings-tab';
    if (subs.settings === 'channels') return 'omnichannel';
    return 'settings-roles';
  }

  const target = ERP_TARGET[activeTab];
  if (target !== undefined) return target;

  // Id lá của registry → nếu registry block render thì hub phải null.
  const node = resolveNode(activeTab);
  if (node && REGISTRY_RENDERED_COMPONENTS.has(node.component)) return '';

  return activeTab;
}

export function getNodesForRole(role: UserRole): NavNode[] {
  return NAV_NODES.filter((n) => n.allowedRoles.includes(role));
}

export function getActiveNode(id: string): NavNode | undefined {
  return NAV_NODES.find((n) => n.id === id);
}

// ---------------------------------------------------------------------------
// Sidebar builder (Task 4) — nguồn sự thật DUY NHẤT cho sidebar + AppHeader.
// Mọi nhóm (quản trị/tài chính + POS/CSKH/KHO) đều lấy items từ NAV_NODES
// theo nodeIds + allowedRoles, gate nhóm theo groupRoles, sắp theo GROUP_ORDER.
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

// MỌI nhóm: items từ NAV_NODES. groupRoles giữ gate nhóm Y HOOI menuGroups cũ
// (TỔNG QUAN [d,m]; POS [d,m,e,cashier]; CSKH [d,m,cskh]; KHO [d,m,stocker,a];
// VẬN HÀNH không gate; QUẢN TRỊ [d,m,a] — logout cũng bị gate bởi nhóm này,
// đúng hiện trạng). TÀI CHÍNH thêm cashier: gộp finance-recon về đây nên phải
// giữ đường vào của cashier.
const REGISTRY_GROUPS: Array<{ title: string; workspace: string; groupRoles?: UserRole[]; nodeIds: string[] }> = [
  { title: 'TỔNG QUAN', workspace: 'management', groupRoles: ['director', 'manager'], nodeIds: ['overview'] },
  { title: 'BÁN HÀNG & POS', workspace: 'pos', groupRoles: ['director', 'manager', 'employee', 'cashier'], nodeIds: ['pos-sales', 'sales-orders-list'] },
  { title: 'CSKH & CRM', workspace: 'cskh', groupRoles: ['director', 'manager', 'cskh'], nodeIds: ['cskh-hub', 'returns-exchange', 'customers-list', 'reviews', 'ai-copilot'] },
  { title: 'KHO VẬN & HÀNG HÓA', workspace: 'warehouse', groupRoles: ['director', 'manager', 'stocker', 'accountant'], nodeIds: ['stocker-inventory', 'stocker-transfer', 'damaged-goods', 'restock'] },
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
    if (!reg) continue;
    if (reg.groupRoles && !reg.groupRoles.includes(role)) continue;

    const items: SidebarItem[] = [];
    for (const id of reg.nodeIds) {
      const n = getActiveNode(id);
      if (!n || !n.allowedRoles.includes(role)) continue;
      items.push({ id: n.id, name: n.name, icon: n.icon, badgeKey: n.badge, workspace: reg.workspace });
    }
    if (title === 'QUẢN TRỊ HỆ THỐNG') {
      items.push({ id: 'logout', name: 'Đăng xuất', icon: 'LogOut', workspace: 'management' });
    }
    if (items.length > 0) {
      out.push({ title, workspace: reg.workspace, items });
    }
  }
  return out;
}
