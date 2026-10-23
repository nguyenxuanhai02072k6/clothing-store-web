import type { MetadataRoute } from 'next';
import { prisma } from '@/database/db';
import { MOCK_PRODUCTS } from '../data/products';

const siteUrl = 'https://novynwear.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/about',
    '/account',
    '/cart',
    '/checkout',
    '/contact',
    '/lookbook',
    '/privacy',
    '/products',
    '/returns',
    '/shipping',
    '/terms',
  ];

  const now = new Date();

  // Fetch all active products from DB, fallback to MOCK_PRODUCTS
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, createdAt: true },
    });

    if (dbProducts.length > 0) {
      productUrls = dbProducts.map((p) => ({
        url: `${siteUrl}/products/${p.slug}`,
        lastModified: p.createdAt || now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error generating dynamic product sitemap from DB:', error);
  }

  // Fallback to MOCK_PRODUCTS if database query returned no items
  if (productUrls.length === 0) {
    productUrls = MOCK_PRODUCTS.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/products' ? ('daily' as const) : ('weekly' as const),
    priority: route === '' ? 1 : route === '/products' ? 0.9 : 0.7,
  }));

  return [...staticEntries, ...productUrls];
}
