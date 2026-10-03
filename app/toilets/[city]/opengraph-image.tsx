import { safeRenderOgCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og/template';
import { CITY_BY_SLUG } from '@/lib/cities';
import { supabase, getActiveToiletTable } from '@/lib/supabase';

export const alt = 'Public toilets by UK city — Where To Wee';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'nodejs';
export const revalidate = 604800;

interface Props {
  params: Promise<{ city: string }>;
}

async function countToiletsInCity(cityName: string): Promise<number> {
  try {
    const tableName = await getActiveToiletTable();
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .or('status.eq.active,status.eq.approved')
      .ilike('address', `%${cityName}%`);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function Image({ params }: Props) {
  try {
    const { city } = await params;
    const info = CITY_BY_SLUG[city];
    const cityName =
      info?.fullName ??
      city
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

    const count = info ? await countToiletsInCity(cityName) : 0;
    const subtitle =
      count > 0
        ? `${count.toLocaleString('en-GB')} listings · accessibility info · ratings · one-tap directions`
        : 'Find the nearest public toilet — accessibility info · ratings · directions';

    return safeRenderOgCard({
      eyebrow: `${cityName} · UK`,
      title: `Public toilets in ${cityName}`,
      subtitle,
      icon: 'CITY',
      accent: 'navy',
    });
  } catch (err) {
    console.error('city opengraph-image failed', err);
    return safeRenderOgCard({
      eyebrow: 'Where To Wee',
      title: 'Public toilets across the UK',
      subtitle: 'Find the nearest loo — free · accessibility-first',
      accent: 'navy',
      icon: 'WTW',
    });
  }
}
