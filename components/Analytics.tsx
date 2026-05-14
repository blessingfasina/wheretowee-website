'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import {
  getOrCreateDeviceId,
  isAnalyticsConsentGranted,
} from '@/lib/consent';
import {
  setUserId,
  setPlatform,
  setAppVersion,
  setAnalyticsConsentProp,
  logToiletDirectionsTapped,
} from '@/lib/analytics';

// Bumped manually on each website deploy that materially changes
// instrumentation. Helps slice GA4 cohorts by "before/after" changes.
const WEBSITE_VERSION = '2026.05.14-trust-signals';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function Analytics() {
  // Bootstrap user identity and user properties after gtag loads. This
  // runs once per page load on the client; the dataLayer queue swallows
  // any calls that fire before gtag is ready, then flushes once the
  // script loads.
  useEffect(() => {
    const granted = isAnalyticsConsentGranted();
    setAnalyticsConsentProp(granted);
    if (!granted) {
      // Honour the persisted opt-out by setting the legacy disable flag.
      if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
        type GADisableWindow = Window & { [key: `ga-disable-${string}`]: boolean };
        (window as unknown as GADisableWindow)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
      }
      return;
    }
    const deviceId = getOrCreateDeviceId();
    if (deviceId) setUserId(deviceId);
    setPlatform('web');
    setAppVersion(WEBSITE_VERSION);

    // Delegated click listener for any anchor tagged with
    // `data-track-directions`. Lets server components fire the
    // `toilet_directions_tapped` event without each one having to
    // become a client component.
    function handleDirectionsClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[data-track-directions]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const idStr = anchor.dataset.toiletId;
      const name = anchor.dataset.toiletName;
      const sourceRaw = anchor.dataset.directionsSource;
      const id = idStr ? Number(idStr) : NaN;
      if (!Number.isFinite(id) || !name) return;
      const source =
        sourceRaw === 'detail_page' || sourceRaw === 'city_page'
          ? sourceRaw
          : 'city_page';
      logToiletDirectionsTapped({ toiletId: id, toiletName: name, source });
    }
    document.addEventListener('click', handleDirectionsClick);
    document.addEventListener('auxclick', handleDirectionsClick);
    return () => {
      document.removeEventListener('click', handleDirectionsClick);
      document.removeEventListener('auxclick', handleDirectionsClick);
    };
  }, []);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  // Persisted consent at first paint. We can't call localStorage in
  // the inline script (we're a client component anyway), so we
  // hard-code the *default* signals here and the `useEffect` above
  // immediately flips the disable flag if the user has opted out.
  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          // Wait for explicit consent (no-op in regions where prior
          // consent is not required, gtag will still send modeled pings).
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500,
          });
          gtag('js', new Date());
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
          });
        `}
      </Script>
    </>
  );
}
