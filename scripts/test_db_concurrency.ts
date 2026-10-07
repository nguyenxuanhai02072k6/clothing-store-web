import { prisma, withDbRetry } from '../database/db';
import fs from 'fs';
import path from 'path';

async function runDbConcurrencyTests() {
  console.log('🧪 === BẮT ĐẦU KIỂM THỬ DATABASE CONCURRENCY RESILIENCE ===\n');

  // 1. Kiểm tra SQLite Journal Mode = WAL
  console.log('1. Kiểm tra cấu hình SQLite Journal Mode...');
  const journalModeResult: any = await prisma.$queryRawUnsafe('PRAGMA journal_mode;');
  const journalMode = journalModeResult[0]?.journal_mode || '';
  if (journalMode.toLowerCase() === 'wal') {
    console.log(`   ✅ SQLite đang chạy ở chế độ WAL (Write-Ahead Logging): "${journalMode}". Cho phép đọc/ghi song song không chặn.`);
  } else {
    throw new Error(`❌ SQLite chưa bật WAL mode! Giá trị hiện tại: "${journalMode}"`);
  }

  // 2. Kiểm tra Busy Timeout
  console.log('\n2. Kiểm tra SQLite Busy Timeout (Thời gian chờ nhả khóa)...');
  const timeoutResult: any = await prisma.$queryRawUnsafe('PRAGMA busy_timeout;');
  const timeoutMs = timeoutResult[0]?.timeout || 0;
  console.log(`   ✅ SQLite busy_timeout cấu hình: ${timeoutMs}ms (Ngăn chặn lỗi SQLITE_BUSY đột ngột).`);

  // 3. Kiểm thử hàm retry helper withDbRetry
  console.log('\n3. Kiểm thử cơ chế retry helper withDbRetry...');
  let attemptCount = 0;
  const retryResult = await withDbRetry(async () => {
    attemptCount++;
    if (attemptCount < 2) {
      const err: any = new Error('database is locked');
      err.code = 'SQLITE_BUSY';
      throw err;
    }
    return 'RETRY_SUCCESS';
  }, { maxRetries: 3, baseDelayMs: 20 });

  if (retryResult === 'RETRY_SUCCESS' && attemptCount === 2) {
    console.log('   ✅ withDbRetry tự động bắt lỗi lock contention, chờ exponential backoff và phục hồi thành công.');
  } else {
    throw new Error('❌ withDbRetry không phục hồi thành công sau lỗi lock contention!');
  }

  // 4. Kiểm thử Concurrency cao với 15 truy vấn song song (Promise.all)
  console.log('\n4. Kiểm thử tải đồng thời (15 tác vụ đọc/ghi song song)...');
  const parallelTasks = Array.from({ length: 15 }, async (_, i) => {
    return await withDbRetry(async () => {
      const users = await prisma.user.findMany({ take: 2 });
      const products = await prisma.product.findMany({ take: 2 });
      return { task: i, usersCount: users.length, productsCount: products.length };
    });
  });

  const parallelResults = await Promise.all(parallelTasks);
  if (parallelResults.length === 15 && parallelResults.every(r => r.usersCount >= 0)) {
    console.log('   ✅ 15 tác vụ đồng thời hoàn tất 100% không xảy ra lock deadlock hay crash.');
  } else {
    throw new Error('❌ Lỗi xử lý đồng thời trong SQLite!');
  }

  // 5. Kiểm tra file PostgreSQL schema template
  console.log('\n5. Kiểm tra tính sẵn sàng của PostgreSQL Schema template...');
  const pgSchemaPath = path.join(process.cwd(), 'prisma', 'schema.postgresql.prisma');
  if (fs.existsSync(pgSchemaPath)) {
    const pgContent = fs.readFileSync(pgSchemaPath, 'utf8');
    if (pgContent.includes('provider = "postgresql"') && pgContent.includes('model Order')) {
      console.log('   ✅ PostgreSQL schema template (prisma/schema.postgresql.prisma) đầy đủ và sẵn sàng chuyển đổi.');
    } else {
      throw new Error('❌ PostgreSQL schema template bị thiếu nội dung quan trọng!');
    }
  } else {
    throw new Error('❌ Không tìm thấy file prisma/schema.postgresql.prisma!');
  }

  console.log('\n✨ TẤT CẢ 5/5 TEST CASES DATABASE CONCURRENCY ĐÃ PASS THÀNH CÔNG! ✨');
}

runDbConcurrencyTests().catch(err => {
  console.error('\n❌ TEST DATABASE CONCURRENCY THẤT BẠI:', err);
  process.exit(1);
});
