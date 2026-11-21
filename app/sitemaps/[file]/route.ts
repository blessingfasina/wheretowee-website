import { notFound } from 'next/navigation';
import {
  ALL_SITEMAP_FILES,
  getPageEntries,
  getToiletEntriesForCity,
  renderUrlset,
  xmlResponse,
} from '@/lib/sitemap';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_SITEMAP_FILES.map((file) => ({ file }));
}

/// Child sitemaps: /sitemaps/pages.xml and /sitemaps/toilets-<city>.xml.
export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const { file } = params;
  if (!ALL_SITEMAP_FILES.includes(file)) notFound();

  if (file === 'pages.xml') {
    return xmlResponse(renderUrlset(await getPageEntries()));
  }
  const city = file.replace(/^toilets-/, '').replace(/\.xml$/, '');
  return xmlResponse(renderUrlset(await getToiletEntriesForCity(city)));
}
