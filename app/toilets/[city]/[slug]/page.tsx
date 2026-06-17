import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Star,
  Accessibility,
  Baby,
  Coins,
  Navigation,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Key,
  HeartHandshake,
  RefreshCw,
  Info,
  Users,
} from 'lucide-react';
import {
  supabase,
  getActiveToiletTable,
  getToiletEnrichment,
  resolveVerificationTier,
  hasConfidenceSignals,
  needsReconfirmation,
  confidenceLevelFor,
  isIndexWorthyToilet,
  getNearbyToilets,
  slugifyToiletName,
  cityFromAddress,
  type Toilet,
  type VerificationTier,
  type ConfidenceLevel,
} from '@/lib/supabase';
import { ToiletDetailImpression, TrackedDirectionsLink } from './Tracking';
import MiniMap from '@/components/MiniMap';

// Revalidate every hour. Each toilet page is rendered on-demand
// (ISR) so we don't have to bake 18k pages at build time.
export const revalidate = 3600;
// Allow Next.js to render any toilet id at request time, not just
// the ones present at build time. Critical for ISR over a large
// catalog.
export const dynamicParams = true;

interface Props {
  params: Promise<{ city: string; slug: string }>;
}

/// Extract the numeric toilet id from a `[id]-[slug]` URL segment.
/// Returns null if the segment can't be parsed.
function parseToiletId(slug: string): number | null {
  const idStr = slug.split('-')[0];
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

/// Fetch a single toilet by id from the currently-active toilet table.
async function fetchToilet(id: number): Promise<Toilet | null> {
  try {
    const tableName = await getActiveToiletTable();
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as Toilet;
  } catch (e) {
    console.error('fetchToilet error:', e);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params;
  const id = parseToiletId(slug);
  if (id == null) return { title: 'Toilet Not Found' };

  const toilet = await fetchToilet(id);
  if (!toilet) return { title: 'Toilet Not Found' };

  const cityName = city
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

  const facilityBits: string[] = [];
  if (toilet.wheelchair === 'yes') facilityBits.push('wheelchair accessible');
  if (toilet.baby_changing === 'yes') facilityBits.push('baby changing');
  if (toilet.fee === 'no' || toilet.fee === 'free') facilityBits.push('free to use');
  if (toilet.radar_key === 'yes') facilityBits.push('RADAR key required');
  const facilityCopy = facilityBits.length > 0 ? ` (${facilityBits.join(', ')})` : '';

  const title = `${toilet.name} — Public Toilet in ${cityName}`;
  const description = toilet.address
    ? `Public toilet at ${toilet.address}${facilityCopy}. View accessibility info, ratings and directions on Where To Wee.`
    : `Public toilet in ${cityName}${facilityCopy}. View accessibility info, ratings and directions on Where To Wee.`;

  // Robots policy: thin/unverified detail pages are kept reachable
  // (so users hitting them from city lists or external links still get
  // a working page) but hidden from Google's index. As soon as the row
  // earns a signal — a single rating, a council import, a recent
  // community confirm, or a high-value accessibility flag — the
  // metadata flips back to indexable on the next request. Search Console
  // had ~2,100 of our pages stuck in "Discovered – not indexed" before
  // we added this gate; this is the targeted fix.
  const indexable = isIndexWorthyToilet(toilet);
  const robots = indexable
    ? undefined
    : {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      };

  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      url: `https://wheretowee.uk/toilets/${city}/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://wheretowee.uk/toilets/${city}/${slug}`,
    },
  };
}

/// Verification badge — mirrors the mobile app's tier styling.
function VerificationBadge({ tier }: { tier: VerificationTier }) {
  if (tier === 'unverified') return null;
  const map: Record<Exclude<VerificationTier, 'unverified'>, { icon: React.ElementType; label: string; cls: string }> = {
    council_verified: { icon: ShieldCheck, label: 'Council verified', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
    community_verified: { icon: BadgeCheck, label: 'Community verified', cls: 'bg-mint-100 text-mint-700 border-mint-200' },
    recently_confirmed: { icon: Clock, label: 'Recently confirmed', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  };
  const c = map[tier];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 ${c.cls} border text-sm font-semibold px-3 py-1.5 rounded-full`}>
      <Icon className="w-4 h-4" /> {c.label}
    </span>
  );
}

/// Pretty label for a confidence level.
function confidenceLabel(level: ConfidenceLevel): string {
  return {
    high: 'High',
    good: 'Good',
    moderate: 'Moderate',
    low: 'Low',
    very_low: 'Very low',
  }[level];
}

/// Colour class for a confidence level — uses Tailwind colours
/// already in the design system.
function confidenceColor(level: ConfidenceLevel): { text: string; bg: string; ring: string } {
  switch (level) {
    case 'high':
      return { text: 'text-mint-700', bg: 'bg-mint-100', ring: 'ring-mint-300' };
    case 'good':
      return { text: 'text-blue-700', bg: 'bg-blue-100', ring: 'ring-blue-300' };
    case 'moderate':
      return { text: 'text-yellow-700', bg: 'bg-yellow-100', ring: 'ring-yellow-300' };
    case 'low':
      return { text: 'text-orange-700', bg: 'bg-orange-100', ring: 'ring-orange-300' };
    case 'very_low':
      return { text: 'text-red-700', bg: 'bg-red-100', ring: 'ring-red-300' };
  }
}

export default async function ToiletDetailPage({ params }: Props) {
  const { city, slug } = await params;
  const id = parseToiletId(slug);
  if (id == null) notFound();

  const toilet = await fetchToilet(id);
  if (!toilet) notFound();

  // If the city in the URL doesn't match the address (e.g. someone
  // mis-linked from a different city's page), redirect to the canonical
  // form via 404 so we don't dilute SEO with multiple URLs for one toilet.
  const canonicalCity = cityFromAddress(toilet.address);
  // We don't *force* a redirect for unknown cities — some toilets'
  // addresses don't include a city keyword. Just trust the URL.
  if (canonicalCity && canonicalCity !== city) {
    // Issue a permanent redirect to the canonical URL.
    const canonicalSlug = `${toilet.id}-${slugifyToiletName(toilet.name)}`;
    const { redirect } = await import('next/navigation');
    redirect(`/toilets/${canonicalCity}/${canonicalSlug}`);
  }

  // Fetch trust signals + accessibility metadata in parallel.
  const { verification, confidence, accessibility } = await getToiletEnrichment([toilet.id]);
  const verifiedSource = verification[toilet.id]?.verified_source ?? toilet.verified_source ?? null;

  const tier = resolveVerificationTier({
    verified_source: verifiedSource,
    verified_at: toilet.verified_at,
    confirmation_count: toilet.confirmation_count,
    last_confirmed_at: toilet.last_confirmed_at,
  });
  const stale = needsReconfirmation({
    verified_source: verifiedSource,
    verified_at: toilet.verified_at,
    confirmation_count: toilet.confirmation_count,
    last_confirmed_at: toilet.last_confirmed_at,
  });
  const hasSignals = hasConfidenceSignals({
    verified_source: verifiedSource,
    verified_at: toilet.verified_at,
    confirmation_count: toilet.confirmation_count,
    not_found_count: toilet.not_found_count,
    rating_count: toilet.rating_count,
  });
  const confidenceRow = confidence[toilet.id];
  const confidenceScore = confidenceRow?.confidence_score ?? null;
  const confidenceLevel = confidenceRow
    ? confidenceLevelFor(confidenceRow.confidence_label, confidenceRow.confidence_score)
    : null;

  const access = accessibility[toilet.id];

  const cityName = city
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

  // Find a handful of nearby toilets to differentiate this page from
  // every other toilet detail page. Two SEO wins:
  //   1. Each page now has unique outgoing internal links → directly
  //      targets "Crawled - currently not indexed" by giving Google a
  //      reason to consider each URL distinct.
  //   2. Users genuinely benefit — if this loo is shut they can pivot
  //      to the next one without bouncing back to the city list.
  // Fetch a slightly larger set, then strip the current toilet and any
  // it can't differentiate by a sensible distance, and keep 5.
  const nearbyToilets = await getNearbyToilets(
    toilet.latitude,
    toilet.longitude,
    1.5, // km radius — tight enough to be genuinely "nearby"
    20,
  );
  const nearbyOthers = nearbyToilets
    .filter((n) => n.id !== toilet.id)
    .slice(0, 5);

  return (
    <>
      <ToiletDetailImpression
        toiletId={toilet.id}
        toiletName={toilet.name}
        citySlug={city}
        verificationTier={tier}
        confidenceScore={hasSignals ? confidenceScore : null}
        confidenceLabel={hasSignals && confidenceLevel ? confidenceLevel : null}
        helpVerifyShown={!hasSignals || confidenceScore == null}
      />
      {/* Hero */}
      <section className="bg-navy-600 text-white py-10 md:py-14">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4 flex-wrap">
            <Link href="/toilets" className="hover:text-white">
              Cities
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/toilets/${city}`} className="hover:text-white">
              {cityName}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{toilet.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {toilet.name}
          </h1>
          {toilet.address && (
            <p className="flex items-start gap-2 text-gray-200 mb-4">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{toilet.address}</span>
            </p>
          )}
          {toilet.average_rating != null && (
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{toilet.average_rating.toFixed(1)}</span>
              <span className="text-gray-300 text-sm">
                ({toilet.rating_count ?? 0} review{toilet.rating_count === 1 ? '' : 's'})
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <VerificationBadge tier={tier} />
            {stale && (
              <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 border border-orange-200 text-sm font-semibold px-3 py-1.5 rounded-full">
                <RefreshCw className="w-4 h-4" /> Needs reconfirmation
              </span>
            )}
            {toilet.radar_key === 'yes' && (
              <Link
                href="/radar-key"
                className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-indigo-200 transition-colors"
              >
                <Key className="w-4 h-4" /> RADAR key required
              </Link>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedDirectionsLink
              href={`https://www.google.com/maps/dir/?api=1&destination=${toilet.latitude},${toilet.longitude}`}
              toiletId={toilet.id}
              toiletName={toilet.name}
              source="detail_page"
              className="btn btn-mint"
            >
              <Navigation className="w-5 h-5" />
              Get directions
            </TrackedDirectionsLink>
            <Link
              href={`/map?lat=${toilet.latitude}&lng=${toilet.longitude}&zoom=18`}
              className="btn btn-secondary"
            >
              <MapPin className="w-5 h-5" />
              View on map
            </Link>
          </div>
        </div>
      </section>

      {/* Static map preview — gives each detail page a unique visual
          asset (helps with "Crawled - currently not indexed") and a
          quick spatial anchor for the user. Tap to open interactive. */}
      <section className="container-custom max-w-4xl -mt-6 md:-mt-8 relative z-10">
        <MiniMap
          lat={toilet.latitude}
          lng={toilet.longitude}
          alt={`Map showing the location of ${toilet.name} in ${cityName}`}
        />
      </section>

      {/* Main content */}
      <section className="section">
        <div className="container-custom max-w-4xl">
          {/* Public "update from the team" note — set by admins when a
              report is resolved. Shown prominently so users see fixes. */}
          {toilet.public_note && (
            <div className="card mb-6 bg-mint-50 border border-mint-200">
              <div className="flex items-start gap-3">
                <BadgeCheck className="w-6 h-6 text-mint-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-navy-800 flex items-center gap-2 flex-wrap">
                    Update from the team
                    {toilet.public_note_at && (
                      <span className="text-xs font-normal text-gray-500">
                        ·{' '}
                        {new Date(toilet.public_note_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-700 mt-1">{toilet.public_note}</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Confidence card OR "Help us verify" prompt */}
            {hasSignals && confidenceScore != null && confidenceLevel ? (
              <div className="card md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-navy-800 flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-navy-600" />
                    Confidence score
                  </h2>
                  <span className={`text-sm font-semibold ${confidenceColor(confidenceLevel).text}`}>
                    {confidenceLabel(confidenceLevel)}
                  </span>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <div className={`text-4xl font-bold ${confidenceColor(confidenceLevel).text}`}>
                    {confidenceScore}
                  </div>
                  <div className="text-gray-500 text-sm mb-1.5">/ 100</div>
                </div>
                <div className={`h-2 rounded-full ${confidenceColor(confidenceLevel).bg} overflow-hidden`}>
                  <div
                    className={`h-full ${confidenceColor(confidenceLevel).text.replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(100, Math.max(0, confidenceScore))}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Calculated from upstream verification, community
                  confirmations, recent visits, and ratings.
                </p>
              </div>
            ) : (
              <div className="card md:col-span-2 bg-mint-50 border-mint-200 border">
                <div className="flex items-start gap-3">
                  <HeartHandshake className="w-6 h-6 text-mint-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-lg font-bold text-navy-800 mb-1">Help us verify this loo</h2>
                    <p className="text-gray-700 mb-3">
                      Nobody has confirmed, reviewed, or reported this toilet yet. The mobile
                      app makes it a single tap — your input gives the next visitor a
                      confidence score they can trust.
                    </p>
                    <Link href="/download" className="btn btn-primary">
                      Confirm via the app
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Facilities */}
            <div className="card">
              <h2 className="text-lg font-bold text-navy-800 mb-4">Facilities</h2>
              <ul className="space-y-3 text-gray-700">
                <FacilityRow
                  icon={<Coins className="w-5 h-5 text-mint-600" />}
                  label={toilet.fee === 'no' || toilet.fee === 'free' ? 'Free to use' : toilet.fee === 'yes' ? 'Paid' : 'Fee not known'}
                />
                <FacilityRow
                  icon={<Accessibility className="w-5 h-5 text-blue-600" />}
                  label={
                    toilet.wheelchair === 'yes'
                      ? 'Wheelchair accessible'
                      : toilet.wheelchair === 'no'
                      ? 'Not wheelchair accessible'
                      : 'Accessibility not known'
                  }
                />
                <FacilityRow
                  icon={<Baby className="w-5 h-5 text-orange-600" />}
                  label={
                    toilet.baby_changing === 'yes'
                      ? 'Baby changing available'
                      : toilet.baby_changing === 'no'
                      ? 'No baby changing'
                      : 'Baby changing not known'
                  }
                />
                {toilet.unisex === 'yes' && (
                  <FacilityRow icon={<Users className="w-5 h-5 text-purple-600" />} label="Unisex / shared" />
                )}
                {toilet.opening_hours && (
                  <FacilityRow icon={<Clock className="w-5 h-5 text-navy-600" />} label={`Hours: ${toilet.opening_hours}`} />
                )}
              </ul>
            </div>

            {/* Inclusive accessibility (A3 metadata) */}
            <div className="card">
              <h2 className="text-lg font-bold text-navy-800 mb-4 flex items-center gap-2">
                Inclusive accessibility
              </h2>
              {access ? (
                <ul className="space-y-3 text-gray-700">
                  <AccessRow
                    label="Changing Places (hoist)"
                    value={access.hoist}
                    hint="A ceiling hoist for transfer to and from the toilet."
                  />
                  <AccessRow
                    label="Adult changing bench"
                    value={access.adult_changing}
                    hint="An adult-sized changing bench."
                  />
                  <AccessRow
                    label="Gender-neutral"
                    value={access.gender_neutral}
                    hint="Single-stall or signage indicating shared facility."
                  />
                  <AccessRow
                    label="Emergency access"
                    value={access.emergency_access}
                    hint="Pull cord or other emergency call system inside."
                  />
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Inclusive accessibility info hasn&apos;t been captured for this loo yet.{' '}
                  <Link href="/download" className="text-mint-600 font-semibold hover:underline">
                    Add details via the app
                  </Link>.
                </p>
              )}
            </div>
          </div>

          {/* Helpful guidance */}
          <div className="card mt-6">
            <h2 className="text-lg font-bold text-navy-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-navy-600" />
              Helpful guidance
            </h2>
            <ul className="grid md:grid-cols-2 gap-3">
              <li>
                <Link
                  href="/radar-key"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-navy-300 hover:bg-gray-50 transition-colors"
                >
                  <Key className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm">
                    <strong className="block text-navy-700">About the RADAR key</strong>
                    <span className="text-gray-500">National Key Scheme explainer</span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/toilet-tips"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-navy-300 hover:bg-gray-50 transition-colors"
                >
                  <HeartHandshake className="w-5 h-5 text-mint-600" />
                  <span className="text-sm">
                    <strong className="block text-navy-700">Toilet tips &amp; travel advice</strong>
                    <span className="text-gray-500">Where to find toilets on the move</span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="card mt-6 bg-navy-50 border-navy-100 border">
            <div className="flex items-start gap-3">
              <BadgeCheck className="w-6 h-6 text-navy-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-navy-800 mb-1">Rate, confirm or report</h2>
                <p className="text-gray-700 mb-3">
                  Tell other users whether this loo is still open, leave a rating, or
                  flag changes. All available in the Where To Wee mobile app.
                </p>
                <Link href="/download" className="btn btn-primary">
                  Download the app
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby toilets — auto-differentiates each detail page (unique
          internal links per URL, helps with "Crawled - not indexed").
          Only renders when we actually have neighbours to suggest. */}
      {nearbyOthers.length > 0 && (
        <section className="section bg-gray-50">
          <div className="container-custom max-w-5xl">
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-navy-800">
                  Other toilets nearby
                </h2>
                <p className="text-gray-600 mt-1">
                  Within 1.5 km of {toilet.name} — handy if this one&apos;s shut.
                </p>
              </div>
              <Link
                href={`/toilets/${city}`}
                className="text-navy-700 font-semibold hover:text-navy-900 inline-flex items-center gap-1"
              >
                All in {cityName}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyOthers.map((n) => {
                const nCity = cityFromAddress(n.address) ?? city;
                const nHref = `/toilets/${nCity}/${n.id}-${slugifyToiletName(n.name)}`;
                const tags: string[] = [];
                if (n.fee === 'no' || n.fee === 'free') tags.push('Free');
                if (n.wheelchair === 'yes') tags.push('Accessible');
                if (n.baby_changing === 'yes') tags.push('Baby change');
                if (n.hoist === 'yes') tags.push('Changing Places');
                if (n.radar_key === 'yes') tags.push('RADAR key');
                return (
                  <Link
                    key={n.id}
                    href={nHref}
                    className="card border border-gray-100 hover:shadow-md hover:border-navy-300 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-navy-800 group-hover:text-mint-600 line-clamp-2">
                        {n.name}
                      </h3>
                      {n.average_rating != null && (
                        <div className="flex items-center gap-1 text-sm flex-shrink-0">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{n.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {n.address && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{n.address}</p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* JSON-LD: PublicToilet + Place + BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'PublicToilet',
            '@id': `https://wheretowee.uk/toilets/${city}/${slug}`,
            name: toilet.name,
            ...(toilet.address && {
              address: {
                '@type': 'PostalAddress',
                streetAddress: toilet.address,
                addressLocality: cityName,
                addressCountry: 'GB',
              },
            }),
            geo: {
              '@type': 'GeoCoordinates',
              latitude: toilet.latitude,
              longitude: toilet.longitude,
            },
            url: `https://wheretowee.uk/toilets/${city}/${slug}`,
            isAccessibleForFree:
              toilet.fee === 'no' || toilet.fee === 'free' ? true : toilet.fee === 'yes' ? false : undefined,
            amenityFeature: [
              ...(toilet.wheelchair === 'yes'
                ? [{ '@type': 'LocationFeatureSpecification', name: 'Wheelchair Accessible', value: true }]
                : []),
              ...(toilet.baby_changing === 'yes'
                ? [{ '@type': 'LocationFeatureSpecification', name: 'Baby Changing Facility', value: true }]
                : []),
              ...(access?.hoist === 'yes'
                ? [{ '@type': 'LocationFeatureSpecification', name: 'Changing Places (hoist)', value: true }]
                : []),
              ...(access?.adult_changing === 'yes'
                ? [{ '@type': 'LocationFeatureSpecification', name: 'Adult Changing Bench', value: true }]
                : []),
              ...(access?.gender_neutral === 'yes'
                ? [{ '@type': 'LocationFeatureSpecification', name: 'Gender Neutral', value: true }]
                : []),
              ...(access?.emergency_access === 'yes'
                ? [{ '@type': 'LocationFeatureSpecification', name: 'Emergency Access (pull cord)', value: true }]
                : []),
              ...(toilet.radar_key === 'yes'
                ? [{ '@type': 'LocationFeatureSpecification', name: 'RADAR Key Required', value: true }]
                : []),
            ],
            ...(toilet.opening_hours && { openingHours: toilet.opening_hours }),
            ...(toilet.average_rating != null && (toilet.rating_count ?? 0) > 0
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: toilet.average_rating.toFixed(1),
                    ratingCount: toilet.rating_count,
                    bestRating: 5,
                    worstRating: 1,
                  },
                }
              : {}),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wheretowee.uk' },
              { '@type': 'ListItem', position: 2, name: 'Cities', item: 'https://wheretowee.uk/toilets' },
              { '@type': 'ListItem', position: 3, name: cityName, item: `https://wheretowee.uk/toilets/${city}` },
              { '@type': 'ListItem', position: 4, name: toilet.name, item: `https://wheretowee.uk/toilets/${city}/${slug}` },
            ],
          }),
        }}
      />
    </>
  );
}

/// Tiny reusable row used in the Facilities & Accessibility cards.
function FacilityRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </li>
  );
}

function AccessRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  const isYes = value === 'yes';
  const isNo = value === 'no';
  const valueLabel = isYes ? 'Yes' : isNo ? 'No' : 'Unknown';
  const cls = isYes
    ? 'bg-mint-100 text-mint-700'
    : isNo
    ? 'bg-gray-100 text-gray-600'
    : 'bg-gray-50 text-gray-500';
  return (
    <li className="flex items-start gap-3">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls} flex-shrink-0 mt-0.5`}>
        {valueLabel}
      </span>
      <span>
        <span className="font-semibold text-navy-700 block">{label}</span>
        <span className="text-xs text-gray-500">{hint}</span>
      </span>
    </li>
  );
}
