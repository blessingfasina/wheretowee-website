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

/// Best-effort match of an address string to one of our supported
/// city slugs. Returns null when no supported city is named in the
/// address. Multi-word slugs are checked first (see `CITIES` order).
export function cityFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  const haystack = address.toLowerCase();
  for (const c of CITIES) {
    const needle = c.fullName.toLowerCase();
    if (haystack.includes(needle)) return c.slug;
  }
  return null;
}
