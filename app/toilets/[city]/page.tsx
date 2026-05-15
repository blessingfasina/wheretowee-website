import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Star, Accessibility, Baby, Coins, Navigation, ChevronRight, ShieldCheck, BadgeCheck, Clock, Key, Trophy, Building2, HelpCircle } from 'lucide-react';
import {
  supabase,
  getActiveToiletTable,
  getToiletEnrichment,
  resolveVerificationTier,
  slugifyToiletName,
  type Toilet,
  type VerificationTier,
} from '@/lib/supabase';
import { CITIES, type CityInfo } from '@/lib/cities';

// Revalidate the city pages every hour. New toilets / freshly
// confirmed status changes show up without a redeploy, but we still
// get CDN cache benefits.
export const revalidate = 3600;

// City coordinates for mapping
const cityCoordinates: Record<string, { lat: number; lng: number; fullName: string }> = {
  london: { lat: 51.5074, lng: -0.1278, fullName: 'London' },
  birmingham: { lat: 52.4862, lng: -1.8904, fullName: 'Birmingham' },
  manchester: { lat: 53.4808, lng: -2.2426, fullName: 'Manchester' },
  leeds: { lat: 53.8008, lng: -1.5491, fullName: 'Leeds' },
  glasgow: { lat: 55.8642, lng: -4.2518, fullName: 'Glasgow' },
  liverpool: { lat: 53.4084, lng: -2.9916, fullName: 'Liverpool' },
  bristol: { lat: 51.4545, lng: -2.5879, fullName: 'Bristol' },
  sheffield: { lat: 53.3811, lng: -1.4701, fullName: 'Sheffield' },
  edinburgh: { lat: 55.9533, lng: -3.1883, fullName: 'Edinburgh' },
  leicester: { lat: 52.6369, lng: -1.1398, fullName: 'Leicester' },
  coventry: { lat: 52.4068, lng: -1.5197, fullName: 'Coventry' },
  bradford: { lat: 53.795, lng: -1.7594, fullName: 'Bradford' },
  cardiff: { lat: 51.4816, lng: -3.1791, fullName: 'Cardiff' },
  belfast: { lat: 54.5973, lng: -5.9301, fullName: 'Belfast' },
  nottingham: { lat: 52.9548, lng: -1.1581, fullName: 'Nottingham' },
  newcastle: { lat: 54.9783, lng: -1.6178, fullName: 'Newcastle upon Tyne' },
  brighton: { lat: 50.8225, lng: -0.1372, fullName: 'Brighton' },
  southampton: { lat: 50.9097, lng: -1.4044, fullName: 'Southampton' },
  portsmouth: { lat: 50.8198, lng: -1.0879, fullName: 'Portsmouth' },
  oxford: { lat: 51.752, lng: -1.2577, fullName: 'Oxford' },
  cambridge: { lat: 52.2053, lng: 0.1218, fullName: 'Cambridge' },
  york: { lat: 53.9591, lng: -1.0815, fullName: 'York' },
  bath: { lat: 51.3811, lng: -2.359, fullName: 'Bath' },
  bournemouth: { lat: 50.7196, lng: -1.8808, fullName: 'Bournemouth' },
  reading: { lat: 51.4543, lng: -0.9781, fullName: 'Reading' },
  'milton-keynes': { lat: 52.0406, lng: -0.7594, fullName: 'Milton Keynes' },
  exeter: { lat: 50.7184, lng: -3.5339, fullName: 'Exeter' },
  aberdeen: { lat: 57.1497, lng: -2.0943, fullName: 'Aberdeen' },
  dundee: { lat: 56.4628, lng: -2.9708, fullName: 'Dundee' },
  swansea: { lat: 51.6214, lng: -3.9436, fullName: 'Swansea' },
};

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityInfo = cityCoordinates[city];

  if (!cityInfo) {
    return {
      title: 'City Not Found',
    };
  }

  const cityName = cityInfo.fullName;

  return {
    title: `Public Toilets ${cityName} - Find Nearest Loo NOW | Free Map`,
    description: `Need a toilet in ${cityName}? Find the nearest loo instantly! 50+ public toilets with wheelchair access, baby change & free options. Interactive map.`,
    keywords: [
      `toilets near me ${cityName}`,
      `public toilets ${cityName}`,
      `${cityName} public toilets`,
      `free toilets ${cityName}`,
      `accessible toilets ${cityName}`,
      `baby changing ${cityName}`,
      `toilet finder ${cityName}`,
      `nearest toilet ${cityName}`,
    ],
    openGraph: {
      title: `Find Toilets Near Me in ${cityName} | Where To Wee`,
      description: `Find clean, accessible public toilets in ${cityName}. View ratings, accessibility info, and get directions to the nearest loo.`,
      url: `https://wheretowee.uk/toilets/${city}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Public Toilets in ${cityName}`,
      description: `Find the nearest public toilets in ${cityName} with accessibility info and ratings.`,
    },
    alternates: {
      canonical: `https://wheretowee.uk/toilets/${city}`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(cityCoordinates).map((city) => ({
    city,
  }));
}

/// Fetch real toilets for a city via the active toilet table. Pulls
/// up to 60 rows ordered by recency so the city page always shows
/// fresh content. Returns an empty list (and we render an empty state)
/// if the query fails — never throws, so a Supabase outage degrades
/// gracefully rather than breaking SEO.
async function fetchCityToilets(city: string, fullName: string): Promise<Toilet[]> {
  try {
    const tableName = await getActiveToiletTable();
    // Match on both the slug ("milton-keynes") and the display name
    // ("Milton Keynes") to maximise hit rate. ILIKE is case-insensitive.
    const slugForLike = fullName.replace(/\s+/g, '%');
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .or('status.eq.active,status.eq.approved')
      .or(`address.ilike.%${slugForLike}%,address.ilike.%${city}%`)
      .order('id', { ascending: false })
      .limit(60);
    if (error) {
      console.error(`fetchCityToilets(${city}) error:`, error);
      return [];
    }
    return (data ?? []) as Toilet[];
  } catch (e) {
    console.error(`fetchCityToilets(${city}) threw:`, e);
    return [];
  }
}

/// Small badge component used in the inline list of toilets. Mirrors
/// the verification badge UX on the mobile app's detail screen.
function VerificationBadge({ tier }: { tier: VerificationTier }) {
  if (tier === 'unverified') return null;
  const config: Record<Exclude<VerificationTier, 'unverified'>, { icon: React.ElementType; label: string; cls: string }> = {
    council_verified: {
      icon: ShieldCheck,
      label: 'Council verified',
      cls: 'bg-sky-100 text-sky-700',
    },
    community_verified: {
      icon: BadgeCheck,
      label: 'Community verified',
      cls: 'bg-mint-100 text-mint-700',
    },
    recently_confirmed: {
      icon: Clock,
      label: 'Recently confirmed',
      cls: 'bg-blue-100 text-blue-700',
    },
  };
  const c = config[tier];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${c.cls} text-xs px-2 py-1 rounded-full`}>
      <Icon className="w-3 h-3" /> {c.label}
    </span>
  );
}

/// Great-circle (haversine) distance between two lat/lng pairs in km.
/// Plenty accurate for the city-proximity use case here.
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
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

/// Return the `n` supported cities closest to the given anchor.
/// Used for the "Nearby cities" cross-link block on the city page.
function nearestCities(
  anchor: { lat: number; lng: number },
  n: number,
): Array<CityInfo & { distanceKm: number }> {
  return CITIES.map((c) => ({ ...c, distanceKm: haversineKm(anchor, c) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, n + 1) // +1 to leave room for filtering out the current city
    .map((c) => ({ slug: c.slug, fullName: c.fullName, lat: c.lat, lng: c.lng, distanceKm: c.distanceKm }));
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityInfo = cityCoordinates[city];

  if (!cityInfo) {
    notFound();
  }

  // Pull real data from Supabase. Falls back to an empty array if the
  // query fails so the rest of the page (hero + SEO copy + CTA) still
  // renders and indexes correctly.
  const toilets = await fetchCityToilets(city, cityInfo.fullName);

  // Enrich with verification info so trust-signal badges can render
  // alongside the existing accessibility chips. Batched in one RPC.
  const ids = toilets.map((t) => t.id);
  const { verification } = await getToiletEnrichment(ids);

  const accessibleCount = toilets.filter((t) => t.wheelchair === 'yes').length;
  const babyCount = toilets.filter((t) => t.baby_changing === 'yes').length;
  const freeCount = toilets.filter((t) => t.fee === 'no' || t.fee === 'free').length;
  const radarCount = toilets.filter((t) => t.radar_key === 'yes').length;
  const changingPlacesCount = toilets.filter((t) => t.hoist === 'yes').length;

  // Top 3 rated toilets for the highlight section — only show when
  // we have at least one rating to avoid surfacing random unrated rows.
  const topRated = toilets
    .filter((t) => t.average_rating != null && (t.rating_count ?? 0) >= 1)
    .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0))
    .slice(0, 3);

  // Nearest 6 supported cities (by great-circle distance) — for the
  // "Nearby cities" cross-link block. Excludes the current city.
  const nearby = nearestCities(cityInfo, 6).filter((c) => c.slug !== city);

  // Per-city FAQ — parameterised so we don't duplicate copy across
  // 30 city pages. Emitted as FAQPage JSON-LD for rich results.
  const cityFaq: Array<{ q: string; a: string }> = [
    {
      q: `Where can I find a public toilet in ${cityInfo.fullName}?`,
      a: `${cityInfo.fullName} has ${toilets.length || 'many'} public toilets in our database — across shopping centres, train stations, council-run public conveniences, libraries, museums and supermarkets. Use the map at the top of this page or download the Where To Wee app to find the nearest one to you in seconds.`,
    },
    {
      q: `Are there free public toilets in ${cityInfo.fullName}?`,
      a: `Yes — ${freeCount > 0 ? `we list at least ${freeCount} free public toilets in ${cityInfo.fullName}` : `most council-run public conveniences in ${cityInfo.fullName} are free`}, plus the toilets in libraries, free museums, hospitals and most supermarkets. See our Free Public Toilets page for the full UK directory.`,
    },
    {
      q: `Are there accessible toilets in ${cityInfo.fullName}?`,
      a: `${accessibleCount > 0 ? `We've listed ${accessibleCount} wheelchair-accessible toilets in ${cityInfo.fullName}` : `Most major venues in ${cityInfo.fullName} have wheelchair-accessible toilets`}, with grab rails and step-free access. Many are RADAR-key controlled — see our RADAR Key guide for details${radarCount > 0 ? `; we currently list ${radarCount} RADAR-key locations in ${cityInfo.fullName}` : ''}.`,
    },
    {
      q: `Where can I find baby changing facilities in ${cityInfo.fullName}?`,
      a: `${babyCount > 0 ? `${babyCount} of our ${cityInfo.fullName} listings have baby changing facilities` : `Most shopping centres, big supermarkets and department stores in ${cityInfo.fullName} have baby changing facilities`}. Many newer venues also have baby change in men's toilets or dedicated family rooms.`,
    },
    {
      q: `How accurate is the toilet data for ${cityInfo.fullName}?`,
      a: `Every listing carries a verification badge — "Council verified" means it was imported from a local authority or trusted partner, "Community verified" means three or more users have confirmed it, and "Recently confirmed" means it was checked in the last 30 days. We also surface a 0-100 confidence score on each detail page so you know how trustworthy the info is.`,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/toilets" className="hover:text-white">
              Cities
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>{cityInfo.fullName}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Public Toilets in {cityInfo.fullName}
          </h1>
          <p className="text-lg text-gray-300 mb-6 max-w-2xl">
            {toilets.length > 0
              ? `Find ${toilets.length}+ public toilets in ${cityInfo.fullName}. View accessibility information, baby changing facilities, ratings, and get directions.`
              : `Explore public toilets across ${cityInfo.fullName}. Use our interactive map to find accessibility info, baby changing facilities, and get directions.`}
          </p>
          <Link
            href={`/map?lat=${cityInfo.lat}&lng=${cityInfo.lng}`}
            className="btn btn-mint"
          >
            <MapPin className="w-5 h-5" />
            View on Map
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-6 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold text-navy-600">{toilets.length}+</div>
              <div className="text-gray-600 text-sm">Total Toilets</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-blue-600">{accessibleCount}</div>
              <div className="text-gray-600 text-sm">Accessible</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-orange-600">{babyCount}</div>
              <div className="text-gray-600 text-sm">Baby Changing</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-mint-600">{freeCount}</div>
              <div className="text-gray-600 text-sm">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Toilet List */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-navy-800">
              Toilets in {cityInfo.fullName}
            </h2>
            <Link href={`/map?lat=${cityInfo.lat}&lng=${cityInfo.lng}`} className="btn btn-secondary">
              <MapPin className="w-4 h-4" />
              Map View
            </Link>
          </div>

          {toilets.length === 0 ? (
            <div className="card text-center py-12">
              <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h3 className="font-bold text-navy-800 mb-2">No toilets listed yet</h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                We don&apos;t have any toilets in our database for {cityInfo.fullName} just yet, but
                the map view shows nearby options. Help the community by submitting one!
              </p>
              <Link href="/submit" className="btn btn-mint">
                Add a Toilet
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toilets.map((toilet) => {
                const tier = resolveVerificationTier({
                  verified_source: verification[toilet.id]?.verified_source,
                  verified_at: toilet.verified_at,
                  confirmation_count: toilet.confirmation_count,
                  last_confirmed_at: toilet.last_confirmed_at,
                });
                const detailHref =
                  `/toilets/${city}/${toilet.id}-${slugifyToiletName(toilet.name)}`;
                return (
                  <div key={toilet.id} className="card">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <Link
                        href={detailHref}
                        className="font-bold text-navy-800 hover:text-mint-600 transition-colors"
                      >
                        {toilet.name}
                      </Link>
                      {toilet.average_rating && (
                        <div className="flex items-center gap-1 text-sm flex-shrink-0">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{toilet.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {toilet.address && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{toilet.address}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(toilet.fee === 'no' || toilet.fee === 'free') && (
                        <span className="inline-flex items-center gap-1 bg-mint-100 text-mint-700 text-xs px-2 py-1 rounded-full">
                          <Coins className="w-3 h-3" /> Free
                        </span>
                      )}
                      {toilet.wheelchair === 'yes' && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                          <Accessibility className="w-3 h-3" /> Accessible
                        </span>
                      )}
                      {toilet.baby_changing === 'yes' && (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                          <Baby className="w-3 h-3" /> Baby
                        </span>
                      )}
                      <VerificationBadge tier={tier} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Link
                        href={detailHref}
                        className="inline-flex items-center gap-1 text-navy-600 text-sm font-semibold hover:text-navy-700"
                      >
                        View details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track-directions=""
                        data-toilet-id={toilet.id}
                        data-toilet-name={toilet.name}
                        data-directions-source="city_page"
                        className="inline-flex items-center gap-1 text-mint-600 text-sm font-semibold hover:text-mint-700"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SEO Content */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-6">
              Finding Public Toilets in {cityInfo.fullName}
            </h2>
            <div className="prose prose-lg text-gray-600">
              <p>
                {cityInfo.fullName} has a wide range of public toilet facilities to serve residents
                and visitors. From council-run public conveniences to facilities in shopping centres,
                train stations, and parks, there are options throughout the city.
              </p>
              <h3>Accessible Toilets in {cityInfo.fullName}</h3>
              <p>
                Many public toilets in {cityInfo.fullName} are wheelchair accessible. Look for the
                accessibility badge on our listings to find facilities with step-free access, grab
                rails, and adequate space for wheelchair users.
              </p>
              <h3>Baby Changing Facilities</h3>
              <p>
                Parents will find baby changing facilities at various locations across{' '}
                {cityInfo.fullName}, including shopping centres, department stores, and some public
                toilet blocks. Filter by "Baby Changing" in our app to find the nearest one.
              </p>
              <h3>Free vs Paid Toilets</h3>
              <p>
                While many public toilets in {cityInfo.fullName} are free to use, some may charge a
                small fee (usually 20-30p). Council-run facilities are typically free, while those in
                train stations may require payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Find by need — internal links to the 5 category landing pages */}
      <section className="section">
        <div className="container-custom max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-2">
            Find what you need in {cityInfo.fullName}
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Looking for a specific type of toilet? Each category page lists every matching
            facility across the UK, with one-tap directions and accessibility info.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href="/free-public-toilets"
              className="card hover:shadow-md transition-shadow group border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-mint-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">Free public toilets</h3>
                  <p className="text-sm text-gray-600">
                    {freeCount > 0 ? `${freeCount} in ${cityInfo.fullName}` : 'No-fee facilities across the UK'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
            <Link
              href="/accessible-toilets-uk"
              className="card hover:shadow-md transition-shadow group border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Accessibility className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">Accessible toilets</h3>
                  <p className="text-sm text-gray-600">
                    {accessibleCount > 0 ? `${accessibleCount} wheelchair-accessible in ${cityInfo.fullName}` : 'Wheelchair access across the UK'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
            <Link
              href="/changing-places-uk"
              className="card hover:shadow-md transition-shadow group border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Accessibility className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">Changing Places</h3>
                  <p className="text-sm text-gray-600">
                    {changingPlacesCount > 0 ? `${changingPlacesCount} hoists in ${cityInfo.fullName}` : 'Hoists & adult changing benches'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
            <Link
              href="/baby-changing-near-me"
              className="card hover:shadow-md transition-shadow group border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Baby className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">Baby changing</h3>
                  <p className="text-sm text-gray-600">
                    {babyCount > 0 ? `${babyCount} facilities in ${cityInfo.fullName}` : 'Baby change tables across the UK'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
            <Link
              href="/radar-key-toilets-uk"
              className="card hover:shadow-md transition-shadow group border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">RADAR key toilets</h3>
                  <p className="text-sm text-gray-600">
                    {radarCount > 0 ? `${radarCount} in ${cityInfo.fullName}` : 'National Key Scheme locations'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
            <Link
              href="/toilet-tips"
              className="card hover:shadow-md transition-shadow group border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-navy-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">UK toilet tips</h3>
                  <p className="text-sm text-gray-600">Motorway, train, shopping centre advice</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Top-rated highlights */}
      {topRated.length > 0 && (
        <section className="section bg-gray-50">
          <div className="container-custom max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-navy-800">
                Highest-rated toilets in {cityInfo.fullName}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {topRated.map((t, idx) => (
                <div key={t.id} className="card border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full w-6 h-6 inline-flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{t.average_rating?.toFixed(1)}</span>
                      <span className="text-gray-500">({t.rating_count})</span>
                    </div>
                  </div>
                  <Link
                    href={`/toilets/${city}/${t.id}-${slugifyToiletName(t.name)}`}
                    className="font-bold text-navy-800 hover:text-mint-600 line-clamp-2"
                  >
                    {t.name}
                  </Link>
                  {t.address && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.address}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nearby cities — internal-link goldmine */}
      {nearby.length > 0 && (
        <section className="section">
          <div className="container-custom max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-2">
              Nearby UK cities
            </h2>
            <p className="text-gray-600 mb-6">
              Travelling beyond {cityInfo.fullName}? Browse toilets in nearby cities.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {nearby.slice(0, 6).map((c) => (
                <Link
                  key={c.slug}
                  href={`/toilets/${c.slug}`}
                  className="card text-center hover:shadow-md hover:border-navy-300 transition-all group border border-gray-100"
                >
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900 text-sm md:text-base">
                    {c.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(c.distanceKm)} km</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Per-city FAQ */}
      <section className="section bg-gray-50">
        <div className="container-custom max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-navy-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800">
              {cityInfo.fullName} toilet FAQ
            </h2>
          </div>
          <div className="space-y-3">
            {cityFaq.map((f) => (
              <details key={f.q} className="card group border border-gray-100">
                <summary className="cursor-pointer font-bold text-navy-800 list-none flex items-center justify-between gap-3">
                  <span>{f.q}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <p className="mt-3 text-gray-700 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FAQPage JSON-LD for the per-city FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: cityFaq.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />

      {/* CTA */}
      <section className="section bg-navy-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Get the App for {cityInfo.fullName}
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Download our free mobile app for the best experience. Find toilets faster, save
            favourites, and get notifications when you're near a saved location.
          </p>
          <Link href="/download" className="btn btn-mint btn-lg">
            Download App
          </Link>
        </div>
      </section>

      {/* Schema.org LocalBusiness + ItemList for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Public Toilets in ${cityInfo.fullName}`,
            description: `List of public toilet facilities in ${cityInfo.fullName}, UK`,
            numberOfItems: toilets.length,
            itemListElement: toilets.slice(0, 10).map((toilet, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'PublicToilet',
                name: toilet.name,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: cityInfo.fullName,
                  addressCountry: 'GB',
                },
                geo: {
                  '@type': 'GeoCoordinates',
                  latitude: toilet.latitude,
                  longitude: toilet.longitude,
                },
                isAccessibleForFree: toilet.fee === 'no' || toilet.fee === 'free',
                amenityFeature: [
                  ...(toilet.wheelchair === 'yes' ? [{ '@type': 'LocationFeatureSpecification', name: 'Wheelchair Accessible', value: true }] : []),
                  ...(toilet.baby_changing === 'yes' ? [{ '@type': 'LocationFeatureSpecification', name: 'Baby Changing Facility', value: true }] : []),
                ],
                aggregateRating: toilet.average_rating ? {
                  '@type': 'AggregateRating',
                  ratingValue: toilet.average_rating.toFixed(1),
                  ratingCount: toilet.rating_count,
                  bestRating: 5,
                  worstRating: 1,
                } : undefined,
              },
            })),
          }),
        }}
      />

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://wheretowee.uk',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Cities',
                item: 'https://wheretowee.uk/toilets',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: cityInfo.fullName,
                item: `https://wheretowee.uk/toilets/${city}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}

