# 🛍️ NOVYN WEAR - Modern Minimalist E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Security](https://img.shields.io/badge/Security-Hardened-success?style=for-the-badge&logo=shield)](https://github.com/)
[![Tests](https://img.shields.io/badge/Automated_Tests-100%25_PASS-brightgreen?style=for-the-badge)](https://github.com/)

> **Novyn Wear** là nền tảng thương mại điện tử (Full-stack E-Commerce) cao cấp, được thiết kế theo triết lý hiện đại tối giản (*Quiet Luxury*) kết hợp với kiến trúc backend đạt tiêu chuẩn bảo mật ngân hàng, hiệu năng chịu tải cao, sẵn sàng phục vụ quy mô sản xuất thực tế.

---

## 📖 BẢNG MỤC LỤC
- [🌟 Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
- [🛡️ Kiến Trúc Bảo Mật & Chịu Tải Cao](#️-kiến-trúc-bảo-mật--chịu-tải-cao)
- [🛠️ Công Nghệ & Thư Viện Sử Dụng](#️-công-nghệ--thư-viện-sử-dụng)
- [📁 Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [⚙️ Biến Môi Trường (Environment Variables)](#️-biến-môi-trường-environment-variables)
- [🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ](#-hướng-dẫn-cài-đặt--chạy-cục-bộ)
- [🧪 Hệ Thống Kiểm Thử Tự Động (Automated Testing)](#-hệ-thống-kiểm-thử-tự-động-automated-testing)
- [👥 Phân Quyền Nhân Sự & Tài Khoản Mẫu](#-phân-quyền-nhân-sự--tài-khoản-mẫu)
- [📄 Giấy Phép (License)](#-giấy-phép-license)

---

## 🌟 Tính Năng Nổi Bật

### 1. Trải Nghiệm Khách Hàng (Storefront UX)
- **Homepage Sang Trọng**: Hero banner bất đối xứng, hiệu ứng gradient Quiet Luxury, danh mục Bento-Grid (Tops, Bottoms, Outerwear, Accessories).
- **Bộ Lọc Nâng Cao (Smart Filter)**: Lọc động theo danh mục, khoảng giá, tag khuyến mãi, sắp xếp đa chiều, đồng bộ URL parameters với React `Suspense`.
- **Trang Chi Tiết Sản Phẩm**: Thư viện ảnh trượt đa góc nhìn, lựa chọn màu sắc/kích cỡ thông minh, kiểm soát tồn kho thời gian thực.
- **Giỏ Hàng Đa Năng**: Cập nhật số lượng tức thì, áp dụng voucher (`SALE10`, `FREESHIP`), thanh tiến độ tự động tính miễn phí vận chuyển.
- **Thanh Toán Đa Kênh**:
  - **VNPay Gateway**: Thanh toán thẻ ATM / Thẻ quốc tế / QR Code VNPay với chữ ký bảo mật HMAC-SHA512.
  - **Chuyển khoản ngân hàng**: Tự động sinh mã VietQR động theo đơn hàng kèm nội dung chuyển khoản tự động.
  - **COD**: Thanh toán khi nhận hàng truyền thống.
- **Hệ Thống Phản Hồi Khách Hàng (CSKH Ticket)**: Tích hợp form liên hệ chống bot Honeypot, tạo ticket hỗ trợ tự động gửi email xác nhận.

### 2. Quản Trị Hệ Thống & Bán Hàng (POS & CRM)
- **Hệ Thống Phân Quyền Đa Tầng (RBAC)**:
  - `DIRECTOR / ADMIN`: Toàn quyền quản trị doanh thu, báo cáo tài chính, cài đặt chi nhánh.
  - `STORE_MANAGER`: Giám sát kho hàng, doanh số và nhân sự ca làm việc tại cửa hàng.
  - `CASHIER / EMPLOYEE`: Tạo đơn POS tại quầy, in hóa đơn, áp mã giảm giá.
  - `STOCKER`: Quản lý nhập/xuất kho, kiểm kê hàng hóa.
  - `CSKH_LEAD / CSKH_STAFF`: Tiếp nhận và xử lý khiếu nại, phản hồi khách hàng.

---

## 🛡️ Kiến Trúc Bảo Mật & Chịu Tải Cao

Dự án đã trải qua quá trình kiểm thử tải nặng (1000 requests đồng thời) và được gia cố với 7 lớp phòng thủ:

1. **Chống Spam F5 & HTTP Flood (Middleware IP Rate Limiter)**:
   - Giới hạn **80 requests/phút/IP** trên toàn bộ các route.
   - Khi vượt ngưỡng, tự động trả về mã **HTTP 429 Too Many Requests**, header `Retry-After: 60`, chặn đứng hoàn toàn hiện tượng F5 liên tục làm sập server.
2. **Chống Tấn Công Dò Mật Khẩu (Brute-Force Auth Limiter)**:
   - Giới hạn 5 lần đăng nhập sai liên tiếp. Tự động khóa tài khoản tạm thời 300 giây.
3. **Cơ Chế Bộ Nhớ Tự Dọn Dẹp (Sliding-Window TTL)**:
   - Dọn dẹp tự động các bản ghi IP hết hạn, đảm bảo không rò rỉ bộ nhớ (zero memory leak) trong Node.js.
4. **Bảo Mật Cổng Thanh Toán VNPay (HMAC-SHA512 & Webhook Idempotency)**:
   - Kiểm tra toàn vẹn chữ ký mật mã theo chuẩn ngân hàng (Timing-safe comparison chống tấn công Timing Attack).
   - Kiểm tra tính duy nhất của đơn hàng chống gian lận lặp đơn hoặc chỉnh sửa số tiền thanh toán.
5. **Cơ Chế Xử Lý Cơ Sở Dữ Liệu Chống Deadlock (Database Concurrency & WAL Mode)**:
   - Bật chế độ `WAL (Write-Ahead Logging)` và `busy_timeout: 5000ms`.
   - Bổ sung cơ chế `withDbRetry` tự động thử lại khi gặp tranh chấp ghi đồng thời.
6. **Hệ Thống Tải Tệp An Toàn (Secure Media Pipeline)**:
   - Kiểm tra **Magic Bytes nhị phân** của tệp tải lên (chỉ cho phép JPEG, PNG, WebP), chặn đứng 100% mã độc PHP / Shell / SVG-XSS.
   - Đổi tên tệp ngẫu nhiên theo chuẩn UUID v4, giới hạn dung lượng 5MB.
7. **Bảo Vệ Mật Khẩu Chuẩn Ngân Hàng (Argon2id Hybrid Hashing)**:
   - Áp dụng thuật toán băm mật khẩu **Argon2id** (đạt giải quán quân Password Hashing Competition và chuẩn khuyến nghị OWASP), kháng hoàn toàn các đòn tấn công giải mã bằng siêu máy tính GPU/ASIC.
   - Cơ chế nâng cấp mật khẩu ngầm (Transparent Rehash): Tự động chuyển đổi các tài khoản dùng Bcrypt cũ sang Argon2id ngay khi người dùng đăng nhập mà không làm gián đoạn trải nghiệm.
   - Thực thi bất đồng bộ hoàn toàn (Async threadpool), không gây nghẽn Event Loop của Node.js.

---

## 🛠️ Công Nghệ & Thư Viện Sử Dụng

| Tầng | Công nghệ / Thư viện | Mô tả |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 / 15 (App Router), React 18 / 19 | Server Components, Suspense Streaming, Tối ưu SEO |
| **Ngôn ngữ** | TypeScript 5 | Định kiểu dữ liệu chặt chẽ (Type-Safe 100%) |
| **Giao diện** | Tailwind CSS v4, Lucide Icons, Framer Motion | Thiết kế Responsive, Dark/Light Mode, Micro-animations |
| **Backend & ORM** | Next.js Server Actions, Route Handlers, Prisma ORM | Truy vấn dữ liệu an toàn, chống SQL Injection |
| **Cơ Sở Dữ Liệu** | SQLite (Dev) / PostgreSQL (Production) | Kiến trúc linh hoạt chuyển đổi, cấu hình WAL Mode |
| **Thanh toán** | VNPay SDK (Checksum SHA512), VietQR Code | Cổng thanh toán trực tuyến chuẩn Việt Nam |
| **Bảo mật** | Argon2id, Bcrypt fallback, JWT Session Crypto, Rate Limiter | Bảo vệ mật khẩu chuẩn OWASP, chống brute-force & flood |
| **Email Service** | Resend API / SMTP Transactional | Gửi hóa đơn tự động và tiếp nhận vé CSKH |

---

## 📁 Cấu Trúc Thư Mục

```text
modern-fashion-ecommerce/
├── app/                          # Giao diện người dùng & API (App Router)
│   ├── (store)/                  # Trang bán hàng: Homepage, Products, Cart, Checkout
│   ├── account/                  # Quản lý tài khoản, lịch sử đơn hàng
│   ├── api/                      # Backend Endpoints: Webhook VNPay, Uploads, Auth
│   ├── cskh/                     # Cổng tiếp nhận & xử lý phản hồi khách hàng
│   ├── pos/                      # Giao diện bán hàng tại quầy cho thu ngân
│   └── globals.css               # Phong cách thiết kế Quiet Luxury
├── components/                   # UI Components dùng chung (Header, Footer, ProductCard)
├── context/                      # Quản lý State toàn cục (Giỏ hàng, Toast)
├── lib/                          # Thư viện lõi & Xử lý nghiệp vụ
│   ├── auth/                     # Xác thực & Phân quyền RBAC
│   ├── email/                    # Dịch vụ gửi hóa đơn & thông báo
│   ├── prisma.ts                 # Prisma Client tối ưu kết nối & WAL mode
│   ├── rateLimiter.ts            # Sliding Window Rate Limiter
│   └── vnpay.ts                  # Xử lý tính toán chữ ký VNPay
├── prisma/                       # Cấu hình CSDL
│   ├── schema.prisma             # Mô hình dữ liệu quan hệ (User, Order, Ticket,...)
│   └── seed.ts                   # Dữ liệu khởi tạo tài khoản & sản phẩm
├── scripts/                      # Bộ công cụ kiểm thử tự động (Test Suites)
│   └── run_all_tests.ts          # Master Runner chạy toàn bộ 7 bộ kiểm thử
├── .env.example                  # File mẫu cấu hình biến môi trường
├── .gitignore                    # Bộ lọc bảo mật loại bỏ file nhạy cảm
└── package.json                  # Khai báo Dependencies & Scripts
```

---

## ⚙️ Biến Môi Trường (Environment Variables)

Dự án cung cấp sẵn tệp mẫu an toàn `.env.example`. Hãy sao chép tệp này thành `.env` để cấu hình:

```bash
cp .env.example .env
```

Nội dung cấu hình cơ bản trong `.env`:
```env
# Kết nối Cơ sở dữ liệu
DATABASE_URL="file:./dev.db"

# Khóa phiên bảo mật (Bắt buộc tối thiểu 32 ký tự khi chạy Production)
SESSION_SECRET="change-this-to-a-secure-random-32-char-secret-key-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cấu hình Cổng thanh toán VNPay Sandbox
VNP_TMN_CODE="YOUR_TMN_CODE"
VNP_HASH_SECRET="YOUR_HASH_SECRET"
VNP_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNP_RETURN_URL="http://localhost:3000/api/checkout/vnpay-return"

# Cấu hình Gửi Email (Resend)
RESEND_API_KEY=""
SYSTEM_FROM_EMAIL="onboarding@resend.dev"
CSKH_SUPPORT_EMAIL="support@novyn.vn"
```

> ⚠️ **Lưu ý**: Tệp `.env` thật đã được `.gitignore` bảo vệ tuyệt đối, không bao giờ bị đẩy lên GitHub.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu cầu hệ thống:
- [Node.js](https://nodejs.org/) phiên bản 18.17 trở lên.
- Trình quản lý gói `npm`, `yarn` hoặc `pnpm`.

### Các bước khởi chạy:

1. **Clone mã nguồn về máy:**
   ```bash
   git clone https://github.com/nguyenxuanhai02072k6/<TEN-REPO-CUA-BAN>.git
   cd <TEN-REPO-CUA-BAN>
   ```

2. **Cài đặt các gói thư viện (Dependencies):**
   ```bash
   npm install
   ```

3. **Khởi tạo cơ sở dữ liệu & Nạp dữ liệu mẫu:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Khởi chạy máy chủ phát triển (Development):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000).

5. **Biên dịch bản sản xuất (Production Build):**
   ```bash
   npm run build
   npm run start
   ```

---

## 🧪 Hệ Thống Kiểm Thử Tự Động (Automated Testing)

Dự án được trang bị hệ thống kiểm thử tự động toàn diện bao quát 100% các tính năng quan trọng:

```bash
npx tsx scripts/run_all_tests.ts
```

**Kết quả kiểm thử đạt 100% [PASS]:**
- ✅ **1. Database Concurrency**: Xử lý đa luồng, chống khóa bảng WAL mode, tự động retry.
- ✅ **2. Payment Security**: Kiểm tra toàn vẹn chữ ký VNPay SHA512, chống gian lận đơn.
- ✅ **3. Distributed Rate Limiter**: Chặn tấn công dò mật khẩu, quản lý bộ nhớ TTL.
- ✅ **4. Transactional Emails**: Tự động phát hành hóa đơn đơn hàng và tiếp nhận phiếu CSKH.
- ✅ **5. Secure Media Upload**: Nhận diện magic bytes, chống upload mã độc PHP/SVG-XSS.
- ✅ **6. Contact & Honeypot**: Lọc spam biểu mẫu liên hệ, chống bot tự động.
- ✅ **7. Anti-Spam F5 Protection**: Chặn đứng HTTP flood tại tầng Middleware (80 req/min).
- ✅ **8. Argon2id Password Security**: Kháng bẻ khóa GPU/ASIC, nâng cấp ngầm từ Bcrypt sang Argon2id.

---

## 👥 Phân Quyền Nhân Sự & Tài Khoản Mẫu

Sau khi chạy lệnh `npx prisma db seed`, bạn có thể đăng nhập bằng các tài khoản sau (Mật khẩu mặc định: `Novyn@2026` hoặc theo cấu hình seed):

| Vai trò (Role) | Tài khoản (Username) | Phạm vi quyền hạn |
| :--- | :--- | :--- |
| **Giám đốc điều hành** | `director` | Xem toàn bộ báo cáo tài chính, doanh thu, quản trị hệ thống |
| **Kế toán trưởng** | `accountant` | Đối soát dòng tiền, xuất báo cáo doanh số |
| **Trưởng phòng CSKH** | `cskh.lead` | Quản trị phiếu khiếu nại, phản hồi khách hàng |
| **Cửa hàng trưởng** | `manager.q1` | Giám sát cửa hàng Chi nhánh Quận 1 |
| **Thu ngân** | `cashier.q1` | Thao tác trên giao diện POS quầy, in hóa đơn |
| **Nhân viên kho** | `stocker.q1` | Nhập hàng, kiểm kho, xuất hàng |
| **Khách hàng thân thiết**| `customer.vip` | Đặt hàng online, theo dõi hành trình đơn |

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Bạn hoàn toàn có thể tự do sử dụng, chỉnh sửa và phát triển phục vụ mục đích học tập hoặc thương mại.

---
*Phát triển bởi [nguyenxuanhai02072k6](https://github.com/nguyenxuanhai02072k6) - 2026.*
