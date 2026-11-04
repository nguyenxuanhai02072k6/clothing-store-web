import {
  NAV_NODES,
  getNodesForRole,
  getActiveNode,
  DEFAULT_PER_ROLE,
  LEGACY_ROUTE_MAP,
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

// 4. cashier sidebar gọn (<= 4 node)
expect(getNodesForRole('cashier').length <= 4, `cashier thấy ${getNodesForRole('cashier').length} node (<=4)`);

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

if (failed > 0) {
  console.error(`\n❌ NAV REGISTRY TEST: ${failed} assertions THẤT BẠI`);
  process.exit(1);
}
console.log('\n✅ NAV REGISTRY TEST: TẤT CẢ PASS');
