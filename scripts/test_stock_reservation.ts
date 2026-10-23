/**
 * TEST SUITE: TWO-TIER STOCK RESERVATION & IN-MEMORY ATOMIC LOCK
 * 
 * Kiểm thử toàn diện cơ chế Tạm Giữ Hàng (Cart Reservation 10 phút)
 * và Bộ đệm In-Memory Atomic Lock chống tranh chấp hàng triệu người cùng giật hàng.
 */

import { prisma } from '../database/db';
import { stockReservationEngine } from '../backend/security/stockReservationEngine';
import { createOrderAction, reserveCartStockAction, releaseCartStockAction } from '../backend/actions/orderActions';

async function runStockReservationTests() {
  console.log('🧪 === BẮT ĐẦU KIỂM THỬ STOCK RESERVATION & IN-MEMORY ATOMIC LOCK ===\n');

  // Chuẩn bị dữ liệu kiểm thử: 1 sản phẩm có duy nhất 1 chiếc tồn kho
  const testProdId = `prod-flash-${Date.now()}`;
  const testBranch = 'Chi nhánh Quận 1';
  
  const product = await prisma.product.create({
    data: {
      id: testProdId,
      name: 'Áo Khoác Limited Edition (Chỉ Còn 1 Chiếc)',
      slug: `ao-khoac-limited-${Date.now()}`,
      category: 'Tops',
      price: 1500000,
      description: 'Hàng hiếm số lượng giới hạn 1 cái duy nhất',
      images: JSON.stringify(['https://images.unsplash.com/photo-1544441893-675973e31985?w=800']),
      variants: {
        create: {
          id: `var-${testProdId}`,
          sku: `SKU-LIMITED-${Date.now()}`,
          colorName: 'Midnight Black',
          colorHex: '#000000',
          size: 'L',
          inventoryItems: {
            create: {
              branchName: testBranch,
              quantity: 1 // DUY NHẤT 1 CHIẾC TRONG KHO!
            }
          }
        }
      }
    },
    include: {
      variants: {
        include: {
          inventoryItems: true
        }
      }
    }
  });

  const variant = product.variants[0];
  console.log(`📦 Đã tạo sản phẩm kiểm thử: ${product.name}`);
  console.log(`   Tồn kho vật lý ban đầu: 1 chiếc tại ${testBranch}.\n`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Khách A bấm "Tiến hành thanh toán" -> Kích hoạt tạm giữ 10 phút
    // -------------------------------------------------------------------------
    console.log('1. Kiểm thử Khách A tạm giữ hàng trong 10 phút (Cart Reservation)...');
    const sessionA = 'session-khach-A-123';
    const reserveA = await stockReservationEngine.reserveStock({
      variantId: variant.id,
      branchName: testBranch,
      quantity: 1,
      sessionId: sessionA,
      ttlSeconds: 600 // 10 phút
    });

    if (!reserveA.success || !reserveA.reservationId) {
      throw new Error(`❌ Khách A không thể tạm giữ hàng: ${reserveA.message}`);
    }
    console.log(`   ✅ Khách A tạm giữ THÀNH CÔNG! Mã giữ hàng: ${reserveA.reservationId}`);
    console.log(`   ⏱️ Thời gian giữ: ${reserveA.expiresInSeconds}s (Hết hạn lúc: ${reserveA.expiresAt})`);
    console.log(`   👉 Tồn kho khả dụng còn lại trong kho: ${reserveA.availableStock}`);

    if (reserveA.availableStock !== 0) {
      throw new Error('❌ Lỗi: Tồn kho khả dụng sau khi giữ hàng phải bằng 0!');
    }

    // -------------------------------------------------------------------------
    // TEST 2: Khách B cùng lúc bấm Mua -> Chặn đứng ngay tại RAM (< 1ms)
    // -------------------------------------------------------------------------
    console.log('\n2. Kiểm thử Khách B bấm mua cùng lúc (Chặn tức thì tại RAM < 1ms)...');
    const startB = Date.now();
    const sessionB = 'session-khach-B-456';
    const reserveB = await stockReservationEngine.reserveStock({
      variantId: variant.id,
      branchName: testBranch,
      quantity: 1,
      sessionId: sessionB,
      ttlSeconds: 600
    });
    const durationB = Date.now() - startB;

    if (reserveB.success) {
      throw new Error('❌ LỖI NGHIÊM TRỌNG: Khách B vẫn tạm giữ được hàng khi Khách A đang giữ!');
    }
    console.log(`   ⚡ Tốc độ phản hồi tại RAM: ${durationB}ms.`);
    console.log(`   ✅ Khách B bị CHẶN ĐỨNG an toàn với lý do: "${reserveB.message}".`);

    // -------------------------------------------------------------------------
    // TEST 3: Khách A đổi ý hủy đơn -> Tự động nhả hàng tức thì cho Khách B
    // -------------------------------------------------------------------------
    console.log('\n3. Kiểm thử Khách A hủy đơn -> Hệ thống nhả kho lập tức cho Khách B...');
    const releaseSuccess = await stockReservationEngine.releaseReservation(reserveA.reservationId);
    if (!releaseSuccess) {
      throw new Error('❌ Không thể nhả hàng đã giữ!');
    }
    console.log('   ✅ Đã nhả hàng của Khách A lại vào kho chung.');

    // Khách B thử đặt lại ngay sau khi hàng được nhả
    const retryB = await stockReservationEngine.reserveStock({
      variantId: variant.id,
      branchName: testBranch,
      quantity: 1,
      sessionId: sessionB,
      ttlSeconds: 600
    });

    if (!retryB.success || !retryB.reservationId) {
      throw new Error('❌ Khách B không thể giữ hàng sau khi Khách A nhả kho!');
    }
    console.log(`   ✅ Khách B nhận được hàng ngay lập tức! Mã giữ mới: ${retryB.reservationId}`);

    // -------------------------------------------------------------------------
    // TEST 4: Khách B hoàn tất thanh toán (Commit Order)
    // -------------------------------------------------------------------------
    console.log('\n4. Kiểm thử Khách B thanh toán hoàn tất đơn hàng (Commit Transaction)...');
    const orderResult = await createOrderAction({
      customerInfo: {
        fullName: 'Nguyễn Văn B',
        phone: '0987654321',
        email: 'khachb@novynwear.com',
        address: '123 Nguyễn Huệ, Quận 1, TP. HCM',
      },
      items: [
        {
          productId: testProdId,
          quantity: 1,
          colorName: 'Midnight Black',
          colorHex: '#000000',
          size: 'L',
          reservationId: retryB.reservationId
        }
      ],
      paymentMethod: 'cod',
      branchName: testBranch,
      sessionId: sessionB
    });

    if (!orderResult.success) {
      throw new Error(`❌ Đặt hàng thất bại: ${orderResult.message}`);
    }
    console.log(`   ✅ Đơn hàng tạo thành công: #${orderResult.orderId}`);

    // Kiểm tra tồn kho vật lý trong DB sau khi mua: Phải còn đúng 0
    const finalItem = await prisma.inventoryItem.findUnique({
      where: {
        variantId_branchName: {
          variantId: variant.id,
          branchName: testBranch
        }
      }
    });
    console.log(`   👉 Tồn kho vật lý trong CSDL sau khi đơn hoàn tất: ${finalItem?.quantity}`);
    if (finalItem?.quantity !== 0) {
      throw new Error('❌ Lỗi: Tồn kho vật lý trong CSDL không bị trừ đúng!');
    }

    // -------------------------------------------------------------------------
    // TEST 5: Stress Test 100 yêu cầu cùng tranh chấp giật 1 món hàng
    // -------------------------------------------------------------------------
    console.log('\n5. Mô phỏng 100 requests cùng giật 1 sản phẩm chỉ còn 1 cái duy nhất...');
    // Đặt lại tồn kho = 1 để thử sức ép đồng thời
    await prisma.inventoryItem.update({
      where: {
        variantId_branchName: {
          variantId: variant.id,
          branchName: testBranch
        }
      },
      data: { quantity: 1 }
    });

    const concurrentRequests = Array.from({ length: 100 }).map((_, idx) => {
      return stockReservationEngine.reserveStock({
        variantId: variant.id,
        branchName: testBranch,
        quantity: 1,
        sessionId: `stress-session-${idx}`,
        ttlSeconds: 60
      });
    });

    const results = await Promise.all(concurrentRequests);
    const successCount = results.filter(r => r.success).length;
    const blockedCount = results.filter(r => !r.success).length;

    console.log(`   👉 Kết quả 100 requests đồng thời:`);
    console.log(`      - Thành công : ${successCount}`);
    console.log(`      - Bị chặn    : ${blockedCount}`);

    if (successCount !== 1 || blockedCount !== 99) {
      throw new Error(`❌ Lỗi đồng quy: Phải có ĐÚNG 1 người mua được và 99 người bị chặn! (Thành công: ${successCount})`);
    }
    console.log('   ✅ Cơ chế Atomic Lock thành công tuyệt đối: 1 người giữ hàng, 99 người còn lại bị chặn đứng.');

    console.log('\n✨ TẤT CẢ 5/5 TEST CASES STOCK RESERVATION ĐÃ PASS THÀNH CÔNG! ✨');
  } finally {
    // Dọn dẹp dữ liệu kiểm thử
    await prisma.stockReservation.deleteMany({ where: { variantId: variant.id } });
    await prisma.orderItem.deleteMany({ where: { variantId: variant.id } });
    await prisma.inventoryTransaction.deleteMany({ where: { variantId: variant.id } });
    await prisma.inventoryItem.deleteMany({ where: { variantId: variant.id } });
    await prisma.productVariant.deleteMany({ where: { productId: testProdId } });
    await prisma.product.deleteMany({ where: { id: testProdId } });
    console.log('   🧹 Đã dọn dẹp dữ liệu kiểm thử khỏi CSDL.');
  }
}

runStockReservationTests().catch(err => {
  console.error('\n❌ TEST STOCK RESERVATION THẤT BẠI:', err);
  process.exit(1);
});
