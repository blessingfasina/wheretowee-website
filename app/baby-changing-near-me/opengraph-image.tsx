import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/template';
import { getCategoryStats } from '@/lib/supabase';

export const alt = 'Baby Changing Near Me — UK Directory';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';
export const revalidate = 3600;

export default async function Image() {
  const { total } = await getCategoryStats('baby_changing');
  const subtitle =
    total > 0
      ? `${total.toLocaleString('en-GB')} baby change facilities across the UK · in mums', dads' and family rooms`
      : 'Baby change tables across the UK · in mums\', dads\' and family rooms';
  return renderOgCard({
    eyebrow: 'Baby changing · UK',
    title: 'Baby changing facilities near you',
    subtitle,
    icon: '🍼',
    accent: 'orange',
  });
}
