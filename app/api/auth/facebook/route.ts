import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSafeAppUrl } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get('demo') === '1';

  const baseUrl = getSafeAppUrl(request);
  const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

  // Prevent OAuth backdoor bypass on production
  if (isDemo) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(`${baseUrl}/account?oauth_error=DEMO_DISABLED_IN_PRODUCTION`);
    }
    return NextResponse.redirect(`${redirectUri}?demo=1`);
  }

  if (!clientId || !process.env.FACEBOOK_CLIENT_SECRET) {
    return NextResponse.redirect(`${baseUrl}/account?oauth_error=FACEBOOK_KEYS_MISSING`);
  }

  // Generate cryptographically secure state token to prevent Login CSRF (RFC 6749)
  const state = crypto.randomBytes(32).toString('hex');

  const fbAuthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  fbAuthUrl.searchParams.set('client_id', clientId);
  fbAuthUrl.searchParams.set('redirect_uri', redirectUri);
  fbAuthUrl.searchParams.set('scope', 'email,public_profile');
  fbAuthUrl.searchParams.set('response_type', 'code');
  fbAuthUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(fbAuthUrl.toString());
  response.cookies.set('oauth_state_facebook', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes TTL
  });

  return response;
}
