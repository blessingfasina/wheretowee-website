'use client';

import { useEffect } from 'react';
import {
  logRadarKeyPageViewed,
  logRadarKeyLearnMoreTapped,
  logToiletTipsPageViewed,
} from '@/lib/analytics';

/**
 * Fires a one-shot impression event for the RADAR key page. Mounts
 * once per route load. The `source` query param (e.g. `?from=badge`)
 * lets us distinguish entry points without bespoke wiring on every
 * caller — falls back to 'direct'.
 */
export function RadarKeyImpression() {
  useEffect(() => {
    const params = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
    const from = params.get('from');
    const allowed = ['badge', 'footer', 'tips'] as const;
    type Source = (typeof allowed)[number];
    const source: Source | 'direct' = (allowed as readonly string[]).includes(from ?? '')
      ? (from as Source)
      : 'direct';
    logRadarKeyPageViewed(source);
  }, []);
  return null;
}

/**
 * Wrap an external "Buy a RADAR key" link so the click is recorded
 * as `radar_key_learn_more_tapped`. The component is a tiny wrapper
 * so we can keep the parent page in a server component.
 */
export function RadarKeyExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseDown={logRadarKeyLearnMoreTapped}
      onAuxClick={logRadarKeyLearnMoreTapped}
      onTouchStart={logRadarKeyLearnMoreTapped}
      className={className}
    >
      {children}
    </a>
  );
}

export function ToiletTipsImpression() {
  useEffect(() => {
    logToiletTipsPageViewed();
  }, []);
  return null;
}
