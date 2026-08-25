import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

/**
 * Self-hosted static map generator for toilet detail pages.
 *
 * Why: MiniMap previously used staticmap.openstreetmap.de, a free
 * third-party service that has been shut down (the hostname no longer
 * resolves), which broke the map preview on every detail page. Rather
 * than depend on another third-party static-map host, we stitch the
 * handful of OSM tiles ourselves and draw the marker — no API key, and
 * no external service that can disappear underneath us again.
 *
 * Tile usage: each unique (lat,lng,zoom) needs at most 6 tile fetches,
 * which Next's data cache keeps for 30 days and the CDN caches the
 * final PNG for a year, so upstream traffic is a one-off per toilet.
 * The OSM-required attribution is rendered by MiniMap under the image.
 */

export const runtime = 'nodejs';

const TILE = 256;
const OSM_TILE_URL = 'https://tile.openstreetmap.org';
const USER_AGENT = 'WhereToWee/1.0 (+https://wheretowee.uk; hello@wheretowee.uk)';

/** Slippy-map maths: lat/lng -> global pixel coordinates at a zoom level. */
function globalPixels(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = TILE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale;
  return { x, y };
}

/** Teardrop map pin, drawn as SVG and rasterised by sharp. */
function markerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 27 15 27s15-15.8 15-27C30 6.7 23.3 0 15 0z"
          fill="#e11d48" stroke="#ffffff" stroke-width="2"/>
    <circle cx="15" cy="15" r="5.5" fill="#ffffff"/>
  </svg>`;
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const lat = parseFloat(p.get('lat') || '');
  const lng = parseFloat(p.get('lng') || '');
  const zoom = Math.min(19, Math.max(1, parseInt(p.get('zoom') || '16', 10)));
  const width = Math.min(1600, Math.max(100, parseInt(p.get('w') || '600', 10)));
  const height = Math.min(800, Math.max(100, parseInt(p.get('h') || '300', 10)));

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 85 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400 });
  }

  try {
    const center = globalPixels(lat, lng, zoom);
    const left = Math.round(center.x - width / 2);
    const top = Math.round(center.y - height / 2);
    const maxTile = Math.pow(2, zoom) - 1;

    // Every tile that intersects the viewport
    const fetches: Promise<{ buf: Buffer; px: number; py: number }>[] = [];
    for (let tx = Math.floor(left / TILE); tx * TILE < left + width; tx++) {
      for (let ty = Math.floor(top / TILE); ty * TILE < top + height; ty++) {
        if (ty < 0 || ty > maxTile) continue;
        const wrappedX = ((tx % (maxTile + 1)) + maxTile + 1) % (maxTile + 1);
        const url = `${OSM_TILE_URL}/${zoom}/${wrappedX}/${ty}.png`;
        fetches.push(
          fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
            next: { revalidate: 60 * 60 * 24 * 30 },
          }).then(async (res) => {
            if (!res.ok) throw new Error(`tile ${zoom}/${wrappedX}/${ty} -> ${res.status}`);
            return {
              buf: Buffer.from(await res.arrayBuffer()),
              px: tx * TILE - left,
              py: ty * TILE - top,
            };
          }),
        );
      }
    }
    const tiles = await Promise.all(fetches);

    // pins=0 is used by printable city maps, which overlay their own
    // numbered markers on a clean basemap.
    const drawPin = p.get('pins') !== '0';
    const layers: Array<{ input: Buffer; left: number; top: number }> = tiles.map((t) => ({
      input: t.buf,
      left: t.px,
      top: t.py,
    }));
    if (drawPin) {
      layers.push({
        input: Buffer.from(markerSvg()),
        left: Math.round(width / 2) - 15,
        top: Math.round(height / 2) - 42,
      });
    }

    const png = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 221, g: 221, b: 221 },
      },
    })
      .composite(layers)
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        // Map imagery around a fixed pin basically never changes:
        // browsers keep it a day, the CDN a year.
        'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('staticmap generation failed:', error);
    // No caching on failure so a transient tile outage self-heals;
    // the browser shows the <img> alt text meanwhile.
    return NextResponse.json(
      { error: 'Failed to generate map' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
