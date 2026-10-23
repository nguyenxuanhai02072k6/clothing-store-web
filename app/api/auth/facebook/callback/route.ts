import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/database/db';
import { setSessionCookie } from '@/backend/security/session';
import { getSafeAppUrl } from '@/lib/utils';
import { hashPassword } from '@/backend/security/passwordHash';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const baseUrl = getSafeAppUrl(request);
  const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const isDemo = searchParams.get('demo') === '1';

  if (error || errorDescription) {
    return NextResponse.redirect(
      `${baseUrl}/account?oauth_error=${encodeURIComponent(errorDescription || error || 'OAUTH_DENIED')}`
    );
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
      // Demo test user for simulated Facebook login
      email = 'facebook.customer@novynwear.com';
      name = 'Facebook VIP Customer';
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200';
    } else {
      // Verify CSRF state parameter (RFC 6749 Section 10.12)
      const storedState = request.cookies.get('oauth_state_facebook')?.value;
      if (!state || !storedState || state !== storedState) {
        console.error('Facebook OAuth state verification failed. Possible CSRF.');
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=INVALID_OAUTH_STATE`);
      }

      if (!code) {
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=MISSING_CODE`);
      }

      const clientId = process.env.FACEBOOK_CLIENT_ID;
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=FACEBOOK_KEYS_MISSING`);
      }

      // Exchange code for Facebook User Access Token
      const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      tokenUrl.searchParams.set('client_id', clientId);
      tokenUrl.searchParams.set('client_secret', clientSecret);
      tokenUrl.searchParams.set('redirect_uri', redirectUri);
      tokenUrl.searchParams.set('code', code);

      const tokenRes = await fetch(tokenUrl.toString());
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        console.error('Facebook token exchange error:', tokenData);
        return NextResponse.redirect(
          `${baseUrl}/account?oauth_error=${encodeURIComponent(tokenData.error?.message || 'TOKEN_EXCHANGE_FAILED')}`
        );
      }

      // Fetch user profile from Graph API
      const profileUrl = new URL('https://graph.facebook.com/me');
      profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
      profileUrl.searchParams.set('access_token', tokenData.access_token);

      const userRes = await fetch(profileUrl.toString());
      const userData = await userRes.json();

      if (!userRes.ok || !userData.id) {
        console.error('Facebook profile fetch error:', userData);
        return NextResponse.redirect(`${baseUrl}/account?oauth_error=FETCH_USER_FAILED`);
      }

      name = userData.name || 'Facebook User';
      email = userData.email || `fb_${userData.id}@facebook.com`;
      avatar = userData.picture?.data?.url || '';
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
          id: `usr-fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
    response.cookies.delete('oauth_state_facebook');
    return response;
  } catch (err: any) {
    console.error('Facebook OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/account?oauth_error=${encodeURIComponent(err.message || 'INTERNAL_ERROR')}`);
  }
}
