import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setSessionCookie } from '@/lib/session';
import { getSafeAppUrl } from '@/lib/utils';
import { hashPassword } from '@/lib/security/passwordHash';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const baseUrl = getSafeAppUrl(request);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  const isDemo = searchParams.get('demo') === '1';

  if (error) {
    return NextResponse.redirect(`${baseUrl}/account?oauth_error=${encodeURIComponent(error)}`);
  }

  try {
    let email = '';
    let name = '';
    let avatar = '';

    if (isDemo) {
      // Strictly prevent demo backdoor in production
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=DEMO_DISABLED_IN_PRODUCTION`);
      }
      // Demo test user for simulated Google login
      email = 'google.customer@novynwear.com';
      name = 'Google VIP Customer';
      avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
    } else {
      // Verify CSRF state parameter (RFC 6749 Section 10.12)
      const storedState = request.cookies.get('oauth_state_google')?.value;
      if (!state || !storedState || state !== storedState) {
        console.error('Google OAuth state verification failed. Possible CSRF.');
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=INVALID_OAUTH_STATE`);
      }

      if (!code) {
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=MISSING_CODE`);
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=GOOGLE_KEYS_MISSING`);
      }

      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        console.error('Google token exchange error:', tokenData);
        return NextResponse.redirect(
          `${baseUrl}/account?oauth_error=${encodeURIComponent(tokenData.error_description || tokenData.error || 'TOKEN_EXCHANGE_FAILED')}`
        );
      }

      // Fetch user profile
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      const userData = await userRes.json();
      if (!userRes.ok || !userData.email) {
        console.error('Google userinfo fetch error:', userData);
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=FETCH_USER_FAILED`);
      }

      email = userData.email;
      name = userData.name || userData.email.split('@')[0];
      avatar = userData.picture || '';
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Create new customer account with random secure password hash
      const randomPasswordHash = await hashPassword(crypto.randomBytes(32).toString('hex'));
      user = await prisma.user.create({
        data: {
          id: `usr-google-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name,
          email: email.toLowerCase(),
          password: randomPasswordHash,
          role: 'customer',
          avatar: avatar || null,
          isActive: true
        }
      });
    } else if (avatar && !user.avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar }
      });
    }

    // Set secure HTTP-Only session cookie
    await setSessionCookie(user);

    const response = NextResponse.redirect(`${baseUrl}/account?oauth=success`);
    response.cookies.delete('oauth_state_google');
    return response;
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/account?oauth_error=${encodeURIComponent(err.message || 'INTERNAL_ERROR')}`);
  }
}
