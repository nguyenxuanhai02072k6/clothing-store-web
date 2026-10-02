import type { MetadataRoute } from 'next';

const siteUrl = 'https://novynwear.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/internal'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
