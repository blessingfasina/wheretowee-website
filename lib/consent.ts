/**
 * Privacy / analytics consent helpers.
 *
 * Mirrors the mobile app's `StorageService.getAnalyticsEnabled()` +
 * anonymous `device_id` pattern so that the same user's web and app
 * activity can be reconciled in BigQuery via a single `user_id`.
 *
 * Implementation notes:
 *  - We persist consent + device id in `localStorage`. We're not using
 *    cookies because they would themselves be an "analytics cookie"
 *    and bootstrap a chicken-and-egg compliance problem.
 *  - Reads are safe on the server (return defaults) so this can be
 *    imported from server components without crashing.
 *  - The hard opt-out also flips the standard
 *    `window['ga-disable-<MEASUREMENT_ID>']` flag that the GA library
 *    checks on every event call.
 */

const LS_DEVICE_ID = 'wtw_device_id';
const LS_ANALYTICS_CONSENT = 'wtw_analytics_consent'; // 'granted' | 'denied'

const isBrowser = typeof window !== 'undefined';

/**
 * Return a stable per-browser UUID. Generated once and persisted so
 * the same browser maps to one `user_id` in GA4 / BigQuery.
 *
 * Returns null when called on the server.
 */
export function getOrCreateDeviceId(): string | null {
  if (!isBrowser) return null;
  try {
    let id = localStorage.getItem(LS_DEVICE_ID);
    if (!id) {
      id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `wtw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(LS_DEVICE_ID, id);
    }
    return id;
  } catch {
    // localStorage can throw in private-browsing modes — fail open.
    return null;
  }
}

/**
 * Has the visitor explicitly granted analytics consent? Returns true
 * when no choice has been recorded — matches existing site behaviour
 * so we don't regress, but flips off the moment a user opts out.
 */
export function isAnalyticsConsentGranted(): boolean {
  if (!isBrowser) return false;
  try {
    const v = localStorage.getItem(LS_ANALYTICS_CONSENT);
    if (v === null) return true; // default-on; user has not chosen
    return v === 'granted';
  } catch {
    return true;
  }
}

/**
 * Persist the consent decision and propagate it to the GA library
 * via consent-mode `update` + the legacy `ga-disable-*` flag.
 *
 * Safe to call any number of times. No-op on the server.
 */
export function setAnalyticsConsent(granted: boolean): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(LS_ANALYTICS_CONSENT, granted ? 'granted' : 'denied');
  } catch {
    /* private browsing — fail open */
  }

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (measurementId) {
    // Belt-and-braces: the official "disable GA on this page" mechanism.
    // GA reads this on every call, so flipping it instantly silences events.
    type GADisableWindow = Window & { [key: `ga-disable-${string}`]: boolean };
    (window as unknown as GADisableWindow)[`ga-disable-${measurementId}`] = !granted;
  }

  // Update consent state via gtag if it has loaded. We use the modern
  // GA4 Consent Mode v2 signals.
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
    });
  }

  if (granted) {
    // When the user re-grants, immediately rewire the user_id so the
    // very next event is correctly attributed.
    const id = getOrCreateDeviceId();
    if (id && typeof window.gtag === 'function') {
      window.gtag('config', measurementId ?? '', { user_id: id });
    }
  }
}

/**
 * Convenience helper used by the consent toggle component. Returns
 * the current consent state without touching localStorage twice.
 */
export function readInitialConsent(): boolean {
  return isAnalyticsConsentGranted();
}
