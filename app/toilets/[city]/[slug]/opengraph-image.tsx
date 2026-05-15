import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE, type OgAccent } from '@/lib/og/template';
import { getToiletById } from '@/lib/supabase';

export const alt = 'Public toilet — Where To Wee';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';
export const revalidate = 3600;

interface Props {
  params: Promise<{ city: string; slug: string }>;
}

// `[id]-[slug]` → numeric id, or null when the segment is malformed.
function parseId(slug: string): number | null {
  const id = Number.parseInt(slug.split('-')[0], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

// Pretty-print a kebab-case city slug for the card's eyebrow text.
function prettifyCity(city: string): string {
  return city
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export default async function Image({ params }: Props) {
  const { city, slug } = await params;
  const id = parseId(slug);
  const cityName = prettifyCity(city);

  if (id == null) {
    // Malformed URL — render a sane fallback rather than 500.
    return renderOgCard({
      eyebrow: cityName,
      title: 'Public toilet near you',
      subtitle: 'Find accessibility info, ratings and directions on Where To Wee',
      accent: 'mint',
    });
  }

  const toilet = await getToiletById(id);
  if (!toilet) {
    return renderOgCard({
      eyebrow: cityName,
      title: 'Public toilet near you',
      subtitle: 'Find accessibility info, ratings and directions on Where To Wee',
      accent: 'mint',
    });
  }

  // Choose an accent based on the primary feature so the card feels
  // editorial rather than generic — Changing Places lean purple,
  // wheelchair-accessible lean blue, baby change lean orange, etc.
  let accent: OgAccent = 'mint';
  let icon = '🚻';
  if (toilet.hoist === 'yes') {
    accent = 'purple';
    icon = '🛌';
  } else if (toilet.wheelchair === 'yes') {
    accent = 'blue';
    icon = '♿';
  } else if (toilet.baby_changing === 'yes') {
    accent = 'orange';
    icon = '🍼';
  } else if (toilet.radar_key === 'yes') {
    accent = 'indigo';
    icon = '🔑';
  } else if (toilet.fee === 'no' || toilet.fee === 'free') {
    accent = 'mint';
    icon = '🪙';
  }

  const tags: string[] = [];
  if (toilet.fee === 'no' || toilet.fee === 'free') tags.push('Free to use');
  if (toilet.wheelchair === 'yes') tags.push('Wheelchair accessible');
  if (toilet.baby_changing === 'yes') tags.push('Baby change');
  if (toilet.hoist === 'yes') tags.push('Changing Places');
  if (toilet.radar_key === 'yes') tags.push('RADAR key');

  const subtitle = [
    toilet.address ?? cityName,
    tags.length > 0 ? tags.join(' · ') : null,
  ]
    .filter(Boolean)
    .join(' — ');

  return renderOgCard({
    eyebrow: `${cityName} · Public toilet`,
    title: toilet.name,
    subtitle,
    icon,
    accent,
  });
}
