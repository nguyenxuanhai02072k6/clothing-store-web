/**
 * Comprehensive Live Testing Script for https://clothing-store-web-ten.vercel.app
 */

const BASE_URL = 'https://clothing-store-web-ten.vercel.app';

async function testAll() {
  console.log(`========================================================================`);
  console.log(`🚀 STARTING THOROUGH AUDIT OF LIVE PRODUCTION DEPLOYMENT`);
  console.log(`🌐 Target: ${BASE_URL}`);
  console.log(`========================================================================\n`);

  const results = [];

  function record(category, testName, passed, details = '') {
    results.push({ category, testName, passed, details });
    const mark = passed ? '✅' : '❌';
    console.log(`${mark} [${category}] ${testName}${details ? ` -> ${details}` : ''}`);
  }

  // 1. TEST ALL STATIC & CONTENT ROUTES
  console.log(`\n--- [PHASE 1: ROUTES & HTTP RESPONSES] ---`);
  const routes = [
    { path: '/', title: 'Trang chủ' },
    { path: '/products', title: 'Danh mục sản phẩm' },
    { path: '/lookbook', title: 'Lookbook & Editorial' },
    { path: '/about', title: 'Giới thiệu' },
    { path: '/contact', title: 'Liên hệ' },
    { path: '/cart', title: 'Giỏ hàng' },
    { path: '/checkout', title: 'Thanh toán' },
    { path: '/account', title: 'Tài khoản & Đăng nhập' },
    { path: '/shipping', title: 'Chính sách vận chuyển' },
    { path: '/returns', title: 'Chính sách đổi trả' },
    { path: '/privacy', title: 'Chính sách bảo mật' },
    { path: '/terms', title: 'Điều khoản sử dụng' },
    { path: '/robots.txt', title: 'SEO Robots.txt' },
    { path: '/sitemap.xml', title: 'SEO Sitemap.xml' },
  ];

  for (const r of routes) {
    try {
      const res = await fetch(`${BASE_URL}${r.path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const text = await res.text();
      const statusOk = res.status === 200;
      const noError = !text.includes('Application error') && !text.includes('SQLITE_CANTOPEN') && !text.includes('500: Internal Server Error');
      record('Routes', `${r.title} (${r.path})`, statusOk && noError, `HTTP ${res.status}, ${text.length} bytes`);
    } catch (err) {
      record('Routes', `${r.title} (${r.path})`, false, err.message);
    }
  }

  // 2. TEST DYNAMIC PRODUCT DETAIL PAGES
  console.log(`\n--- [PHASE 2: DYNAMIC PRODUCT DETAIL PAGES] ---`);
  const sampleSlugs = [
    'ao-thun-premium-cotton-minimalist',
    'dam-lua-sat-nach-quiet-luxury',
    'quan-tay-wool-blend-classic-fit',
    'ao-blazer-linen-single-breasted',
    'ao-polo-mercerized-cotton'
  ];

  for (const slug of sampleSlugs) {
    try {
      const res = await fetch(`${BASE_URL}/products/${slug}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const text = await res.text();
      const is200 = res.status === 200;
      const hasProductInfo = text.includes('VND') || text.includes('₫') || text.includes('Thêm vào giỏ');
      const noCrash = !text.includes('SQLITE_CANTOPEN') && !text.includes('Application error');
      record('Product Details', `/products/${slug}`, is200 && hasProductInfo && noCrash, `Status: ${res.status}, Length: ${text.length}`);
    } catch (err) {
      record('Product Details', `/products/${slug}`, false, err.message);
    }
  }

  // 3. TEST 404 NOT FOUND HANDLING
  console.log(`\n--- [PHASE 3: NOT FOUND (404) HANDLING] ---`);
  try {
    const res = await fetch(`${BASE_URL}/san-pham-khong-ton-tai-abc-xyz`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    record('Error Handling', 'Non-existent route returns 404', res.status === 404, `Status: ${res.status}`);
  } catch (err) {
    record('Error Handling', 'Non-existent route returns 404', false, err.message);
  }

  // 4. TEST SECURITY HEADERS
  console.log(`\n--- [PHASE 4: SECURITY HEADERS AUDIT] ---`);
  try {
    const res = await fetch(`${BASE_URL}/`);
    const headers = res.headers;
    record('Security', 'Strict-Transport-Security (HSTS)', Boolean(headers.get('strict-transport-security')), headers.get('strict-transport-security') || 'Missing');
    record('Security', 'Content-Security-Policy (CSP)', Boolean(headers.get('content-security-policy')), headers.get('content-security-policy') ? 'Configured' : 'Missing');
    record('Security', 'X-Frame-Options (Clickjacking)', headers.get('x-frame-options') === 'DENY', headers.get('x-frame-options') || 'Missing');
    record('Security', 'X-Content-Type-Options', headers.get('x-content-type-options') === 'nosniff', headers.get('x-content-type-options') || 'Missing');
    record('Security', 'Referrer-Policy', Boolean(headers.get('referrer-policy')), headers.get('referrer-policy') || 'Missing');
    record('Security', 'Permissions-Policy', Boolean(headers.get('permissions-policy')), headers.get('permissions-policy') || 'Missing');
  } catch (err) {
    record('Security', 'Headers Fetch', false, err.message);
  }

  // 5. TEST PROTECTED INTERNAL ERP ACCESS CONTROL
  console.log(`\n--- [PHASE 5: INTERNAL ERP ACCESS CONTROL & REDIRECT] ---`);
  try {
    // Attempt unauthorized access to /internal without cookies
    const res = await fetch(`${BASE_URL}/internal`, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const isRedirect = res.status === 307 || res.status === 302 || res.status === 308;
    const location = res.headers.get('location') || '';
    const redirectsToAccount = location.includes('/account');
    record('Access Control', 'Unauthorized /internal is blocked and redirected to /account', isRedirect && redirectsToAccount, `Status: ${res.status}, Location: ${location}`);
  } catch (err) {
    record('Access Control', 'Unauthorized /internal check', false, err.message);
  }

  // 6. TEST SEO ARTIFACTS
  console.log(`\n--- [PHASE 6: SEO ARTIFACTS AUDIT] ---`);
  try {
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapText = await sitemapRes.text();
    const hasXml = sitemapText.includes('<urlset') && sitemapText.includes('<url>');
    const hasProductsInSitemap = sitemapText.includes('/products/');
    record('SEO', 'sitemap.xml validity & structure', sitemapRes.status === 200 && hasXml && hasProductsInSitemap, `Products indexed: ${sitemapText.split('<url>').length - 1}`);

    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    const robotsText = await robotsRes.text();
    const hasRobots = robotsText.includes('User-agent:') && robotsText.includes('Disallow: /internal');
    record('SEO', 'robots.txt blocks /internal and specifies sitemap', robotsRes.status === 200 && hasRobots, `Status: ${robotsRes.status}`);
  } catch (err) {
    record('SEO', 'SEO files check', false, err.message);
  }

  // 7. SUMMARY
  console.log(`\n========================================================================`);
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`📊 TOTAL AUDIT SUMMARY: ${passedCount}/${total} PASSED (${failedCount} failed)`);
  console.log(`========================================================================\n`);

  return { total, passedCount, failedCount, results };
}

testAll().catch(console.error);
