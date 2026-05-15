import { renderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/template';

export const alt = 'UK Toilet Tips — Where to Find a Loo on the Move';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';

export default function Image() {
  return renderOgCard({
    eyebrow: 'Guide · UK',
    title: 'Where to find a toilet on the move',
    subtitle: 'Motorway services · train stations · shopping centres · libraries · museums',
    icon: '🧭',
    accent: 'navy',
  });
}
