import { createClient } from '@supabase/supabase-js';
import { CITIES, type CityInfo } from './cities';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base toilet interface (works with v1, v2, and v3)
export interface Toilet {
  id: number;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  fee: string | null;
  wheelchair: string | null;
  baby_changing: string | null;
  unisex: string | null;
  opening_hours: string | null;
  operator_name?: string | null;  // V1/V2
  operator?: string | null;       // V3
  average_rating: number | null;
  rating_count: number | null;
  status: string;
  created_at: string;
  // V2/V3 additional fields (optional for backward compatibility)
  original_id?: string;           // V2
  original_id_v1?: string | null; // V3
  original_id_v2?: string | null; // V3
  radar_key?: string | null;
  men?: string | null;
  women?: string | null;
  attended?: string | null;
  automatic?: string | null;
  urinal_only?: string | null;
  children?: string | null;
  notes?: string | null;
  payment_details?: string | null;
  verified_at?: string | null;
  source?: string | null;         // V3: 'v1', 'v2', or 'merged'

  // ---- New trust-signal & accessibility fields (May 2026 migration) ----
  // These mirror the Dart `Toilet` model in lib/models/toilet.dart so
  // the web and app render the same UI surfaces. They are all
  // nullable: older rows pre-migration won't have them populated.

  // A3 — Optional accessibility metadata.
  hoist?: string | null;             // 'yes' | 'no' | 'unknown' (Changing Places)
  adult_changing?: string | null;    // adult changing bench
  gender_neutral?: string | null;
  emergency_access?: string | null;  // emergency cord, etc.

  // A1 — Trust source. Used by `get_toilet_verification` RPC and
  // displayed as the "Council verified" / "Community verified" /
  // "Recently confirmed" badge.
  verified_source?: string | null;   // 'council' | 'partner' | etc.

  // A2 + B1 — Cached confirmation stats (also returned via dedicated
  // RPCs but exposed on the row so the city listing card can summarise
  // without a per-toilet round-trip).
  confirmation_count?: number | null;
  not_found_count?: number | null;
  last_confirmed_at?: string | null;
}

/// Trust tier surfaced on a toilet card / detail page. Mirrors the
/// `VerificationTier` enum in the Flutter app. Derived client-side
/// from `verified_source`, `verified_at`, `confirmation_count`, and
/// `last_confirmed_at` so the server RPC stays lightweight.
export type VerificationTier =
  | 'council_verified'
  | 'community_verified'
  | 'recently_confirmed'
  | 'unverified';

/// Raw row returned by `get_toilet_verification` (toilet_id +
/// verified_source). Everything else is derived from the toilet row
/// itself via [resolveVerificationTier].
export interface ToiletVerificationRow {
  toilet_id: number;
  verified_source: string | null;
}

/// Raw row returned by `get_toilet_confidence`. The Dart model
/// resolves a categorical level from this — see [confidenceLevelFor].
export interface ToiletConfidenceRow {
  toilet_id: number;
  confidence_score: number;
  confidence_label: string; // 'high' | 'good' | 'moderate' | 'low' | 'very_low'
}

/// Raw row returned by `get_toilet_accessibility`.
export interface ToiletAccessibilityRow {
  toilet_id: number;
  hoist: string;
  adult_changing: string;
  gender_neutral: string;
  emergency_access: string;
}

export type ConfidenceLevel = 'high' | 'good' | 'moderate' | 'low' | 'very_low';

/// Derive a verification tier from the verified_source column + the
/// community-confirmation columns on a toilet row. Mirrors the
/// `Toilet.verificationTier` getter in `lib/models/toilet.dart`.
export function resolveVerificationTier(t: {
  verified_source?: string | null;
  verified_at?: string | null;
  confirmation_count?: number | null;
  last_confirmed_at?: string | null;
}): VerificationTier {
  if (
    t.verified_source === 'council' ||
    t.verified_source === 'official' ||
    t.verified_source === 'partner'
  ) {
    return 'council_verified';
  }
  if (t.verified_at != null || (t.confirmation_count ?? 0) >= 3) {
    return 'community_verified';
  }
  if (t.last_confirmed_at) {
    const ageDays = (Date.now() - new Date(t.last_confirmed_at).getTime()) /
      (1000 * 60 * 60 * 24);
    if (ageDays <= 30) return 'recently_confirmed';
  }
  return 'unverified';
}

/// Mirror of `Toilet.hasConfidenceSignals`. Used to decide whether to
/// render the confidence card or the "Help us verify this loo" prompt.
export function hasConfidenceSignals(t: {
  verified_source?: string | null;
  verified_at?: string | null;
  confirmation_count?: number | null;
  not_found_count?: number | null;
  rating_count?: number | null;
}): boolean {
  if (
    t.verified_source === 'council' ||
    t.verified_source === 'partner' ||
    t.verified_source === 'official'
  ) return true;
  if (t.verified_at) return true;
  if ((t.confirmation_count ?? 0) > 0) return true;
  if ((t.not_found_count ?? 0) > 0) return true;
  if ((t.rating_count ?? 0) > 0) return true;
  return false;
}

/// Mirror of `Toilet.needsReconfirmation`.
export function needsReconfirmation(t: {
  verified_source?: string | null;
  verified_at?: string | null;
  confirmation_count?: number | null;
  last_confirmed_at?: string | null;
}): boolean {
  if (resolveVerificationTier(t) === 'council_verified') return false;
  if (!t.last_confirmed_at) return false;
  const ageDays = (Date.now() - new Date(t.last_confirmed_at).getTime()) /
    (1000 * 60 * 60 * 24);
  return ageDays > 90;
}

/// "Index-worthy" cutoff in days. Toilets confirmed within this
/// window are considered fresh enough to deserve their own indexable
/// page even without ratings or verification. Matches the freshness
/// threshold used by `resolveVerificationTier` for `recently_confirmed`.
const INDEXABLE_RECENT_CONFIRM_DAYS = 30;

/**
 * Decide whether a toilet detail page is worth asking Google to index.
 *
 * The site has ~18k toilet rows but only a small fraction carry signals
 * Google can use to differentiate them (ratings, council verification,
 * recent community confirmation, or a high-value accessibility flag
 * like Changing Places / RADAR key). Pushing the entire long tail at
 * Google leads to "Discovered – currently not indexed" piling up; we
 * pre-filter here so:
 *
 *   - The sitemap only includes URLs we want crawled now.
 *   - Detail pages that don't yet earn this bar render with
 *     `<meta name="robots" content="noindex,follow">`. They stay live
 *     for users (the city pages still link to them), but stop competing
 *     for crawl budget. As soon as a row earns one of the signals it
 *     flips to indexable on the next request — no manual flag.
 */
export function isIndexWorthyToilet(t: {
  rating_count?: number | null;
  verified_source?: string | null;
  verified_at?: string | null;
  last_confirmed_at?: string | null;
  hoist?: string | null;
  radar_key?: string | null;
}): boolean {
  if ((t.rating_count ?? 0) >= 1) return true;
  if (t.verified_source && t.verified_source.length > 0) return true;
  if (t.verified_at) return true;
  if (t.last_confirmed_at) {
    const ageDays =
      (Date.now() - new Date(t.last_confirmed_at).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= INDEXABLE_RECENT_CONFIRM_DAYS) return true;
  }
  if (t.hoist === 'yes') return true; // Changing Places: always high-value
  if (t.radar_key === 'yes') return true; // National Key Scheme: high-value
  return false;
}

/**
 * Aggregate per-city counts for the `/toilets` city directory page.
 *
 * Issues one head-only count per city in parallel — the same shape as
 * [getCategoryStats] but without the category filter. Soft-fails to
 * `count: 0` per city on error so the directory page always renders.
 *
 * Cheaper than scanning the whole table client-side; each query is a
 * single integer round-trip.
 */
export async function getCityDirectoryStats(): Promise<{
  total: number;
  byCity: Array<{ city: CityInfo; count: number }>;
  topRated: Toilet[];
}> {
  const empty = { total: 0, byCity: [] as Array<{ city: CityInfo; count: number }>, topRated: [] as Toilet[] };
  try {
    const tableName = await getActiveToiletTable();
    const cityPromises = CITIES.map(async (city) => {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .or('status.eq.active,status.eq.approved')
        .ilike('address', `%${city.fullName}%`);
      if (error) return { city, count: 0 };
      return { city, count: count ?? 0 };
    });
    const totalQuery = supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .or('status.eq.active,status.eq.approved');
    const topRatedQuery = supabase
      .from(tableName)
      .select('*')
      .or('status.eq.active,status.eq.approved')
      .not('average_rating', 'is', null)
      .gte('rating_count', 2)
      .order('average_rating', { ascending: false })
      .limit(6);
    const [byCityRaw, totalRes, topRatedRes] = await Promise.all([
      Promise.all(cityPromises),
      totalQuery,
      topRatedQuery,
    ]);
    return {
      total: totalRes.count ?? 0,
      byCity: byCityRaw.sort((a, b) => b.count - a.count),
      topRated: ((topRatedRes.data as Toilet[] | null) ?? []),
    };
  } catch (e) {
    console.error('getCityDirectoryStats threw:', e);
    return empty;
  }
}

/// PostgREST `OR` filter string mirroring [isIndexWorthyToilet]. Used by
/// the slim sitemap query so the filtering happens server-side rather
/// than streaming 30k rows into Node and discarding 90 % of them.
function indexWorthyOrFilter(): string {
  const cutoff = new Date(
    Date.now() - INDEXABLE_RECENT_CONFIRM_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  return [
    'rating_count.gte.1',
    'verified_source.not.is.null',
    'verified_at.not.is.null',
    `last_confirmed_at.gte.${cutoff}`,
    'hoist.eq.yes',
    'radar_key.eq.yes',
  ].join(',');
}

/// Resolve a confidence level from either a server-provided label or
/// the numeric score. Matches the Dart `ConfidenceLevel.fromCode/Score`.
export function confidenceLevelFor(
  label: string | null,
  score: number,
): ConfidenceLevel {
  if (label) {
    const code = label.toLowerCase().replace(/[\s-]/g, '_');
    if (['high', 'good', 'moderate', 'low', 'very_low'].includes(code)) {
      return code as ConfidenceLevel;
    }
  }
  if (score >= 80) return 'high';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'low';
  return 'very_low';
}

// Cache for active table name (to avoid repeated DB calls)
let cachedTableName: string | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Get the active toilet table name from app_settings
 * Defaults to 'toilets' if setting not found
 */
export async function getActiveToiletTable(): Promise<string> {
  // Return cached value if still valid
  if (cachedTableName && Date.now() < cacheExpiry) {
    return cachedTableName;
  }

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'website_toilet_table')
      .single();

    if (!error && data && data.setting_value) {
      cachedTableName = data.setting_value as string;
      cacheExpiry = Date.now() + CACHE_DURATION;
      return cachedTableName;
    }
  } catch (e) {
    console.log('Could not fetch app_settings, using default table');
  }

  // Default to original table
  cachedTableName = 'toilets';
  cacheExpiry = Date.now() + CACHE_DURATION;
  return 'toilets';
}

/**
 * Get the appropriate RPC function name based on table
 */
function getRpcFunctionName(tableName: string): string {
  switch (tableName) {
    case 'toilets_v3':
      return 'find_nearby_toilets_v3';
    case 'toilets_v2':
      return 'find_nearby_toilets_v2';
    default:
      return 'find_nearby_toilets';
  }
}

/**
 * Force refresh the cached table name
 */
export function invalidateTableCache(): void {
  cachedTableName = null;
  cacheExpiry = 0;
}

export async function getNearbyToilets(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  limit: number = 50
): Promise<Toilet[]> {
  const tableName = await getActiveToiletTable();
  const rpcFunction = getRpcFunctionName(tableName);

  // Try RPC function first for accurate distance-based results
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(rpcFunction, {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radiusKm * 1000, // Convert km to meters
      max_results: limit,
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      return rpcData as Toilet[];
    }
    
    // If RPC returns empty or fails, fall back to bounding box
    console.log(`RPC (${rpcFunction}) returned empty, falling back to bounding box query`);
  } catch (rpcErr) {
    console.log(`RPC function (${rpcFunction}) failed, using fallback:`, rpcErr);
  }

  // Fallback: Simple bounding box query
  const latDiff = radiusKm / 111;
  const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .or('status.eq.active,status.eq.approved')
    .gte('latitude', lat - latDiff)
    .lte('latitude', lat + latDiff)
    .gte('longitude', lng - lngDiff)
    .lte('longitude', lng + lngDiff)
    .limit(limit);

  if (error) {
    console.error('Error fetching toilets:', error);
    return [];
  }

  return data || [];
}

export async function getToiletsByCity(city: string, limit: number = 100): Promise<Toilet[]> {
  const tableName = await getActiveToiletTable();

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .or('status.eq.active,status.eq.approved')
    .ilike('address', `%${city}%`)
    .limit(limit);

  if (error) {
    console.error('Error fetching toilets:', error);
    return [];
  }

  return data || [];
}

export async function getToiletById(id: number): Promise<Toilet | null> {
  const tableName = await getActiveToiletTable();

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching toilet:', error);
    return null;
  }

  return data;
}

/// Batch-fetch the verification, confidence, and accessibility
/// enrichment rows for a set of toilet ids. All three RPCs are issued
/// in parallel and any individual failure (e.g. RPC not deployed yet)
/// soft-fails to an empty map so the rest of the page still renders.
export async function getToiletEnrichment(
  toiletIds: number[],
): Promise<{
  verification: Record<number, ToiletVerificationRow>;
  confidence: Record<number, ToiletConfidenceRow>;
  accessibility: Record<number, ToiletAccessibilityRow>;
}> {
  if (toiletIds.length === 0) {
    return { verification: {}, confidence: {}, accessibility: {} };
  }

  const empty = { verification: {}, confidence: {}, accessibility: {} };
  try {
    const [verificationRes, confidenceRes, accessibilityRes] = await Promise.all([
      supabase.rpc('get_toilet_verification', { p_toilet_ids: toiletIds }),
      supabase.rpc('get_toilet_confidence',   { p_toilet_ids: toiletIds }),
      supabase.rpc('get_toilet_accessibility', { p_toilet_ids: toiletIds }),
    ]);

    const verification: Record<number, ToiletVerificationRow> = {};
    for (const row of (verificationRes.data ?? []) as ToiletVerificationRow[]) {
      verification[row.toilet_id] = row;
    }
    const confidence: Record<number, ToiletConfidenceRow> = {};
    for (const row of (confidenceRes.data ?? []) as ToiletConfidenceRow[]) {
      confidence[row.toilet_id] = row;
    }
    const accessibility: Record<number, ToiletAccessibilityRow> = {};
    for (const row of (accessibilityRes.data ?? []) as ToiletAccessibilityRow[]) {
      accessibility[row.toilet_id] = row;
    }
    return { verification, confidence, accessibility };
  } catch (e) {
    console.error('getToiletEnrichment failed:', e);
    return empty;
  }
}

/// Light-weight pagination helper for the sitemap and any future
/// admin pages. Returns just the columns needed to build a URL and
/// fall back to a freshness signal.
///
/// By default this only returns rows that pass [isIndexWorthyToilet]
/// — i.e. the ones we actually want Google to crawl. Pass
/// `{ onlyIndexable: false }` if a caller (e.g. a future admin page)
/// genuinely wants the full active catalogue.
export async function getToiletSitemapPage(
  offset: number,
  limit: number,
  opts: { onlyIndexable?: boolean } = {},
): Promise<Array<{
  id: number;
  name: string | null;
  address: string | null;
  updated_at: string | null;
}>> {
  const onlyIndexable = opts.onlyIndexable ?? true;
  const tableName = await getActiveToiletTable();

  let query = supabase
    .from(tableName)
    .select('id, name, address, updated_at, created_at')
    .or('status.eq.active,status.eq.approved');

  if (onlyIndexable) {
    // Server-side filter — keeps round-trips small even when the table
    // has 18k+ rows but only a few thousand are index-worthy.
    query = query.or(indexWorthyOrFilter());
  }

  const { data, error } = await query
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getToiletSitemapPage error:', error);
    return [];
  }
  // Some rows pre-date the `updated_at` column — fall back to
  // `created_at` so the sitemap still has a usable lastmod date.
  return (data ?? []).map((row: {
    id: number;
    name: string | null;
    address: string | null;
    updated_at?: string | null;
    created_at?: string | null;
  }) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    updated_at: row.updated_at ?? row.created_at ?? null,
  }));
}

/// City slugs we currently have first-class landing pages for. Used by
/// `cityFromAddress` when resolving a clean URL for a toilet detail
/// page. Order matters slightly — multi-word slugs come first so we
/// match the longest token before falling back to single words.
export const SUPPORTED_CITY_SLUGS: ReadonlyArray<string> = [
  'milton-keynes',
  'london',
  'birmingham',
  'manchester',
  'leeds',
  'glasgow',
  'liverpool',
  'bristol',
  'sheffield',
  'edinburgh',
  'leicester',
  'coventry',
  'bradford',
  'cardiff',
  'belfast',
  'nottingham',
  'newcastle',
  'brighton',
  'southampton',
  'portsmouth',
  'oxford',
  'cambridge',
  'york',
  'bath',
  'bournemouth',
  'reading',
  'exeter',
  'aberdeen',
  'dundee',
  'swansea',
];

/// Best-effort match of an address string to one of our supported
/// city slugs. Used to build canonical `/toilets/[city]/[id]` URLs.
/// Returns null when no supported city is named in the address.
export function cityFromAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  const haystack = address.toLowerCase();
  for (const slug of SUPPORTED_CITY_SLUGS) {
    const needle = slug.replace(/-/g, ' ');
    if (haystack.includes(needle)) return slug;
  }
  return null;
}

/// Kind of "intent" landing page. Each variant maps to a different
/// Supabase predicate via [applyCategoryFilter]. Adding a new
/// category is a 2-step change: extend the union here and add a case
/// to the switch below.
export type CategoryKind =
  | 'free'
  | 'accessible'
  | 'changing_places'
  | 'baby_changing'
  | 'radar_key';

/// Pre-baked SEO metadata for each category. Centralised so the
/// page component, sitemap, and footer can all stay in sync.
export const CATEGORY_META: Record<
  CategoryKind,
  { slug: string; title: string; shortLabel: string }
> = {
  free: {
    slug: 'free-public-toilets',
    title: 'Free Public Toilets',
    shortLabel: 'Free toilets',
  },
  accessible: {
    slug: 'accessible-toilets-uk',
    title: 'Accessible Toilets UK',
    shortLabel: 'Accessible toilets',
  },
  changing_places: {
    slug: 'changing-places-uk',
    title: 'Changing Places Toilets UK',
    shortLabel: 'Changing Places',
  },
  baby_changing: {
    slug: 'baby-changing-near-me',
    title: 'Baby Changing Facilities',
    shortLabel: 'Baby changing',
  },
  radar_key: {
    slug: 'radar-key-toilets-uk',
    title: 'RADAR Key Toilets',
    shortLabel: 'RADAR key toilets',
  },
};

// Internal: applies the appropriate Supabase `eq` / `or` filter for
// a given category. Keeps the page components free of column-name
// trivia and avoids drift between the count, by-city and featured
// queries (they MUST share the exact same filter).
//
// `q` is typed loosely because the Supabase JS chainable type is a
// huge intersection — we only need the chain semantics here.
type SupaQuery = ReturnType<ReturnType<typeof supabase.from>['select']>;
function applyCategoryFilter(q: SupaQuery, kind: CategoryKind): SupaQuery {
  switch (kind) {
    case 'free':
      return q.or('fee.eq.no,fee.eq.free');
    case 'accessible':
      return q.eq('wheelchair', 'yes');
    case 'changing_places':
      return q.eq('hoist', 'yes');
    case 'baby_changing':
      return q.eq('baby_changing', 'yes');
    case 'radar_key':
      return q.eq('radar_key', 'yes');
  }
}

export interface CategoryStats {
  /** Total matching rows across the active toilet table. */
  total: number;
  /**
   * Per-city counts, sorted desc by `count`. Cities with zero hits
   * are dropped so the page never renders an empty stat card.
   */
  byCity: Array<{ city: CityInfo; count: number }>;
  /** Up to 8 top-rated examples for the "featured" carousel. */
  featured: Toilet[];
}

/**
 * Aggregate stats for an intent landing page (e.g. "free public
 * toilets", "accessible toilets"). All sub-queries share the same
 * category filter, so the numbers are internally consistent.
 *
 * Soft-fails: when Supabase is unreachable the page still renders
 * with `total: 0` / empty lists rather than throwing — important
 * because these pages are crawled by Googlebot at scale and a 500
 * during a crawl can de-index us for those keywords.
 */
export async function getCategoryStats(kind: CategoryKind): Promise<CategoryStats> {
  const empty: CategoryStats = { total: 0, byCity: [], featured: [] };
  try {
    const tableName = await getActiveToiletTable();

    // Total count using head=true so Postgres doesn't return rows.
    const totalQuery = applyCategoryFilter(
      supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .or('status.eq.active,status.eq.approved'),
      kind,
    );

    // Featured: top-rated matching toilets with at least one rating
    // so we surface real social proof, not random unrated rows.
    const featuredQuery = applyCategoryFilter(
      supabase
        .from(tableName)
        .select('*')
        .or('status.eq.active,status.eq.approved')
        .not('average_rating', 'is', null)
        .gte('rating_count', 1)
        .order('average_rating', { ascending: false })
        .limit(8),
      kind,
    );

    // Per-city counts — issued in parallel. Each query is a
    // head-only count so the round-trips are cheap even with 30+
    // cities.
    const cityCountPromises = CITIES.map(async (city): Promise<{ city: CityInfo; count: number }> => {
      const q = applyCategoryFilter(
        supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .or('status.eq.active,status.eq.approved')
          .ilike('address', `%${city.fullName}%`),
        kind,
      );
      const { count, error } = await q;
      if (error) {
        console.error(`getCategoryStats(${kind}) city=${city.slug} error:`, error);
        return { city, count: 0 };
      }
      return { city, count: count ?? 0 };
    });

    const [totalRes, featuredRes, cityResults] = await Promise.all([
      totalQuery,
      featuredQuery,
      Promise.all(cityCountPromises),
    ]);

    const byCity = cityResults
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      total: totalRes.count ?? 0,
      byCity,
      featured: ((featuredRes.data as Toilet[] | null) ?? []),
    };
  } catch (e) {
    console.error(`getCategoryStats(${kind}) threw:`, e);
    return empty;
  }
}

/// Build a URL-friendly slug from a toilet name. Falls back to "loo"
/// when the name is missing so we never produce `/-12345` style URLs.
export function slugifyToiletName(name: string | null | undefined): string {
  if (!name) return 'loo';
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'loo';
}

export async function getToiletStats(): Promise<{
  total: number;
  accessible: number;
  babyChanging: number;
  free: number;
  radarRequired?: number;
}> {
  const tableName = await getActiveToiletTable();

  const { count: total } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved');

  const { count: accessible } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .eq('wheelchair', 'yes');

  const { count: babyChanging } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .eq('baby_changing', 'yes');

  const { count: free } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved')
    .or('fee.eq.no,fee.eq.free');

  // V2/V3 specific stat (radar key)
  let radarRequired = 0;
  if (tableName === 'toilets_v2' || tableName === 'toilets_v3') {
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .or('status.eq.active,status.eq.approved')
      .eq('radar_key', 'yes');
    radarRequired = count || 0;
  }

  const hasEnhancedFields = tableName === 'toilets_v2' || tableName === 'toilets_v3';

  return {
    total: total || 0,
    accessible: accessible || 0,
    babyChanging: babyChanging || 0,
    free: free || 0,
    ...(hasEnhancedFields && { radarRequired }),
  };
}

export async function getCities(): Promise<string[]> {
  // Major UK cities for directory
  return [
    'London',
    'Birmingham',
    'Manchester',
    'Leeds',
    'Glasgow',
    'Liverpool',
    'Bristol',
    'Sheffield',
    'Edinburgh',
    'Leicester',
    'Coventry',
    'Bradford',
    'Cardiff',
    'Belfast',
    'Nottingham',
    'Newcastle',
    'Brighton',
    'Southampton',
    'Portsmouth',
    'Oxford',
    'Cambridge',
    'York',
    'Bath',
    'Bournemouth',
  ];
}

/**
 * Get current data source info (for admin/debugging)
 */
export async function getDataSourceInfo(): Promise<{
  tableName: string;
  version: 'v1' | 'v2' | 'v3';
  hasEnhancedFields: boolean;
  recordCount: number;
}> {
  const tableName = await getActiveToiletTable();
  
  const { count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true })
    .or('status.eq.active,status.eq.approved');

  let version: 'v1' | 'v2' | 'v3' = 'v1';
  if (tableName === 'toilets_v2') version = 'v2';
  if (tableName === 'toilets_v3') version = 'v3';

  return {
    tableName,
    version,
    hasEnhancedFields: tableName === 'toilets_v2' || tableName === 'toilets_v3',
    recordCount: count || 0,
  };
}