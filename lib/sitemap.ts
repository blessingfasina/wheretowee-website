import { unstable_cache } from 'next/cache';
import { CITY_SLUGS } from '@/lib/cities';
import {
  supabase,
  getToiletSitemapPage,
  citySlugForToilet,
  canonicalToiletPath,
  SITE_ORIGIN,
} from '@/lib/supabase';

/**
 * Sitemap index + child sitemaps.
 *
 *   /sitemap.xml                    → index (what GSC / robots.txt point at)
 *   /sitemaps/pages.xml             → static, intent, city and blog pages
 *   /sitemaps/toilets-<city>.xml    → quality toilet pages for one city
 *
 * Splitting toilets by city lets Search Console report "submitted vs
 * indexed" per city, so we can see where Google is accepting pages.
 *
 * lastmod is only emitted when we have a real change date (toilet /
 * blog `updated_at`). Static pages used to send `new Date()` on every
 * rebuild, which teaches Google to ignore our lastmod entirely.
 */

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}

export const REVALIDATE_SECONDS = 3600;

const STATIC_ROUTES = [
  '',
  '/map',
  '/toilets',
  '/download',
  '/about',
  '/blog',
  '/faq',
  '/submit',
  '/press',
  '/print/brighton-hove',
  '/contact',
  '/radar-key',
  '/toilet-tips',
  '/free-public-toilets',
  '/accessible-toilets-uk',
  '/changing-places-uk',
  '/baby-changing-near-me',
  '/radar-key-toilets-uk',
  '/privacy',
  '/terms',
  '/accessibility',
  '/cookies',
  '/content-policy',
];

const MAX_TOILET_URLS = 40000;
const PAGE_SIZE = 1000;

export const TOILET_SITEMAP_FILES = CITY_SLUGS.map((c) => `toilets-${c}.xml`);
export const ALL_SITEMAP_FILES = ['pages.xml', ...TOILET_SITEMAP_FILES];

function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/// Every sitemap-worthy toilet URL, grouped by city slug. One scan of
/// the table per hour, shared by all 30 city sitemaps via the data cache.
const getToiletEntriesByCity = unstable_cache(
  async (): Promise<Record<string, SitemapEntry[]>> => {
    const byCity: Record<string, SitemapEntry[]> = {};
    let total = 0;
    try {
      let offset = 0;
      while (total < MAX_TOILET_URLS) {
        const { rows, scanned } = await getToiletSitemapPage(offset, PAGE_SIZE);
        if (scanned === 0) break;
        for (const row of rows) {
          const city = citySlugForToilet(row);
          if (!city) continue;
          (byCity[city] ??= []).push({
            loc: `${SITE_ORIGIN}${canonicalToiletPath(row, city)}`,
            lastmod: isoDate(row.updated_at),
          });
          total += 1;
        }
        offset += PAGE_SIZE;
        if (scanned < PAGE_SIZE) break;
      }
    } catch (e) {
      console.error('sitemap: failed to enumerate toilet pages', e);
    }
    return byCity;
  },
  ['sitemap-toilets-by-city-v1'],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getToiletEntriesForCity(city: string): Promise<SitemapEntry[]> {
  const byCity = await getToiletEntriesByCity();
  return byCity[city] ?? [];
}

export async function getPageEntries(): Promise<SitemapEntry[]> {
  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((route) => ({
    loc: `${SITE_ORIGIN}${route}`,
  }));
  const cityEntries: SitemapEntry[] = CITY_SLUGS.map((city) => ({
    loc: `${SITE_ORIGIN}/toilets/${city}`,
  }));

  let blogEntries: SitemapEntry[] = [];
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);
    blogEntries = (posts ?? []).map((post: { slug: string; updated_at: string | null }) => ({
      loc: `${SITE_ORIGIN}/blog/${post.slug}`,
      lastmod: isoDate(post.updated_at),
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [...staticEntries, ...cityEntries, ...blogEntries];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderUrlset(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) =>
      `<url><loc>${escapeXml(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function renderIndex(files: string[]): string {
  const body = files
    .map((f) => `<sitemap><loc>${SITE_ORIGIN}/sitemaps/${f}</loc></sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
