import { safeRenderOgCard, OG_SIZE, OG_CONTENT_TYPE, type OgAccent } from '@/lib/og/template';
import { getToiletById } from '@/lib/supabase';

export const alt = 'Public toilet — Where To Wee';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';
// One week at the CDN. Toilet names/features rarely change; under
// AhrefsBot bursts this is the difference between edge hits and 500s.
export const revalidate = 604800;

interface Props {
  params: Promise<{ city: string; slug: string }>;
}

function parseId(slug: string): number | null {
  const id = Number.parseInt(slug.split('-')[0], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function prettifyCity(city: string): string {
  return city
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

const FALLBACK = {
  eyebrow: 'Where To Wee',
  title: 'Public toilet near you',
  subtitle: 'Find accessibility info, ratings and directions on Where To Wee',
  accent: 'mint' as const,
  icon: 'WTW',
};

export default async function Image({ params }: Props) {
  try {
    const { city, slug } = await params;
    const id = parseId(slug);
    const cityName = prettifyCity(city);

    if (id == null) {
      return safeRenderOgCard({ ...FALLBACK, eyebrow: cityName }, FALLBACK);
    }

    const toilet = await getToiletById(id);
    if (!toilet) {
      return safeRenderOgCard({ ...FALLBACK, eyebrow: cityName }, FALLBACK);
    }

    let accent: OgAccent = 'mint';
    let icon = 'WTW';
    if (toilet.hoist === 'yes') {
      accent = 'purple';
      icon = 'CP';
    } else if (toilet.wheelchair === 'yes') {
      accent = 'blue';
      icon = 'A11Y';
    } else if (toilet.baby_changing === 'yes') {
      accent = 'orange';
      icon = 'BABY';
    } else if (toilet.radar_key === 'yes') {
      accent = 'indigo';
      icon = 'KEY';
    } else if (toilet.fee === 'no' || toilet.fee === 'free') {
      accent = 'mint';
      icon = 'FREE';
    }

    const tags: string[] = [];
    if (toilet.fee === 'no' || toilet.fee === 'free') tags.push('Free to use');
    if (toilet.wheelchair === 'yes') tags.push('Wheelchair accessible');
    if (toilet.baby_changing === 'yes') tags.push('Baby change');
    if (toilet.hoist === 'yes') tags.push('Changing Places');
    if (toilet.radar_key === 'yes') tags.push('RADAR key');

    const subtitle = [toilet.address ?? cityName, tags.length > 0 ? tags.join(' · ') : null]
      .filter(Boolean)
      .join(' — ');

    return safeRenderOgCard(
      {
        eyebrow: `${cityName} · Public toilet`,
        title: toilet.name || 'Public toilet',
        subtitle,
        icon,
        accent,
      },
      FALLBACK,
    );
  } catch (err) {
    console.error('toilet opengraph-image failed', err);
    return safeRenderOgCard(FALLBACK);
  }
}
