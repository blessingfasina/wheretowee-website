import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/template';
import { getCategoryStats } from '@/lib/supabase';

export const alt = 'RADAR Key Toilet Locations UK';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';
export const revalidate = 3600;

export default async function Image() {
  const { total } = await getCategoryStats('radar_key');
  const subtitle =
    total > 0
      ? `${total.toLocaleString('en-GB')} National Key Scheme locations across the UK`
      : 'Every National Key Scheme location in our database';
  return renderOgCard({
    eyebrow: 'RADAR key · UK',
    title: 'Where to use your RADAR key',
    subtitle,
    icon: '🔑',
    accent: 'indigo',
  });
}
