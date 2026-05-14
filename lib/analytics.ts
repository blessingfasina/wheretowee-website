/**
 * Google Analytics 4 Event Tracking.
 *
 * All public helpers in this file are safe to call from either client
 * or server components — they no-op on the server and when `gtag` is
 * not yet on the window. Event names are stable and intentionally
 * mirror the Flutter app's `AnalyticsService` so the two streams can
 * be unioned in BigQuery via the shared `user_id`.
 *
 * Adding a new event:
 *   1. Add a small typed helper here.
 *   2. Wire it at the call site.
 *   3. Add it as a custom dimension in GA4 if you want it for
 *      audiences / explorations (numeric params auto-register).
 *
 * Note: this file historically only exported a handful of helpers
 * (waitlist signup, directions, etc.). Those are all retained as-is
 * for backwards compatibility with existing call sites.
 */

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js' | 'set' | 'consent',
      targetIdOrEvent: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// ============================================================
//  Existing helpers — unchanged signatures, unchanged events.
// ============================================================

// Track when user successfully joins the waitlist
export function trackWaitlistSignup(_email?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'waitlist_signup', {
      event_category: 'conversion',
      event_label: 'Waitlist Form Submission',
      // Don't send actual email for privacy
      value: 1,
    });
  }
}

// Track when user clicks "Get Directions" for a toilet
export function trackGetDirections(toiletName: string, toiletId?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'get_directions', {
      event_category: 'engagement',
      event_label: toiletName,
      toilet_id: toiletId,
      value: 1,
    });
  }
}

// Track when user clicks app store download button
export function trackAppDownload(store: 'app_store' | 'play_store') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'app_download_click', {
      event_category: 'conversion',
      event_label: store === 'app_store' ? 'App Store' : 'Google Play',
      value: 1,
    });
  }
}

// Track when user submits a new toilet
export function trackToiletSubmission(toiletName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'toilet_submission', {
      event_category: 'engagement',
      event_label: toiletName,
      value: 1,
    });
  }
}

// Track when user reports an inaccuracy
export function trackInaccuracyReport(toiletId?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'inaccuracy_report', {
      event_category: 'engagement',
      event_label: toiletId ? `Toilet ${toiletId}` : 'General Report',
      value: 1,
    });
  }
}

// Track search usage on the map
export function trackMapSearch(searchTerm: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'map_search', {
      event_category: 'engagement',
      event_label: searchTerm,
      value: 1,
    });
  }
}

// Track contact form submission
export function trackContactSubmission() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'contact_form_submit', {
      event_category: 'engagement',
      event_label: 'Contact Form',
      value: 1,
    });
  }
}

// Track page views (automatic with GA4, but useful for SPAs)
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

// ============================================================
//  New helpers — feature-parity with the Flutter app's
//  `AnalyticsService`. Event names mirror the Dart side so the
//  same dashboards / audiences light up for both surfaces.
// ============================================================

const GA_ID = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : '') || '';

function gtagReady(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Tie subsequent events to a stable per-browser user id. Matches the
 * Flutter side's `AnalyticsService.setUserId(deviceId)`.
 */
export function setUserId(userId: string | null) {
  if (!gtagReady() || !GA_ID) return;
  window.gtag('config', GA_ID, { user_id: userId ?? undefined });
}

/**
 * Update one-or-more GA4 user properties for the current user.
 * Properties live under `user_properties.*` in BigQuery and can be
 * used as audience definitions in GA4.
 */
export function setUserProperties(props: Record<string, string | number | boolean | null | undefined>) {
  if (!gtagReady()) return;
  // GA4 prefers an explicit `user_properties` config payload.
  const cleaned: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined) continue;
    cleaned[k] = v;
  }
  if (Object.keys(cleaned).length === 0) return;
  window.gtag('set', 'user_properties', cleaned);
}

/** Coarse-grained engagement segment. Matches the app's bucketing. */
export type UserSegment = 'new' | 'engaged' | 'contributor' | 'power_contributor';

export function setUserSegment(segment: UserSegment) {
  setUserProperties({ user_segment: segment });
}

export function setAppVersion(version: string) {
  setUserProperties({ app_version: version });
}

export function setPlatform(platform: 'web' | 'ios' | 'android' | 'other') {
  setUserProperties({ platform });
}

export function setAnalyticsConsentProp(granted: boolean) {
  setUserProperties({ analytics_consent: granted ? 'granted' : 'denied' });
}

// -- Toilet selection / discovery --

export function logToiletViewed(params: {
  toiletId: number;
  toiletName: string;
  source: 'detail_page' | 'city_page' | 'map' | 'list' | 'search' | 'deep_link';
  citySlug?: string;
}) {
  if (!gtagReady()) return;
  window.gtag('event', 'toilet_viewed', {
    toilet_id: params.toiletId,
    toilet_name: params.toiletName,
    discovery_source: params.source,
    city_slug: params.citySlug,
  });
}

export function logToiletSelectedFromCityList(params: {
  toiletId: number;
  toiletName: string;
  citySlug: string;
  listPosition: number;
}) {
  if (!gtagReady()) return;
  window.gtag('event', 'toilet_selected_city_list', {
    toilet_id: params.toiletId,
    toilet_name: params.toiletName,
    city_slug: params.citySlug,
    list_position: params.listPosition,
  });
}

// -- Directions / map --

export function logToiletDirectionsTapped(params: {
  toiletId: number;
  toiletName: string;
  source: 'detail_page' | 'city_page';
}) {
  if (!gtagReady()) return;
  window.gtag('event', 'toilet_directions_tapped', {
    toilet_id: params.toiletId,
    toilet_name: params.toiletName,
    source: params.source,
  });
}

// -- Trust signals (mirrors mobile app) --

export function logVerificationBadgeShown(params: {
  toiletId: number;
  tier: string; // 'council_verified' | 'community_verified' | 'recently_confirmed'
}) {
  if (!gtagReady()) return;
  window.gtag('event', 'verification_badge_shown', {
    toilet_id: params.toiletId,
    verification_tier: params.tier,
  });
}

export function logConfidenceCardShown(params: {
  toiletId: number;
  confidenceScore: number;
  confidenceLabel: string;
}) {
  if (!gtagReady()) return;
  window.gtag('event', 'confidence_card_shown', {
    toilet_id: params.toiletId,
    confidence_score: params.confidenceScore,
    confidence_label: params.confidenceLabel,
  });
}

export function logHelpVerifyPromptShown(toiletId: number) {
  if (!gtagReady()) return;
  window.gtag('event', 'help_verify_prompt_shown', {
    toilet_id: toiletId,
  });
}

export function logHelpVerifyPromptCtaTapped(params: {
  toiletId: number;
  ctaType: 'download_app' | 'visit_map';
}) {
  if (!gtagReady()) return;
  window.gtag('event', 'help_verify_prompt_cta_tapped', {
    toilet_id: params.toiletId,
    cta_type: params.ctaType,
  });
}

// -- Content pages --

export function logRadarKeyPageViewed(source: 'badge' | 'footer' | 'tips' | 'direct' = 'direct') {
  if (!gtagReady()) return;
  window.gtag('event', 'radar_key_page_viewed', {
    source,
  });
}

export function logRadarKeyLearnMoreTapped() {
  if (!gtagReady()) return;
  window.gtag('event', 'radar_key_learn_more_tapped');
}

export function logToiletTipsPageViewed() {
  if (!gtagReady()) return;
  window.gtag('event', 'toilet_tips_page_viewed');
}

// -- Privacy / consent --

export function logAnalyticsConsentChanged(granted: boolean) {
  if (!gtagReady()) return;
  // Fire even when the new state is "denied" — the LAST event before
  // the disable flag flips so we have an audit trail.
  window.gtag('event', 'analytics_consent_changed', {
    consent_granted: granted,
  });
}

export function logPrivacyInfoOpened(source: 'cookies_page' | 'footer' | 'direct' = 'direct') {
  if (!gtagReady()) return;
  window.gtag('event', 'privacy_info_opened', { source });
}
