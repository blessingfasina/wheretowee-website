import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/template';
import { getCategoryStats } from '@/lib/supabase';

export const alt = 'Accessible Toilets UK — Wheelchair-Accessible Loos';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';
export const revalidate = 3600;

export default async function Image() {
  const { total } = await getCategoryStats('accessible');
  const subtitle =
    total > 0
      ? `${total.toLocaleString('en-GB')} wheelchair-accessible toilets · grab rails · RADAR key info`
      : 'Wheelchair-accessible toilets across the UK · grab rails · RADAR key info';
  return renderOgCard({
    eyebrow: 'Accessible · UK',
    title: 'Accessible toilets across the UK',
    subtitle,
    icon: '♿',
    accent: 'blue',
  });
}
