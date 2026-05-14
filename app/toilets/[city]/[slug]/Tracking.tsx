'use client';

import { useEffect } from 'react';
import {
  logToiletViewed,
  logVerificationBadgeShown,
  logConfidenceCardShown,
  logHelpVerifyPromptShown,
  logToiletDirectionsTapped,
} from '@/lib/analytics';

interface ImpressionProps {
  toiletId: number;
  toiletName: string;
  citySlug: string;
  /** Resolved verification tier from `resolveVerificationTier`. */
  verificationTier: string;
  /** Numeric confidence score, or null when the toilet has no signals. */
  confidenceScore: number | null;
  /** Confidence label (e.g. 'high'), or null when no signals. */
  confidenceLabel: string | null;
  /** True when we rendered the "Help us verify" prompt instead of a score. */
  helpVerifyShown: boolean;
}

/**
 * Client-side analytics for the toilet detail page. Fires once per
 * render: a `toilet_viewed` event plus a *_shown event for whichever
 * trust signal was actually displayed. Pre-existing impression events
 * matching the mobile app keep the funnels comparable.
 */
export function ToiletDetailImpression(props: ImpressionProps) {
  useEffect(() => {
    logToiletViewed({
      toiletId: props.toiletId,
      toiletName: props.toiletName,
      source: 'detail_page',
      citySlug: props.citySlug,
    });
    if (props.verificationTier !== 'unverified') {
      logVerificationBadgeShown({
        toiletId: props.toiletId,
        tier: props.verificationTier,
      });
    }
    if (props.confidenceScore != null && props.confidenceLabel) {
      logConfidenceCardShown({
        toiletId: props.toiletId,
        confidenceScore: props.confidenceScore,
        confidenceLabel: props.confidenceLabel,
      });
    }
    if (props.helpVerifyShown) {
      logHelpVerifyPromptShown(props.toiletId);
    }
    // Intentionally an empty dep array — we only want this to fire on
    // initial page load, not on the (rare) prop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

interface DirectionsButtonProps {
  toiletId: number;
  toiletName: string;
  source: 'detail_page' | 'city_page';
  href: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Drop-in replacement for the "Get directions" link that also fires
 * the `toilet_directions_tapped` event before navigating. We use
 * onMouseDown so the event records even if the user releases on the
 * link (most click-tracking patterns lose the event when the new tab
 * opens immediately).
 */
export function TrackedDirectionsLink(props: DirectionsButtonProps) {
  function record() {
    logToiletDirectionsTapped({
      toiletId: props.toiletId,
      toiletName: props.toiletName,
      source: props.source,
    });
  }
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseDown={record}
      onAuxClick={record}
      onTouchStart={record}
      className={props.className}
    >
      {props.children}
    </a>
  );
}
