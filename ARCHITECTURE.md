# 🏛️ TỔNG QUAN KIẾN TRÚC HỆ THỐNG 3 TẦNG (3-TIER ARCHITECTURE)

Dự án này được tổ chức theo mô hình **Kiến trúc 3 Tầng Rành Mạch (Clean Layered Architecture)**:

```
modern-fashion-ecommerce/
│
├── 🗄️ database/               <=== TẦNG 1: CƠ SỞ DỮ LIỆU
│   ├── db.ts                  (Kết nối SQLite qua Prisma Client)
│   ├── README.md              (Hướng dẫn chi tiết về các bảng và dữ liệu)
│   └── (../prisma/)           (Bản thiết kế schema.prisma & seed.ts)
│
├── ⚙️ backend/                <=== TẦNG 2: MÁY CHỦ & XỬ LÝ NGHIỆP VỤ
│   ├── actions/               (Toàn bộ Server Actions: Đơn hàng, Kho, Phân quyền, Giá)
│   ├── security/              (Bảo mật Session, HttpOnly Cookie, Xác thực RBAC)
│   ├── services/              (Cầu nối cung cấp dữ liệu nghiệp vụ)
│   └── README.md              (Hướng dẫn chi tiết về từng hàm Backend)
│
├── 🎨 frontend/               <=== TẦNG 3: GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG
│   ├── components/            (Header, Footer, Thẻ sản phẩm, POS, ERP Dashboard)
│   ├── context/               (Bộ nhớ trình duyệt: Giỏ hàng, Thông báo Toast, Auth)
│   └── README.md              (Hướng dẫn chi tiết về các thành phần giao diện)
│
└── 🌐 app/                    <=== TẦNG ĐỊNH TUYẾN TRANG WEB (NEXT.JS ROUTING)
    ├── page.tsx               (Trang chủ: http://localhost:3000)
    ├── products/              (Xem & lọc sản phẩm)
    ├── cart/                  (Giỏ hàng mua sắm)
    ├── checkout/              (Thanh toán đơn hàng)
    ├── account/               (Tài khoản thành viên & Tích điểm VIP)
    └── internal/              (Hệ thống ERP nội bộ cho nhân sự)
```

---

## 🧭 BẢN ĐỒ CHỈ ĐƯỜNG NHANH CHO LẬP TRÌNH VIÊN

| Bạn muốn làm gì? | Hãy mở thư mục này |
| :--- | :--- |
| **Muốn thêm bảng mới, thêm cột dữ liệu, nạp dữ liệu mẫu** | 📁 [`database/`](file:///Users/apple/.gemini/antigravity/scratch/modern-fashion-ecommerce/database) |
| **Muốn sửa tính tiền, trừ tồn kho, đăng nhập, phân quyền, đổi giá** | 📁 [`backend/`](file:///Users/apple/.gemini/antigravity/scratch/modern-fashion-ecommerce/backend) |
| **Muốn đổi màu nút bấm, sửa giao diện Header, Footer, Giỏ hàng, Modal** | 📁 [`frontend/`](file:///Users/apple/.gemini/antigravity/scratch/modern-fashion-ecommerce/frontend) |
| **Muốn thêm một trang web mới với đường link mới** | 📁 [`app/`](file:///Users/apple/.gemini/antigravity/scratch/modern-fashion-ecommerce/app) |
