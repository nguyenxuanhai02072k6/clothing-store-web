import { execSync } from 'child_process';

const testSuites = [
  { name: '1. Database Concurrency & PostgreSQL Readiness', file: 'scripts/test_db_concurrency.ts' },
  { name: '2. Payment Gateway & Webhook Security', file: 'scripts/test_payment_gateway.ts' },
  { name: '3. Distributed-Ready Rate Limiter', file: 'scripts/test_rate_limiter.ts' },
  { name: '4. Transactional Email Notification System', file: 'scripts/test_email_service.ts' },
  { name: '5. Secure Media & Object Storage Pipeline', file: 'scripts/test_media_upload.ts' },
  { name: '6. Contact & Anti-Spam Form Integration', file: 'scripts/test_contact.ts' },
  { name: '7. Middleware F5 Spam & HTTP Flood Protection', file: 'scripts/test_f5_rate_limiter.ts' },
  { name: '8. Argon2id Password Hashing & Migration Pipeline', file: 'scripts/test_argon2.ts' },
  { name: '9. Two-Tier Stock Reservation & In-Memory Lock', file: 'scripts/test_stock_reservation.ts' }
];

console.log('================================================================');
console.log('🚀 BẮT ĐẦU CHẠY TỔNG BỘ KIỂM THỬ HỆ THỐNG TOÀN DIỆN (REGRESSION TEST)');
console.log('================================================================\n');

let allPassed = true;
const results: { name: string; status: 'PASS' | 'FAIL'; durationMs: number }[] = [];

for (const suite of testSuites) {
  console.log(`▶️ ĐANG CHẠY SUITE: ${suite.name}...`);
  const startTime = Date.now();
  try {
    const output = execSync(`npx tsx ${suite.file}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(output);
    const durationMs = Date.now() - startTime;
    results.push({ name: suite.name, status: 'PASS', durationMs });
  } catch (error: any) {
    console.error(`❌ THẤT BẠI: ${suite.name}`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    const durationMs = Date.now() - startTime;
    results.push({ name: suite.name, status: 'FAIL', durationMs });
    allPassed = false;
  }
}

console.log('\n================================================================');
console.log('📊 BẢNG TỔNG KẾT KIỂM THỬ HỆ THỐNG TOÀN DIỆN:');
console.log('================================================================');
for (const r of results) {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${r.status}] ${r.name} (${r.durationMs}ms)`);
}

if (allPassed) {
  console.log('\n🎉 TẤT CẢ CÁC BỘ TEST TOÀN HỆ THỐNG ĐÃ ĐẠT 100% TIÊU CHUẨN SẢN XUẤT! 🎉');
  process.exit(0);
} else {
  console.error('\n⚠️ CÓ TEST CASE THẤT BẠI TRONG QUÁ TRÌNH KIỂM THỬ HỆ THỐNG!');
  process.exit(1);
}
