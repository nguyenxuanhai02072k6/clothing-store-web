import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/backend/security/session';
import { uploadRateLimiter } from '@/backend/security/rateLimiter';
import { validateMediaBuffer, saveMediaFile } from '@/backend/services/mediaService';
import { prisma } from '@/database/db';

export const runtime = 'nodejs';

const STAFF_ROLES = ['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker'];

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user session
    const session = await getSessionUser();
    if (!session || !STAFF_ROLES.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền thực hiện tải lên tệp đa phương tiện.' },
        { status: 403 }
      );
    }

    // 2. Rate Limiting per user (max 15 uploads / minute)
    const rateCheck = await uploadRateLimiter.check(session.userId);
    if (!rateCheck.success) {
      const waitSecs = Math.ceil(rateCheck.retryAfterMs / 1000);
      return NextResponse.json(
        { success: false, error: `Bạn đã tải lên quá nhiều tệp trong thời gian ngắn. Vui lòng chờ ${waitSecs} giây.` },
        { status: 429 }
      );
    }

    // 3. Parse Multipart FormData
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tệp đính kèm để tải lên.' },
        { status: 400 }
      );
    }

    const fileBlob = file as File;
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Validate binary magic bytes and size
    const validated = validateMediaBuffer(buffer);

    // 5. Save securely with unguessable UUID filename
    const saved = await saveMediaFile(validated);

    // 6. Record Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'MEDIA_UPLOAD',
        details: `Nhân viên ${session.name} tải lên tệp ${saved.filename} (${(saved.size / 1024).toFixed(1)} KB, ${saved.mimeType})`,
        performedById: session.userId,
        performedByName: session.name
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      url: saved.url,
      filename: saved.filename,
      size: saved.size,
      mimeType: saved.mimeType
    });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý tệp từ máy chủ' },
      { status: 400 }
    );
  }
}
