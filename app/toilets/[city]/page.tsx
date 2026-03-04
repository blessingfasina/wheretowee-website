import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Star, Accessibility, Baby, Coins, Navigation, ChevronRight } from 'lucide-react';

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

// Demo toilet data (in production, fetch from Supabase)
function generateDemoToilets(city: string, count: number = 10) {
  const cityInfo = cityCoordinates[city];
  if (!cityInfo) return [];

  const names = [
    'Public Toilet - High Street',
    'Shopping Centre Facilities',
    'Train Station Toilets',
    'Park Public Convenience',
    'Library Public Toilet',
    'Council Offices WC',
    'Bus Station Facilities',
    'Supermarket Customer Toilets',
    'Museum Visitor Facilities',
    'Sports Centre Changing Rooms',
  ];

  return names.slice(0, count).map((name, i) => ({
    id: i + 1,
    name: `${name}`,
    address: `Near ${cityInfo.fullName} City Centre`,
    latitude: cityInfo.lat + (Math.random() - 0.5) * 0.02,
    longitude: cityInfo.lng + (Math.random() - 0.5) * 0.02,
    fee: Math.random() > 0.6 ? 'no' : 'yes',
    wheelchair: Math.random() > 0.4 ? 'yes' : 'no',
    baby_changing: Math.random() > 0.5 ? 'yes' : 'no',
    average_rating: 3 + Math.random() * 2,
    rating_count: Math.floor(Math.random() * 50) + 5,
  }));
}

export default async function CityPage({ params }: Props) {
  const { city } = await params;
  const cityInfo = cityCoordinates[city];

  if (!cityInfo) {
    notFound();
  }

  // In production, fetch real data from Supabase
  const toilets = generateDemoToilets(city, 12);
  const accessibleCount = toilets.filter((t) => t.wheelchair === 'yes').length;
  const babyCount = toilets.filter((t) => t.baby_changing === 'yes').length;
  const freeCount = toilets.filter((t) => t.fee === 'no').length;

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
            Find {toilets.length}+ public toilets in {cityInfo.fullName}. View accessibility
            information, baby changing facilities, ratings, and get directions.
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toilets.map((toilet) => (
              <div key={toilet.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-navy-800">{toilet.name}</h3>
                  {toilet.average_rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{toilet.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{toilet.address}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {toilet.fee === 'no' && (
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
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-mint-600 text-sm font-semibold hover:text-mint-700"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            ))}
          </div>
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
            Join the waitlist to be notified when our mobile app launches. Find toilets faster, save
            favorites, and get notifications when you're near a saved location.
          </p>
          <Link href="/download" className="btn btn-mint btn-lg">
            Join Waitlist
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
                isAccessibleForFree: toilet.fee === 'no',
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

