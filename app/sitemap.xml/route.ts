import { ALL_SITEMAP_FILES, getToiletEntriesForCity, renderIndex, xmlResponse } from '@/lib/sitemap';
import { CITY_SLUGS } from '@/lib/cities';

export const revalidate = 3600;

/// Sitemap index. Lists pages.xml plus one toilets-<city>.xml per city
/// that currently has at least one sitemap-worthy toilet (empty child
/// sitemaps just show up as errors in Search Console).
export async function GET() {
  const counts = await Promise.all(CITY_SLUGS.map((c) => getToiletEntriesForCity(c)));
  const files = ALL_SITEMAP_FILES.filter((f) => {
    if (f === 'pages.xml') return true;
    const idx = CITY_SLUGS.indexOf(f.replace(/^toilets-/, '').replace(/\.xml$/, ''));
    return idx >= 0 && counts[idx].length > 0;
  });
  return xmlResponse(renderIndex(files));
}
