/**
 * ==============================================================================
 * TEST SUITE: SMART SHIPPING ENGINE & ADMINISTRATIVE ADDRESS (SUITE 10)
 * ==============================================================================
 * Kiểm tra toàn diện hệ thống phân cấp 4 cấp hành chính, định tuyến kho tối ưu,
 * 3 gói cước SLA (Hỏa tốc 2H, Nhanh, Tiết kiệm) và các quy tắc chiết khấu cước.
 * ==============================================================================
 */

import { VIETNAM_PROVINCES, findProvinceByName, findDistrictByName } from '../data/vietnamLocations';
import { smartShippingEngine } from '../backend/services/smartShippingEngine';
import { createOrderAction } from '../backend/actions/orderActions';
import { prisma } from '../database/db';

async function runSmartShippingTests() {
  console.log('🚀 [START] Bắt đầu kiểm thử Smart Shipping & Vietnam Address Selector...\n');
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (detail) console.error(`     Chi tiết lỗi: ${detail}`);
    }
  }

  // TEST 1: Kiểm tra cấu trúc dữ liệu địa giới hành chính Việt Nam
  console.log('--- TEST 1: Cấu trúc dữ liệu 63 Tỉnh/Thành & Phân vùng ---');
  const hcm = findProvinceByName('TP. Hồ Chí Minh');
  const hanoi = findProvinceByName('Hà Nội');
  const binhduong = findProvinceByName('Bình Dương');
  const danang = findProvinceByName('Đà Nẵng');

  assert(VIETNAM_PROVINCES.length >= 10, 'Danh sách tỉnh thành đã nạp đầy đủ các trung tâm kinh tế');
  assert(hcm?.zone === 'ZONE_1_HCM', 'TP.HCM thuộc ZONE_1_HCM');
  assert(binhduong?.zone === 'ZONE_2_SOUTH', 'Bình Dương thuộc ZONE_2_SOUTH');
  assert(hanoi?.zone === 'ZONE_3_CENTRAL_NORTH', 'Hà Nội thuộc ZONE_3_CENTRAL_NORTH');
  assert(danang?.zone === 'ZONE_3_CENTRAL_NORTH', 'Đà Nẵng thuộc ZONE_3_CENTRAL_NORTH');

  // TEST 2: Kiểm tra phân cấp Quận/Huyện và Phường/Xã
  console.log('\n--- TEST 2: Cấp Quận/Huyện & Phường/Xã ---');
  const dist1 = findDistrictByName(hcm!, 'Quận 1');
  const thuduc = findDistrictByName(hcm!, 'Thành phố Thủ Đức (Quận 2, 9, Thủ Đức)');
  const cuchi = findDistrictByName(hcm!, 'Huyện Củ Chi');

  assert(dist1?.isInnerCity === true, 'Quận 1 là nội thành TP.HCM (isInnerCity = true)');
  assert(dist1?.preferredBranch === 'Chi nhánh Quận 1', 'Quận 1 ưu tiên Chi nhánh Quận 1');
  assert(thuduc?.preferredBranch === 'Chi nhánh Thảo Điền', 'Thủ Đức/Quận 2 ưu tiên Chi nhánh Thảo Điền');
  assert(cuchi?.isInnerCity === false, 'Củ Chi là ngoại thành TP.HCM (isInnerCity = false)');
  assert(dist1?.wards.includes('Phường Bến Nghé') === true, 'Quận 1 có Phường Bến Nghé');

  // TEST 3: Gói cước Hỏa Tốc 2 Giờ (Instant 2H)
  console.log('\n--- TEST 3: Tính cước Hỏa Tốc 2 Giờ & Nội thành ---');
  const instantRes = smartShippingEngine.calculate({
    provinceName: 'TP. Hồ Chí Minh',
    districtName: 'Quận 1',
    wardName: 'Phường Bến Thành',
    subtotal: 300000,
    customerTier: 'bronze',
    paymentMethod: 'cod'
  });

  const instantOpt = instantRes.options.find(o => o.id === 'instant_2h');
  assert(instantRes.zone === 'ZONE_1_HCM', 'Đúng vùng ZONE_1_HCM');
  assert(instantRes.recommendedBranch === 'Chi nhánh Quận 1', 'Định tuyến chuẩn về Chi nhánh Quận 1');
  assert(instantOpt !== undefined, 'Hỗ trợ gói Hỏa Tốc 2 Giờ tại Quận 1');
  assert(instantOpt?.finalFee === 50000, 'Cước hỏa tốc tiêu chuẩn là 50.000đ', `Thực tế: ${instantOpt?.finalFee}`);

  // TEST 4: Ngoại thành / Tỉnh khác KHÔNG hỗ trợ Hỏa tốc 2H
  console.log('\n--- TEST 4: Ngoại thành / Liên tỉnh loại trừ Hỏa tốc 2H ---');
  const hanoiRes = smartShippingEngine.calculate({
    provinceName: 'Hà Nội',
    districtName: 'Quận Hoàn Kiếm',
    subtotal: 300000
  });

  const hanoiInstant = hanoiRes.options.find(o => o.id === 'instant_2h');
  const hanoiStandard = hanoiRes.options.find(o => o.id === 'express_standard');
  assert(hanoiInstant === undefined, 'Hà Nội không có gói Hỏa Tốc xe máy 2H từ kho HCM');
  assert(hanoiRes.zone === 'ZONE_3_CENTRAL_NORTH', 'Hà Nội được xếp vào Tuyến Liên miền ZONE_3');
  assert(hanoiStandard?.finalFee === 38000, 'Cước đường bay Hà Nội là 38.000đ', `Thực tế: ${hanoiStandard?.finalFee}`);

  // TEST 5: Chính sách Miễn phí vận chuyển (Freeship >= 500k hoặc VIP)
  console.log('\n--- TEST 5: Chính sách Freeship đơn >= 500k & Khách VIP ---');
  const freeSubtotalRes = smartShippingEngine.calculate({
    provinceName: 'TP. Hồ Chí Minh',
    districtName: 'Quận 3',
    subtotal: 650000, // Đơn trên 500k
    customerTier: 'standard'
  });
  const standardOptionFree = freeSubtotalRes.options.find(o => o.id === 'express_standard');
  assert(standardOptionFree?.finalFee === 0, 'Đơn từ 500k được Freeship tiêu chuẩn (cước 0đ)', `Thực tế: ${standardOptionFree?.finalFee}`);

  const vipDiamondRes = smartShippingEngine.calculate({
    provinceName: 'Đà Nẵng',
    districtName: 'Quận Hải Châu',
    subtotal: 200000,
    customerTier: 'diamond'
  });
  const vipStandardOpt = vipDiamondRes.options.find(o => o.id === 'express_standard');
  assert(vipStandardOpt?.finalFee === 0, 'Khách hàng VIP Diamond được Freeship tiêu chuẩn toàn quốc', `Thực tế: ${vipStandardOpt?.finalFee}`);

  // TEST 6: Trợ giá thanh toán không tiền mặt (VNPay / Transfer) & Trọng lượng vượt mức
  console.log('\n--- TEST 6: Trợ giá không tiền mặt & Phụ phí cân nặng ---');
  const cashlessRes = smartShippingEngine.calculate({
    provinceName: 'Bình Dương',
    districtName: 'Thành phố Thủ Dầu Một',
    subtotal: 200000,
    paymentMethod: 'vnpay',
    totalWeightGrams: 350
  });
  const cashlessOpt = cashlessRes.options.find(o => o.id === 'express_standard');
  // Base Bình Dương: 30.000đ - giảm 10.000đ VNPay = 20.000đ
  assert(cashlessOpt?.finalFee === 20000, 'Thanh toán VNPay giảm 10.000đ cước vận chuyển (30k -> 20k)', `Thực tế: ${cashlessOpt?.finalFee}`);
  assert(cashlessRes.recommendedBranch === 'Chi nhánh Thảo Điền', 'Bình Dương được xuất kho từ Chi nhánh Thảo Điền (cửa ngõ phía Đông)');

  const overweightRes = smartShippingEngine.calculate({
    provinceName: 'TP. Hồ Chí Minh',
    districtName: 'Quận 1',
    subtotal: 200000,
    totalWeightGrams: 2200 // Vượt 1kg: thêm 1200g -> ceil(1200/500) = 3 nấc x 5000 = 15.000đ phụ phí
  });
  const overweightStandard = overweightRes.options.find(o => o.id === 'express_standard');
  assert(overweightStandard?.finalFee === 37000, 'Hàng nặng 2.2kg phụ phí 15.000đ (22k base + 15k = 37.000đ)', `Thực tế: ${overweightStandard?.finalFee}`);

  // TEST 7: Tích hợp Database & Server Action CreateOrder với Smart Shipping
  console.log('\n--- TEST 7: Server Action createOrderAction với Smart Shipping ---');
  // Tìm một variant có sẵn tồn kho trong DB để test
  let testVariant = await prisma.productVariant.findFirst({
    where: {
      inventoryItems: {
        some: {
          branchName: 'Chi nhánh Quận 1',
          quantity: { gt: 0 }
        }
      }
    },
    include: { product: true }
  });

  if (!testVariant) {
    testVariant = await prisma.productVariant.findFirst({
      include: { product: true }
    });
    if (testVariant) {
      await prisma.inventoryItem.upsert({
        where: {
          variantId_branchName: {
            variantId: testVariant.id,
            branchName: 'Chi nhánh Quận 1'
          }
        },
        update: { quantity: 10 },
        create: {
          variantId: testVariant.id,
          branchName: 'Chi nhánh Quận 1',
          quantity: 10
        }
      });
    }
  }

  if (testVariant) {
    const orderRes = await createOrderAction({
      customerInfo: {
        fullName: 'Nguyễn Văn Test Shipping',
        phone: '0912345678',
        email: 'testshipping@novyn.vn',
        address: '72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        notes: 'Giao giờ hành chính'
      },
      items: [
        {
          productId: testVariant.productId,
          quantity: 1,
          colorName: testVariant.colorName,
          colorHex: '#000000',
          size: testVariant.size
        }
      ],
      paymentMethod: 'cod',
      branchName: 'Chi nhánh Quận 1',
      shippingOptionId: 'instant_2h',
      provinceName: 'TP. Hồ Chí Minh',
      districtName: 'Quận 1',
      wardName: 'Phường Bến Nghé'
    });

    assert(orderRes.success === true, 'Tạo đơn hàng với Smart Shipping thành công');
    if (orderRes.orderId) {
      const createdOrder = await prisma.order.findUnique({
        where: { id: orderRes.orderId }
      });
      assert(createdOrder !== null, 'Đơn hàng lưu thành công trong SQLite Database');
      assert(createdOrder?.shipping === 50000, 'Cước phí Hỏa tốc 2H được lưu đúng 50.000đ trong DB', `DB shipping: ${createdOrder?.shipping}`);
      assert(createdOrder?.customerNotes?.includes('Hỏa Tốc 2 Giờ') === true, 'Ghi chú đơn hàng tự động lưu gói vận chuyển và nhà vận chuyển', `customerNotes: ${createdOrder?.customerNotes}`);

      // Dọn dẹp đơn test
      await prisma.orderItem.deleteMany({ where: { orderId: orderRes.orderId } });
      await prisma.payment.deleteMany({ where: { orderId: orderRes.orderId } });
      await prisma.order.delete({ where: { id: orderRes.orderId } });
      console.log('     (Đã dọn dẹp đơn test sạch sẽ)');
    }
  } else {
    console.log('  ⚠️ Bỏ qua Test 7 vì chưa có sản phẩm mẫu trong DB');
  }

  console.log(`\n==============================================================================`);
  console.log(`KẾT QUẢ TEST SMART SHIPPING: ${passedCount}/${totalCount} TESTS THÀNH CÔNG (${Math.round((passedCount/totalCount)*100)}%)`);
  console.log(`==============================================================================\n`);

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runSmartShippingTests()
  .catch((e) => {
    console.error('Unhandled test failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
