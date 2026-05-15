import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/template';
import { getCategoryStats } from '@/lib/supabase';

export const alt = 'Free Public Toilets Near Me — UK Directory';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';
export const revalidate = 3600;

export default async function Image() {
  const { total } = await getCategoryStats('free');
  const subtitle =
    total > 0
      ? `${total.toLocaleString('en-GB')} free public toilets across the UK · no fee · no sign-up`
      : 'No-fee public conveniences across the UK · free to use · no sign-up';
  return renderOgCard({
    eyebrow: 'Free toilets · UK',
    title: 'Free public toilets near you',
    subtitle,
    icon: '🪙',
    accent: 'mint',
  });
}
