import { cookies } from 'next/headers';
import { prisma } from '@/database/db';
import {
  SESSION_COOKIE_NAME,
  SessionPayload,
  encryptSession,
  decryptSession
} from './sessionCrypto';

export { SESSION_COOKIE_NAME, encryptSession, decryptSession };
export type { SessionPayload };

// Set secure HttpOnly session cookie
export async function setSessionCookie(user: { id: string; name: string; email: string; role: string; branch?: string | null; phone?: string | null }) {
  try {
    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch || null,
      phone: user.phone || null
    };
    
    const token = await encryptSession(payload);
    const cookieStore = await cookies();
    
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });
  } catch (error) {
    console.error('setSessionCookie error:', error);
  }
}

// Clear session cookie
export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('clearSessionCookie error:', error);
  }
}

// Get user session data from cookie
export async function getSessionUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie || !cookie.value) return null;
    return await decryptSession(cookie.value);
  } catch (error) {
    console.error('getSessionUser error:', error);
    return null;
  }
}

// Verify session and role (RBAC helper)
export async function verifySession(allowedRoles?: string[]): Promise<SessionPayload> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Yêu cầu đăng nhập để thực hiện hành động này (Unauthorized)');
  }
  
  // Real-time active status check to ensure immediate revocation for deactivated/deleted users
  try {
    const liveUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isActive: true, role: true }
    });

    if (!liveUser || !liveUser.isActive) {
      await clearSessionCookie();
      throw new Error('Tài khoản đã bị vô hiệu hóa hoặc không còn tồn tại (Unauthorized)');
    }

    session.role = liveUser.role;
  } catch (err: any) {
    if (err.message?.includes('vô hiệu hóa') || err.message?.includes('Unauthorized')) {
      throw err;
    }
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    throw new Error('Tài khoản không có quyền thực hiện hành động này (Forbidden)');
  }
  
  return session;
}
