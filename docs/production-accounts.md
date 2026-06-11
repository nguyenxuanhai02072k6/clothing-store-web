# Tài khoản chính thức

Các tài khoản dưới đây được seed qua `prisma/seed.ts`. Không commit mật khẩu thật vào repository. Khi deploy lên domain chính, hãy đặt các biến môi trường tương ứng trên server/hosting rồi chạy seed.

| Vai trò | Tên | Email đăng nhập | Biến mật khẩu cần đặt |
| --- | --- | --- | --- |
| Giám đốc | Trần Quốc Bảo | `director@novynwear.com` | `NOVYN_DIRECTOR_PASSWORD` |
| Kế toán trưởng | Phạm Thu Thảo | `accountant@novynwear.com` | `NOVYN_ACCOUNTANT_PASSWORD` |
| CSKH trưởng | Mai An CSKH | `cskh@novynwear.com` | `NOVYN_CSKH_LEAD_PASSWORD` |
| CSKH | Lê Thùy Dương | `duong.cskh@novynwear.com` | `NOVYN_CSKH_STAFF_PASSWORD` |
| Quản lý Quận 1 | Nguyễn Huy Hoàng | `manager.q1@novynwear.com` | `NOVYN_MANAGER_Q1_PASSWORD` |
| Quản lý Thảo Điền | Đỗ Thu Trang | `manager.td@novynwear.com` | `NOVYN_MANAGER_TD_PASSWORD` |
| Nhân viên Quận 1 | Phạm Minh Đức | `employee.q1@novynwear.com` | `NOVYN_EMPLOYEE_Q1_PASSWORD` |
| Nhân viên Thảo Điền | Lê Quỳnh Chi | `employee.td@novynwear.com` | `NOVYN_EMPLOYEE_TD_PASSWORD` |
| Nhân viên Quận 1 | Trần Minh Tâm | `tam.employee.q1@novynwear.com` | `NOVYN_EMPLOYEE_TAM_PASSWORD` |
| Nhân viên Thảo Điền | Nguyễn Hoàng Nam | `nam.employee.td@novynwear.com` | `NOVYN_EMPLOYEE_NAM_PASSWORD` |
| Thu ngân Quận 1 | Nguyễn Thuỳ Lan | `cashier.q1@novynwear.com` | `NOVYN_CASHIER_Q1_PASSWORD` |
| Thủ kho Quận 1 | Trần Minh Hải | `stocker.q1@novynwear.com` | `NOVYN_STOCKER_Q1_PASSWORD` |
| Khách hàng | Lâm Khánh Vy | `customer@novynwear.com` | `NOVYN_CUSTOMER_PASSWORD` |

## Ví dụ biến môi trường

```env
NOVYN_DIRECTOR_PASSWORD="..."
NOVYN_ACCOUNTANT_PASSWORD="..."
NOVYN_CSKH_LEAD_PASSWORD="..."
NOVYN_CSKH_STAFF_PASSWORD="..."
NOVYN_MANAGER_Q1_PASSWORD="..."
NOVYN_MANAGER_TD_PASSWORD="..."
NOVYN_EMPLOYEE_Q1_PASSWORD="..."
NOVYN_EMPLOYEE_TD_PASSWORD="..."
NOVYN_EMPLOYEE_TAM_PASSWORD="..."
NOVYN_EMPLOYEE_NAM_PASSWORD="..."
NOVYN_CASHIER_Q1_PASSWORD="..."
NOVYN_STOCKER_Q1_PASSWORD="..."
NOVYN_CUSTOMER_PASSWORD="..."
```

Gợi ý: dùng mật khẩu dài từ 12 ký tự trở lên, gồm chữ hoa, chữ thường, số và ký tự đặc biệt. Sau khi đăng nhập lần đầu, từng người có thể đổi mật khẩu tại trang tài khoản.
