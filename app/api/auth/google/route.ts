import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSafeAppUrl } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get('demo') === '1';

  const baseUrl = getSafeAppUrl(request);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // Prevent OAuth backdoor bypass on production
  if (isDemo) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(`${baseUrl}/account?oauth_error=DEMO_DISABLED_IN_PRODUCTION`);
    }
    return NextResponse.redirect(`${redirectUri}?demo=1`);
  }

  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${baseUrl}/account?oauth_error=GOOGLE_KEYS_MISSING`);
  }

  // Generate cryptographically secure state token to prevent Login CSRF (RFC 6749)
  const state = crypto.randomBytes(32).toString('hex');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(googleAuthUrl.toString());
  response.cookies.set('oauth_state_google', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes TTL
  });

  return response;
}
