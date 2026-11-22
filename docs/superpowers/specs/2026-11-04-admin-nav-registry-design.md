# Thiết kế lại điều hướng bảng quản trị (Slice 1: Nav Registry + vùng Quản trị/Director)

## Ý định & vì sao

Bảng quản trị `app/internal` đang "loạn" vì **không có nguồn sự thật duy nhất cho điều hướng**. Bằng chứng (chạy thật, 7 vai, DB seed có sẵn):

- `useInternalNavigationState.ts` (306 dòng): **8 biến sub-tab rời rạc** + 3 hàm if/else 50 dòng (`handleSidebarChange`, `getSubTabs`, `setCurrentSubTab`). Thêm một tính năng = sửa 3 chỗ, dễ sai lệch.
- `AppSidebar.tsx` `isItemActive` (dòng 210-230): **~30 alias** gán "mục đang bật" bằng chuỗi, lặp đi lặp lại.
- `InternalTabRenderer.tsx` (537 dòng, ~80 props): một "switch khổng lồ" 20 khối JSX, mỗi khối là 3-4 alias. `page.tsx` (469 dòng) truyền gần như mọi thứ từ `useAuth()` qua.
- **Tính năng đặt 2 chỗ**: `finance-recon` (đối soát két) nằm cả ở "BÁN HÀNG & POS" lẫn "TÀI CHÍNH & KẾ TOÁN".
- **Hai cây nội dung chồng nhau**: 11 file `subsystems/*` + 20 file `tabs/*` mô tả cùng các vùng, không khớp.
- **Director thấy hết** (7 nhóm, ~25 mục) → không có điểm rơi.

Mục tiêu: **giữ 100% tính năng**, nhưng gom mọi việc quyết định điều hướng vào **một registry dữ liệu duy nhất**, tự sinh sidebar + renderer, và cho mỗi vai chỉ thấy đúng thứ mình cần.

**Non-goals**: không cắt tính năng nào; không đổi logic nghiệp vụ trong các tab; không đổi API/backend; không đụng vùng POS/CSKH/Kho ở lát này (để lát sau).

## Quyết định thiết kế (cốt lõi)

### 1. `NavRegistry` — nguồn sự thật duy nhất

File mới `components/internal/nav/nav-registry.ts` (thuần dữ liệu + types, không import React). Mỗi "nút" là một entry:

```ts
interface NavNode {
  id: string;              // id GỐC, dùng duy nhất trong hệ thống (không alias)
  name: string;
  icon: LucideIcon;
  group: GroupKey;         // 'management' | 'finance' | ... (vùng, hiện chỉ dùng 2: management + các vùng khác)
  allowedRoles: Role[];    // quyền, thay cho allowedRoles + PermissionGuard chồng
  subTabs?: SubTabDef[];   // danh sách sub-tab + điều kiện hiện (role-based)
  component: TabComponentKey; // 'director-ops' | 'director-pl' | 'expenses' | ... map thẳng tới component
  badge?: BadgeKey;
  defaultSubTab?: string;
}
```

- **Xóa hẳn lớp alias.** Mỗi nút một `id` gốc duy nhất (vd `finance-recon`), mọi place khác trỏ vào id đó. `isItemActive` giảm thành `activeId === node.id`.
- **Gộp `finance-recon` về 1 nút** (thuộc nhóm Tài chính). Sidebar chỉ render 1 lần, hết hiện tượng "hai lối vào".
- **`allowedRoles` đặt trên node** (và có thể trên `subTabs`) → PermissionGuard trong renderer dùng chính danh sách này, không hardcode lại.

### 2. Registry phân vùng theo quyền (role-centric)

- Thêm field `defaultPerRole: Partial<Record<Role, string>>` — vai nào thì mặc định rớt vào nút nào (thay thế `useInternalNavigationState` dòng 38-55).
- Sidebar tự lọc: `nodes.filter(n => n.allowedRoles.includes(role))`. Với **director** các nút được gom theo `group` (Quản trị / Tài chính) và chỉ hiện nhóm có nội dung → màn hình bớt "dài vô tận". Với **thu ngân** chỉ hiện ~3 nút.

### 3. Renderer mỏng lại

`InternalTabRenderer` chuyển từ "switch khổng lồ" sang:

```tsx
const node = registry.activeNode(activeId);
return <node.component { ...scopedProps } />
```

- Props **phân vùng theo node** (mỗi component chỉ nhận đúng thứ nó cần), không phải 80 props nhét chung.
- Lát này chỉ cần registry + renderer phủ **vùng Quản trị/Director** (nút: `director-ops`, `director-pl`, `expenses`, `staff-schedule`, `attendance`, `announcements`, `audit-logs`, `settings`, `products-database`, `finance-recon`, `manager-reports`). Các nút vùng khác (POS, CSKH, Kho) **giữ nguyên logic hiện tại** qua một fallback `registry.legacyRoute(...)` trong lát này, lát sau mới migrates dần — đảm bảo không phá vỡ các vai khác.

### 4. Hook điều hướng giảm code

`useInternalNavigationState`:
- Bỏ 8 sub-tab state rời → 1 `activeSubTab: string` (theo node hiện tại, có trong registry).
- `handleSidebarChange` / `setCurrentSubTab` / `getSubTabs` đều đọc từ registry → mỗi hàm còn ~10 dòng.
- `defaultPerRole` + `defaultSubTab` thay các useEffect hardcode.

## Cắt lát (để an toàn)

- **Lát 1A**: dựng `nav-registry.ts` + types; **giữ** hệ cũ chạy song song (không đổi gì behavior), chỉ thêm file. Chạy build + test `run_all_tests.ts` (phải 100% pass).
- **Lát 1B**: sidebar đọc từ registry cho vùng Quản trị (gộp `finance-recon`, lọc role). So sánh screenshot trước/sau với vai director.
- **Lát 1C**: renderer + hook đọc từ registry cho vùng Quản trị; xóa if/else vùng đó. Test lại.

Mỗi lát dừng lại được, review được. Vùng POS/CSKH/Kho chưa chạm → không rủi ro với vai thu ngân/CSKH/stocker.

## Rủi ro & cách giảm

| Rủi ro | Giảm |
|---|---|
| Alias cũ bị gọi ở chỗ không thấy | grep toàn bộ `activeTab === '<alias>'` trước lát 1B, map từng cái về node gốc |
| Director mất nút do filter sai | Giữ `allowedRoles` đúng như hiện trạng (copy từ menuGroups + sub-tab conditions), không suy đoán |
| Next.js "không phải bản bạn biết" | Đọc `node_modules/next/dist/docs/` liên quan (App Router/route) trước khi đổi cấu trúc page — nhưng lát này chỉ đổi components, không đổi route, nên rủi ro thấp |

## Những gì để người build tự quyết

- Tên file registry, cách export (single file vs `nav/` folder).
- Type cho `component` (map string→React.FC vs import trực tiếp).
- Có dùng `React.lazy` cho component vùng không (hiệu năng — khớp chủ đề ban đầu "hiệu năng").

## Tiêu chí hoàn thành (Slice 1)

1. `nav-registry.ts` là nguồn sự thật duy nhất cho sidebar + renderer **vùng Quản trị/Director**.
2. Hết `finance-recon` hai chỗ; `isItemActive` không còn alias lặp.
3. Director: sidebar gọn, group rõ, điểm rơi theo vai; **mọi tính năng vùng quản trị vẫn hoạt động**.
4. Các vai khác (POS/CSKH/Kho) **không đổi behavior** (đi qua legacy fallback).
5. `run_all_tests.ts` = 100% PASS; `npm run build` xanh.
