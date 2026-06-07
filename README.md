# Novyn Wear - Modern Minimalist E-Commerce

Chào mừng bạn đến với **Novyn Wear**, một dự án website thương mại điện tử (e-commerce) cao cấp, hiện đại, sinh động và đầy đủ tính năng. Website được thiết kế tối ưu hóa trải nghiệm người dùng (UX) tinh tế, ứng dụng triết lý thiết kế tối giản hiện đại (Quiet Luxury) cùng các micro-animations chuyển động mượt mà.

Website được tối ưu hóa hiển thị responsive hoàn hảo trên mọi kích cỡ màn hình từ thiết bị di động (mobile) đến máy tính để bàn (desktop) lớn.

---

## 🌟 Tính Năng Nổi Bật

1. **Trang Chủ Lộng Lẫy (Homepage)**
   - Hero banner thiết kế bất đối xứng với gradient chuyển màu nhẹ nhàng và hiệu ứng chuyển động lôi cuốn.
   - Bento-grid giới thiệu danh mục sản phẩm (Tops, Bottoms, Accessories, Lifestyle) sinh động.
   - Trưng bày các sản phẩm bán chạy nhất (Best Sellers) kèm phản hồi thực tế từ khách hàng uy tú.
   - Banner khuyến mãi tích hợp mã coupon ưu đãi.

2. **Trang Danh Sách Sản Phẩm (Products Catalog)**
   - Tìm kiếm tức thời (Instant Search) tích hợp đồng bộ URL query.
   - Bộ lọc nâng cao đa dạng: Lọc theo danh mục (Category), Tag khuyến mãi (On Sale), và khoảng giá (Price Range).
   - Sắp xếp linh hoạt (Sort): Mới nhất, giá từ thấp đến cao, giá từ cao đến thấp.
   - Giao diện Loading Skeleton giả lập và trạng thái giỏ hàng rỗng (Empty State) chỉn chu.
   - Bọc kín toàn bộ logic URL parameters bằng `<Suspense>` của React để tránh lỗi Hydration/Build.

3. **Trang Chi Tiết Sản Phẩm (Product Details)**
   - Thư viện ảnh sản phẩm (Image Gallery) hỗ trợ chuyển đổi linh hoạt.
   - Bộ chọn Thuộc tính: Màu sắc (Color) trực quan sinh động và kích cỡ (Size) tiêu chuẩn.
   - Bộ điều khiển số lượng (Quantity Controller) trực quan, tự động validate giới hạn.
   - Khung Accordion thu gọn chi tiết chất liệu, bảo quản và chính sách giao hàng tiện dụng.
   - Mục đề xuất sản phẩm liên quan (Related Products) tăng khả năng cross-selling.

4. **Trang Giỏ Hàng Hoàn Chỉnh (Shopping Cart)**
   - Danh sách sản phẩm trực quan, cập nhật số lượng hoặc xóa sản phẩm tức thì.
   - Tích hợp hệ thống Mã Giảm Giá (Promo Code):
     - `SALE10`: Giảm ngay 10% tổng giá trị đơn hàng.
     - `FREESHIP`: Miễn phí phí vận chuyển toàn quốc.
   - Thanh tiến độ (Threshold bar) thông minh khuyến khích khách hàng mua thêm để nhận ưu đãi Freeship tự động (cho đơn từ 500.000đ).
   - Lưu trữ đồng bộ giỏ hàng an toàn qua `localStorage` chống mất dữ liệu khi refresh trang.

5. **Trang Thanh Toán Demo An Toàn (Checkout Flow)**
   - Form thông tin khách hàng đầy đủ kiểm tra lỗi logic (Full Name, Phone number, Email, Address, Notes).
   - Tích hợp 3 hình thức thanh toán tùy biến cao cấp:
     - **Thanh toán khi nhận hàng (COD)**: Đơn giản, tin cậy.
     - **Chuyển khoản ngân hàng trực tuyến**: Tạo mã QR thanh toán giả lập động dựa trên mã đơn hàng cực kỳ chuyên nghiệp.
     - **Thẻ tín dụng quốc tế Visa/Master**: Khung nhập thẻ Visa sandbox kèm thẻ visual 3D bắt mắt, hướng dẫn kiểm thử an toàn.
   - Modal thông báo Đặt hàng thành công hiển thị hóa đơn tóm tắt và tự động reset giỏ hàng.

6. **Hệ Thống Trực Quan Hóa**
   - **Toast Notifications**: Thông báo nổi khi thêm, xóa sản phẩm hoặc áp mã giảm giá thành công/thất bại, sử dụng Framer Motion và `AnimatePresence`.
   - **Vượt trội về CSS**: Ghi đè triệt để chế độ Dark Mode mặc định của Tailwind v4 giúp giao diện luôn sáng bóng, sang trọng, đẳng cấp nhất trên mọi trình duyệt.

7. **Trang Giới Thiệu (About) & Liên Hệ (Contact)**
   - **About**: Kể câu chuyện thương hiệu Novyn Wear, triết lý "Less but Better", quy trình dệt sợi Linen mộc mạc và các giá trị bền vững cốt lõi.
   - **Contact**: Form liên hệ trực quan (validate Tên, Email, nội dung ngắn), danh sách showrooms kèm bản đồ thiết kế đồ họa sang trọng.

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Lập trình**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Cấu Trúc Thư Mục Dự Án

```text
modern-fashion-ecommerce/
├── app/                      # Cấu trúc App Router của Next.js
│   ├── about/                # Trang Giới thiệu thương hiệu
│   ├── contact/              # Trang Liên hệ & Form gửi tin
│   ├── cart/                 # Trang quản lý Giỏ hàng
│   ├── checkout/             # Trang thanh toán đơn hàng & QR Demo
│   ├── products/             # Trang danh sách & chi tiết sản phẩm ([slug])
│   ├── layout.tsx            # Bố cục chính toàn trang (Navbar, Footer, Providers)
│   ├── page.tsx              # Trang chủ Homepage
│   └── globals.css           # Cấu hình Tailwind CSS & Custom scrollbar
├── components/               # Các components tái sử dụng
│   ├── layout/               # Header, Footer, Mobile menu
│   └── product/              # ProductCard hiển thị sản phẩm
├── context/                  # Trạng thái toàn cục (State Context)
│   ├── CartContext.tsx       # Quản lý giỏ hàng & Promo codes
│   └── ToastContext.tsx      # Quản lý thông báo Toast nổi
├── data/                     # Dữ liệu mẫu (Mock data)
│   └── products.ts           # Danh sách 16 sản phẩm thời trang cao cấp Unsplash
├── lib/                      # Các tiện ích chung
│   └── utils.ts              # Hàm định dạng tiền tệ VND, merge class Tailwind
├── types/                    # Các khai báo kiểu TypeScript
│   └── index.ts              # Interface Product, CartItem, Order...
├── package.json              # Khai báo thư viện dependencies
└── tsconfig.json             # Cấu hình TypeScript
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử Cục Bộ

Hãy chắc chắn rằng máy tính của bạn đã cài đặt [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 18+ hoặc mới nhất).

1. **Truy cập thư mục dự án**:
   ```bash
   cd /Users/apple/.gemini/antigravity/scratch/modern-fashion-ecommerce
   ```

2. **Cài đặt các gói thư viện bổ sung**:
   ```bash
   npm install
   ```

3. **Chạy server phát triển (Development Mode)**:
   ```bash
   npm run dev
   ```
   Sau đó mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000).

4. **Biên dịch và kiểm thử kiểm duyệt lỗi (Build Production)**:
   ```bash
   npm run build
   ```
   Lệnh này sẽ biên dịch mã TypeScript và đóng gói tối ưu hóa cho môi trường thực tế, đảm bảo không có lỗi cảnh báo (linter) hay lỗi cú pháp nào.

5. **Chạy bản Production đã biên dịch**:
   ```bash
   npm run start
   ```

---

## 🔒 Cam Kết Về Trải Nghiệm Lập Trình & Demo
- Dự án hoàn toàn **không sử dụng cổng thanh toán thật** hay các API thu thập dữ liệu nhạy cảm. Toàn bộ thông tin điền trong trang checkout hoặc contact đều được xử lý cục bộ an toàn cho mục đích kiểm thử và demo cho khách hàng.
- Trải nghiệm chuyển trang cực kỳ nhanh chóng nhờ tối ưu hóa cơ chế Server Components kết hợp Client Components của Next.js.
- Các ảnh sản phẩm được sử dụng từ nguồn CDN Unsplash chất lượng cực kỳ cao với kích thước tối ưu, giúp hiển thị mượt mà không làm trễ tốc độ tải trang.
