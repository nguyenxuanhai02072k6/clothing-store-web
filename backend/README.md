# ⚙️ TẦNG 2: MÁY CHỦ & XỬ LÝ NGHIỆP VỤ (BACKEND LAYER)

Chào bạn! Thư mục này là **Tầng Backend (Máy chủ / Server-side)** của hệ thống Novyn Fashion & ERP. 
Toàn bộ logic tính toán tiền bạc, kiểm tra tồn kho, đăng nhập, bảo mật và phân quyền đều nằm ở đây.

---

## 1. Cấu trúc thư mục

### 📁 `backend/actions/` (Các hành động nghiệp vụ - Server Actions)
Mỗi file trong này chứa các hàm có đánh dấu `"use server"`, chạy 100% trên máy chủ và không bao giờ lộ code thuật toán cho client:

* **`orderActions.ts`** (Đơn hàng & Thanh toán):
  * `createOrderAction()`: Nhận đơn hàng, kiểm tra tồn kho bằng Database Transaction (`prisma.$transaction`), trừ tồn kho nguyên tử (`decrement`), tính chiết khấu VIP và áp mã voucher.
  * `getOrdersAction()`: Lấy danh sách đơn hàng (chống IDOR: khách chỉ xem được đơn của mình, nhân viên xem được toàn chuỗi).
  * `updateOrderStatusAction()`: Cập nhật trạng thái giao hàng (`pending` -> `shipping` -> `completed`). Chỉ cộng điểm VIP và tính doanh thu khi đơn đạt `completed`.

* **`authActions.ts`** (Xác thực & Người dùng):
  * `loginAction()`: Xác thực email/mật khẩu qua `bcrypt`, có Rate Limiting khóa tài khoản sau 5 lần gõ sai.
  * `registerAction()`: Tạo tài khoản mới, băm mật khẩu an toàn.
  * `getLoyaltyPointsAction()` & `redeemLoyaltyVoucherAction()`: Quản lý điểm thưởng tích lũy và đổi voucher VIP an toàn ở Server thông qua `AuditLog`.

* **`productActions.ts`** (Sản phẩm & Giá cả):
  * `addGlobalProductAction()`: Tạo sản phẩm mới, tự động tạo các biến thể Size/Màu cho cả 2 chi nhánh.
  * `updateGlobalProductPriceAction()`: Đổi giá sản phẩm (xác thực Zod schema: giá phải là số nguyên, từ 1.000 ₫ đến 1.000.000.000 ₫).

* **`staffActions.ts`** (Nhân sự & Vận hành nội bộ ERP):
  * Quản lý ca làm (`requestShiftAction`), yêu cầu đổi ca (`requestShiftSwapAction`), chấm công, báo cáo doanh thu cuối ngày.
  * Mọi hành động đều kiểm tra quyền hạn `verifySession(['director', 'manager', ...])`.

* **`inventoryActions.ts`** (Quản lý kho & Điều chuyển):
  * Tạo phiếu điều chuyển kho Quận 1 <-> Thảo Điền, duyệt xuất/nhập kho, lập biên bản hàng lỗi.

* **`financeActions.ts`** (Tài chính & Kế toán):
  * Quản lý bảng chi lương (`payroll`), các khoản thu chi hoạt động, tính thuế.

* **`chatActions.ts`** (Live Chat hỗ trợ khách hàng):
  * Phòng chat thời gian thực giữa Khách và CSKH, phòng chống lỗ hổng xem trộm tin nhắn (IDOR).

---

### 📁 `backend/security/` (Bảo mật & Phiên làm việc)
* **`session.ts`**:
  * `setSessionCookie()`: Tạo token đã mã hóa AES-GCM và lưu vào HttpOnly Cookie.
  * `verifySession(roles)`: Người gác cổng RBAC kiểm tra quyền truy cập và kiểm tra trạng thái hoạt động tài khoản (`isActive`) theo thời gian thực để thu hồi phiên ngay lập tức nếu nhân viên bị khóa.

---

### 📁 `backend/services/` (Tầng dịch vụ dữ liệu)
* Chứa các file `orderService.ts`, `authService.ts`, `productService.ts`... đóng vai trò làm cầu nối sạch sẽ giữa Frontend và các Server Actions.

---

## 2. Luồng gọi chuẩn (Call Flow)
```
Giao diện Client (frontend/) 
       │
       ▼
Dịch vụ (backend/services/)
       │
       ▼
Hành động máy chủ (backend/actions/) ──> Kiểm tra quyền (backend/security/session.ts)
       │
       ▼
Cơ sở dữ liệu (database/db.ts)
```
