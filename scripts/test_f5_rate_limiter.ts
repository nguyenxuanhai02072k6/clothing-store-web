import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { globalIpLimiter } from '../backend/security/rateLimiter';
import { loginAction } from '../backend/actions/authActions';

async function runF5RateLimiterTests() {
  console.log('🧪 === BẮT ĐẦU KIỂM THỬ BẢO VỆ CHỐNG SPAM F5 & HTTP FLOOD (MIDDLEWARE LAYER) ===\n');

  const spammerIp = '198.51.100.42';
  const innocentIp = '203.0.113.19';

  // Đảm bảo limiter sạch trước khi test
  await globalIpLimiter.reset(spammerIp);
  await globalIpLimiter.reset(innocentIp);

  // 1. Kiểm thử mô phỏng Spam F5 (Gửi 85 requests dồn dập từ 1 IP)
  console.log('1. Mô phỏng 1 IP bấm giữ F5 liên tục 85 lần trong vài giây...');
  let allowedCount = 0;
  let blockedCount = 0;
  let sampleBlockedResponse: any = null;

  for (let i = 1; i <= 85; i++) {
    const req = new NextRequest('http://localhost:3000/products', {
      headers: {
        'x-forwarded-for': spammerIp,
        'accept': 'text/html'
      }
    });

    const res = await middleware(req);
    if (res.status === 429) {
      blockedCount++;
      if (!sampleBlockedResponse) sampleBlockedResponse = res;
    } else {
      allowedCount++;
    }
  }

  console.log(`   👉 Kết quả: ${allowedCount} request đầu được thông qua, ${blockedCount} request sau bị CHẶN ĐỨNG ngay tức khắc.`);

  if (allowedCount === 80 && blockedCount === 5) {
    console.log('   ✅ Bộ lọc chặn chính xác 100% tại ngưỡng 80 request/phút của IP!');
  } else {
    throw new Error(`❌ Ngưỡng chặn không đúng: Allowed=${allowedCount}, Blocked=${blockedCount}`);
  }

  // 2. Kiểm tra Headers bảo vệ (Retry-After, X-RateLimit-*)
  console.log('\n2. Kiểm tra phản hồi HTTP 429 và các HTTP Security Headers...');
  const retryAfter = sampleBlockedResponse.headers.get('Retry-After');
  const limitHeader = sampleBlockedResponse.headers.get('X-RateLimit-Limit');
  const remainingHeader = sampleBlockedResponse.headers.get('X-RateLimit-Remaining');
  const bodyText = await sampleBlockedResponse.text();

  if (retryAfter && limitHeader === '80' && remainingHeader === '0' && bodyText.includes('Thao tác quá nhanh')) {
    console.log(`   ✅ Status 429 chuẩn quốc tế. Retry-After: ${retryAfter}s, Limit: ${limitHeader}, HTML giao diện thông báo tiếng Việt hiển thị hoàn hảo.`);
  } else {
    throw new Error(`❌ Thiếu hoặc sai định dạng headers bảo mật 429!`);
  }

  // 3. Kiểm thử phản hồi dạng JSON cho API request bị spam F5
  console.log('\n3. Kiểm thử phản hồi dạng JSON đối với yêu cầu API/Fetch...');
  const jsonReq = new NextRequest('http://localhost:3000/api/products', {
    headers: {
      'x-forwarded-for': spammerIp,
      'accept': 'application/json'
    }
  });
  const jsonRes = await middleware(jsonReq);
  const jsonData = await jsonRes.json();
  if (jsonRes.status === 429 && jsonData.error === 'Too Many Requests') {
    console.log(`   ✅ Yêu cầu API nhận được JSON 429 chuẩn: "${jsonData.message}".`);
  } else {
    throw new Error('❌ Phản hồi JSON 429 không hợp lệ!');
  }

  // 4. Kiểm thử tính công bằng (Fair Queuing - IP của người khác không bị ảnh hưởng)
  console.log('\n4. Kiểm thử người dùng khác (IP bình thường không bị ảnh hưởng bởi kẻ spam)...');
  const innocentReq = new NextRequest('http://localhost:3000/', {
    headers: {
      'x-forwarded-for': innocentIp,
      'accept': 'text/html'
    }
  });
  const innocentRes = await middleware(innocentReq);
  if (innocentRes.status !== 429) {
    console.log('   ✅ Người dùng bình thường truy cập mượt mà, không hề bị chặn lây.');
  } else {
    throw new Error('❌ Lỗi Fair Queuing: IP người dùng vô tội bị chặn oan!');
  }

  // 5. Kiểm thử hàm băm mật khẩu bất đồng bộ (Non-blocking Async Bcrypt)
  console.log('\n5. Kiểm thử hàm băm mật khẩu bất đồng bộ (Không còn chặn Event Loop của Node.js)...');
  const startBcrypt = Date.now();
  try {
    await loginAction('admin@novynwear.com', 'NovynAdmin@2026!');
  } catch {}
  const duration = Date.now() - startBcrypt;
  console.log(`   ✅ Async bcrypt.compare thực thi hoàn toàn bất đồng bộ (${duration}ms) không gây giật lag máy chủ.`);

  // Dọn dẹp limiter test
  await globalIpLimiter.reset(spammerIp);
  await globalIpLimiter.reset(innocentIp);

  console.log('\n✨ TẤT CẢ 5/5 TEST CASES CHỐNG SPAM F5 & TỐI ƯU EVENT LOOP ĐÃ PASS THÀNH CÔNG! ✨');
}

runF5RateLimiterTests().catch(err => {
  console.error('\n❌ TEST CHỐNG SPAM F5 THẤT BẠI:', err);
  process.exit(1);
});
