/**
 * Comprehensive Automated Audit Script for Clothing Store Web
 * Target: https://clothing-store-web-ten.vercel.app
 */

const BASE_URL = 'https://clothing-store-web-ten.vercel.app';

async function runAudit() {
  const results = {
    http: [],
    security: {},
    seo: [],
    a11y: [],
    forms: [],
    performance: [],
  };

  const routesToTest = [
    { path: '/', name: 'Trang chủ' },
    { path: '/products', name: 'Danh mục sản phẩm' },
    { path: '/products/ao-thun-premium-cotton-minimalist', name: 'Chi tiết sản phẩm' },
    { path: '/lookbook', name: 'Lookbook' },
    { path: '/about', name: 'Về chúng tôi' },
    { path: '/contact', name: 'Liên hệ' },
    { path: '/cart', name: 'Giỏ hàng' },
    { path: '/checkout', name: 'Thanh toán' },
    { path: '/account', name: 'Tài khoản' },
    { path: '/shipping', name: 'Chính sách vận chuyển' },
    { path: '/returns', name: 'Chính sách đổi trả' },
    { path: '/privacy', name: 'Chính sách bảo mật' },
    { path: '/terms', name: 'Điều khoản dịch vụ' },
    { path: '/robots.txt', name: 'Robots.txt' },
    { path: '/sitemap.xml', name: 'Sitemap.xml' },
    { path: '/non-existent-page-404-test', name: 'Trang 404' }
  ];

  console.log('--- 1. TESTING ROUTES & PERFORMANCE TIMINGS ---');
  for (const r of routesToTest) {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${r.path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
        redirect: 'manual'
      });
      const ttfb = performance.now() - start;
      const text = await res.text();
      const totalTime = performance.now() - start;

      results.http.push({
        path: r.path,
        name: r.name,
        status: res.status,
        ttfbMs: Math.round(ttfb),
        totalTimeMs: Math.round(totalTime),
        sizeBytes: text.length,
        contentType: res.headers.get('content-type'),
        cacheControl: res.headers.get('cache-control'),
        xVercelCache: res.headers.get('x-vercel-cache'),
      });

      // Analyze SEO for HTML pages
      if (res.headers.get('content-type')?.includes('text/html')) {
        const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
        const descMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
        const ogTitleMatch = text.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
        const ogDescMatch = text.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
        const ogImageMatch = text.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
        const canonicalMatch = text.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
        const h1Matches = Array.from(text.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map(m => m[1].replace(/<[^>]+>/g, '').trim());
        const jsonLdMatch = text.includes('application/ld+json');

        results.seo.push({
          path: r.path,
          name: r.name,
          title: titleMatch ? titleMatch[1] : null,
          titleLength: titleMatch ? titleMatch[1].length : 0,
          description: descMatch ? descMatch[1] : null,
          descLength: descMatch ? descMatch[1].length : 0,
          hasOgTitle: Boolean(ogTitleMatch),
          hasOgDesc: Boolean(ogDescMatch),
          hasOgImage: Boolean(ogImageMatch),
          hasCanonical: Boolean(canonicalMatch),
          canonicalUrl: canonicalMatch ? canonicalMatch[1] : null,
          h1Count: h1Matches.length,
          h1Texts: h1Matches,
          hasJsonLd: jsonLdMatch
        });

        // Accessibility checks on HTML
        const imgTags = Array.from(text.matchAll(/<img([^>]*)>/gi));
        const missingAltImgs = imgTags.filter(img => !img[1].includes('alt=') || img[1].includes('alt=""') || img[1].includes("alt=''"));
        const buttons = Array.from(text.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/gi));
        const emptyButtons = buttons.filter(b => {
          const content = b[2].replace(/<[^>]+>/g, '').trim();
          const hasAria = b[1].includes('aria-label') || b[1].includes('aria-labelledby') || b[1].includes('title=');
          return content.length === 0 && !hasAria;
        });

        results.a11y.push({
          path: r.path,
          name: r.name,
          totalImages: imgTags.length,
          missingAltCount: missingAltImgs.length,
          totalButtons: buttons.length,
          emptyButtonCount: emptyButtons.length,
          htmlLang: text.includes('html lang="vi"') ? 'vi' : (text.match(/<html[^>]*lang=["']([^"']*)["']/i)?.[1] || 'none')
        });
      }

    } catch (e) {
      results.http.push({ path: r.path, name: r.name, error: e.message });
    }
  }

  // Security Headers Check
  console.log('--- 2. AUDITING SECURITY HEADERS ---');
  const homeRes = await fetch(`${BASE_URL}/`);
  const headers = homeRes.headers;
  results.security.headers = {
    'Strict-Transport-Security': headers.get('strict-transport-security'),
    'Content-Security-Policy': headers.get('content-security-policy'),
    'X-Frame-Options': headers.get('x-frame-options'),
    'X-Content-Type-Options': headers.get('x-content-type-options'),
    'Referrer-Policy': headers.get('referrer-policy'),
    'Permissions-Policy': headers.get('permissions-policy'),
    'X-XSS-Protection': headers.get('x-xss-protection'),
    'Server': headers.get('server'),
  };

  // Form & Action Validation Edge Cases Test
  console.log('--- 3. TESTING FORM VALIDATION & ACTIONS ---');
  // Test contact action with invalid inputs
  try {
    const contactRes = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/x-component'
      },
      body: JSON.stringify(['', '', '', '']) // empty fields
    });
    results.forms.push({ test: 'Contact Form Empty Submission', status: contactRes.status });
  } catch (e) {
    results.forms.push({ test: 'Contact Form Empty Submission', error: e.message });
  }

  console.log(JSON.stringify(results, null, 2));
}

runAudit().catch(console.error);
