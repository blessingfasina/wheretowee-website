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
 * The image comes from our own /api/staticmap endpoint, which
 * stitches OpenStreetMap tiles server-side and draws the marker.
 * We previously used staticmap.openstreetmap.de, but that free
 * third-party service was shut down (the hostname no longer
 * resolves), silently breaking the preview on every detail page —
 * self-hosting removes that whole class of failure. No API key, and
 * the endpoint caches aggressively so tile traffic is one-off.
 *
 * The image is plain `<img>` (not `next/image`) on purpose:
 *   - we want simple lazy loading without going through Vercel's
 *     image optimiser (the endpoint already returns a small PNG);
 *   - if generation ever fails, the browser shows alt text and the
 *     page still renders cleanly — no Next.js build error.
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

/// Build the static-map URL. Centralised so a provider swap stays a
/// one-line change.
function staticMapUrl({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }): string {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    zoom: String(zoom),
    w: '600',
    h: '300',
  });
  return `/api/staticmap?${params.toString()}`;
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
