import {
  NAV_NODES,
  getNodesForRole,
  getActiveNode,
  DEFAULT_PER_ROLE,
  LEGACY_ROUTE_MAP,
  buildSidebarGroups,
  COMPONENT_KEYS,
} from '../components/internal/nav/nav-registry';
import type { UserRole } from '../types';

let failed = 0;
function expect(cond: boolean, msg: string) {
  if (!cond) {
    console.error('   ❌ ' + msg);
    failed++;
  } else {
    console.log('   ✅ ' + msg);
  }
}

console.log('🧪 === KIỂM THỬ NAV REGISTRY (nguồn sự thật điều hướng admin) ===\n');

// 1. finance-recon tồn tại DUY NHẤT (đã gộp), vẫn giữ quyền cashier
const recons = NAV_NODES.filter((n) => n.id === 'finance-recon');
expect(recons.length === 1, 'finance-recon phải có đúng 1 node (gộp POS + Tài chính)');
expect(
  recons[0]?.allowedRoles.includes('cashier'),
  'finance-recon (gộp) phải giữ quyền cashier (menuGroups dòng 85)'
);

// 2. director default landing = overview (không đổi behavior hiện tại)
expect(DEFAULT_PER_ROLE['director'] === 'overview', 'director default = overview');

// 3. audit-logs chỉ dành cho director (menuGroups dòng 137)
const audit = NAV_NODES.find((n) => n.id === 'audit-logs');
expect(
  audit?.allowedRoles.length === 1 && audit?.allowedRoles[0] === 'director',
  'audit-logs allowedRoles chỉ chứa director'
);

// 4. cashier sidebar gọn (<= 4 mục hiển thị)
//    Slice 2: đo bằng ITEM SIDEBAR (buildSidebarGroups), không phải
//    getNodesForRole — permission surface rộng hơn sidebar (vài node thuộc
//    nhóm mà vai này không vào, vd returns-exchange của nhóm CSKH).
//    Ý định assertion giữ nguyên: sidebar của cashier phải gọn.
const cashierSidebarItems = buildSidebarGroups('cashier').reduce((n, g) => n + g.items.length, 0);
expect(cashierSidebarItems <= 4, `cashier thấy ${cashierSidebarItems} mục sidebar (<=4)`);

// 5. getActiveNode trả đúng node (node id = alias chuẩn của activeTab/sidebar)
expect(getActiveNode('finance-p-l')?.id === 'finance-p-l', 'getActiveNode("finance-p-l") trả đúng node');

// 6. Mọi legacy route đều map tới một node id hợp lệ (không trống)
expect(
  Object.values(LEGACY_ROUTE_MAP).every((v) => v.length > 0),
  'mọi legacy route đều có node target không rỗng'
);

// 7. fidelity subTabs (khớp getSubTabs hiện tại, useInternalNavigationState 113-223)
const subVisible = (id: string, sub: string, role: string) =>
  getActiveNode(id)?.subTabs.some((s) => s.id === sub && s.visibleFor.includes(role as UserRole)) ?? false;
// 4 nút tài chính riêng (finance-p-l/costs/payroll/recon) KHÔNG có case trong getSubTabs
// → default [] → panel đơn, không có thanh sub-tab. Gộp chung thành 1 nút chỉ ở "finance-profit"
// (nút khác, thuộc lát sau). Nên registry giữ subTabs: [] — KHÔNG thêm UI mới.
expect(getActiveNode('finance-p-l')?.subTabs.length === 0, 'finance-p-l: panel đơn, không thanh sub-tab (khớp getSubTabs default)');
expect(getActiveNode('finance-recon')?.subTabs.length === 0, 'finance-recon: panel đơn, không thanh sub-tab (khớp getSubTabs default)');
expect(subVisible('staff-schedule', 'payroll', 'director'), 'staff-schedule: sub-tab payroll cho director');
expect(subVisible('staff-schedule', 'requests', 'employee'), 'staff-schedule: sub-tab requests cho employee');
expect(subVisible('attendance', 'approval', 'manager'), 'attendance: sub-tab approval cho manager');
expect(subVisible('attendance', 'clock', 'employee'), 'attendance: sub-tab clock cho employee');
// products-database DÙNG CHUNG thanh 5 sub-tab kho (getSubTabs case 134) — phải giữ đủ 5
expect(getActiveNode('products-database')?.subTabs.length === 5, 'products-database: thanh 5 sub-tab kho (khớp getSubTabs case 134)');
expect(subVisible('products-database', 'list', 'stocker'), 'products-database: sub-tab list cho stocker');

// 8. buildSidebarGroups — sidebar được dựng từ registry + legacy, gộp finance-recon, lọc role
const directorGroups = buildSidebarGroups('director');
const reconInDirector = directorGroups.flatMap(g => g.items).filter(i => i.id === 'finance-recon');
expect(reconInDirector.length === 1, 'director: finance-recon chỉ hiện DUY NHẤT 1 lần (gộp POS + Tài chính)');
expect(
  directorGroups.find(g => g.title === 'TÀI CHÍNH & KẾ TOÁN')?.items.some(i => i.id === 'finance-recon') === true,
  'finance-recon nằm trong nhóm TÀI CHÍNH & KẾ TOÁN (không còn ở POS)'
);

const cashierGroups = buildSidebarGroups('cashier');
expect(
  cashierGroups.flatMap(g => g.items).some(i => i.id === 'finance-recon') === true,
  'cashier VẪN thấy finance-recon sau khi gộp (giữ đường vào)'
);
expect(
  cashierGroups.flatMap(g => g.items).some(i => i.id === 'audit-logs') === false,
  'cashier KHÔNG thấy audit-logs (allowedRoles chỉ director)'
);
expect(cashierGroups.length <= 5, `cashier thấy ${cashierGroups.length} nhóm (<=5)`);

expect(
  directorGroups.some(g => g.items.some(i => i.id === 'logout')),
  'logout nằm trong một nhóm (QUẢN TRỊ HỆ THỐNG)'
);
// Thứ tự chuẩn: TÀI CHÍNH xuất hiện trước VẬN HÀNH
const idxFinance = directorGroups.findIndex(g => g.title === 'TÀI CHÍNH & KẾ TOÁN');
const idxHr = directorGroups.findIndex(g => g.title === 'VẬN HÀNH & NHÂN SỰ');
expect(idxFinance !== -1 && idxHr !== -1 && idxFinance < idxHr, 'TÀI CHÍNH xếp trước VẬN HÀNH (giữ thứ tự hiện tại)');

// 9. Task 4 contract — mọi node.component phải render được qua COMPONENT_KEYS
//    (guard: renderer đọc getActiveNode(activeTab).component; key lạ → render rỗng).
//    Bản thân JSX của renderer KHÔNG test được bằng tsx → xác nhận bằng npm run build
//    + bộ regression (run_all_tests).
expect(
  NAV_NODES.every((n) => COMPONENT_KEYS.includes(n.component)),
  'mọi node.component thuộc COMPONENT_KEYS (contract renderer Task 4)'
);
expect(
  COMPONENT_KEYS.length === 23,
  `COMPONENT_KEYS giữ đúng 23 key (hiện ${COMPONENT_KEYS.length})`
);

// 10. Task 5 contract — hook đọc DEFAULT_PER_ROLE + LEGACY_ROUTE_MAP; guard
//     pure-data để landing/alias không rơi về node cấm hoặc id không tồn tại.
// (a) DEFAULT_PER_ROLE[role] luôn là node mà role được phép mở (landing hợp lệ).
const ROLE_IDS: string[] = ['customer', 'employee', 'manager', 'director', 'accountant', 'cskh', 'cashier', 'stocker'];
expect(
  Object.entries(DEFAULT_PER_ROLE).every(
    ([role, target]) =>
      ROLE_IDS.includes(role) &&
      getActiveNode(target)?.allowedRoles.includes(role as UserRole) === true
  ),
  'DEFAULT_PER_ROLE: mọi role landing về node được phép (không cấm)'
);
// (b) Nhóm admin (director/manager) landing trong DEFAULT_PER_ROLE (registry-driven).
expect(
  ['director', 'manager'].every((r) => r in DEFAULT_PER_ROLE),
  'DEFAULT_PER_ROLE phủ đủ director + manager (vùng quản trị slice 1)'
);

// 11. Slice 2 data — POS/CSKH/KHO nodes exist + correct roles + dedup survives
expect(getActiveNode('cskh-hub')?.allowedRoles.join(',') === 'director,manager,cskh', 'cskh-hub roles = director,manager,cskh');
expect(getActiveNode('stocker-inventory')?.allowedRoles.includes('employee') === true, 'stocker-inventory visible to employee');
expect(getActiveNode('ai-copilot')?.allowedRoles.includes('cashier') === false, 'ai-copilot NOT visible to cashier');
expect(NAV_NODES.filter((n) => n.id === 'finance-recon').length === 1, 'finance-recon deduped to 1 node after region promotion');
const cashierItems = getNodesForRole('cashier').map((n) => n.id);
expect(cashierItems.includes('pos-sales') && cashierItems.includes('finance-recon'), 'cashier sees pos + finance-recon');
expect(cashierItems.includes('cskh-hub') === false, 'cashier does NOT see cskh-hub');

if (failed > 0) {
  console.error(`\n❌ NAV REGISTRY TEST: ${failed} assertions THẤT BẠI`);
  process.exit(1);
}
console.log('\n✅ NAV REGISTRY TEST: TẤT CẢ PASS');
