# Nav Registry — Slice 1 (Vùng Quản trị/Director) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo `NavRegistry` làm nguồn sự thật duy nhất cho điều hướng admin, và refactor sidebar + renderer + hook để phục vụ **vùng Quản trị/Director** (giữ 100% tính năng), các vùng khác (POS/CSKH/Kho) đi qua legacy fallback không đổi behavior.

**Architecture:** Một file `nav-registry.ts` thuần dữ liệu (types + node tree) được 3 phía đọc: `AppSidebar` (tự lọc node theo role, gộp `finance-recon`), `InternalTabRenderer` (render component theo node thay vì switch khổng lồ), và `useInternalNavigationState` (mỗi node 1 sub-tab state, bỏ if/else alias). Mỗi lát commit được, test được.

**Tech Stack:** Next.js (App Router), React 19, TypeScript 5, Tailwind, lucide-react. Test bằng `npx tsx` (registry là pure data) + `npm run build` + `scripts/run_all_tests.ts` (regression).

**Spec:** `docs/superpowers/specs/2026-11-04-admin-nav-registry-design.md`

## Global Constraints

- **Type `UserRole`:** `'customer' | 'employee' | 'manager' | 'director' | 'accountant' | 'cskh' | 'cashier' | 'stocker'` (import từ `@/types`, file `types/index.ts` dòng 57). Registry dùng type này, KHÔNG dùng `any[]`.
- **Giữ 100% tính năng:** mọi nút/sub-tab hiện có trong vùng quản trị phải tồn tại trong registry với cùng `allowedRoles` (copy đúng từ `menuGroups` + điều kiện sub-tab trong `getSubTabs`, KHÔNG suy đoán).
- **Không đổi route/app router:** lát này chỉ sửa components trong `components/internal/*`, KHÔNG sửa cấu trúc `app/`. (AGENTS.md cảnh báo Next.js có breaking change — nhưng lát này không tạo route mới nên rủi ro thấp. Nếu phải đụng `next/navigation`, đọc `node_modules/next/dist/docs/` trước.)
- **Không phá vai khác:** các nút POS/CSKH/Kho giữ logic hiện tại qua `registry.legacyRoute(...)`.
- **Mỗi lát:** sau khi xong, `npm run build` phải xanh và `npx tsx scripts/run_all_tests.ts` phải 100% PASS trước khi commit.

## Review Focus

1. **Nút `finance-recon` sau khi gộp về nhóm Tài chính** — cashier (có quyền `finance-recon` ở POS theo menuGroups dòng 85) phải VẪN thấy đường vào. *Kiểm: có cashier trong `allowedRoles` của node gộp.* → test Task 1.
2. **Director default landing** — hiện director rớt vào `overview`; không được thay đổi nếu không có lý do (spec không yêu cầu đổi). *Kiểm: `defaultPerRole['director']` = 'overview'.* → test Task 1.
3. **`audit-logs` chỉ hiện với director** (menuGroups dòng 137, allowedRoles=['director']). *Kiểm: node audit-logs `allowedRoles` chính xác.* → test Task 1.
4. **Sub-tab điều kiện theo role không trùng lặp/mất** (vd finance-profit: director+accountant thấy `p-l`, cashier thấy `recon`). *Kiểm: registry.subTabs cho finance-profit khớp getSubTabs hiện tại.* → test Task 2.
5. **Legacy fallback đúng cho vùng ngoài lát** (POS/CSKH/Kho) — khi activeId thuộc nhóm khác, renderer phải render đúng như cũ. *Kiểm: smoke build + 1 nút POS render qua legacyRoute không crash.* → Task 5.

---

### Task 1: `nav-registry.ts` — types + node tree + helper

**Files:**
- Create: `components/internal/nav/nav-registry.ts`
- Test: `scripts/test_nav_registry.ts`

**Interfaces:**
- Produces (đọc bởi Task 2-5):
  - `interface SubTabDef { id: string; name: string; visibleFor: UserRole[] }`
  - `type TabComponentKey = 'director-ops' | 'director-pl' | 'expenses' | 'staff-schedule' | 'attendance' | 'announcements' | 'audit-logs' | 'settings' | 'products-database' | 'finance-recon' | 'manager-reports' | 'overview'`
  - `interface NavNode { id: string; name: string; icon: string; group: 'management'|'finance'; allowedRoles: UserRole[]; subTabs: SubTabDef[]; component: TabComponentKey; badge?: 'pendingHr'|'announcements'|'lowStock'|'pendingOrders'; defaultSubTab?: string }`
  - `const NAV_NODES: NavNode[]`
  - `function getNodesForRole(role: UserRole): NavNode[]`
  - `function getActiveNode(id: string): NavNode | undefined`
  - `const DEFAULT_PER_ROLE: Partial<Record<UserRole, string>>`
  - `const LEGACY_ROUTE_MAP: Record<string, string>` (activeTab alias cũ → node.id, dùng bởi Task 5)

- [ ] **Step 1: Write the failing test**

Tạo `scripts/test_nav_registry.ts` (mô phỏng format các test khác trong `scripts/`, dùng `console.log` + `process.exit(1)` khi sai — xem `scripts/test_rate_limiter.ts` để sao chép pattern assert đơn giản):

```ts
// scripts/test_nav_registry.ts
import { NAV_NODES, getNodesForRole, getActiveNode, DEFAULT_PER_ROLE } from '../components/internal/nav/nav-registry';
import type { UserRole } from '../types';

let failed = 0;
function expect(cond: boolean, msg: string) { if (!cond) { console.error('❌ ' + msg); failed++; } }

// 1. finance-recon tồn tại DUY NHẤT (gộp), có cashier trong allowedRoles
const recons = NAV_NODES.filter(n => n.id === 'finance-recon');
expect(recons.length === 1, 'finance-recon phải có đúng 1 node');
expect(recons[0]?.allowedRoles.includes('cashier'), 'finance-recon (gộp) phải giữ quyền cashier');

// 2. director default là overview
expect(DEFAULT_PER_ROLE['director'] === 'overview', 'director default = overview');

// 3. audit-logs chỉ director
const audit = NAV_NODES.find(n => n.id === 'audit-logs');
expect(audit?.allowedRoles.join(',') === 'director', 'audit-logs allowedRoles chỉ director');

// 4. cashier sidebar gọn (<= 4 node)
expect(getNodesForRole('cashier').length <= 4, 'cashier thấy <=4 node');

// 5. getActiveNode
expect(getActiveNode('director-ops')?.id === 'director-ops', 'getActiveNode trả đúng node');

if (failed) { console.error(`${failed} assertions thất bại`); process.exit(1); }
console.log('✅ NAV REGISTRY TEST: TẤT CẢ PASS');
```

- [ ] **Step 2: Run test, xác nhận fail**

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: FAIL — module `nav-registry` chưa tồn tại.

- [ ] **Step 3: Implement `components/internal/nav/nav-registry.ts`**

Viết types + `NAV_NODES` (11 node vùng quản trị theo spec, `allowedRoles` copy **đúng** từ `menuGroups` trong AppSidebar + điều kiện `getSubTabs`), `DEFAULT_PER_ROLE`, `LEGACY_ROUTE_MAP`. Helper:

```ts
export function getNodesForRole(role: UserRole): NavNode[] {
  return NAV_NODES.filter(n => n.allowedRoles.includes(role));
}
export function getActiveNode(id: string) {
  return NAV_NODES.find(n => n.id === id);
}
```

> Lưu ý `icon`: registry dùng **tên string** của icon (vd `'TrendingUp'`), Task 3 map string→component lucide. Đừng import lucide vào registry (giữ pure data, dễ test).

- [ ] **Step 4: Run test, xác nhận pass**

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: `✅ NAV REGISTRY TEST: TẤT CẢ PASS`

- [ ] **Step 5: Commit**

```bash
git add components/internal/nav/nav-registry.ts scripts/test_nav_registry.ts
git commit -m "feat(nav): add NavRegistry data source + role filtering"
```

---

### Task 2: `subTabs` khớp `getSubTabs` hiện tại

**Files:**
- Modify: `components/internal/nav/nav-registry.ts` (điền `subTabs` cho từng node)
- Test: `scripts/test_nav_registry.ts` (thêm block)

**Interfaces:**
- Consumes: `SubTabDef` (Task 1).
- Produces: `node.subTabs` có `visibleFor: UserRole[]` — Task 4 dùng để render.

- [ ] **Step 1: Thêm test khớp điều kiện sub-tab hiện tại**

Copy logic `getSubTabs` (useInternalNavigationState dòng 113-223) thành assertion trong test:

```ts
// 6. finance-profit subTabs khớp hiện trạng (DirectorPLViewTab hiện dùng sub-tab p-l/recon/costs)
const fp = getActiveNode('finance-profit');
expect(fp?.subTabs.some(s => s.id === 'p-l' && s.visibleFor.includes('director')), 'finance-profit p-l cho director');
expect(fp?.subTabs.some(s => s.id === 'recon' && s.visibleFor.includes('cashier')), 'finance-profit recon cho cashier');
// 7. staff-schedule: director thấy payroll
const ss = getActiveNode('staff-schedule');
expect(ss?.subTabs.some(s => s.id === 'payroll' && s.visibleFor.includes('director')), 'staff-schedule payroll cho director');
// 8. attendance: manager thấy approval, employee thấy clock
const att = getActiveNode('attendance');
expect(att?.subTabs.some(s => s.id === 'approval' && s.visibleFor.includes('manager')), 'attendance approval cho manager');
expect(att?.subTabs.some(s => s.id === 'clock' && s.visibleFor.includes('employee')), 'attendance clock cho employee');
```

- [ ] **Step 2: Run, fail** (subTabs chưa điền đúng)

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: FAIL ở block 6-8.

- [ ] **Step 3: Điền `subTabs` cho từng node** trong `nav-registry.ts`, `visibleFor` sao chép **1-1** từ `getSubTabs` (dòng 113-223). Đối chiếu:
  - `finance-profit` (dòng 173-185), `staff-schedule` (dòng 159-172), `attendance` (dòng 146-158), `settings` (dòng 193-209), `customers` (dòng 210-219).

- [ ] **Step 4: Run, pass**

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/internal/nav/nav-registry.ts scripts/test_nav_registry.ts
git commit -m "feat(nav): fill subTabs with role-visibility matching legacy getSubTabs"
```

---

### Task 3: Sidebar đọc từ registry (gộp `finance-recon`, lọc role)

**Files:**
- Modify: `components/internal/AppSidebar.tsx`

**Interfaces:**
- Consumes: `getNodesForRole`, `NavNode`, `DEFAULT_PER_ROLE` (Task 1-2).

- [ ] **Step 1: Thay `menuGroups` + `isItemActive` bằng registry**

- Xóa `menuGroups` (dòng 69-142) và `isItemActive` (dòng 210-230).
- Render: `getNodesForRole(currentUser.role)` → group theo `node.group` + tên group. Map `icon: string` → lucide bằng một object nhỏ (import từ `lucide-react`).
- `isItemActive` giảm thành `activeId === node.id` (dùng `LEGACY_ROUTE_MAP` ngược: nhận `activeTab` truyền vào, map về node.id rồi so).
- **Badge:** map `node.badge` → count (dùng `getBadgeValue` hiện có, chỉ đổi key).

- [ ] **Step 2: Xác nhận gộp + lọc**

Chạy dev, login vai **director** và vai **cashier**:
- Director: thấy các node vùng quản trị + tài chính, `finance-recon` chỉ hiện 1 lần (nhóm Tài chính).
- Cashier: sidebar gọn (~3-4 node), không thấy audit-logs.

Run: `npm run build` (xanh).

- [ ] **Step 3: Run regression + registry test**

Run: `npx tsx scripts/test_nav_registry.ts && npx tsx scripts/run_all_tests.ts`
Expected: registry PASS + regression 100% PASS.

- [ ] **Step 4: Commit**

```bash
git add components/internal/AppSidebar.tsx
git commit -m "refactor(nav): sidebar renders from NavRegistry, dedupe finance-recon"
```

---

### Task 4: Renderer đọc từ registry (vùng quản trị)

**Files:**
- Modify: `components/internal/tabs/InternalTabRenderer.tsx`

**Interfaces:**
- Consumes: `getActiveNode`, `NavNode.subTabs`, `TabComponentKey`.

- [ ] **Step 1: Thêm vùng registry-driven phía trên renderer**

Thêm mapping `TabComponentKey` → component React (import các tab: `DirectorOperationsTab`, `DirectorPLViewTab`, `ExpensesManagementTab`, `StaffAccountDirectoryTab`, `ManagerStaffApprovalTab`, `AnnouncementsTab`, `ManagerReportsTab`, ...). Render:

```tsx
const node = getActiveNode(activeTab);
if (node) { /* render node.component với scoped props */ }
```

Mỗi component chỉ nhận props cần (đọc từ props hiện có của InternalTabRenderer, không đổi gì bên trên). **Giữ nguyên** khối ERPSubsystems + các tab vùng POS/CSKH/Kho cho lát sau.

- [ ] **Step 2: Xác nhận vùng quản trị render đúng qua registry**

Login director, duyệt các node: `director-ops`, `director-pl`, `expenses`, `staff-schedule`, `attendance`, `announcements`, `audit-logs`. Mỗi cái render đúng component cũ.

Run: `npm run build`.

- [ ] **Step 3: Regression + registry test**

Run: `npx tsx scripts/test_nav_registry.ts && npx tsx scripts/run_all_tests.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/internal/tabs/InternalTabRenderer.tsx
git commit -m "refactor(nav): admin/director tabs render via NavRegistry node.component"
```

---

### Task 5: Hook điều hướng dùng registry + legacy fallback

**Files:**
- Modify: `components/internal/hooks/useInternalNavigationState.ts`
- Test: `scripts/test_nav_registry.ts` (thêm case legacy)

**Interfaces:**
- Consumes: `DEFAULT_PER_ROLE`, `LEGACY_ROUTE_MAP`, `NavNode.defaultSubTab`.

- [ ] **Step 1: Viết test legacyRoute không crash cho vùng ngoài lát**

```ts
// 9. legacy fallback: alias POS còn map được, không trả undefined gây crash
const LEGACY = getActiveNode ? undefined : undefined; // placeholder — thực tế:
import { LEGACY_ROUTE_MAP } from '../components/internal/nav/nav-registry';
expect(Object.values(LEGACY_ROUTE_MAP).every(v => v), 'mọi legacy route đều có node target');
```

- [ ] **Step 2: Refactor hook**

- Bỏ 8 sub-tab state rời (dòng 10-17) → 1 `activeSubTab` (default từ `node.defaultSubTab`).
- `handleSidebarChange` / `setCurrentSubTab` / `getSubTabs` (dòng 79-223): đọc từ registry; alias cũ đi qua `LEGACY_ROUTE_MAP` (dòng `pos-sales` → node, v.v.).
- useEffect role-landing (dòng 38-55): dùng `DEFAULT_PER_ROLE[role]`.

- [ ] **Step 3: Verify các vai không đổi behavior**

Login: director, cashier, stocker, cskh. Mỗi vai: tab mặc định landing đúng như cũ (vd cashier→`pos-sales`), chuyển tab vùng quản trị hoạt động, vùng POS/Kho (legacy) vẫn render (không crash).

Run: `npm run build && npx tsx scripts/test_nav_registry.ts && npx tsx scripts/run_all_tests.ts`
Expected: build xanh, registry PASS, regression 100% PASS.

- [ ] **Step 4: Commit**

```bash
git add components/internal/hooks/useInternalNavigationState.ts scripts/test_nav_registry.ts
git commit -m "refactor(nav): navigation hook driven by NavRegistry + legacy fallback"
```

---

### Task 6: Dọn page orchestrator (giảm props)

**Files:**
- Modify: `app/internal/page.tsx`

**Interfaces:**
- Consumes: hook registry-driven (Task 5), renderer registry-driven (Task 4).

- [ ] **Step 1: Gom các sub-tab prop khỏi page**

Sau Task 5, page không còn cần truyền 8 sub-tab setter + các alias props cho vùng quản trị (hook tự xử). Giảm số props `InternalTabRenderer` nhận cho các node quản trị. **Giữ** props vùng POS/CSKH/Kho (vẫn cần cho lát sau).

- [ ] **Step 2: Verify tổng thể**

Run: `npm run build && npx tsx scripts/run_all_tests.ts`
Expected: build xanh, regression 100% PASS. So sánh số dòng `app/internal/page.tsx` (mục tiêu: giảm rõ so với 469).

- [ ] **Step 3: Commit**

```bash
git add app/internal/page.tsx
git commit -m "refactor(nav): slim admin orchestrator props via NavRegistry"
```

---

## Ghi chú cho người thực thi

- Pattern test: sao chép cách `scripts/test_rate_limiter.ts` assert (Node, không dùng framework test).
- Trước mỗi lát sửa, `git status` sạch (commit lát trước đã xong).
- `icon: string` → lucide: tạo map trong `AppSidebar` (Task 3), giữ registry pure data.
- Nếu đụng `next/navigation` hay route: đọc `node_modules/next/dist/docs/` trước (AGENTS.md).
