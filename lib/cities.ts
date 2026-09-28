/**
 * Canonical list of UK cities we have first-class landing pages for.
 *
 * Single source of truth used by:
 *  - The city directory landing page (`app/toilets/[city]/page.tsx`)
 *  - The toilet detail route (`app/toilets/[city]/[slug]/page.tsx`)
 *  - The sitemap (`app/sitemap.ts`)
 *  - The new intent / category pages (`app/free-public-toilets`, etc.)
 *
 * Adding a new city = single entry here; everything else picks it up
 * automatically on the next build / revalidate.
 */
export interface CityInfo {
  /** URL-friendly slug, e.g. `milton-keynes`. */
  slug: string;
  /** Display name, e.g. `Milton Keynes`. */
  fullName: string;
  /** Approximate city-centre latitude. */
  lat: number;
  /** Approximate city-centre longitude. */
  lng: number;
}

/// Ordered so multi-word slugs come first — matches the resolver
/// logic in `cityFromAddress` so we hit the longest plausible match
/// before falling back to a single-word slug.
export const CITIES: ReadonlyArray<CityInfo> = [
  { slug: 'milton-keynes', fullName: 'Milton Keynes', lat: 52.0406, lng: -0.7594 },
  { slug: 'london', fullName: 'London', lat: 51.5074, lng: -0.1278 },
  { slug: 'birmingham', fullName: 'Birmingham', lat: 52.4862, lng: -1.8904 },
  { slug: 'manchester', fullName: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { slug: 'leeds', fullName: 'Leeds', lat: 53.8008, lng: -1.5491 },
  { slug: 'glasgow', fullName: 'Glasgow', lat: 55.8642, lng: -4.2518 },
  { slug: 'liverpool', fullName: 'Liverpool', lat: 53.4084, lng: -2.9916 },
  { slug: 'bristol', fullName: 'Bristol', lat: 51.4545, lng: -2.5879 },
  { slug: 'sheffield', fullName: 'Sheffield', lat: 53.3811, lng: -1.4701 },
  { slug: 'edinburgh', fullName: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
  { slug: 'leicester', fullName: 'Leicester', lat: 52.6369, lng: -1.1398 },
  { slug: 'coventry', fullName: 'Coventry', lat: 52.4068, lng: -1.5197 },
  { slug: 'bradford', fullName: 'Bradford', lat: 53.795, lng: -1.7594 },
  { slug: 'cardiff', fullName: 'Cardiff', lat: 51.4816, lng: -3.1791 },
  { slug: 'belfast', fullName: 'Belfast', lat: 54.5973, lng: -5.9301 },
  { slug: 'nottingham', fullName: 'Nottingham', lat: 52.9548, lng: -1.1581 },
  { slug: 'newcastle', fullName: 'Newcastle upon Tyne', lat: 54.9783, lng: -1.6178 },
  { slug: 'brighton', fullName: 'Brighton', lat: 50.8225, lng: -0.1372 },
  { slug: 'southampton', fullName: 'Southampton', lat: 50.9097, lng: -1.4044 },
  { slug: 'portsmouth', fullName: 'Portsmouth', lat: 50.8198, lng: -1.0879 },
  { slug: 'oxford', fullName: 'Oxford', lat: 51.752, lng: -1.2577 },
  { slug: 'cambridge', fullName: 'Cambridge', lat: 52.2053, lng: 0.1218 },
  { slug: 'york', fullName: 'York', lat: 53.9591, lng: -1.0815 },
  { slug: 'bath', fullName: 'Bath', lat: 51.3811, lng: -2.359 },
  { slug: 'bournemouth', fullName: 'Bournemouth', lat: 50.7196, lng: -1.8808 },
  { slug: 'reading', fullName: 'Reading', lat: 51.4543, lng: -0.9781 },
  { slug: 'exeter', fullName: 'Exeter', lat: 50.7184, lng: -3.5339 },
  { slug: 'aberdeen', fullName: 'Aberdeen', lat: 57.1497, lng: -2.0943 },
  { slug: 'dundee', fullName: 'Dundee', lat: 56.4628, lng: -2.9708 },
  { slug: 'swansea', fullName: 'Swansea', lat: 51.6214, lng: -3.9436 },
];

/// Quick lookup map: slug → metadata. O(1) for the hot path.
export const CITY_BY_SLUG: Record<string, CityInfo> = Object.fromEntries(
  CITIES.map((c) => [c.slug, c]),
);

export const CITY_SLUGS: ReadonlyArray<string> = CITIES.map((c) => c.slug);

/// Extra phrases that should resolve to a city even when the address
/// doesn't use the exact `fullName` (e.g. "Newcastle" not "Newcastle
/// upon Tyne", "Hove" as part of Brighton & Hove).
const CITY_EXTRA_PHRASES: ReadonlyArray<{ slug: string; phrases: string[] }> = [
  { slug: 'brighton', phrases: ['brighton and hove', 'brighton & hove', 'hove'] },
  { slug: 'newcastle', phrases: ['newcastle upon tyne', 'newcastle'] },
  { slug: 'milton-keynes', phrases: ['milton keynes'] },
];

/// Radius used when an address doesn't name a city and we fall back
/// to "nearest supported city by coordinates". Tight enough that
/// Bridlington (East Yorkshire) does not get filed under York.
export const CITY_MATCH_KM = 35;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/// True when `phrase` appears in `haystack` as its own token, not as
/// a substring of a longer word. This is what stops "York" matching
/// "Yorkshire" / "East Yorkshire".
function hasPhrase(haystack: string, phrase: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(phrase)}([^a-z0-9]|$)`).test(
    haystack,
  );
}

/// Phrase list used by [cityFromAddress], longest first so
/// "brighton & hove" wins over "hove" and "milton keynes" is tried
/// before any single-word leftover.
const CITY_PHRASES: ReadonlyArray<{ slug: string; phrase: string }> = (() => {
  const out: Array<{ slug: string; phrase: string }> = [];
  for (const c of CITIES) {
    out.push({ slug: c.slug, phrase: c.fullName.toLowerCase() });
  }
  for (const extra of CITY_EXTRA_PHRASES) {
    for (const phrase of extra.phrases) {
      out.push({ slug: extra.slug, phrase });
    }
  }
  out.sort((a, b) => b.phrase.length - a.phrase.length);
  return out;
})();

/// Best-effort match of an address string to one of our supported
/// city slugs. Returns null when no supported city is named.
export function cityFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  const haystack = address.toLowerCase();
  for (const { slug, phrase } of CITY_PHRASES) {
    if (hasPhrase(haystack, phrase)) return slug;
  }
  return null;
}

/// Great-circle distance in km. Accurate enough for "is this loo in
/// this city" and "nearest supported city" decisions.
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const x =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

/// Resolve the city slug we want in a toilet's canonical URL.
/// Address match wins; otherwise the nearest supported city within
/// [CITY_MATCH_KM]; otherwise `fallbackCity` when it's one we know.
export function citySlugForToilet(
  toilet: {
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  },
  fallbackCity?: string | null,
): string | null {
  const fromAddress = cityFromAddress(toilet.address);
  if (fromAddress) return fromAddress;

  const lat = toilet.latitude;
  const lng = toilet.longitude;
  if (typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)) {
    let best: { slug: string; km: number } | null = null;
    for (const c of CITIES) {
      const km = haversineKm({ lat, lng }, { lat: c.lat, lng: c.lng });
      if (best == null || km < best.km) best = { slug: c.slug, km };
    }
    if (best && best.km <= CITY_MATCH_KM) return best.slug;
  }

  if (fallbackCity && CITY_BY_SLUG[fallbackCity]) return fallbackCity;
  return fallbackCity ?? null;
}

/// Should this toilet appear on `city`'s directory page?
/// Address that names a *different* supported city is always out
/// (fixes York listing Bridlington because "Yorkshire" contained
/// "York"). Unnamed addresses stay if they're geographically close.
export function belongsToCity(
  toilet: {
    address?: string | null;
    latitude: number;
    longitude: number;
  },
  city: CityInfo,
  nearbyKm: number = CITY_MATCH_KM,
): boolean {
  const matched = cityFromAddress(toilet.address);
  if (matched) return matched === city.slug;
  if (!Number.isFinite(toilet.latitude) || !Number.isFinite(toilet.longitude)) {
    return false;
  }
  return (
    haversineKm(
      { lat: toilet.latitude, lng: toilet.longitude },
      { lat: city.lat, lng: city.lng },
    ) <= nearbyKm
  );
}
