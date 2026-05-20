import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  ChevronRight,
  Coins,
  Accessibility,
  Baby,
  Key,
  Star,
  Compass,
} from 'lucide-react';
import { getCityDirectoryStats, slugifyToiletName, cityFromAddress } from '@/lib/supabase';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Public Toilets UK — Find Loos in Every Major City',
  description:
    'Browse public toilets across 30+ UK cities — London, Manchester, Edinburgh and more. Free directory with accessibility, baby change and Changing Places filters.',
  openGraph: {
    title: 'Find Public Toilets by City — Where To Wee',
    description: 'Browse 18,000+ public toilets across all major UK cities, with real verification and rating data.',
    url: 'https://wheretowee.uk/toilets',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/toilets',
  },
};

// Revalidate hourly so live counts stay fresh without re-querying on
// every request.
export const revalidate = 3600;

/// Category quick-links surfaced at the top of the directory. Mirrors
/// the header dropdown so a user landing here can find the right
/// page in one tap rather than hunting in the city list.
const CATEGORY_LINKS: Array<{
  href: string;
  label: string;
  blurb: string;
  icon: React.ElementType;
  cls: string;
}> = [
  {
    href: '/free-public-toilets',
    label: 'Free public toilets',
    blurb: 'No fee, no sign-up',
    icon: Coins,
    cls: 'bg-mint-100 text-mint-700',
  },
  {
    href: '/accessible-toilets-uk',
    label: 'Accessible toilets',
    blurb: 'Wheelchair access + grab rails',
    icon: Accessibility,
    cls: 'bg-blue-100 text-blue-700',
  },
  {
    href: '/changing-places-uk',
    label: 'Changing Places',
    blurb: 'Hoist + adult-changing bench',
    icon: Accessibility,
    cls: 'bg-purple-100 text-purple-700',
  },
  {
    href: '/baby-changing-near-me',
    label: 'Baby changing',
    blurb: 'Family rooms + change tables',
    icon: Baby,
    cls: 'bg-orange-100 text-orange-700',
  },
  {
    href: '/radar-key-toilets-uk',
    label: 'RADAR key locations',
    blurb: 'National Key Scheme toilets',
    icon: Key,
    cls: 'bg-indigo-100 text-indigo-700',
  },
];

/// Loose region grouping used for the directory's "Browse by region"
/// section. Pinned here rather than on the canonical city list so we
/// don't pollute the core data model with editorial labels.
const REGION_BY_SLUG: Record<string, string> = {
  london: 'Greater London',
  birmingham: 'West Midlands',
  coventry: 'West Midlands',
  manchester: 'Greater Manchester',
  leeds: 'West Yorkshire',
  bradford: 'West Yorkshire',
  glasgow: 'Scotland',
  edinburgh: 'Scotland',
  aberdeen: 'Scotland',
  dundee: 'Scotland',
  liverpool: 'Merseyside',
  bristol: 'South West',
  bath: 'South West',
  exeter: 'South West',
  bournemouth: 'South West',
  sheffield: 'South Yorkshire',
  leicester: 'East Midlands',
  nottingham: 'East Midlands',
  cardiff: 'Wales',
  swansea: 'Wales',
  belfast: 'Northern Ireland',
  newcastle: 'North East',
  brighton: 'South East',
  southampton: 'South East',
  portsmouth: 'South East',
  oxford: 'South East',
  reading: 'South East',
  'milton-keynes': 'South East',
  cambridge: 'East of England',
  york: 'North Yorkshire',
};

export default async function ToiletsDirectoryPage() {
  const { total, byCity, topRated } = await getCityDirectoryStats();
  const renderTotal = total > 0 ? total.toLocaleString('en-GB') : '18,000+';
  const cityCount = byCity.length;

  // Group cities by region for the secondary directory section.
  const grouped = byCity.reduce<Record<string, Array<{ city: typeof byCity[number]['city']; count: number }>>>((acc, item) => {
    const region = REGION_BY_SLUG[item.city.slug] ?? 'Other UK cities';
    (acc[region] ||= []).push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>UK city directory</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Public toilets across the UK
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Browse our directory of {renderTotal} public toilets in {cityCount > 0 ? cityCount : 30}+
              UK cities. Each listing carries a verification badge and confidence score so you know
              what you&apos;re looking at — not a stale data dump.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/map" className="btn btn-mint">
                <MapPin className="w-5 h-5" />
                Open the live map
              </Link>
              <Link href="/download" className="btn btn-secondary">
                Download the app
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats — real numbers from Supabase */}
      <section className="py-8 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-600">{renderTotal}</div>
              <div className="text-gray-600 text-sm">Toilets listed</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-mint-600">
                {cityCount > 0 ? cityCount : 30}+
              </div>
              <div className="text-gray-600 text-sm">UK cities covered</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-orange-600">Free</div>
              <div className="text-gray-600 text-sm">Web + app, no sign-up</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600">Daily</div>
              <div className="text-gray-600 text-sm">Updated by community</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category links */}
      <section className="section">
        <div className="container-custom max-w-5xl">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-6 h-6 text-mint-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800">Find by need</h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Looking for a specific facility? Each page lists every matching toilet across the UK
            with one-tap directions.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORY_LINKS.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="card group hover:shadow-md hover:border-navy-300 transition-all border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${cat.cls} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy-800 group-hover:text-navy-900">{cat.label}</h3>
                    <p className="text-sm text-gray-500">{cat.blurb}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top cities — sorted by real toilet count */}
      <section className="section bg-gray-50">
        <div className="container-custom max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-2">
            Most-listed UK cities
          </h2>
          <p className="text-gray-600 mb-6">
            Cities ranked by how many verified toilets we have. Each tile takes you to the city
            detail page with full filters.
          </p>
          {byCity.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-600">
                We&apos;re still loading live counts. Browse by region below or open the live map.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {byCity.slice(0, 12).map(({ city, count }) => (
                <Link
                  key={city.slug}
                  href={`/toilets/${city.slug}`}
                  className="card group hover:shadow-md hover:border-mint-300 transition-all border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-navy-800 group-hover:text-mint-700">{city.fullName}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-mint-600" />
                  </div>
                  <p className="text-sm text-gray-500">{count.toLocaleString('en-GB')} toilets</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Top-rated toilets nationwide */}
      {topRated.length > 0 && (
        <section className="section">
          <div className="container-custom max-w-5xl">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-navy-800">Top-rated nationwide</h2>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl">
              Highest-rated toilets across the UK, based on community ratings.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRated.map((t) => {
                const citySlug = cityFromAddress(t.address) ?? 'uk';
                const href = `/toilets/${citySlug}/${t.id}-${slugifyToiletName(t.name)}`;
                return (
                  <Link
                    key={t.id}
                    href={href}
                    className="card border border-gray-100 hover:shadow-md hover:border-navy-300 group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-navy-800 group-hover:text-mint-600 line-clamp-2">
                        {t.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm flex-shrink-0">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{t.average_rating?.toFixed(1)}</span>
                      </div>
                    </div>
                    {t.address && (
                      <p className="text-sm text-gray-600 line-clamp-2">{t.address}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All cities by region */}
      {Object.keys(grouped).length > 0 && (
        <section className="section bg-gray-50">
          <div className="container-custom max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-8">Browse by region</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([region, cities]) => (
                  <div key={region}>
                    <h3 className="font-bold text-navy-700 mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-mint-500" />
                      {region}
                    </h3>
                    <ul className="space-y-1">
                      {cities
                        .sort((a, b) => b.count - a.count)
                        .map(({ city, count }) => (
                          <li key={city.slug}>
                            <Link
                              href={`/toilets/${city.slug}`}
                              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white transition-colors group"
                            >
                              <span className="text-gray-700 group-hover:text-navy-700">
                                {city.fullName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {count.toLocaleString('en-GB')}
                              </span>
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section bg-navy-600 text-white">
        <div className="container-custom text-center max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Don&apos;t see your city?</h2>
          <p className="text-gray-300 mb-6">
            The interactive map covers the whole of the UK, including towns and villages too small
            for their own page. The mobile app caches your last view for offline use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/map" className="btn btn-mint">
              <MapPin className="w-5 h-5" />
              Open map
            </Link>
            <Link href="/download" className="btn bg-white text-navy-600 hover:bg-gray-100">
              Download app
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD: ItemList of cities for richer SERPs */}
      {byCity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'UK cities with public toilet directories on Where To Wee',
              numberOfItems: byCity.length,
              itemListElement: byCity.slice(0, 30).map((c, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://wheretowee.uk/toilets/${c.city.slug}`,
                name: `Public toilets in ${c.city.fullName}`,
              })),
            }),
          }}
        />
      )}
      <BreadcrumbJsonLd trail={[{ name: 'UK city directory', url: 'https://wheretowee.uk/toilets' }]} />
    </>
  );
}
