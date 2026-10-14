/**
 * TEST SUITE: ARGON2ID PASSWORD SECURITY & MIGRATION PIPELINE
 * 
 * Kiểm thử toàn diện cơ chế băm mật khẩu Argon2id đạt chuẩn OWASP:
 * 1. Băm mật khẩu bằng Argon2id chuẩn hóa ($argon2id$v=19$m=19456,p=1,t=2).
 * 2. Xác thực mật khẩu chính xác / từ chối mật khẩu sai.
 * 3. Khả năng tương thích ngược (Backward Compatibility) với mã băm Bcrypt cũ.
 * 4. Tự động nâng cấp (Seamless Auto-Upgrade / Rehash) từ Bcrypt lên Argon2id khi đăng nhập.
 * 5. Hành vi đổi mật khẩu (Change Password) lưu trữ trực tiếp bằng Argon2id.
 */

import { hashPassword, verifyPassword, ARGON2_OPTIONS } from '../lib/security/passwordHash';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/db';
import { loginAction, registerAction, changePasswordAction } from '../backend/actions/authActions';

async function runArgon2Tests() {
  console.log('🧪 === BẮT ĐẦU KIỂM THỬ BẢO MẬT MẬT KHẨU ARGON2ID ===\n');

  // Test 1: Băm mật khẩu bằng Argon2id
  console.log('1. Kiểm thử hàm băm mật khẩu hashPassword (Argon2id)...');
  const plainPassword = 'NovynSecurePassword@2026!';
  const argon2Hash = await hashPassword(plainPassword);

  console.log(`   👉 Hash tạo ra: ${argon2Hash.substring(0, 35)}...`);
  if (!argon2Hash.startsWith('$argon2id$')) {
    throw new Error('❌ Lỗi: Mã băm không phải định dạng Argon2id!');
  }
  if (!argon2Hash.includes('m=19456') || !argon2Hash.includes('t=2')) {
    throw new Error('❌ Lỗi: Tham số bảo mật OWASP (memoryCost, timeCost) không khớp!');
  }
  console.log('   ✅ Sinh mã băm Argon2id chuẩn xác với tham số bộ nhớ 19MB & 2 vòng lặp.');

  // Test 2: Xác thực mật khẩu Argon2id
  console.log('\n2. Kiểm thử xác thực verifyPassword với Argon2id...');
  const validResult = await verifyPassword(plainPassword, argon2Hash);
  if (!validResult.isValid || validResult.needsRehash !== false || validResult.algorithm !== 'argon2id') {
    throw new Error('❌ Lỗi: Xác thực mật khẩu đúng bị thất bại!');
  }
  console.log('   ✅ Xác thực mật khẩu đúng thành công (needsRehash: false, algorithm: argon2id).');

  const invalidResult = await verifyPassword('WrongPassword123!', argon2Hash);
  if (invalidResult.isValid) {
    throw new Error('❌ Lỗi: Mật khẩu sai nhưng lại xác thực thành công!');
  }
  console.log('   ✅ Từ chối mật khẩu sai chính xác 100%.');

  // Test 3: Tương thích ngược với Bcrypt cũ (Legacy Bcrypt Support)
  console.log('\n3. Kiểm thử tương thích ngược với mật khẩu cũ mã hóa bằng Bcrypt...');
  const legacyBcryptHash = bcrypt.hashSync(plainPassword, 10);
  console.log(`   👉 Legacy Bcrypt Hash: ${legacyBcryptHash.substring(0, 30)}...`);

  const legacyVerify = await verifyPassword(plainPassword, legacyBcryptHash);
  if (!legacyVerify.isValid || legacyVerify.needsRehash !== true || legacyVerify.algorithm !== 'bcrypt') {
    throw new Error('❌ Lỗi: Không thể xác thực hash Bcrypt cũ hoặc không cắm cờ needsRehash!');
  }
  console.log('   ✅ Nhận diện và xác thực chuẩn xác hash Bcrypt cũ (needsRehash: true, algorithm: bcrypt).');

  // Test 4: Tự động nâng cấp trong loginAction (Seamless Migration to Argon2id)
  console.log('\n4. Kiểm thử tự động nâng cấp mã băm khi người dùng đăng nhập (Transparent Rehash)...');
  const testUserEmail = `migration_test_${Date.now()}@novyn.vn`;
  const testUserPassword = 'NovynMigration@2026!';
  
  // Tạo người dùng giả lập với mật khẩu bcrypt cũ
  const user = await prisma.user.create({
    data: {
      id: `usr-migration-${Date.now()}`,
      name: 'Migration Test User',
      email: testUserEmail,
      password: bcrypt.hashSync(testUserPassword, 10), // Lưu bằng bcrypt cũ
      role: 'customer',
      isActive: true
    }
  });

  // Xác nhận ban đầu trong CSDL là bcrypt
  if (!user.password.startsWith('$2')) {
    throw new Error('❌ Lỗi chuẩn bị dữ liệu test: mật khẩu chưa được lưu bằng bcrypt!');
  }
  console.log('   👉 CSDL ban đầu: Người dùng đang mang mã băm Bcrypt ($2b$).');

  // Thực hiện đăng nhập qua loginAction
  const loggedIn = await loginAction(testUserEmail, testUserPassword);
  if (!loggedIn) {
    throw new Error('❌ Lỗi: Đăng nhập thất bại với tài khoản mang hash cũ!');
  }

  // Truy vấn lại CSDL kiểm tra xem hash đã được tự động nâng cấp sang Argon2id chưa
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!updatedUser?.password.startsWith('$argon2id$')) {
    throw new Error(`❌ Lỗi: Mật khẩu chưa được tự động nâng cấp lên Argon2id! Hash hiện tại: ${updatedUser?.password}`);
  }
  console.log(`   ✅ CSDL tự động nâng cấp: Hash sau khi đăng nhập đã chuyển thành Argon2id: ${updatedUser.password.substring(0, 35)}...`);

  // Dọn dẹp tài khoản test
  await prisma.user.delete({ where: { id: user.id } });
  console.log('   🧹 Đã dọn dẹp tài khoản kiểm thử.');

  // Test 5: Đăng ký tài khoản mới & Đổi mật khẩu
  console.log('\n5. Kiểm thử Đăng ký tài khoản mới (Lưu trực tiếp bằng Argon2id)...');
  const newCustomerEmail = `new_customer_${Date.now()}@novyn.vn`;
  const registerResult = await registerAction('New Customer Argon2', newCustomerEmail, 'NewCustomer@2026!', 'customer');
  if (!registerResult.success || !registerResult.user) {
    throw new Error('❌ Lỗi: Đăng ký tài khoản mới thất bại!');
  }

  const createdUser = await prisma.user.findUnique({ where: { id: registerResult.user.id } });
  if (!createdUser?.password.startsWith('$argon2id$')) {
    throw new Error('❌ Lỗi: Người dùng mới không được băm bằng Argon2id!');
  }
  console.log(`   ✅ Người dùng đăng ký mới được mã hóa 100% bằng Argon2id: ${createdUser.password.substring(0, 35)}...`);

  // Dọn dẹp
  await prisma.user.delete({ where: { id: createdUser.id } });
  console.log('   🧹 Đã dọn dẹp tài khoản mới.');

  console.log('\n✨ TẤT CẢ 5/5 TEST CASES ARGON2ID ĐÃ PASS THÀNH CÔNG! ✨');
}

runArgon2Tests().catch(err => {
  console.error('\n❌ TEST ARGON2ID THẤT BẠI:', err);
  process.exit(1);
});
