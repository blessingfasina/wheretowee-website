import { ImageResponse } from 'next/og';

/**
 * Shared layout for Open Graph share cards (1200×630).
 *
 * Used by every route-level `opengraph-image.tsx` to avoid copy-pasting
 * the same hero gradient + brand mark across 9+ files. The component
 * intentionally uses only flex layout and inline styles — `next/og`'s
 * Satori renderer doesn't support CSS grid, advanced shadows or
 * external fonts (without explicit loading).
 *
 * Important for crawler resilience:
 *  - No emoji (Twemoji CDN fetches fail under concurrent Ahrefs/SEO
 *    load and turn into 500s).
 *  - Text is sanitised to a single string node (Satori crashes on
 *    unexpected multi-child text containers).
 *  - Long Cache-Control so successful renders aren't re-generated.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

const CACHE_HEADERS = {
  // Successful OG cards are deterministic for a given toilet/city.
  // Cache hard at the CDN so crawler bursts hit the edge, not the
  // serverless function.
  'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
} as const;

const ACCENT_PALETTE = {
  mint: { gradFrom: '#0e7c5b', gradTo: '#06532f', pill: '#22c08a', text: '#072c1d' },
  navy: { gradFrom: '#1e2a4a', gradTo: '#0c1530', pill: '#7aa0ff', text: '#0c1530' },
  blue: { gradFrom: '#1c4f8a', gradTo: '#0a2b54', pill: '#5db4ff', text: '#0a2b54' },
  purple: { gradFrom: '#553c9a', gradTo: '#2f1b6e', pill: '#b08af8', text: '#2f1b6e' },
  orange: { gradFrom: '#c2410c', gradTo: '#7c2d12', pill: '#fdba74', text: '#7c2d12' },
  indigo: { gradFrom: '#3730a3', gradTo: '#1e1b4b', pill: '#a5b4fc', text: '#1e1b4b' },
} as const;

export type OgAccent = keyof typeof ACCENT_PALETTE;

export interface OgCardConfig {
  /** Small uppercase label above the headline (e.g. "Accessible Toilets"). */
  eyebrow?: string;
  /** Main headline — kept punchy, ~6-10 words. */
  title: string;
  /** Sub-text line below the title (e.g. count, location). */
  subtitle?: string;
  /**
   * Optional short ASCII/mark for the brand badge. Prefer letters over
   * emoji — emoji force Satori to fetch Twemoji PNGs and that CDN is
   * what fails under crawler concurrency.
   */
  icon?: string;
  /** Visual accent. Defaults to brand mint. */
  accent?: OgAccent;
  /** Custom "site" label (defaults to wheretowee.uk). */
  siteLabel?: string;
}

/// Strip characters that commonly crash Satori / Resvg under load.
function sanitizeOgText(value: string | null | undefined, max = 140): string {
  if (!value) return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    // Drop emoji / variation selectors — no Twemoji CDN dependency.
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\uFE0E\uFE0F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function buildOgElement(config: OgCardConfig) {
  const accent = ACCENT_PALETTE[config.accent ?? 'mint'];
  const eyebrow = sanitizeOgText(config.eyebrow, 48);
  const title = sanitizeOgText(config.title, 90) || 'Where To Wee';
  const subtitle = sanitizeOgText(config.subtitle, 160);
  const icon = sanitizeOgText(config.icon, 4) || 'WTW';
  const siteLabel = sanitizeOgText(config.siteLabel, 40) || 'wheretowee.uk';
  const titleSize = title.length > 60 ? 56 : 72;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: `linear-gradient(135deg, ${accent.gradFrom} 0%, ${accent.gradTo} 100%)`,
        color: 'white',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: icon.length > 2 ? 18 : 28,
              fontWeight: 800,
            }}
          >
            {icon}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>
              Where To Wee
            </div>
            <div style={{ fontSize: 16, opacity: 0.7 }}>{siteLabel}</div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.12)',
            padding: '8px 16px',
            borderRadius: 999,
            fontSize: 18,
          }}
        >
          UK toilet finder
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {eyebrow ? (
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              backgroundColor: accent.pill,
              color: accent.text,
              padding: '8px 18px',
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            maxWidth: 1000,
            display: 'flex',
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontSize: 28,
              opacity: 0.85,
              maxWidth: 950,
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 22,
            opacity: 0.9,
          }}
        >
          15,000+ public toilets · accessibility-first · free
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            color: accent.text,
            padding: '12px 24px',
            borderRadius: 12,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          Find one near you
        </div>
      </div>
    </div>
  );
}

/// Returns an `ImageResponse` configured for OG/Twitter share cards.
export function renderOgCard(config: OgCardConfig): ImageResponse {
  return new ImageResponse(buildOgElement(config), {
    ...OG_SIZE,
    headers: CACHE_HEADERS,
  });
}

/// Never-throwing wrapper used by high-cardinality routes (per-toilet
/// OG). If Satori/Resvg or upstream data fails, return a brand card
/// instead of a 500 — SEO crawlers were turning those into alerts.
export function safeRenderOgCard(
  config: OgCardConfig,
  fallback: OgCardConfig = {
    eyebrow: 'Where To Wee',
    title: 'Find public toilets near you',
    subtitle: '15,000+ UK listings · free · no sign-up',
    accent: 'navy',
    icon: 'WTW',
  },
): ImageResponse {
  try {
    return renderOgCard(config);
  } catch (err) {
    console.error('renderOgCard failed, using fallback', err);
    try {
      return renderOgCard(fallback);
    } catch (fallbackErr) {
      console.error('fallback renderOgCard also failed', fallbackErr);
      // Absolute last resort — still an ImageResponse so Next doesn't 500.
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1e2a4a',
              color: 'white',
              fontSize: 64,
              fontWeight: 800,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Where To Wee
          </div>
        ),
        { ...OG_SIZE, headers: CACHE_HEADERS },
      );
    }
  }
}
