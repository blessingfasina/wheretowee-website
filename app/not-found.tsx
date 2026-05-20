import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Compass,
  Coins,
  Accessibility,
  Baby,
  Key,
  ChevronRight,
  Search,
  HomeIcon,
} from 'lucide-react';

/**
 * Custom 404 page.
 *
 * Default Next.js 404s are a dead end — visitors hit them and bounce.
 * This page recovers the visit by surfacing:
 *   - the live map (most likely intent for "/toilets/{somewhere}" misses),
 *   - the 5 category landing pages, and
 *   - a few popular cities.
 *
 * Note: this page is intentionally `noindex`. Google doesn't need to
 * rank our 404, and rendering it cleanly keeps Search Console's
 * "Not found (404)" rows from spiralling out of control as users
 * mistype URLs.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const QUICK_LINKS: Array<{ href: string; label: string; icon: React.ElementType; cls: string }> = [
  {
    href: '/map',
    label: 'Open the live map',
    icon: MapPin,
    cls: 'bg-navy-100 text-navy-700',
  },
  {
    href: '/free-public-toilets',
    label: 'Free public toilets',
    icon: Coins,
    cls: 'bg-mint-100 text-mint-700',
  },
  {
    href: '/accessible-toilets-uk',
    label: 'Accessible toilets UK',
    icon: Accessibility,
    cls: 'bg-blue-100 text-blue-700',
  },
  {
    href: '/changing-places-uk',
    label: 'Changing Places UK',
    icon: Accessibility,
    cls: 'bg-purple-100 text-purple-700',
  },
  {
    href: '/baby-changing-near-me',
    label: 'Baby changing facilities',
    icon: Baby,
    cls: 'bg-orange-100 text-orange-700',
  },
  {
    href: '/radar-key-toilets-uk',
    label: 'RADAR key toilets',
    icon: Key,
    cls: 'bg-indigo-100 text-indigo-700',
  },
];

const POPULAR_CITIES = [
  'london',
  'manchester',
  'birmingham',
  'leeds',
  'edinburgh',
  'glasgow',
  'liverpool',
  'bristol',
  'cardiff',
  'belfast',
  'newcastle',
  'brighton',
];

export default function NotFound() {
  return (
    <>
      {/* Hero — friendly tone, not punitive */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4 text-sm font-semibold">
              <span aria-hidden>🚻</span>
              <span>Hmm — that loo isn&apos;t here</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              We couldn&apos;t find that page
            </h1>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl">
              The link might be old, the toilet may have been merged, or the URL was mistyped.
              Don&apos;t worry — there are 18,000+ other public toilets across the UK, and the live
              map will find the nearest one in seconds.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="btn btn-mint">
                <HomeIcon className="w-5 h-5" />
                Back to the home page
              </Link>
              <Link href="/map" className="btn btn-secondary">
                <MapPin className="w-5 h-5" />
                Open the map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick links — recovers the most likely intents */}
      <section className="section">
        <div className="container-custom max-w-5xl">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-6 h-6 text-mint-600" />
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800">
              Were you looking for one of these?
            </h2>
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Pick a category and we&apos;ll take you straight to the right list.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="card group hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${link.cls} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 font-bold text-navy-800 group-hover:text-navy-900">
                    {link.label}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular cities */}
      <section className="section bg-gray-50">
        <div className="container-custom max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-2">Popular cities</h2>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Browse public toilets in one of the UK&apos;s biggest cities, or see the{' '}
            <Link href="/toilets" className="text-mint-600 hover:underline font-semibold">
              full directory
            </Link>
            .
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {POPULAR_CITIES.map((slug) => (
              <Link
                key={slug}
                href={`/toilets/${slug}`}
                className="card text-center hover:shadow-md hover:border-navy-300 transition-all border border-gray-100"
              >
                <h3 className="font-bold text-navy-800 capitalize">
                  {slug.replace(/-/g, ' ')}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Last-ditch CTA */}
      <section className="section">
        <div className="container-custom max-w-3xl text-center">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-navy-800 mb-2">Still stuck?</h2>
          <p className="text-gray-600 mb-4">
            If a toilet you saw on the map vanished, it may have been merged or removed for being
            permanently closed. Drop us a line and we&apos;ll dig in.
          </p>
          <Link href="/contact" className="btn btn-secondary">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
