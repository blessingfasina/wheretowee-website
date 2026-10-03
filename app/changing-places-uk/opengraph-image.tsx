import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/template';
import { getCategoryStats } from '@/lib/supabase';

export const alt = 'Changing Places Toilets UK — Hoist & Adult-Changing Bench';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';
export const revalidate = 3600;

export default async function Image() {
  const { total } = await getCategoryStats('changing_places');
  const subtitle =
    total > 0
      ? `${total.toLocaleString('en-GB')} hoist-equipped facilities · adult bench · UK-wide`
      : 'Hoists · adult-changing benches · the space families need';
  return renderOgCard({
    eyebrow: 'Changing Places · UK',
    title: 'Find a Changing Places near you',
    subtitle,
    icon: 'CP',
    accent: 'purple',
  });
}
