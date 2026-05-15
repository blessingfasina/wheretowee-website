import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/template';

export const alt = 'RADAR Key Guide — National Key Scheme Explainer';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';

export default function Image() {
  return renderOgCard({
    eyebrow: 'Guide · UK',
    title: 'The RADAR key, explained',
    subtitle: '10,000+ accessible toilets · one key · £5 from Disability Rights UK',
    icon: '🔑',
    accent: 'indigo',
  });
}
