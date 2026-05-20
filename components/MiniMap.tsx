import Link from 'next/link';
import { Navigation } from 'lucide-react';

/**
 * Server-rendered static-map preview for toilet detail pages.
 *
 * Why this exists: detail pages were text-only, which hurt both
 * "Crawled - currently not indexed" (Google saw 18k near-identical
 * pages) and user perception (no visual anchor at the top of the
 * page). A 600x300 PNG with a marker addresses both.
 *
 * We use OpenStreetMap's free static map service: no API key, no
 * signup, no per-request fee, attribution-only. Reliable enough for
 * our traffic and consistent with the OSM tiles we already use on
 * /map. If usage ever outgrows the upstream's rate limit, swap the
 * `staticMapUrl` builder for Mapbox / Stadia and add the token via
 * env var — the rest of the component stays identical.
 *
 * The image is plain `<img>` (not `next/image`) on purpose:
 *   - the staticmap host doesn't need to be added to remotePatterns;
 *   - we want simple lazy loading without going through Vercel's
 *     image optimiser (these are already small, ~30-50 KB);
 *   - if the upstream is unreachable, the browser shows alt text and
 *     the page still renders cleanly — no Next.js build error.
 *
 * Wrapped in a `<Link>` to `/map` so a tap takes the user straight
 * to the interactive view centred on this toilet — best UX for a
 * still-image preview.
 */
export interface MiniMapProps {
  lat: number;
  lng: number;
  /** Alt text — should include the toilet name + city for SEO. */
  alt: string;
  /** Zoom level (1-19). Default 16 = neighbourhood detail. */
  zoom?: number;
  /** Optional className applied to the outer wrapper. */
  className?: string;
}

/// Build the upstream static-map URL. Centralised so the swap to a
/// paid provider later is a one-line change.
function staticMapUrl({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }): string {
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: String(zoom),
    size: '600x300',
    maptype: 'mapnik',
    markers: `${lat},${lng},red-pushpin`,
  });
  return `https://staticmap.openstreetmap.de/staticmap.php?${params.toString()}`;
}

export default function MiniMap({ lat, lng, alt, zoom = 16, className }: MiniMapProps) {
  const src = staticMapUrl({ lat, lng, zoom });
  const interactiveHref = `/map?lat=${lat}&lng=${lng}`;
  return (
    <div className={className}>
      <Link
        href={interactiveHref}
        className="block relative rounded-2xl overflow-hidden border border-gray-100 group focus-visible:ring-2 focus-visible:ring-mint-400"
        aria-label="Open the interactive map centred on this toilet"
      >
        <img
          src={src}
          alt={alt}
          width={600}
          height={300}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block"
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-navy-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm group-hover:bg-mint-500 group-hover:text-white transition-colors">
          <Navigation className="w-3.5 h-3.5" />
          Open interactive map
        </span>
      </Link>
      <p className="text-[11px] text-gray-400 mt-1.5 px-1">
        Map ©{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 underline-offset-2 hover:underline"
        >
          OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}
