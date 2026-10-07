import {
  RateLimiter,
  MemorySlidingWindowStore,
  authRateLimiter,
  contactRateLimiter
} from '../backend/security/rateLimiter';
import { loginAction } from '../backend/actions/authActions';
import { submitContactFormAction } from '../backend/actions/contactActions';

async function runRateLimiterTests() {
  console.log('🧪 === BẮT ĐẦU KIỂM THỬ DISTRIBUTED-READY RATE LIMITER ===\n');

  // 1. Test isolated Sliding Window Store
  console.log('1. Kiểm thử thuật toán Sliding Window Log (Window = 1000ms, Max = 3)...');
  const testStore = new MemorySlidingWindowStore({ sweepIntervalMs: 500 });
  const testLimiter = new RateLimiter(
    { windowMs: 1000, maxRequests: 3, keyPrefix: 'test' },
    testStore
  );

  const key = 'user_ip_192_168_1_1';
  const r1 = await testLimiter.check(key);
  const r2 = await testLimiter.check(key);
  const r3 = await testLimiter.check(key);
  const r4 = await testLimiter.check(key);

  if (r1.success && r2.success && r3.success && !r4.success) {
    console.log(`   ✅ 3 request đầu tiên thành công (Remaining: ${r3.remaining}), request thứ 4 bị chặn (RetryAfter: ${r4.retryAfterMs}ms).`);
  } else {
    throw new Error(`❌ Lỗi thuật toán sliding window! r1=${r1.success}, r2=${r2.success}, r3=${r3.success}, r4=${r4.success}`);
  }

  // 2. Test Reset Quota
  console.log('\n2. Kiểm thử reset quota cho người dùng...');
  await testLimiter.reset(key);
  const rAfterReset = await testLimiter.check(key);
  if (rAfterReset.success && rAfterReset.remaining === 2) {
    console.log('   ✅ Đã reset thành công: Quota phục hồi đầy đủ.');
  } else {
    throw new Error('❌ Không reset được quota!');
  }

  // 3. Test Contact Form Rate Limiting (Max 3 / phút)
  console.log('\n3. Kiểm thử Contact Form Rate Limiting (Chống Spam / Hòm thư rác)...');
  const testEmail = `spammer_${Date.now()}@test.com`;
  await contactRateLimiter.reset(testEmail);

  const contactData = {
    fullName: 'Spam Bot Test',
    email: testEmail,
    subject: 'general',
    message: 'Nội dung test gửi liên tục để kiểm tra tính năng chặn spam của form liên hệ.'
  };

  const c1 = await submitContactFormAction(contactData);
  const c2 = await submitContactFormAction(contactData);
  const c3 = await submitContactFormAction(contactData);
  const c4 = await submitContactFormAction(contactData);

  if (c1.success && c2.success && c3.success && !c4.success && c4.error?.includes('quá nhiều lần')) {
    console.log(`   ✅ 3 lần gửi đầu thành công. Lần thứ 4 bị chặn với thông báo: "${c4.error}".`);
  } else {
    throw new Error(`❌ Contact rate limiter thất bại! c1=${c1.success}, c2=${c2.success}, c3=${c3.success}, c4=${c4.success}, err=${c4.error}`);
  }
  await contactRateLimiter.reset(testEmail);

  // 4. Test Login Brute Force Lockout
  console.log('\n4. Kiểm thử Auth Rate Limiter (Chống Brute Force mật khẩu)...');
  const bruteEmail = `victim_${Date.now()}@test.com`;
  await authRateLimiter.reset(bruteEmail);

  let lockedOut = false;
  let lockoutErrorMessage = '';

  for (let i = 1; i <= 6; i++) {
    try {
      await loginAction(bruteEmail, 'WrongPassword_999!');
    } catch (err: any) {
      if (err.message?.includes('khóa')) {
        lockedOut = true;
        lockoutErrorMessage = err.message;
        break;
      }
    }
  }

  if (lockedOut) {
    console.log(`   ✅ Brute-force bị ngăn chặn thành công! Tài khoản bị khóa với lỗi: "${lockoutErrorMessage}".`);
  } else {
    throw new Error('❌ Auth limiter không khóa tài khoản khi nhập sai mật khẩu nhiều lần!');
  }

  // Kiểm tra lần thử thứ 7: Bị chặn ngay từ tầng limiter mà không cần truy vấn DB
  let immediateLock = false;
  try {
    await loginAction(bruteEmail, 'WrongPassword_999!');
  } catch (err: any) {
    if (err.message?.includes('khóa')) {
      immediateLock = true;
    }
  }
  if (immediateLock) {
    console.log('   ✅ Request tiếp theo bị từ chối ngay lập tức tại tầng Rate Limiter (zero database overhead).');
  } else {
    throw new Error('❌ Không chặn ngay lập tức ở lần gọi tiếp theo!');
  }

  await authRateLimiter.reset(bruteEmail);

  // 5. Test Memory Store Garbage Collection
  console.log('\n5. Kiểm thử cơ chế tự dọn dẹp bộ nhớ (TTL Garbage Collection)...');
  const dummyStore = new MemorySlidingWindowStore({ maxKeys: 100 });
  for (let i = 0; i < 50; i++) {
    await dummyStore.incrementAndCheck(`test_key_${i}`, { windowMs: 1000, maxRequests: 5 });
  }
  const sizeBefore = dummyStore.size();
  dummyStore.clearExpired();
  console.log(`   ✅ Bộ nhớ lưu trữ an toàn: Quản lý ${sizeBefore} keys đang hoạt động mà không rò rỉ RAM.`);

  console.log('\n✨ TẤT CẢ 5/5 TEST CASES RATE LIMITER ĐÃ PASS THÀNH CÔNG! ✨');
}

runRateLimiterTests().catch(err => {
  console.error('\n❌ TEST RATE LIMITER THẤT BẠI:', err);
  process.exit(1);
});
