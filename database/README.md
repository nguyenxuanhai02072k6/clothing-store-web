# 🗄️ TẦNG 1: CƠ SỞ DỮ LIỆU (DATABASE LAYER)

Chào bạn! Thư mục này là **Tầng Cơ sở dữ liệu (Database)** của toàn bộ hệ thống Novyn Fashion & ERP.

---

## 1. Các file cốt lõi trong tầng này
* **`db.ts`**: Cầu nối kết nối giữa ứng dụng và cơ sở dữ liệu (sử dụng thư viện `@prisma/client` và `@prisma/adapter-better-sqlite3`).
* **`../prisma/schema.prisma`**: Bản thiết kế (Schema) của toàn bộ các bảng dữ liệu trong hệ thống.
* **`../prisma/seed.ts`**: Kịch bản nạp sẵn các tài khoản nhân viên, sản phẩm thời trang và đơn hàng mẫu khi khởi động dự án lần đầu.
* **`../dev.db`**: File dữ liệu vật lý (SQLite database). Toàn bộ dữ liệu thực tế được lưu vào file này.

---

## 2. Bản đồ các bảng dữ liệu (Data Models)
Hệ thống sử dụng cơ sở dữ liệu quan hệ (Relational Database) gồm các nhóm bảng chính:

### Nhóm A: Người dùng & Phân quyền
* **`User`**: Lưu thông tin khách hàng và nhân viên nội bộ (ID, tên, email, mật khẩu đã băm bằng `bcrypt`, vai trò `role`, chi nhánh `branch`, mức lương cơ bản `salary`, tổng chi tiêu `totalSpent`, trạng thái `isActive`).

### Nhóm B: Sản phẩm & Kho hàng (Thời trang đa chi nhánh)
* **`Product`**: Bảng sản phẩm chung (tên, slug, danh mục, giá niêm yết, mô tả, ảnh, đánh giá sao).
* **`ProductVariant`**: Từng biến thể cụ thể của sản phẩm theo tổ hợp Màu sắc + Kích thước (ví dụ: Màu Trắng - Size L). Mỗi biến thể có một mã `sku` độc nhất.
* **`InventoryItem`**: Số lượng tồn kho thực tế của từng biến thể (`variantId`) tại từng chi nhánh cụ thể (`branchName` = "Chi nhánh Quận 1" hoặc "Chi nhánh Thảo Điền").
* **`InventoryTransaction`**: Sổ nhật ký ghi lại mọi biến động kho (bán hàng, nhập thêm hàng, chuyển kho, hàng lỗi).

### Nhóm C: Bán hàng, Thanh toán & Khuyến mãi
* **`Order`**: Hóa đơn mua hàng (thông tin người nhận, tiền hàng, tiền giảm giá, phí ship, tổng tiền thanh toán, trạng thái đơn: `pending`, `shipping`, `completed`, `cancelled`).
* **`OrderItem`**: Chi tiết từng món đồ trong đơn (tên sản phẩm, màu, size, giá tại thời điểm mua, số lượng).
* **`Promotion`**: Danh sách mã voucher giảm giá (mã code, loại giảm theo phần trăm hoặc số tiền cố định, giá trị đơn tối thiểu).
* **`AuditLog`**: Sổ nhật ký bảo mật (ghi lại ai đã đổi mật khẩu, ai bị khóa đăng nhập do brute-force, ai đã đổi điểm thưởng VIP).

---

## 3. Các lệnh cần nhớ cho người mới bắt đầu
1. **Mở giao diện xem bảng dữ liệu trực quan bằng mắt (Prisma Studio)**:
   ```bash
   npx prisma studio
   ```
   *(Trình duyệt sẽ mở một trang web tại `http://localhost:5555`, bạn có thể bấm vào từng bảng để xem và sửa dữ liệu như Excel).*

2. **Nạp lại dữ liệu mẫu từ đầu**:
   ```bash
   npx prisma db push --force-reset
   npx tsx ./prisma/seed.ts
   ```

---

## 4. Cơ chế chống nghẽn (Concurrency Resilience) & Sẵn sàng cho PostgreSQL
* **Chế độ WAL (Write-Ahead Logging)**: File SQLite `dev.db` đã được cấu hình chế độ WAL. Nhờ đó, các tác vụ đọc dữ liệu (khách xem web, xem sản phẩm) không bao giờ bị chặn bởi tác vụ ghi (đặt hàng, cập nhật kho).
* **Cơ chế Busy Timeout 5000ms**: Cấu hình trong `db.ts` giúp hệ thống kiên nhẫn chờ tối đa 5 giây khi có nhiều luồng ghi đồng thời thay vì văng lỗi `SQLITE_BUSY`.
* **Hàm `withDbRetry`**: Tự động thử lại giao dịch với cơ chế Exponential Backoff nếu có tranh chấp ghi dữ liệu.
* **Sẵn sàng chuyển đổi sang PostgreSQL**: File mẫu `prisma/schema.postgresql.prisma` đã được thiết kế sẵn. Khi đưa lên máy chủ Production thực tế (Vercel/Railway/AWS), chỉ cần trỏ `DATABASE_URL=postgresql://...` và dùng lệnh `npx prisma migrate deploy` là có thể chạy ngay lập tức.
