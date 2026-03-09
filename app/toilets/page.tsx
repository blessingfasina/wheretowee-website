import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ChevronRight, Search } from 'lucide-react';
import { getCities } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Public Toilets UK - Every City Covered | Free Directory',
  description:
    'Find public toilets in London, Manchester, Birmingham & 500+ UK cities. Free, accessible & baby change filters. Your complete UK toilet directory.',
  openGraph: {
    title: 'Find Public Toilets by City - Where To Wee',
    description: 'Browse 18,000+ public toilets across all major UK cities.',
    url: 'https://wheretowee.uk/toilets',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/toilets',
  },
};

// City data with approximate toilet counts
const cityData = [
  { name: 'London', slug: 'london', count: 2500, region: 'Greater London' },
  { name: 'Birmingham', slug: 'birmingham', count: 450, region: 'West Midlands' },
  { name: 'Manchester', slug: 'manchester', count: 380, region: 'Greater Manchester' },
  { name: 'Leeds', slug: 'leeds', count: 320, region: 'West Yorkshire' },
  { name: 'Glasgow', slug: 'glasgow', count: 290, region: 'Scotland' },
  { name: 'Liverpool', slug: 'liverpool', count: 260, region: 'Merseyside' },
  { name: 'Bristol', slug: 'bristol', count: 240, region: 'South West' },
  { name: 'Sheffield', slug: 'sheffield', count: 220, region: 'South Yorkshire' },
  { name: 'Edinburgh', slug: 'edinburgh', count: 210, region: 'Scotland' },
  { name: 'Leicester', slug: 'leicester', count: 180, region: 'East Midlands' },
  { name: 'Coventry', slug: 'coventry', count: 160, region: 'West Midlands' },
  { name: 'Bradford', slug: 'bradford', count: 150, region: 'West Yorkshire' },
  { name: 'Cardiff', slug: 'cardiff', count: 200, region: 'Wales' },
  { name: 'Belfast', slug: 'belfast', count: 170, region: 'Northern Ireland' },
  { name: 'Nottingham', slug: 'nottingham', count: 190, region: 'East Midlands' },
  { name: 'Newcastle', slug: 'newcastle', count: 175, region: 'North East' },
  { name: 'Brighton', slug: 'brighton', count: 165, region: 'South East' },
  { name: 'Southampton', slug: 'southampton', count: 145, region: 'South East' },
  { name: 'Portsmouth', slug: 'portsmouth', count: 140, region: 'South East' },
  { name: 'Oxford', slug: 'oxford', count: 120, region: 'South East' },
  { name: 'Cambridge', slug: 'cambridge', count: 110, region: 'East of England' },
  { name: 'York', slug: 'york', count: 130, region: 'North Yorkshire' },
  { name: 'Bath', slug: 'bath', count: 95, region: 'South West' },
  { name: 'Bournemouth', slug: 'bournemouth', count: 125, region: 'South West' },
  { name: 'Reading', slug: 'reading', count: 115, region: 'South East' },
  { name: 'Milton Keynes', slug: 'milton-keynes', count: 100, region: 'South East' },
  { name: 'Exeter', slug: 'exeter', count: 85, region: 'South West' },
  { name: 'Aberdeen', slug: 'aberdeen', count: 120, region: 'Scotland' },
  { name: 'Dundee', slug: 'dundee', count: 90, region: 'Scotland' },
  { name: 'Swansea', slug: 'swansea', count: 95, region: 'Wales' },
];

// Group cities by region
const regions = cityData.reduce((acc, city) => {
  if (!acc[city.region]) {
    acc[city.region] = [];
  }
  acc[city.region].push(city);
  return acc;
}, {} as Record<string, typeof cityData>);

export default function ToiletsDirectoryPage() {
  const totalToilets = cityData.reduce((sum, city) => sum + city.count, 0);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Find Public Toilets Across the UK
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Browse our directory of {totalToilets.toLocaleString()}+ public toilets in major UK
              cities and towns. Find accessible facilities, baby changing, and more.
            </p>
            <Link href="/map" className="btn btn-mint">
              <MapPin className="w-5 h-5" />
              Use Interactive Map
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-600">
                {totalToilets.toLocaleString()}+
              </div>
              <div className="text-gray-600 text-sm">Total Toilets</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-600">
                {cityData.length}+
              </div>
              <div className="text-gray-600 text-sm">Cities Covered</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-600">8,000+</div>
              <div className="text-gray-600 text-sm">Accessible</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-600">5,000+</div>
              <div className="text-gray-600 text-sm">Baby Changing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="section">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-8">Popular Cities</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cityData.slice(0, 8).map((city) => (
              <Link
                key={city.slug}
                href={`/toilets/${city.slug}`}
                className="card group hover:border-mint-500 border-2 border-transparent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-mint-100 transition-colors">
                    🚻
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-navy-800 group-hover:text-mint-600 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm text-gray-500">{city.count.toLocaleString()} toilets</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-mint-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Cities by Region */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-8">Browse by Region</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(regions).map(([region, cities]) => (
              <div key={region}>
                <h3 className="font-bold text-navy-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-mint-500" />
                  {region}
                </h3>
                <ul className="space-y-2">
                  {cities.map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={`/toilets/${city.slug}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white transition-colors group"
                      >
                        <span className="text-gray-700 group-hover:text-navy-700">
                          {city.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {city.count.toLocaleString()}
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

      {/* SEO Content */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-6">
              About Our UK Toilet Directory
            </h2>
            <div className="prose prose-lg text-gray-600">
              <p>
                Where To Wee maintains the most comprehensive database of public toilets across the
                United Kingdom. Our directory includes toilets in shopping centres, train stations,
                parks, and standalone public facilities.
              </p>
              <p>
                Each listing includes important information such as wheelchair accessibility, baby
                changing facilities, opening hours, and whether the toilet is free or paid. User
                ratings help you find the cleanest and best-maintained facilities.
              </p>
              <p>
                Whether you're a parent with young children, someone with accessibility needs, or
                simply looking for the nearest loo, our directory has you covered across all major
                UK cities and towns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Can't Find Your City?</h2>
          <p className="text-gray-300 mb-6">
            Use our interactive map to find toilets anywhere in the UK, or download the app for the
            best experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/map" className="btn btn-mint">
              <MapPin className="w-5 h-5" />
              Open Map
            </Link>
            <Link href="/download" className="btn bg-white text-navy-600 hover:bg-gray-100">
              Download App
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

