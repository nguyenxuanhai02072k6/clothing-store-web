import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decryptSession } from './backend/security/sessionCrypto';
import { globalIpLimiter } from './backend/security/rateLimiter';

const STAFF_ROLES = ['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip Rate Limiter for Next.js internal prefetch requests & RSC payloads
  const isPrefetch =
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('x-purpose') === 'prefetch' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.nextUrl.searchParams.has('_rsc');

  if (!isPrefetch) {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const rateCheck = await globalIpLimiter.check(clientIp);
    if (!rateCheck.success) {
      const retryAfterSec = Math.ceil(rateCheck.retryAfterMs / 1000);
      const acceptHeader = request.headers.get('accept') || '';

      if (acceptHeader.includes('text/html')) {
        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>429 - Thao tác quá nhanh | NOVYN WEAR</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0a09; color: #f5f5f4; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
    .card { background: #1c1917; padding: 2.5rem; border-radius: 1rem; border: 1px solid #292524; text-align: center; max-width: 440px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    h1 { font-size: 3.5rem; margin: 0; color: #e11d48; font-weight: 800; letter-spacing: -2px; }
    h2 { font-size: 1.15rem; margin: 0.75rem 0 0.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    p { color: #a8a29e; font-size: 0.875rem; line-height: 1.6; margin: 0.5rem 0; }
    .timer { font-family: monospace; font-size: 1.5rem; font-weight: bold; color: #38bdf8; margin: 1.25rem 0; background: #0c0a09; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #292524; }
  </style>
</head>
<body>
  <div class="card">
    <h1>429</h1>
    <h2>Thao tác quá nhanh</h2>
    <p>Hệ thống bảo vệ phát hiện bạn đang làm mới trang (F5) hoặc gửi yêu cầu liên tục từ địa chỉ IP này.</p>
    <div class="timer">Vui lòng chờ: ${retryAfterSec}s</div>
    <p>Máy chủ tự động mở lại kết nối ngay sau khi thời gian chờ kết thúc.</p>
  </div>
</body>
</html>`;
        return new NextResponse(html, {
          status: 429,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(rateCheck.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateCheck.resetTime)
          }
        });
      }

      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Bạn đang thao tác quá nhanh hoặc spam F5. Vui lòng thử lại sau ${retryAfterSec} giây.`,
          retryAfter: retryAfterSec
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(rateCheck.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateCheck.resetTime)
          }
        }
      );
    }
  }

  // 2. Protect internal ERP routes on server-side
  if (pathname.startsWith('/internal')) {
    const sessionCookie = request.cookies.get('novyn_session')?.value;
    
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const session = await decryptSession(sessionCookie);
    if (!session || !STAFF_ROLES.includes(session.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      url.searchParams.set('error', 'unauthorized_internal');
      return NextResponse.redirect(url);
    }
  }

  // 2. Add Security Headers across all application routes
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // HSTS (HTTP Strict Transport Security) for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Base Content Security Policy (CSP)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com https://*.facebook.com https://platform-lookaside.fbsbx.com",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, brand, images
     */
    '/((?!_next/static|_next/image|favicon.ico|brand|images).*)',
  ],
};
