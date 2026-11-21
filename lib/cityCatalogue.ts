import { unstable_cache } from 'next/cache';
import { CITY_BY_SLUG, CITY_MATCH_KM, belongsToCity } from '@/lib/cities';
import {
  supabase,
  getActiveToiletTable,
  toiletQualityScore,
  type Toilet,
} from '@/lib/supabase';

/**
 * Full catalogue of toilets for one city landing page.
 *
 * The old city query matched `address ILIKE '%London%'`, but ~90% of
 * London rows store only the borough as their address ("Westminster",
 * "Tower Hamlets"), so the page showed "60+ toilets" made up of
 * user-submitted oddities while 2,000+ council-quality listings were
 * invisible. This pulls every active toilet inside the city's bounding
 * box and keeps the ones [belongsToCity] accepts — the same rule the
 * canonical toilet URLs use — so counts, lists and sitemaps agree.
 *
 * Cached for an hour per city. Only slim columns are kept so London's
 * ~2,500 rows stay well under the data-cache entry limit.
 */

export interface CityToilet {
  id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  fee: string | null;
  wheelchair: string | null;
  baby_changing: string | null;
  radar_key: string | null;
  hoist: string | null;
  opening_hours: string | null;
  average_rating: number | null;
  rating_count: number | null;
  verified_source: string | null;
  verified_at: string | null;
  confirmation_count: number | null;
  last_confirmed_at: string | null;
  status: string;
  created_at: string;
  quality: number;
  area: string | null;
}

export interface CityArea {
  name: string;
  count: number;
  lat: number;
  lng: number;
  toilets: CityToilet[];
}

export interface CityCatalogue {
  total: number;
  accessible: number;
  babyChanging: number;
  free: number;
  radar: number;
  changingPlaces: number;
  /** Best-documented toilets first (quality, then rating). */
  toilets: CityToilet[];
  /** Areas (London boroughs) by size; empty for cities without area data. */
  areas: CityArea[];
}

/// London boroughs + the City. Most London rows use one of these as
/// the entire address, which makes them a clean grouping key.
const LONDON_AREAS = [
  'City of London', 'Westminster', 'Camden', 'Islington', 'Hackney',
  'Tower Hamlets', 'Southwark', 'Lambeth', 'Kensington and Chelsea',
  'Hammersmith and Fulham', 'Wandsworth', 'Lewisham', 'Greenwich',
  'Newham', 'Haringey', 'Waltham Forest', 'Richmond upon Thames',
  'Hounslow', 'Merton', 'Brent', 'Barnet', 'Bromley', 'Ealing',
  'Croydon', 'Enfield', 'Harrow', 'Hillingdon', 'Kingston upon Thames',
  'Sutton', 'Bexley', 'Havering', 'Redbridge', 'Barking and Dagenham',
];

const AREAS_BY_CITY: Record<string, string[]> = {
  london: LONDON_AREAS,
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/// Borough (or other configured area) named in an address, if any.
export function areaForAddress(address: string | null, citySlug: string): string | null {
  return areaFor(address, AREAS_BY_CITY[citySlug]);
}

function areaFor(address: string | null, areas: string[] | undefined): string | null {
  if (!address || !areas) return null;
  const hay = address.toLowerCase();
  // Longest first so "City of London" wins over a bare "London" match
  // elsewhere, and "Kingston upon Thames" over "Kingston".
  for (const area of [...areas].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`(^|[^a-z])${escapeRegExp(area.toLowerCase())}([^a-z]|$)`);
    if (re.test(hay)) return area;
  }
  return null;
}

function isYes(v: string | null | undefined): boolean {
  return (v ?? '').toLowerCase() === 'yes';
}

function isFree(v: string | null | undefined): boolean {
  const s = (v ?? '').toLowerCase();
  return s === 'no' || s === 'free';
}

async function loadCityCatalogue(citySlug: string): Promise<CityCatalogue> {
  const empty: CityCatalogue = {
    total: 0, accessible: 0, babyChanging: 0, free: 0, radar: 0, changingPlaces: 0,
    toilets: [], areas: [],
  };
  const city = CITY_BY_SLUG[citySlug];
  if (!city) return empty;

  const latDiff = CITY_MATCH_KM / 111;
  const lngDiff = CITY_MATCH_KM / (111 * Math.cos((city.lat * Math.PI) / 180));
  const areaNames = AREAS_BY_CITY[citySlug];

  const rows: CityToilet[] = [];
  try {
    const tableName = await getActiveToiletTable();
    const PAGE = 1000;
    for (let offset = 0; offset < 20000; offset += PAGE) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .or('status.eq.active,status.eq.approved')
        .gte('latitude', city.lat - latDiff)
        .lte('latitude', city.lat + latDiff)
        .gte('longitude', city.lng - lngDiff)
        .lte('longitude', city.lng + lngDiff)
        .order('id', { ascending: true })
        .range(offset, offset + PAGE - 1);
      if (error) {
        console.error(`cityCatalogue(${citySlug}) error:`, error);
        break;
      }
      const page = (data ?? []) as Toilet[];
      for (const t of page) {
        if (!belongsToCity(t, city)) continue;
        rows.push({
          id: t.id,
          name: t.name,
          address: t.address,
          latitude: t.latitude,
          longitude: t.longitude,
          fee: t.fee,
          wheelchair: t.wheelchair,
          baby_changing: t.baby_changing,
          radar_key: t.radar_key ?? null,
          hoist: t.hoist ?? null,
          opening_hours: t.opening_hours,
          average_rating: t.average_rating,
          rating_count: t.rating_count,
          verified_source: t.verified_source ?? null,
          verified_at: t.verified_at ?? null,
          confirmation_count: t.confirmation_count ?? null,
          last_confirmed_at: t.last_confirmed_at ?? null,
          status: t.status,
          created_at: t.created_at,
          quality: toiletQualityScore(t),
          area: areaFor(t.address, areaNames),
        });
      }
      if (page.length < PAGE) break;
    }
  } catch (e) {
    console.error(`cityCatalogue(${citySlug}) threw:`, e);
    return empty;
  }

  rows.sort(
    (a, b) =>
      b.quality - a.quality ||
      (b.rating_count ?? 0) - (a.rating_count ?? 0) ||
      (b.average_rating ?? 0) - (a.average_rating ?? 0) ||
      a.id - b.id,
  );

  const byArea = new Map<string, CityToilet[]>();
  for (const t of rows) {
    if (!t.area) continue;
    const list = byArea.get(t.area) ?? [];
    list.push(t);
    byArea.set(t.area, list);
  }
  const areas: CityArea[] = Array.from(byArea.entries())
    .map(([name, list]: [string, CityToilet[]]) => ({
      name,
      count: list.length,
      lat: list.reduce((s, t) => s + t.latitude, 0) / list.length,
      lng: list.reduce((s, t) => s + t.longitude, 0) / list.length,
      toilets: list.slice(0, 8),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    total: rows.length,
    accessible: rows.filter((t) => isYes(t.wheelchair)).length,
    babyChanging: rows.filter((t) => isYes(t.baby_changing)).length,
    free: rows.filter((t) => isFree(t.fee)).length,
    radar: rows.filter((t) => isYes(t.radar_key)).length,
    changingPlaces: rows.filter((t) => isYes(t.hoist)).length,
    toilets: rows.slice(0, 60),
    areas,
  };
}

/// Cached per city for an hour (args are part of the cache key).
export const getCityCatalogue = unstable_cache(loadCityCatalogue, ['city-catalogue-v1'], {
  revalidate: 3600,
});

/// "2,231" → "2,200+", "64" → "60+", "7" → "7". Keeps titles honest
/// without changing every hour.
export function roundedCount(n: number): string {
  if (n >= 1000) return `${(Math.floor(n / 100) * 100).toLocaleString('en-GB')}+`;
  if (n >= 100) return `${Math.floor(n / 50) * 50}+`;
  if (n >= 20) return `${Math.floor(n / 10) * 10}+`;
  return String(n);
}
