import * as bcrypt from 'bcryptjs';
import { MOCK_PRODUCTS } from '../data/products';
import { prisma } from '../lib/db';

// Default users matching DEFAULT_USERS in authService
const DEFAULT_USERS = [
  { id: 'usr-dir', name: 'Trần Quốc Bảo', email: 'director@novynwear.com', role: 'director', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 'usr-mgr1', name: 'Nguyễn Huy Hoàng', email: 'manager.q1@novynwear.com', role: 'manager', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', salary: 15000000 },
  { id: 'usr-mgr2', name: 'Đỗ Thu Trang', email: 'manager.td@novynwear.com', role: 'manager', branch: 'Chi nhánh Thảo Điền', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', salary: 16000000 },
  { id: 'usr-emp1', name: 'Phạm Minh Đức', email: 'employee.q1@novynwear.com', role: 'employee', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', salary: 8500000 },
  { id: 'usr-emp2', name: 'Lê Quỳnh Chi', email: 'employee.td@novynwear.com', role: 'employee', branch: 'Chi nhánh Thảo Điền', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', salary: 9000000 },
  { id: 'usr-acc', name: 'Phạm Thu Thảo', email: 'accountant@novynwear.com', role: 'accountant', salary: 12000000, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop' },
  { id: 'usr-cskh', name: 'Mai An CSKH', email: 'cskh@novynwear.com', role: 'cskh', salary: 9500000, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
  { id: 'usr-cskh2', name: 'Lê Thùy Dương', email: 'duong.cskh@novynwear.com', role: 'cskh', salary: 9200000, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  { id: 'usr-cust', name: 'Lâm Khánh Vy', email: 'customer@gmail.com', role: 'customer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', totalSpent: 22500000 },
  { id: 'usr-demo-cust', name: 'Demo Customer', email: 'demo.customer@example.com', role: 'customer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop', totalSpent: 6500000, phone: '0909123456' },
  { id: 'usr-emp3', name: 'Trần Minh Tâm', email: 'tam.employee.q1@novynwear.com', role: 'employee', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop', salary: 8500000 },
  { id: 'usr-emp4', name: 'Nguyễn Hoàng Nam', email: 'nam.employee.td@novynwear.com', role: 'employee', branch: 'Chi nhánh Thảo Điền', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop', salary: 8800000 },
  { id: 'usr-cashier1', name: 'Nguyễn Thuỳ Lan', email: 'cashier.q1@novynwear.com', role: 'cashier', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', salary: 8000000 },
  { id: 'usr-stocker1', name: 'Trần Minh Hải', email: 'stocker.q1@novynwear.com', role: 'stocker', branch: 'Chi nhánh Quận 1', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', salary: 8200000 },
];

const INITIAL_EXPENSES = [
  { id: 'exp-1', title: 'Chi phí Marketing chụp ảnh BST Linen Hè', amount: 25000000, category: 'marketing', date: '2026-05-10' },
  { id: 'exp-2', title: 'Mua sắm iPad Pro phục vụ trưng bày Thảo Điền', amount: 22000000, category: 'equipment', date: '2026-05-15' },
  { id: 'exp-3', title: 'Chi phí điện nước và internet các chi nhánh tháng 4', amount: 8500005, category: 'operations', date: '2026-05-02' }
];

const INITIAL_PAYROLL = [
  // April 2026 (Paid)
  { id: 'pay-04-emp1', userId: 'usr-emp1', name: 'Phạm Minh Đức', role: 'employee', branch: 'Chi nhánh Quận 1', salary: 8500000, month: '2026-04', status: 'paid', paymentDate: '2026-04-30 17:00:00' },
  { id: 'pay-04-emp2', userId: 'usr-emp2', name: 'Lê Quỳnh Chi', role: 'employee', branch: 'Chi nhánh Thảo Điền', salary: 9000000, month: '2026-04', status: 'paid', paymentDate: '2026-04-30 17:05:00' },
  { id: 'pay-04-mgr1', userId: 'usr-mgr1', name: 'Nguyễn Huy Hoàng', role: 'manager', branch: 'Chi nhánh Quận 1', salary: 15000000, month: '2026-04', status: 'paid', paymentDate: '2026-04-30 17:10:00' },
  { id: 'pay-04-mgr2', userId: 'usr-mgr2', name: 'Đỗ Thu Trang', role: 'manager', branch: 'Chi nhánh Thảo Điền', salary: 16000000, month: '2026-04', status: 'paid', paymentDate: '2026-04-30 17:15:00' },
  { id: 'pay-04-acc', userId: 'usr-acc', name: 'Phạm Thu Thảo', role: 'accountant', salary: 12000000, month: '2026-04', status: 'paid', paymentDate: '2026-04-30 17:20:00' },

  // May 2026 (Pending)
  { id: 'pay-05-emp1', userId: 'usr-emp1', name: 'Phạm Minh Đức', role: 'employee', branch: 'Chi nhánh Quận 1', salary: 8500000, month: '2026-05', status: 'pending' },
  { id: 'pay-05-emp2', userId: 'usr-emp2', name: 'Lê Quỳnh Chi', role: 'employee', branch: 'Chi nhánh Thảo Điền', salary: 9000000, month: '2026-05', status: 'pending' },
  { id: 'pay-05-mgr1', userId: 'usr-mgr1', name: 'Nguyễn Huy Hoàng', role: 'manager', branch: 'Chi nhánh Quận 1', salary: 15000000, month: '2026-05', status: 'pending' },
  { id: 'pay-05-mgr2', userId: 'usr-mgr2', name: 'Đỗ Thu Trang', role: 'manager', branch: 'Chi nhánh Thảo Điền', salary: 16000000, month: '2026-05', status: 'pending' },
  { id: 'pay-05-acc', userId: 'usr-acc', name: 'Phạm Thu Thảo', role: 'accountant', salary: 12000000, month: '2026-05', status: 'pending' },
];

async function main() {
  console.log('Starting DB Seed...');

  // 1. Clean up existing data in correct order
  console.log('Cleaning up existing database records...');
  await prisma.auditLog.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatSession.deleteMany({});
  await prisma.damagedGood.deleteMany({});
  await prisma.inventoryTransfer.deleteMany({});
  await prisma.cashReconciliation.deleteMany({});
  await prisma.cSKHTicket.deleteMany({});
  await prisma.cRMClient.deleteMany({});
  await prisma.wikiDoc.deleteMany({});
  await prisma.workspaceComment.deleteMany({});
  await prisma.workspacePost.deleteMany({});
  await prisma.workspaceTask.deleteMany({});
  await prisma.officeReservation.deleteMany({});
  await prisma.taxRecord.deleteMany({});
  await prisma.shiftSwapRequest.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.shiftRequest.deleteMany({});
  await prisma.restockRecord.deleteMany({});
  await prisma.expenseItem.deleteMany({});
  await prisma.payrollRecord.deleteMany({});
  await prisma.dailyReport.deleteMany({});
  await prisma.salaryRequest.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.attendanceLog.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.branch.deleteMany({});

  // 2. Seed Branches
  console.log('Seeding branches...');
  await prisma.branch.create({ data: { name: 'Chi nhánh Quận 1', address: '125 Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM' } });
  await prisma.branch.create({ data: { name: 'Chi nhánh Thảo Điền', address: '68 Xuân Thủy, Phường Thảo Điền, Quận 2, TP. HCM' } });

  // 3. Seed Users with hashed passwords
  console.log('Seeding users...');
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('password', salt);

  for (const u of DEFAULT_USERS) {
    await prisma.user.create({
      data: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        branch: u.branch || null,
        avatar: u.avatar || null,
        salary: u.salary || null,
        totalSpent: u.totalSpent || 0,
      }
    });
  }

  // 4. Seed Products, ProductVariants, and InventoryItems
  console.log('Seeding products, variants, and stock items...');
  for (const prod of MOCK_PRODUCTS) {
    await prisma.product.create({
      data: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        category: prod.category,
        price: prod.price,
        oldPrice: prod.oldPrice || null,
        description: prod.description,
        images: JSON.stringify(prod.images),
        rating: prod.rating,
        reviews: prod.reviews,
        has3D: prod.has3D || false,
        modelType: prod.modelType || null,
        badges: prod.badges ? prod.badges.join(',') : null,
      }
    });

    // Generate variants and stock for each size & color combination
    const sizes = prod.sizes && prod.sizes.length > 0 ? prod.sizes : ['S', 'M', 'L', 'XL'];
    const colors = prod.colors && prod.colors.length > 0 ? prod.colors : [{ name: 'Default', hex: '#CCCCCC' }];

    for (const color of colors) {
      for (const size of sizes) {
        const cleanColorName = color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanSize = size.toLowerCase();
        const sku = `${prod.slug}-${cleanColorName}-${cleanSize}`;

        const variant = await prisma.productVariant.create({
          data: {
            productId: prod.id,
            sku,
            colorName: color.name,
            colorHex: color.hex,
            size,
          }
        });

        // Seed Inventory for both branches
        const stockQ1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
        const stockTD = Math.floor(Math.random() * 8) + 2; // 2 to 9

        await prisma.inventoryItem.create({
          data: {
            variantId: variant.id,
            branchName: 'Chi nhánh Quận 1',
            quantity: stockQ1,
          }
        });

        await prisma.inventoryItem.create({
          data: {
            variantId: variant.id,
            branchName: 'Chi nhánh Thảo Điền',
            quantity: stockTD,
          }
        });

        // Log initial stock creation transaction
        await prisma.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            branchName: 'Chi nhánh Quận 1',
            quantity: stockQ1,
            type: 'restock',
            reason: 'Khởi tạo tồn kho ban đầu',
          }
        });

        await prisma.inventoryTransaction.create({
          data: {
            variantId: variant.id,
            branchName: 'Chi nhánh Thảo Điền',
            quantity: stockTD,
            type: 'restock',
            reason: 'Khởi tạo tồn kho ban đầu',
          }
        });
      }
    }
  }

  // 5. Seed Promotions
  console.log('Seeding promotions...');
  await prisma.promotion.createMany({
    data: [
      { code: 'SALE10', discountType: 'percent', value: 10, description: 'Giảm giá 10% tổng hóa đơn' },
      { code: 'FREESHIP', discountType: 'freeship', value: 0, description: 'Miễn phí vận chuyển toàn quốc' },
      { code: 'XUAN2026', discountType: 'fixed', value: 50000, minOrderValue: 500000, description: 'Giảm trực tiếp 50k cho đơn từ 500k' }
    ]
  });

  // 6. Seed Finance records
  console.log('Seeding payroll and expenses...');
  for (const exp of INITIAL_EXPENSES) {
    await prisma.expenseItem.create({
      data: {
        id: exp.id,
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        date: exp.date,
      }
    });
  }

  for (const pay of INITIAL_PAYROLL) {
    await prisma.payrollRecord.create({
      data: {
        id: pay.id,
        userId: pay.userId,
        name: pay.name,
        role: pay.role,
        branch: pay.branch || null,
        salary: pay.salary,
        month: pay.month,
        status: pay.status,
        paymentDate: pay.paymentDate || null,
      }
    });
  }

  // 7. Seed Restock record
  console.log('Seeding restock request record...');
  await prisma.restockRecord.create({
    data: {
      id: 'rest-1',
      productId: 'prod-01',
      productName: 'Áo Thun Premium Cotton Minimalist',
      branch: 'Chi nhánh Quận 1',
      amount: 20,
      cost: 2800000,
      status: 'pending',
      size: 'M',
      color: 'Trắng'
    }
  });

  // 8. Seed Wiki Docs
  console.log('Seeding wiki documents...');
  await prisma.wikiDoc.createMany({
    data: [
      { id: 'wiki-1', title: 'Quy trình Mở cửa và Chuẩn bị Ca làm', category: 'operations', content: '1. Nhân viên có mặt trước ca làm 15 phút.\n2. Bật hệ thống đèn, điều hòa, kiểm tra vệ sinh sàn diễn và kệ trưng bày sản phẩm.\n3. Kiểm tra tiền mặt lẻ tại két POS bán hàng.\n4. Thực hiện bàn giao ca với ca trước nếu có.', lastUpdated: '2026-05-10' },
      { id: 'wiki-2', title: 'Chính sách Phúc lợi & Đãi ngộ nhân viên', category: 'hr', content: '1. Được hưởng chiết khấu mua hàng nội bộ 30% cho bản thân.\n2. Thưởng doanh số chi nhánh hàng tháng nếu vượt KPI.\n3. Hỗ trợ phụ cấp ăn trưa 50.000đ/ngày đối với ca làm trên 8 tiếng.', lastUpdated: '2026-05-12' },
    ]
  });

  // 9. Seed Announcements
  console.log('Seeding announcements...');
  await prisma.announcement.createMany({
    data: [
      { title: 'Triển khai BST Linen Hè và Họp chiến lược doanh số', content: 'Họp toàn thể các trưởng bộ phận và quản lý chi nhánh vào lúc 9h00 sáng Thứ Hai tuần tới tại văn phòng tổng.', recipientType: 'all', senderName: 'Trần Quốc Bảo' },
      { title: 'Yêu cầu kiểm toán báo cáo thuế Quý II/2026', content: 'Vui lòng hoàn thành đối soát P&L ledger trước ngày 15/06/2026 để chuẩn bị nộp tờ khai thuế.', recipientType: 'accountant', senderName: 'Trần Quốc Bảo' }
    ]
  });

  // 10. Seed CSKH Messages & Sessions
  console.log('Seeding CSKH chat data...');
  const chatSession = await prisma.chatSession.create({
    data: {
      customerName: 'Lâm Khánh Vy',
      customerEmail: 'customer@gmail.com',
      lastMessage: 'Shop ơi đầm lụa slip dress có size XS không ạ?',
    }
  });

  await prisma.chatMessage.createMany({
    data: [
      { sessionId: chatSession.id, sender: 'customer', content: 'Hello shop!' },
      { sessionId: chatSession.id, sender: 'staff', content: 'NOVYN.WEAR xin chào chị Vy, shop có thể hỗ trợ gì cho mình ạ?' },
      { sessionId: chatSession.id, sender: 'customer', content: 'Shop ơi đầm lụa slip dress có size XS không ạ?' },
    ]
  });

  console.log('DB Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
