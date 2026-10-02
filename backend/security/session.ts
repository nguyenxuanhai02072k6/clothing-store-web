import { cookies } from 'next/headers';
import { prisma } from '@/database/db';

const SESSION_COOKIE_NAME = 'novyn_session';
const DEV_SESSION_SECRET = 'novyn-wear-local-dev-session-secret-change-before-production';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET || DEV_SESSION_SECRET;
  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('[CRITICAL SECURITY ERROR] SESSION_SECRET must be set in production environment variables.');
  }

  const enc = new TextEncoder();
  const rawKey = await crypto.subtle.digest('SHA-256', enc.encode(secret));
  return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: string;
  branch?: string | null;
  phone?: string | null;
  expiresAt: string;
}

// Encrypt payload using AES-256-GCM via Edge-safe Web Crypto API
export async function encryptSession(payload: Omit<SessionPayload, 'expiresAt'>, lifespanMs: number = 24 * 60 * 60 * 1000): Promise<string> {
  try {
    const expiresAt = new Date(Date.now() + lifespanMs).toISOString();
    const fullPayload: SessionPayload = { ...payload, expiresAt };
    const enc = new TextEncoder();
    const data = enc.encode(JSON.stringify(fullPayload));

    const key = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as any }, key, data);

    return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
  } catch (error) {
    console.error('encryptSession error:', error);
    throw new Error('Không thể mã hóa thông tin phiên làm việc');
  }
}

// Decrypt token and return payload if valid via Edge-safe Web Crypto API
export async function decryptSession(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const parts = token.split(':');
    if (parts.length !== 2) return null;

    const [ivHex, cipherHex] = parts;
    const iv = hexToBytes(ivHex);
    const ciphertext = hexToBytes(cipherHex);

    const key = await getCryptoKey();
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as any }, key, ciphertext as any);

    const dec = new TextDecoder();
    const payload = JSON.parse(dec.decode(decrypted)) as SessionPayload;

    if (new Date(payload.expiresAt).getTime() < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('decryptSession error:', error);
    return null;
  }
}

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
