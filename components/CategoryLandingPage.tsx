import Link from 'next/link';
import {
  MapPin,
  Star,
  ChevronRight,
  Navigation,
  Accessibility,
  Baby,
  Coins,
  Building2,
} from 'lucide-react';
import {
  getCategoryStats,
  slugifyToiletName,
  CATEGORY_META,
  type CategoryKind,
  type Toilet,
} from '@/lib/supabase';

/**
 * Public, declarative config for an intent landing page. Each of the
 * 5 category pages (`/free-public-toilets`, `/accessible-toilets-uk`,
 * ...) is a tiny shell that hands one of these to
 * [CategoryLandingPage]. Keeping the page-specific copy here lets
 * each route stay focused on SEO metadata + content, and lets us
 * change the shared shell in one place.
 */
export interface CategoryLandingConfig {
  /** Which category to render. Drives the Supabase query + canonical slug. */
  kind: CategoryKind;
  /** Big hero title — should match the H1 + page title. */
  heading: string;
  /** Sub-headline below the H1 in the hero. */
  subheading: string;
  /** Opening SEO paragraph (~80-120 words). */
  intro: string;
  /** Optional Lucide icon for the hero corner badge. */
  HeroIcon?: React.ElementType;
  /**
   * 3-4 bullet body sections that follow the city list. Each gets an
   * `<h2>` and a paragraph. Keep total copy ≥400 words for ranking weight.
   */
  bodySections: Array<{ heading: string; body: string }>;
  /** 4-6 FAQ Q&As. Rendered as `<details>` + emitted as `FAQPage` JSON-LD. */
  faq: Array<{ q: string; a: string }>;
  /** Cross-links to related content pages — internal linking is SEO gold. */
  related: Array<{ href: string; title: string; description: string }>;
  /** Optional override for the human-friendly count noun (defaults to `toilets`). */
  unitNoun?: string;
}

const CATEGORY_BADGE_ICON: Record<CategoryKind, React.ElementType> = {
  free: Coins,
  accessible: Accessibility,
  changing_places: Accessibility,
  baby_changing: Baby,
  radar_key: Building2,
};

const CATEGORY_BADGE_CLASS: Record<CategoryKind, { bg: string; text: string }> = {
  free: { bg: 'bg-mint-100', text: 'text-mint-700' },
  accessible: { bg: 'bg-blue-100', text: 'text-blue-700' },
  changing_places: { bg: 'bg-purple-100', text: 'text-purple-700' },
  baby_changing: { bg: 'bg-orange-100', text: 'text-orange-700' },
  radar_key: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
};

/// Server component. Fetches stats then renders the landing page.
export default async function CategoryLandingPage({
  config,
}: {
  config: CategoryLandingConfig;
}) {
  const meta = CATEGORY_META[config.kind];
  const stats = await getCategoryStats(config.kind);
  const Hero = config.HeroIcon ?? CATEGORY_BADGE_ICON[config.kind];
  const unit = config.unitNoun ?? 'toilets';
  const totalLabel = stats.total > 0 ? stats.total.toLocaleString('en-GB') : '—';
  const cityCount = stats.byCity.length;
  const topCity = stats.byCity[0];

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>{meta.title}</span>
          </nav>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-white/10 rounded-2xl p-3 flex-shrink-0">
              <Hero className="w-10 h-10 text-mint-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                {config.heading}
              </h1>
              <p className="text-lg text-gray-300">{config.subheading}</p>
            </div>
          </div>
          <p className="text-lg text-gray-200 max-w-3xl leading-relaxed">{config.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/map" className="btn btn-mint">
              <MapPin className="w-5 h-5" />
              Find on the map
            </Link>
            <Link href="/download" className="btn btn-secondary">
              Download the app
            </Link>
          </div>
        </div>
      </section>

      {/* Quick stats strip */}
      <section className="py-6 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-600">{totalLabel}</div>
              <div className="text-gray-600 text-sm">{meta.shortLabel} listed</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-mint-600">{cityCount}</div>
              <div className="text-gray-600 text-sm">UK cities covered</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-orange-600">
                {topCity ? topCity.count.toLocaleString('en-GB') : '—'}
              </div>
              <div className="text-gray-600 text-sm">
                {topCity ? `in ${topCity.city.fullName}` : 'top city'}
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600">Free</div>
              <div className="text-gray-600 text-sm">App + web, no sign-up</div>
            </div>
          </div>
        </div>
      </section>

      {/* By-city list */}
      <section className="section">
        <div className="container-custom max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-2">
            {meta.shortLabel} by UK city
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Tap a city to see every {unit.toLowerCase()} matching this filter, with
            accessibility info, ratings and walking-distance directions.
          </p>
          {stats.byCity.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-gray-600 mb-4">
                We&apos;re still collecting data for {meta.shortLabel.toLowerCase()} across
                the UK. Help by adding the next one!
              </p>
              <Link href="/submit" className="btn btn-mint">Add a Toilet</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.byCity.map(({ city, count }) => {
                const badge = CATEGORY_BADGE_CLASS[config.kind];
                return (
                  <Link
                    key={city.slug}
                    href={`/toilets/${city.slug}`}
                    className="card hover:shadow-md hover:border-navy-300 transition-all group border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-navy-800 group-hover:text-navy-900">
                        {city.fullName}
                      </h3>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-navy-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 ${badge.bg} ${badge.text} text-xs font-semibold px-2 py-0.5 rounded-full`}>
                        {count.toLocaleString('en-GB')} {unit.toLowerCase()}
                      </span>
                      <span className="text-xs text-gray-500">View list →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured */}
      {stats.featured.length > 0 && (
        <section className="section bg-gray-50">
          <div className="container-custom max-w-5xl">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-2">
              Top-rated {meta.shortLabel.toLowerCase()}
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl">
              The highest-rated {unit.toLowerCase()} our community has reviewed.
              Tap any card to see full details and directions.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.featured.map((t: Toilet) => <FeaturedToiletCard key={t.id} toilet={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* SEO body sections */}
      <section className="section">
        <div className="container-custom max-w-3xl">
          {config.bodySections.map((s) => (
            <div key={s.heading} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3">{s.heading}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))}

          {/* Related guides */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-navy-800 mb-4">Related guides</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {config.related.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="card hover:shadow-md transition-shadow group border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-navy-400 flex-shrink-0 mt-0.5 group-hover:text-navy-600" />
                    <div>
                      <h3 className="font-bold text-navy-800 group-hover:text-navy-900">
                        {r.title}
                      </h3>
                      <p className="text-sm text-gray-600">{r.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-gray-50">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {config.faq.map((f) => (
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

      {/* JSON-LD: WebPage + ItemList + FAQPage + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `https://wheretowee.uk/${meta.slug}`,
            name: config.heading,
            description: config.intro,
            url: `https://wheretowee.uk/${meta.slug}`,
            isPartOf: { '@type': 'WebSite', name: 'Where To Wee', url: 'https://wheretowee.uk' },
          }),
        }}
      />
      {stats.byCity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: `${meta.title} — by UK city`,
              numberOfItems: stats.byCity.length,
              itemListElement: stats.byCity.slice(0, 30).map((c, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `https://wheretowee.uk/toilets/${c.city.slug}`,
                name: `${meta.shortLabel} in ${c.city.fullName}`,
              })),
            }),
          }}
        />
      )}
      {config.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: config.faq.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            }),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wheretowee.uk' },
              { '@type': 'ListItem', position: 2, name: config.heading, item: `https://wheretowee.uk/${meta.slug}` },
            ],
          }),
        }}
      />
    </>
  );
}

/// Single-purpose card used in the featured grid. Extracted out of
/// the page body to keep the parent component scannable. We don't
/// know the canonical city in this context (the toilet matched the
/// filter but its address might not include one of our supported
/// city slugs), so we fall back to a city-less URL when needed.
function FeaturedToiletCard({ toilet }: { toilet: Toilet }) {
  // Try to derive a city slug from the address for a clean URL;
  // fall back to "uk" so the link still works (the [slug] route
  // ignores the city segment for lookup — it parses the toilet id
  // from the slug).
  const lowerAddress = (toilet.address ?? '').toLowerCase();
  const matched = lowerAddress.match(
    /(london|birmingham|manchester|leeds|glasgow|liverpool|bristol|sheffield|edinburgh|leicester|coventry|bradford|cardiff|belfast|nottingham|newcastle|brighton|southampton|portsmouth|oxford|cambridge|york|bath|bournemouth|reading|exeter|aberdeen|dundee|swansea|milton keynes)/,
  );
  const citySlug = matched ? matched[1].replace(/\s+/g, '-') : 'uk';
  const href = `/toilets/${citySlug}/${toilet.id}-${slugifyToiletName(toilet.name)}`;
  return (
    <div className="card border border-gray-100">
      <div className="flex items-start justify-between mb-2 gap-2">
        <Link href={href} className="font-bold text-navy-800 hover:text-mint-600 line-clamp-2">
          {toilet.name}
        </Link>
        {toilet.average_rating != null && (
          <div className="flex items-center gap-1 text-sm flex-shrink-0">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{toilet.average_rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      {toilet.address && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{toilet.address}</p>
      )}
      <div className="flex items-center justify-between">
        <Link href={href} className="inline-flex items-center gap-1 text-navy-600 text-sm font-semibold hover:text-navy-700">
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
}
