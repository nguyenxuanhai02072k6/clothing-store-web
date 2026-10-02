# 🎨 TẦNG 3: GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (FRONTEND LAYER)

Chào bạn! Thư mục này là **Tầng Frontend (Giao diện người dùng / Client-side)** của hệ thống Novyn Fashion & ERP.
Tất cả những gì khách hàng hoặc nhân viên nhìn thấy, bấm chuột, tương tác trên màn hình đều được định nghĩa ở đây.

---

## 1. Cấu trúc thư mục

### 📁 `frontend/components/` (Các khối giao diện tái sử dụng)
* **`layout/`**:
  * `Header.tsx`: Thanh điều hướng đầu trang (Logo, thanh tìm kiếm sản phẩm, danh mục Lookbook, nút đăng nhập và icon giỏ hàng kèm số lượng đồ).
  * `Footer.tsx`: Chân trang hiển thị thông tin thương hiệu, chính sách đổi trả, chi nhánh cửa hàng.

* **`product/`**:
  * `ProductCard.tsx`: Thẻ hiển thị từng sản phẩm (ảnh hover đổi góc chụp, giá tiền, nhãn Sale/New, nút thêm nhanh vào giỏ).
  * `ProductDetailClient.tsx`: Giao diện chi tiết sản phẩm (bộ chọn màu sắc thực tế, bảng chọn size S/M/L/XL, xem ảnh phóng to, bảng kích thước).

* **`common/`**:
  * `LuckyWheel.tsx`: Vòng quay may mắn tương tác cho khách hàng quay trúng voucher giảm giá (mã tự động liên kết với Backend Database).
  * `Chatbot.tsx`: Hộp chat trực tuyến nổi góc màn hình để khách hàng trò chuyện với nhân viên CSKH.

* **`internal/`**:
  * Giao diện Hệ thống quản trị ERP dành riêng cho nội bộ nhân viên:
    * `OverviewDashboard.tsx`: Bảng điều khiển tổng quan doanh số và KPI.
    * `AppSidebar.tsx`: Thanh menu chuyển đổi giữa các phân hệ (POS Thu ngân, Nhân sự, Kho vận, CSKH, Kế toán).
    * `ERPSubsystems.tsx`: Các tab chức năng chuyên sâu cho từng bộ phận.

* **`3d/`**:
  * Trình dựng mô hình 3D tương tác (xoay 360 độ) cho các sản phẩm phụ kiện cao cấp.

---

### 📁 `frontend/context/` (Bộ nhớ tạm của trình duyệt - React Contexts)
* **`AuthContext.tsx`**: Lưu trữ thông tin người dùng đang đăng nhập trên trình duyệt (`currentUser`) để hiển thị avatar, tên, và quyền hạn.
* **`CartContext.tsx`**: Quản lý giỏ hàng mua sắm (danh sách món đồ, số lượng, lưu tạm vào `localStorage` để khi F5 tải lại trang khách không bị mất giỏ hàng).
* **`ToastContext.tsx`**: Hiển thị thông báo góc màn hình (Xanh lá = thành công, Đỏ = thông báo lỗi).
* **`ChatContext.tsx`**: Quản lý lịch sử tin nhắn trong phiên chat trực tuyến.

---

## 2. Mối liên hệ với các Tầng khác
* Khi người dùng bấm nút (ví dụ: bấm "Thanh toán"):
  1. Giao diện ở `frontend/` thu thập danh sách sản phẩm từ `CartContext.tsx`.
  2. Giao diện gọi hàm ở `backend/actions/orderActions.ts`.
  3. Hàm backend kiểm tra tồn kho và ghi đơn vào `database/`.
  4. Backend trả kết quả về cho `frontend/` hiển thị thông báo thành công qua `ToastContext.tsx`.
