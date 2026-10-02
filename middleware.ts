import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decryptSession } from './lib/session';

const STAFF_ROLES = ['director', 'manager', 'accountant', 'cskh', 'employee', 'cashier', 'stocker'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect internal ERP routes on server-side
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
