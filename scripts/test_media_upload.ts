import fs from 'fs';
import path from 'path';
import {
  detectMagicBytes,
  validateMediaBuffer,
  saveMediaFile,
  MAX_FILE_SIZE_BYTES
} from '../backend/services/mediaService';
import { POST } from '../app/api/upload/route';
import { NextRequest } from 'next/server';

async function runMediaUploadTests() {
  console.log('🧪 === BẮT ĐẦU KIỂM THỬ SECURE MEDIA & OBJECT STORAGE PIPELINE ===\n');

  // 1. Kiểm tra Magic Bytes cho các định dạng ảnh hợp lệ
  console.log('1. Kiểm thử nhận diện Magic Bytes nhị phân (JPEG, PNG, WebP, GIF)...');
  
  // Fake JPEG buffer: FF D8 FF + padding
  const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const jpegResult = detectMagicBytes(jpegHeader);
  if (jpegResult?.mimeType === 'image/jpeg' && jpegResult.extension === 'jpg') {
    console.log('   ✅ JPEG magic bytes nhận diện chuẩn xác (image/jpeg).');
  } else {
    throw new Error('❌ Lỗi nhận diện JPEG magic bytes!');
  }

  // Fake PNG buffer: 89 50 4E 47 0D 0A 1A 0A + padding
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
  const pngResult = detectMagicBytes(pngHeader);
  if (pngResult?.mimeType === 'image/png' && pngResult.extension === 'png') {
    console.log('   ✅ PNG magic bytes nhận diện chuẩn xác (image/png).');
  } else {
    throw new Error('❌ Lỗi nhận diện PNG magic bytes!');
  }

  // Fake WebP buffer: RIFF (4 bytes) + len (4 bytes) + WEBP (4 bytes)
  const webpHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x20, 0x00, 0x00, 0x00, // length
    0x57, 0x45, 0x42, 0x50  // WEBP
  ]);
  const webpResult = detectMagicBytes(webpHeader);
  if (webpResult?.mimeType === 'image/webp' && webpResult.extension === 'webp') {
    console.log('   ✅ WebP magic bytes nhận diện chuẩn xác (image/webp).');
  } else {
    throw new Error('❌ Lỗi nhận diện WebP magic bytes!');
  }

  // 2. Chặn các tệp độc hại / giả mạo phần mở rộng (Anti-RCE & Anti-XSS)
  console.log('\n2. Kiểm thử chống giả mạo tệp độc hại (PHP, SVG-XSS, Text Script)...');
  const fakePhp = Buffer.from('<?php system($_GET["cmd"]); ?>');
  const fakeSvg = Buffer.from('<svg onload="alert(document.cookie)"></svg>');
  const fakeTxt = Buffer.from('console.log("malicious javascript")');

  let phpBlocked = false;
  try {
    validateMediaBuffer(fakePhp);
  } catch {
    phpBlocked = true;
  }

  let svgBlocked = false;
  try {
    validateMediaBuffer(fakeSvg);
  } catch {
    svgBlocked = true;
  }

  let txtBlocked = false;
  try {
    validateMediaBuffer(fakeTxt);
  } catch {
    txtBlocked = true;
  }

  if (phpBlocked && svgBlocked && txtBlocked) {
    console.log('   ✅ Chặn đứng 100% các tệp script độc hại / giả mạo extension (Anti-RCE).');
  } else {
    throw new Error('❌ Hệ thống không chặn được tệp độc hại!');
  }

  // 3. Kiểm tra giới hạn dung lượng tệp (Max 5MB)
  console.log('\n3. Kiểm thử giới hạn kích thước tệp (File Size Cap 5MB)...');
  const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024);
  // Give it valid JPEG header but excess size
  oversizedBuffer[0] = 0xFF;
  oversizedBuffer[1] = 0xD8;
  oversizedBuffer[2] = 0xFF;

  let sizeBlocked = false;
  try {
    validateMediaBuffer(oversizedBuffer);
  } catch (err: any) {
    if (err.message?.includes('vượt quá giới hạn')) {
      sizeBlocked = true;
    }
  }

  if (sizeBlocked) {
    console.log('   ✅ Chặn tệp vượt quá 5MB thành công (Bảo vệ tài nguyên đĩa & RAM).');
  } else {
    throw new Error('❌ Không chặn được tệp vượt quá 5MB!');
  }

  // 4. Kiểm thử lưu tệp với UUID ngẫu nhiên & dọn dẹp
  console.log('\n4. Kiểm thử lưu tệp an toàn với UUID ngẫu nhiên...');
  const validJpeg = Buffer.concat([jpegHeader, Buffer.alloc(100)]);
  const validated = validateMediaBuffer(validJpeg);
  const testUploadDir = path.join(process.cwd(), 'public', 'uploads');
  const saved = await saveMediaFile(validated, testUploadDir);

  const diskPath = path.join(testUploadDir, saved.filename);
  if (fs.existsSync(diskPath) && saved.url.startsWith('/uploads/')) {
    console.log(`   ✅ Tệp đã lưu thành công tại: ${saved.url} (UUID: ${saved.filename}, Dung lượng: ${saved.size} bytes).`);
    // Dọn dẹp tệp test
    fs.unlinkSync(diskPath);
    console.log('   🧹 Đã dọn dẹp tệp test khỏi đĩa.');
  } else {
    throw new Error('❌ Tệp không được ghi đúng trên đĩa!');
  }

  // 5. Kiểm thử Endpoint API /api/upload yêu cầu Staff Session
  console.log('\n5. Kiểm thử bảo mật tầng API /api/upload (Chặn người dùng chưa xác thực)...');
  const unauthReq = new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST'
  });
  const unauthRes = await POST(unauthReq);
  const unauthData = await unauthRes.json();

  if (unauthRes.status === 403 && unauthData.success === false) {
    console.log('   ✅ API bảo vệ thành công: Chặn truy cập trái phép không có phiên nhân viên (Status 403).');
  } else {
    throw new Error(`❌ API không chặn request unauthenticated! Status: ${unauthRes.status}`);
  }

  console.log('\n✨ TẤT CẢ 5/5 TEST CASES SECURE MEDIA PIPELINE ĐÃ PASS THÀNH CÔNG! ✨');
}

runMediaUploadTests().catch(err => {
  console.error('\n❌ TEST MEDIA PIPELINE THẤT BẠI:', err);
  process.exit(1);
});
