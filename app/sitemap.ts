import { MetadataRoute } from 'next';
import { CITY_SLUGS } from '@/lib/cities';
import {
  supabase,
  getToiletSitemapPage,
  citySlugForToilet,
  canonicalToiletPath,
  SITE_ORIGIN,
} from '@/lib/supabase';

export const revalidate = 3600;

// Cap how many individual toilet pages we list. Google's per-file
// limit is 50,000; we stay well under that. Named, city-resolvable
// toilets are indexable, so the sitemap should actually list them —
// the previous generator stopped after the first 1,000 database rows
// and omitted most of the pages Search Console had already found.
const MAX_TOILET_URLS = 20000;
const PAGE_SIZE = 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_ORIGIN;

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
    { route: '/print/brighton-hove', priority: 0.7, changeFreq: 'weekly' as const },
    { route: '/contact', priority: 0.5, changeFreq: 'monthly' as const },
    { route: '/radar-key', priority: 0.8, changeFreq: 'monthly' as const },
    { route: '/toilet-tips', priority: 0.8, changeFreq: 'monthly' as const },
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

  const cityPages = CITY_SLUGS.map((city) => ({
    url: `${baseUrl}/toilets/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7 as const,
  }));

  const toiletPages: MetadataRoute.Sitemap = [];
  try {
    let offset = 0;
    while (toiletPages.length < MAX_TOILET_URLS) {
      const { rows, scanned } = await getToiletSitemapPage(offset, PAGE_SIZE);
      if (scanned === 0) break;
      for (const row of rows) {
        const citySlug = citySlugForToilet(row);
        if (!citySlug) continue;
        toiletPages.push({
          url: `${SITE_ORIGIN}${canonicalToiletPath(row, citySlug)}`,
          lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        });
        if (toiletPages.length >= MAX_TOILET_URLS) break;
      }
      offset += PAGE_SIZE;
      if (scanned < PAGE_SIZE) break;
    }
  } catch (e) {
    console.error('sitemap: failed to enumerate toilet pages', e);
  }

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
