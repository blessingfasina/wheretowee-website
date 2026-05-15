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
 * @example
 *   export default function Image() {
 *     return renderOgCard({
 *       eyebrow: 'Accessible Toilets',
 *       title: 'Wheelchair-accessible loos across the UK',
 *       subtitle: '18,000+ listings · free · no sign-up',
 *       accent: 'blue',
 *     });
 *   }
 *   export const size = OG_SIZE;
 *   export const contentType = OG_CONTENT_TYPE;
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

// Accent colour palette — keyed off the in-app brand language so OG
// cards stay visually consistent with each landing page's hero.
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
  /** Optional emoji / icon to anchor the card visually. */
  icon?: string;
  /** Visual accent. Defaults to brand mint. */
  accent?: OgAccent;
  /** Custom "site" label (defaults to wheretowee.uk). */
  siteLabel?: string;
}

/// Returns an `ImageResponse` configured for OG/Twitter share cards.
/// Pure function — call from a route's `opengraph-image.tsx`.
export function renderOgCard(config: OgCardConfig): ImageResponse {
  const accent = ACCENT_PALETTE[config.accent ?? 'mint'];
  const eyebrow = config.eyebrow;
  const subtitle = config.subtitle;
  const icon = config.icon ?? '🚻';
  const siteLabel = config.siteLabel ?? 'wheretowee.uk';

  return new ImageResponse(
    (
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
        {/* Top row: brand + site label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
                fontSize: 36,
              }}
            >
              {icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>Where To Wee</div>
              <div style={{ fontSize: 16, opacity: 0.7 }}>{siteLabel}</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255,255,255,0.12)',
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 18,
            }}
          >
            <span>🇬🇧</span>
            <span>UK toilet finder</span>
          </div>
        </div>

        {/* Centre block: eyebrow + title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {eyebrow && (
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
          )}
          <div
            style={{
              fontSize: config.title.length > 60 ? 56 : 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {config.title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 28, opacity: 0.85, maxWidth: 950, lineHeight: 1.3 }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom row: CTA reinforcement */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, opacity: 0.9 }}>
            <span>📍</span>
            <span>18,000+ public toilets · accessibility-first · free</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'white',
              color: accent.text,
              padding: '12px 24px',
              borderRadius: 12,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Find one near you →
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
