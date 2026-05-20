import { MetadataRoute } from 'next';
import {
  supabase,
  getToiletSitemapPage,
  cityFromAddress,
  slugifyToiletName,
} from '@/lib/supabase';

const cities = [
  'london', 'birmingham', 'manchester', 'leeds', 'glasgow', 'liverpool',
  'bristol', 'sheffield', 'edinburgh', 'leicester', 'coventry', 'bradford',
  'cardiff', 'belfast', 'nottingham', 'newcastle', 'brighton', 'southampton',
  'portsmouth', 'oxford', 'cambridge', 'york', 'bath', 'bournemouth',
  'reading', 'milton-keynes', 'exeter', 'aberdeen', 'dundee', 'swansea',
];

// Cap how many individual toilet pages we list in the sitemap.
//
// We deliberately keep this much lower than Google's 50,000 limit and
// far below the live row count. Reasoning, learnt the hard way from
// Search Console:
//   * A young site has limited crawl budget. Listing every toilet
//     ever created drowns the high-value pages in a queue of similar
//     listings → "Discovered – currently not indexed" piles up.
//   * `getToiletSitemapPage` already applies the
//     [isIndexWorthyToilet] filter, so this cap is the upper bound on
//     the indexable set, not on the catalog as a whole.
// As we accrue ratings + verifications the indexable set grows
// organically; raise this cap then.
const MAX_TOILET_URLS = 5000;
const PAGE_SIZE = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wheretowee.uk';

  // Static pages
  const staticPages = [
    { route: '', priority: 1, changeFreq: 'weekly' as const },
    { route: '/map', priority: 0.9, changeFreq: 'daily' as const },
    { route: '/toilets', priority: 0.8, changeFreq: 'weekly' as const },
    { route: '/download', priority: 0.8, changeFreq: 'monthly' as const },
    { route: '/about', priority: 0.6, changeFreq: 'monthly' as const },
    { route: '/blog', priority: 0.8, changeFreq: 'daily' as const },
    { route: '/faq', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/submit', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/press', priority: 0.6, changeFreq: 'monthly' as const },
    { route: '/contact', priority: 0.5, changeFreq: 'monthly' as const },
    // High-intent SEO content pages (May 2026 launch).
    { route: '/radar-key', priority: 0.8, changeFreq: 'monthly' as const },
    { route: '/toilet-tips', priority: 0.8, changeFreq: 'monthly' as const },
    // Intent-based aggregation pages (May 2026 SEO push).
    { route: '/free-public-toilets', priority: 0.9, changeFreq: 'weekly' as const },
    { route: '/accessible-toilets-uk', priority: 0.9, changeFreq: 'weekly' as const },
    { route: '/changing-places-uk', priority: 0.9, changeFreq: 'weekly' as const },
    { route: '/baby-changing-near-me', priority: 0.9, changeFreq: 'weekly' as const },
    { route: '/radar-key-toilets-uk', priority: 0.9, changeFreq: 'weekly' as const },
    { route: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { route: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
    { route: '/accessibility', priority: 0.4, changeFreq: 'yearly' as const },
    { route: '/cookies', priority: 0.3, changeFreq: 'yearly' as const },
    { route: '/content-policy', priority: 0.3, changeFreq: 'yearly' as const },
  ].map((page) => ({
    url: `${baseUrl}${page.route}`,
    lastModified: new Date(),
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));

  // City pages - good for local SEO
  const cityPages = cities.map((city) => ({
    url: `${baseUrl}/toilets/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Per-toilet detail pages. We paginate through the active table in
  // batches of PAGE_SIZE so we never load the whole catalog into
  // memory at once. Toilets whose addresses don't map to a supported
  // city slug are silently dropped because their canonical URL can't
  // be constructed without a city segment.
  const toiletPages: MetadataRoute.Sitemap = [];
  try {
    let offset = 0;
    while (toiletPages.length < MAX_TOILET_URLS) {
      const batch = await getToiletSitemapPage(offset, PAGE_SIZE);
      if (batch.length === 0) break;
      for (const row of batch) {
        const citySlug = cityFromAddress(row.address);
        if (!citySlug) continue;
        const slug = `${row.id}-${slugifyToiletName(row.name)}`;
        toiletPages.push({
          url: `${baseUrl}/toilets/${citySlug}/${slug}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        });
        if (toiletPages.length >= MAX_TOILET_URLS) break;
      }
      offset += PAGE_SIZE;
      if (batch.length < PAGE_SIZE) break;
    }
  } catch (e) {
    console.error('sitemap: failed to enumerate toilet pages', e);
  }

  // Blog posts - fetch from Supabase
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);

    if (posts) {
      blogPages = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [...staticPages, ...cityPages, ...toiletPages, ...blogPages];
}
