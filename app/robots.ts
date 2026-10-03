import { MetadataRoute } from 'next';

/**
 * SEO crawlers (especially AhrefsBot) were hammering every toilet's
 * `/opengraph-image` route. Those images are for social previews when
 * a human shares a link — they are not needed for indexing the HTML
 * page. Disallowing them stops the crawler-induced 5xx / CDN spike
 * while leaving the parent toilet pages fully crawlable.
 */
const DISALLOW = [
  '/api/',
  '/admin/',
  '/*/opengraph-image',
  '/*/*/opengraph-image',
  '/*/*/*/opengraph-image',
  '/*/twitter-image',
  '/*/*/twitter-image',
  '/*/*/*/twitter-image',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      // Explicit rule for the crawler that caused the alert — same
      // disallow set, kept separate so it shows clearly in robots.txt.
      {
        userAgent: 'AhrefsBot',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: 'SemrushBot',
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: 'https://wheretowee.uk/sitemap.xml',
  };
}
