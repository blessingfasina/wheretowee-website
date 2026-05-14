import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Star, Accessibility, Baby, Coins, Navigation, ChevronRight, ShieldCheck, BadgeCheck, Clock } from 'lucide-react';
import {
  supabase,
  getActiveToiletTable,
  getToiletEnrichment,
  resolveVerificationTier,
  slugifyToiletName,
  type Toilet,
  type VerificationTier,
} from '@/lib/supabase';

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

