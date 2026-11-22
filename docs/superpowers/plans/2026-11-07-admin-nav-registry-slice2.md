# Nav Registry — Slice 2 (Vùng POS / CSKH / KHO + single-source landing & alias) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the three remaining regions (POS, CSKH, KHO) from Slice-1's embedded `LEGACY_GROUPS` fallback into first-class `NAV_NODES`, so the **sidebar, active-state, sub-tab bars, and role-landing all read from ONE data source**; then delete the now-dead legacy "family parent" alias machinery.

**Architecture:** Two halves. **(A) Data** — extend `NAV_NODES` with the 11 POS/CSKH/KHO leaf nodes (reusing the exact role lists / badges / icons already in `LEGACY_GROUPS`), add a `resolveNav(activeTab)` alias-normalizer, and extend `DEFAULT_PER_ROLE` to every role. **(B) Wiring** — `buildSidebarGroups` reads POS/CSKH/KHO from `NAV_NODES` instead of `LEGACY_GROUPS`; the hook drops its hardcoded role-landing + **dead** family-parent sub-tab code; the renderer's ~30 alias if-chains collapse to `resolveNav`. **Content rendering (hub `ERPSubsystems` + domain JSX blocks) is untouched** — per spec, POS/CSKH/KHO keep their current render path this slice; only *navigation* becomes single-sourced.

**Tech Stack:** Next.js App Router, React 19, TypeScript 5, Tailwind 4, lucide-react. Pure-data layer tested with `npx tsx` (mirrors `scripts/test_nav_registry.ts`); JSX changes gated by `npm run build` + `npx tsx scripts/run_all_tests.ts`.

**Spec:** `docs/superpowers/specs/2026-11-04-admin-nav-registry-design.md` (Slice-1 spec §3 + the "Cắt lát" note: "Các nút vùng khác (POS, CSKH, Kho) giữ nguyên logic hiện tại qua một fallback `registry.legacyRoute` trong lát này"). Slice-1 plan: `docs/superpowers/plans/2026-11-04-admin-nav-registry-slice1.md`.

## Global Constraints

- **Single source of truth:** after Slice 2, `NAV_NODES` is the ONLY data feeding `buildSidebarGroups`, active-state resolution, and role-landing. `LEGACY_GROUPS` and `LEGACY_ROUTE_MAP` are **deleted** (content absorbed into `NAV_NODES` / `NAV_ALIAS`).
- **Preserve every visible item & role:** each new node's `allowedRoles`, `badge`, `icon`, `name`, group, and order are copied **verbatim** from `LEGACY_GROUPS` (`nav-registry.ts:286-334`) and original `menuGroups` (`git show c54d0fb:components/internal/AppSidebar.tsx` lines 69-155). Do not "fix up" role lists.
- **Do NOT change content rendering:** the `ERPSubsystems` switch + the domain blocks in `InternalTabRenderer.tsx` keep rendering exactly what they do today. Slice 2 only changes *which navigation values reach them*, not *what they render*.
- **Reachable ids are leaf ids only.** The live `activeTab` values are the sidebar / command-palette / pending-action targets: `pos-sales, sales-orders-list, stocker-inventory, stocker-transfer, damaged-goods, restock, cskh-hub, returns-exchange, customers-list, reviews, ai-copilot` + admin/finance slice-1 ids + `shifts`. The **family parent** ids `sales-orders, customers, promotions, products-inventory, finance-profit, settings-roles` are **never set by live code** (verified: no `setActiveTab('<family-parent>')` literal outside the hook's own unreachable branches) → delete, not port.
- **KHO sub-tab bar is PRESERVED.** The 4 warehouse items currently show the 5-pill `products-inventory` family bar (a *live* case, because `stocker-inventory/transfer/damaged-goods/restock` and `products-database` are all reachable). So the warehouse `NAV_NODES` get `subTabs: []` (registry gives them no *new* bar) **but** the legacy `products-inventory` `getSubTabs` case is **kept**. A *later* slice may retire the redundant pill bar; this slice does not. (POS/CSKH items show no pill bar today → their dead `sales-orders`/`customers`/`promotions` cases are deleted.)
- **Component-key guard:** Slice-1 test #9 pins `COMPONENT_KEYS.length === 12` + "every `node.component` ∈ `COMPONENT_KEYS`". Adding 11 nodes **breaks** this — Task 1 updates it to 23.
- **Every task:** `npx tsx scripts/test_nav_registry.ts` PASS + `npm run build` green + `npx tsx scripts/run_all_tests.ts` 100% PASS before commit.

## Review Focus

1. **Sidebar parity after promoting regions** — for each role, the visible item set + order + group titles must equal pre-Slice-2 (which rendered `LEGACY_GROUPS`). A wrong `allowedRoles` copy hides or grants a menu. → Task 1 tests assert per-role id-sets.
2. **`shifts` alias landing** — `PendingActionsPanel.tsx:107` sets `activeTab='shifts'`; active-state + content must still hit `staff-schedule`/`shifts`. → Task 2 test pins `resolveNav('shifts')`.
3. **`finance-recon` still appears exactly once** (Slice-1 dedup must survive region promotion; it lives in `NAV_NODES`, not a region group). → Task 1 test.
4. **KHO 5-pill bar stays** — after the sidebar reads from `NAV_NODES`, a stocker on `stocker-inventory` must still see the 5-pill `products-inventory` bar. → Task 4 keeps the legacy case; verified by unchanged `getSubTabs` products-inventory branch.
5. **Role-landing unchanged** — cashier/employee→`pos-sales`, cskh→`cskh-hub`, stocker→`stocker-inventory`(sub `matrix`), accountant→`finance-costs`. → Task 3 test pins `DEFAULT_PER_ROLE`.
6. **Dead family-branch removal leaves no dangling reference** — deleting the *dead* `sales-orders`/`customers`/`promotions` sub-tab branches must not break the **kept** sub-tab states that the renderer still reads. → Task 4 keeps all sub-tab states; deletes only unreachable branches; grep-gated.

---

### Task 1: Promote POS/CSKH/KHO into `NAV_NODES` (data only)

**Files:**
- Modify: `components/internal/nav/nav-registry.ts` (append 11 nodes to `NAV_NODES`; extend `GroupKey`; extend `COMPONENT_KEYS`)
- Test: `scripts/test_nav_registry.ts` (extend; fix the count assertion)

**Interfaces:**
- Consumes: existing `NavNode`, `UserRole`, `ALL`/`ADMIN` consts in `nav-registry.ts`.
- Produces: 11 new `NAV_NODES` entries (`pos-sales, sales-orders-list, cskh-hub, returns-exchange, customers-list, reviews, ai-copilot, stocker-inventory, stocker-transfer, damaged-goods, restock`); `COMPONENT_KEYS` now 23.

The 11 node definitions (copy roles/badges/icons **verbatim** from `LEGACY_GROUPS` at `nav-registry.ts:286-334`):

| id | name | icon | group | allowedRoles | badge |
|---|---|---|---|---|---|
| `pos-sales` | Quầy POS Bán Lẻ | `ShoppingBag` | `pos` | director,manager,employee,cashier | — |
| `sales-orders-list` | Danh sách đơn hàng | `FileText` | `pos` | `ALL`¹ | `pendingOrders` |
| `cskh-hub` | CSKH Console (Live Chat) | `MessageSquare` | `cskh` | director,manager,cskh | — |
| `returns-exchange` | Phiếu đổi trả & Khiếu nại | `RotateCcw` | `cskh` | director,manager,cskh,employee,cashier | — |
| `customers-list` | Khách hàng & Hạng VIP | `Crown` | `cskh` | director,manager,cskh,employee,cashier | — |
| `reviews` | Đánh giá từ khách | `Star` | `cskh` | director,cskh,manager | — |
| `ai-copilot` | Trợ lý AI Marketing | `Sparkles` | `cskh` | director,manager,cskh | — |
| `stocker-inventory` | Tồn kho 2 chi nhánh | `Layers` | `warehouse` | director,manager,stocker,accountant,cashier,employee | `lowStock` |
| `stocker-transfer` | Điều chuyển kho | `ArrowRightLeft` | `warehouse` | director,manager,stocker,accountant | — |
| `damaged-goods` | Biên bản hàng lỗi | `AlertTriangle` | `warehouse` | director,manager,stocker,cskh,accountant | — |
| `restock` | Phiếu nhập hàng | `FileDown` | `warehouse` | director,manager,stocker,accountant | — |

¹ `sales-orders-list` had no `allowedRoles` in `LEGACY_GROUPS` (visible to all group-gated staff) → use `ALL` (staff-only, no customer).

Each new node: `subTabs: []`; `component:` = its own id (added to `COMPONENT_KEYS`); `group` extended with `'pos' | 'cskh' | 'warehouse'`.

- [ ] **Step 1: Add the 11 nodes + extend `GroupKey`/`COMPONENT_KEYS` in `nav-registry.ts`**

Add `'pos' | 'cskh' | 'warehouse'` to `GroupKey` (line 45). Append the 11 `NavNode` objects to `NAV_NODES` (after `finance-p-l`, before the closing `]`). Extend `COMPONENT_KEYS` (line 32) with the 11 new ids → 23 total.

- [ ] **Step 2: Fix the now-stale count test in `test_nav_registry.ts`**

`expect(COMPONENT_KEYS.length === 12, ...)` → `=== 23`; the "every `node.component` ∈ `COMPONENT_KEYS`" expectation now spans all 23 nodes.

- [ ] **Step 3: Add per-role parity + dedup tests (data)**

Append to `test_nav_registry.ts`:

```ts
expect(getActiveNode('cskh-hub')?.allowedRoles.join(',') === 'director,manager,cskh', 'cskh-hub roles');
expect(getActiveNode('stocker-inventory')?.allowedRoles.includes('employee') === true, 'stocker-inventory visible to employee');
expect(getActiveNode('ai-copilot')?.allowedRoles.includes('cashier') === false, 'ai-copilot NOT visible to cashier');
expect(NAV_NODES.filter(n => n.id === 'finance-recon').length === 1, 'finance-recon deduped to 1 node after region promotion');
const cashierItems = getNodesForRole('cashier').map(n => n.id);
expect(cashierItems.includes('pos-sales') && cashierItems.includes('finance-recon'), 'cashier sees pos + finance-recon');
expect(cashierItems.includes('cskh-hub') === false, 'cashier does NOT see cskh-hub');
```

- [ ] **Step 4: Run test**

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: PASS (all old + new assertions).

- [ ] **Step 5: Commit**

```bash
git add components/internal/nav/nav-registry.ts scripts/test_nav_registry.ts
git commit -m "feat(nav): promote POS/CSKH/KHO regions into NAV_NODES (slice 2 data)"
```

---

### Task 2: `resolveNav()` alias-normalizer (replaces `LEGACY_ROUTE_MAP` + if-chains)

**Files:**
- Modify: `components/internal/nav/nav-registry.ts` (add `resolveNav` + `NAV_ALIAS`; delete `LEGACY_ROUTE_MAP`)
- Test: `scripts/test_nav_registry.ts`

**Interfaces:**
- Produces: `resolveNav(activeTab: string): { node?: NavNode; subTab?: string }` — canonical node + default sub-tab for any reachable id **or** legacy alias. Role-independent (the sidebar already gates by role). `NAV_ALIAS: Record<string,string>` = superset of today's `LEGACY_ROUTE_MAP` (`nav-registry.ts:222-262`) + live region ids + `shifts`→`staff-schedule`.

- [ ] **Step 1: Write the failing test**

```ts
const rv = (id: string) => resolveNav(id);
expect(rv('pos-sales')?.node?.id === 'pos-sales', 'pos-sales canonical');
expect(rv('sales-orders-list')?.node?.id === 'sales-orders-list', 'sales-orders-list canonical');
expect(rv('cskh-hub')?.node?.id === 'cskh-hub', 'cskh-hub canonical');
expect(rv('shifts')?.node?.id === 'staff-schedule' && rv('shifts')?.subTab === 'shifts', 'shifts → staff-schedule/sub shifts');
expect(rv('manager-shift-overview')?.node?.id === 'staff-schedule', 'legacy alias manager-shift-overview → staff-schedule');
expect(rv('branch-stock')?.node?.id === 'stocker-inventory', 'legacy alias branch-stock → stocker-inventory');
expect(rv('recon')?.node?.id === 'finance-recon', 'legacy alias recon → finance-recon');
expect(rv('unknown-id-xyz')?.node === undefined, 'unknown id → undefined node (graceful)');
```

- [ ] **Step 2: Run — verify fail**

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: FAIL "resolveNav is not defined".

- [ ] **Step 3: Implement `resolveNav` + `NAV_ALIAS`; delete `LEGACY_ROUTE_MAP`**

`NAV_ALIAS` = every existing `LEGACY_ROUTE_MAP` entry (verbatim) + region leaf ids → themselves + `shifts`→`staff-schedule`.

```ts
export function resolveNav(activeTab: string): { node?: NavNode; subTab?: string } {
  const canonical = NAV_ALIAS[activeTab] ?? activeTab;
  const node = getActiveNode(canonical);
  return { node, subTab: node?.defaultSubTab };
}
```

(For `shifts`, `getActiveNode('staff-schedule').defaultSubTab` is `'shifts'` — set in Slice-1 — so no special-case needed.) Replace `export const LEGACY_ROUTE_MAP` with `export const NAV_ALIAS` (superset). Update the import in `AppSidebar.tsx:37` and `AppSidebar.tsx:154` (`LEGACY_ROUTE_MAP` → `NAV_ALIAS`; `activeItemTarget = NAV_ALIAS[activeTab] ?? activeTab`).

- [ ] **Step 4: Run — verify pass**

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: PASS. Confirm no leftover: `grep -rn "LEGACY_ROUTE_MAP" scripts/ components/` → only `nav-registry.ts` (the removed symbol) / none.

- [ ] **Step 5: Commit**

```bash
git add components/internal/nav/nav-registry.ts components/internal/AppSidebar.tsx scripts/test_nav_registry.ts
git commit -m "refactor(nav): add resolveNav alias-normalizer, retire LEGACY_ROUTE_MAP"
```

---

### Task 3: Role-landing from registry (drop hook hardcode)

**Files:**
- Modify: `components/internal/nav/nav-registry.ts` (`DEFAULT_PER_ROLE` → all roles; `stocker-inventory` gains `defaultSubTab: 'matrix'`)
- Modify: `components/internal/hooks/useInternalNavigationState.ts` (replace landing `if/else` at ~lines 56-76 with `DEFAULT_PER_ROLE`)
- Test: `scripts/test_nav_registry.ts`

**Interfaces:**
- Produces: `DEFAULT_PER_ROLE` now covering `cashier, employee, cskh, stocker, accountant` + existing `director, manager`. `stocker-inventory` node gains `defaultSubTab: 'matrix'` so the registry read reproduces the legacy `setProductsInventorySubTab('matrix')` landing.

Landing targets (from hook lines 62-75): cashier/employee→`pos-sales`, cskh→`cskh-hub`, stocker→`stocker-inventory`(sub `matrix`), accountant→`finance-costs`.

- [ ] **Step 1: Write failing test**

```ts
expect(DEFAULT_PER_ROLE['cskh'] === 'cskh-hub', 'cskh lands cskh-hub');
expect(DEFAULT_PER_ROLE['stocker'] === 'stocker-inventory', 'stocker lands stocker-inventory');
expect(DEFAULT_PER_ROLE['cashier'] === 'pos-sales' && DEFAULT_PER_ROLE['employee'] === 'pos-sales', 'cashier/employee land pos-sales');
expect(DEFAULT_PER_ROLE['accountant'] === 'finance-costs', 'accountant lands finance-costs');
```

- [ ] **Step 2: Run — verify fail** (only director/manager present today)

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: FAIL on the new `DEFAULT_PER_ROLE` lines.

- [ ] **Step 3: Extend `DEFAULT_PER_ROLE` + add `stocker-inventory.defaultSubTab:'matrix'`; wire hook**

In `nav-registry.ts`, extend `DEFAULT_PER_ROLE` (line 213) with the 5 roles; set `defaultSubTab: 'matrix'` on `stocker-inventory`. In the hook, replace the landing `if/else` (lines ~62-75) with:

```ts
const landing = DEFAULT_PER_ROLE[role];
if (landing) {
  setActiveTab(landing);
  const sub = getActiveNode(landing)?.defaultSubTab;
  if (sub === 'matrix') setProductsInventorySubTab('matrix');
  if (sub === 'pos') setSalesOrdersSubTab('pos');
}
```

(The admin path already reads `DEFAULT_PER_ROLE`; keep it.)

- [ ] **Step 4: Run — verify pass**

Run: `npx tsx scripts/test_nav_registry.ts`
Expected: PASS.

- [ ] **Step 5: Build + regression gate**

Run: `npm run build && npx tsx scripts/run_all_tests.ts`
Expected: build green, 10/10 suites PASS.

- [ ] **Step 6: Commit**

```bash
git add components/internal/nav/nav-registry.ts components/internal/hooks/useInternalNavigationState.ts scripts/test_nav_registry.ts
git commit -m "refactor(nav): route all role-landing through DEFAULT_PER_ROLE (slice 2)"
```

---

### Task 4: Sidebar + sub-tab bars single-sourced; delete **dead** family branches only

**Files:**
- Modify: `components/internal/nav/nav-registry.ts` (`buildSidebarGroups` → all groups from `NAV_NODES`; remove `LEGACY_GROUPS`/`LegacyItem`; order via `GROUP_ORDER`)
- Modify: `components/internal/hooks/useInternalNavigationState.ts` (delete the **dead** `sales-orders`/`customers`/`promotions` sub-tab branches in `getSubTabs` + `setCurrentSubTab`; **keep** the `products-inventory` family case for the KHO 5-pill bar)
- Test: `scripts/test_nav_registry.ts`

**Interfaces:**
- `buildSidebarGroups(role)` now sources **all** groups from `NAV_NODES` grouped by node `group`, ordered by `GROUP_ORDER` (7 titles: TỔNG QUAN, BÁN HÀNG & POS, CSKH & CRM, KHO VẬN & HÀNG HÓA, TÀI CHÍNH & KẾ TOÁN, VẬN HÀNH & NHÂN SỰ, QUẢN TRỊ HỆ THỐNG). `LEGACY_GROUPS` (nav-registry.ts:286-334) is **removed**; its items live in `NAV_NODES` (Task 1). `groupRoles` gating + `logout` item preserved.
- Sub-tab states `salesOrdersSubTab`/`customersSubTab`/`promotionsSubTab`/`financeProfitSubTab`/`settingsRolesSubTab`/`productsInventorySubTab` are **KEPT** (still passed to renderer domain blocks — Review Focus #6). Only the **unreachable family-parent** branches are deleted; the `products-inventory` warehouse case is **kept** (Review Focus #4).

- [ ] **Step 1: Grep-confirm which family cases are dead (gate before deleting)**

Run: `grep -rn "setActiveTab('sales-orders')\|setActiveTab('customers')\|setActiveTab('promotions')\|setActiveTab('products-inventory')\|setActiveTab('finance-profit')\|setActiveTab('settings-roles')\|setActiveTab('stocker-inventory')\|setActiveTab('restock')\|setActiveTab('damaged-goods')\|setActiveTab('stocker-transfer')" --include=*.tsx --include=*.ts app/ components/`
Expected: `products-inventory` and the POS/CSKH parents (`sales-orders`/`customers`/`promotions`) have **no live producer** → dead; but `stocker-inventory`/`stocker-transfer`/`damaged-goods`/`restock`/`settings-roles` DO have producers (PendingActionsPanel, CommandPalette, hook) → **live**. This is the exact split: delete the POS/CSKH families + `finance-profit` parent; **keep** the warehouse family (`products-inventory` case covers the live `stocker-*`/`restock`/`products-database` ids). If a "dead" id has a live producer, STOP and re-scope.

- [ ] **Step 2: Rewrite `buildSidebarGroups` to read POS/CSKH/KHO from `NAV_NODES`**

Replace the `LEGACY_GROUPS` array + the `leg`-branch in `buildSidebarGroups` (nav-registry.ts:286-394) so every group's items come from `NAV_NODES` filtered by `group` + `allowedRoles`, ordered per `GROUP_ORDER`. Remove the unused `LEGACY_GROUPS`/`LegacyItem`. Keep `groupRoles` gating for the gated groups (TỔNG QUAN; TÀI CHÍNH & KẾ TOÁN incl. cashier; QUẢN TRỊ HỆ THỐNG) and the `logout` item appended to QUẢN TRỊ HỆ THỐNG.

- [ ] **Step 3: Extend sidebar parity tests**

```ts
const cskhItems = buildSidebarGroups('cskh').flatMap(g => g.items.map(i => i.id));
expect(cskhItems.includes('cskh-hub') && cskhItems.includes('customers-list') && cskhItems.includes('ai-copilot'), 'cskh sees CSKH items');
expect(cskhItems.includes('pos-sales') === false, 'cskh does NOT see pos-sales');
const stockerItems = buildSidebarGroups('stocker').flatMap(g => g.items.map(i => i.id));
expect(stockerItems.includes('stocker-transfer') && stockerItems.includes('restock'), 'stocker sees kho items');
expect(buildSidebarGroups('director').flatMap(g => g.items).filter(i => i.id === 'finance-recon').length === 1, 'director finance-recon single');
```

- [ ] **Step 4: Delete the dead POS/CSKH family sub-tab branches in the hook (keep warehouse)**

In `getSubTabs` (useInternalNavigationState.ts ~153-233): delete `case 'sales-orders'`, `case 'customers'`, `case 'promotions'` blocks. **Keep** the `products-inventory`/`stocker-inventory`/`stocker-transfer`/`damaged-goods`/`restock`/`products-database` combined case (the KHO 5-pill bar). In `setCurrentSubTab` (~100-130): delete the `if (activeTab==='sales-orders')`, `customers`, `promotions` branches; **keep** the `products-inventory` family branch (with its `setActiveTab('stocker-inventory')`/`'restock'`/`'products-database'` live side-effects). Update `REGISTRY_SUBTAB_NODES` (line 13) to add `products-database` is already there; no new region node has registry sub-tabs, so leave it otherwise unchanged.

- [ ] **Step 5: Run test + build + regression**

Run: `npx tsx scripts/test_nav_registry.ts && npm run build && npx tsx scripts/run_all_tests.ts`
Expected: all PASS / green.

- [ ] **Step 6: Commit**

```bash
git add components/internal/nav/nav-registry.ts components/internal/hooks/useInternalNavigationState.ts scripts/test_nav_registry.ts
git commit -m "refactor(nav): sidebar single-sourced from NAV_NODES; drop LEGACY_GROUPS + dead POS/CSKH family branches (keep KHO bar)"
```

---

### Task 5: Collapse renderer alias if-chains to `resolveNav` (content untouched)

**Files:**
- Modify: `components/internal/tabs/InternalTabRenderer.tsx` (replace alias inputs with `resolveNav`; keep domain blocks + hub switch rendering identical)
- Test: `scripts/test_nav_registry.ts`

**Interfaces:**
- Consumes: `resolveNav` (Task 2).
- The renderer's **JSX output is behavior-identical**: for every reachable leaf id, `resolveNav(activeTab).node.id` selects the same component the legacy branch produced. ~30 alias comparisons (e.g. `activeTab==='pos-sales' || (activeTab==='sales-orders' && salesOrdersSubTab==='pos')`) collapse to `resolveNav(activeTab).node.id`. Domain blocks + `ERPSubsystems` switch are **not** re-rendered differently (Review Focus: unchanged component set).

- [ ] **Step 1: Record the "before" — which component fires per reachable leaf id**

Note from this plan's mapping: `pos-sales`→`MultiCartPOS`, `stocker-*`→hub warehouse subsystems, `cskh-hub`/`customers-list`→`CSKHCRMSubsystem` **plus** domain blocks 17/18 (`CSKHLiveChatHubTab`/`CustomersLoyaltyTab`) — the known double-render, left as-is.

- [ ] **Step 2: Replace alias comparisons with `resolveNav` in `InternalTabRenderer.tsx`**

  - Registry switch trigger (line ~229): `const { node } = resolveNav(activeTab);` then `switch (node?.component)` (was `getActiveNode(activeTab)`).
  - `ERPSubsystems` `activeTab={...}` 12-line ternary (~341-359): reduce to the canonical node id from `resolveNav`; **keep** the `''` suppression for slice-1 direct-node ids (`products-database`/`finance-payroll`/`finance-recon`/`settings`).
  - Domain blocks 19/20/8 (SalesOrdersManagerTab, CustomerReviewsTab, RestockOperationsTab): resolve aliases via `resolveNav(activeTab).node.id` (e.g. `activeTab==='sales-orders-list'` now canonical) so they still fire. **Do not change which component each block renders.**

- [ ] **Step 3: Diff-check content untouched**

Run: `git diff --stat components/internal/tabs/InternalTabRenderer.tsx`, then confirm the set of **components** used (MultiCartPOS, VariantStockMatrix, CSKHCRMSubsystem, CSKHLiveChatHubTab, CustomersLoyaltyTab, CustomerReviewsTab, SalesOrdersManagerTab, RestockOperationsTab, …) is unchanged — only selection *conditions* changed.

- [ ] **Step 4: Run test + build + regression**

Run: `npx tsx scripts/test_nav_registry.ts && npm run build && npx tsx scripts/run_all_tests.ts`
Expected: all PASS / green.

- [ ] **Step 5: Commit**

```bash
git add components/internal/tabs/InternalTabRenderer.tsx scripts/test_nav_registry.ts
git commit -m "refactor(nav): renderer resolves region nodes via resolveNav (content unchanged)"
```

---

### Task 6: Retire dead helpers, final gate

**Files:**
- Modify: `components/internal/AppSidebar.tsx`, `components/internal/AppHeader.tsx` (use `resolveNav`/`NAV_ALIAS`; alias title lookups → canonical)
- Modify: `app/internal/page.tsx` (audit-log fetch condition → `resolveNav`)

**Interfaces:**
- `page.tsx` lines 148-155 (audit-log `useEffect`) and `AppHeader.tsx` title/breadcrumb lookups now resolve through `resolveNav`/`NAV_ALIAS` instead of hardcoded alias strings.

- [ ] **Step 1: Update `page.tsx` audit-log fetch + `AppHeader`/`AppSidebar` alias lookups**

Replace `nav.activeTab === 'audit-logs' || (nav.activeTab === 'settings-roles' && nav.settingsRolesSubTab === 'audit-logs')` with `resolveNav(nav.activeTab).node?.id === 'audit-logs'`. In `AppHeader.tsx` (~line 113), `activeTab==='finance-p-l' || activeTab==='finance-profit'` → `resolveNav(activeTab).node?.id === 'finance-p-l'`. Same for other alias-string title checks.

- [ ] **Step 2: Grep for leftover dead aliases**

Run: `grep -rn "'products-inventory'\|'finance-profit'\|'settings-roles'\|'cskh-live-chat'\|'cskh-customers'\|'branch-stock'\|LEGACY_GROUPS\|LEGACY_ROUTE_MAP" --include=*.tsx --include=*.ts app/ components/ scripts/ | grep -v "NAV_ALIAS\|resolveNav"`
Expected: nothing live outside `NAV_ALIAS` values / doc comments. Anything live outside `NAV_ALIAS` is a bug — fix or note.

- [ ] **Step 3: Final gate**

Run: `npx tsx scripts/test_nav_registry.ts && npm run build && npx tsx scripts/run_all_tests.ts`
Expected: all PASS / green. Confirm `LEGACY_GROUPS`/`LEGACY_ROUTE_MAP` are gone: `grep -rn "LEGACY_GROUPS\|LEGACY_ROUTE_MAP" components/ scripts/` → none.

- [ ] **Step 4: Commit**

```bash
git add app/internal/page.tsx components/internal/AppHeader.tsx components/internal/AppSidebar.tsx
git commit -m "refactor(nav): retire legacy alias helpers; final slice-2 gate"
```

---

## Out of scope (flagged, NOT changed this slice)

- **KHO 5-pill bar redundancy** — the warehouse sidebar items and the 5-pill `products-inventory` bar are duplicates. This slice *preserves* the bar (Task 4); a follow-up slice can drop it and give `stocker-*`/`products-database` a clean single registry sub-tab bar.
- **Double-render** at `cskh-hub` (`CSKHCRMSubsystem` hub + `CSKHLiveChatHubTab` block 17) and `customers-list` (hub + `CustomersLoyaltyTab` block 18). Left byte-identical per the spec's legacy-fallback rule. A follow-up picks the authoritative panel per node.
- **Content-rendering rewrite** of POS/CSKH/KHO to the Slice-1 registry switch (hub/blocks stay).
- `shifts` alias could be retired by pointing `PendingActionsPanel` at `staff-schedule`+sub `shifts` — kept as an alias now (safe).
