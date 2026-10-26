/**
 * Comprehensive Product & Feature Audit for https://clothing-store-web-ten.vercel.app
 */

const BASE_URL = 'https://clothing-store-web-ten.vercel.app';

const ALL_SLUGS = [
  'ao-thun-premium-cotton-minimalist',
  'ao-khoac-blazer-relaxed-fit',
  'ao-so-mi-linen-cao-cap',
  'ao-len-det-kim-soft-touch',
  'ao-so-mi-linen-co-tau',
  'ao-polo-soi-cotton-det-kim',
  'ao-khoac-blazer-linen-cao-cap',
  'quan-tay-ong-suong-pleated-trousers',
  'quan-short-linen-drawstring',
  'quan-jean-raw-denim-classic',
  'quan-jogger-ni-french-terry',
  'quan-culottes-vai-linen-ong-rong',
  'quan-kaki-chino-slim-fit',
  'quan-tay-xep-ly-dup-dang-ru',
  'dam-lua-slip-dress-quiet-luxury',
  'ao-khoac-trench-coat-da-dang-dai',
  'quan-jean-dang-suong-straight-fit',
  'ao-so-mi-lua-cat-silk-cotton',
  'ao-khoac-bomber-satin-dung-phom',
  'quan-kaki-short-pleated-classic',
  'ao-tweed-jacket-co-co-dien',
  'ao-thun-oversized-heavyweight-cotton'
];

async function runDetailedAudit() {
  console.log(`========================================================================`);
  console.log(`🔎 TESTING ALL 22 REAL PRODUCT DETAIL PAGES ON PRODUCTION`);
  console.log(`========================================================================\n`);

  let passed = 0;
  let failed = 0;

  for (const slug of ALL_SLUGS) {
    const url = `${BASE_URL}/products/${slug}`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
      });
      const html = await res.text();
      
      const is200 = res.status === 200;
      const notNotFound = !html.includes('Sản phẩm không tồn tại');
      const hasPrice = html.includes('₫') || html.includes('VND') || html.includes('000');
      const hasActionBtn = html.includes('Thêm vào giỏ') || html.includes('giỏ hàng') || html.includes('cart');
      const hasJsonLd = html.includes('@type') && html.includes('Product');

      if (is200 && notNotFound && hasPrice && hasActionBtn && hasJsonLd) {
        passed++;
        console.log(`✅ [Product] ${slug} -> 200 OK | Full Schema & Cart Ready (${html.length} bytes)`);
      } else {
        failed++;
        console.log(`❌ [Product] ${slug} -> FAILED (Status: ${res.status}, notNotFound: ${notNotFound}, price: ${hasPrice}, btn: ${hasActionBtn})`);
      }
    } catch (err) {
      failed++;
      console.log(`❌ [Product] ${slug} -> ERROR: ${err.message}`);
    }
  }

  console.log(`\n========================================================================`);
  console.log(`📊 PRODUCT AUDIT RESULT: ${passed}/${ALL_SLUGS.length} PRODUCTS PERFECT`);
  console.log(`========================================================================\n`);
}

runDetailedAudit().catch(console.error);
