'use client';

import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import { readInitialConsent, setAnalyticsConsent } from '@/lib/consent';
import { logAnalyticsConsentChanged } from '@/lib/analytics';

/**
 * In-page toggle that lets a visitor opt out of (or back into)
 * anonymous analytics collection. Mirrors the mobile app's About →
 * Privacy → "Anonymous analytics" switch so users have a single
 * mental model across surfaces.
 *
 * Used on `/cookies` and `/privacy`. Persists to localStorage and
 * flips the standard GA disable flag so the next event call is
 * suppressed instantly without a page reload.
 */
export default function AnalyticsConsentToggle() {
  // Avoid a hydration mismatch by starting in the same state on
  // server (`null`) and client, then updating once localStorage is
  // accessible.
  const [granted, setGranted] = useState<boolean | null>(null);
  const [justChanged, setJustChanged] = useState(false);

  useEffect(() => {
    setGranted(readInitialConsent());
  }, []);

  function handleToggle(next: boolean) {
    setGranted(next);
    // Fire the audit event *before* we disable, so the "off" state
    // change is recorded too.
    logAnalyticsConsentChanged(next);
    setAnalyticsConsent(next);
    setJustChanged(true);
    // Clear the confirmation banner after a few seconds.
    setTimeout(() => setJustChanged(false), 3000);
  }

  if (granted === null) {
    return (
      <div className="card border-gray-200 border bg-gray-50 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="card border-2 border-mint-200 bg-mint-50">
      <div className="flex items-start gap-3">
        <div className="bg-white rounded-lg p-2 flex-shrink-0">
          {granted ? (
            <ShieldCheck className="w-6 h-6 text-mint-600" />
          ) : (
            <ShieldOff className="w-6 h-6 text-gray-500" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-navy-800">Anonymous analytics</h3>
            <button
              type="button"
              role="switch"
              aria-checked={granted}
              aria-label={`Anonymous analytics ${granted ? 'enabled' : 'disabled'}`}
              onClick={() => handleToggle(!granted)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-offset-2 ${
                granted ? 'bg-mint-600' : 'bg-gray-300'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  granted ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-gray-700">
            We use Google Analytics 4 to understand how visitors discover and use
            Where To Wee. All events are anonymised — we never collect names, email
            addresses or precise location. Toggle this off and we&apos;ll stop
            collecting any usage data from you immediately.
          </p>
          {justChanged && (
            <div
              className={`mt-3 inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${
                granted ? 'bg-mint-100 text-mint-700' : 'bg-gray-100 text-gray-600'
              }`}
              role="status"
            >
              <Shield className="w-3 h-3" />
              {granted
                ? 'Analytics enabled — thanks for helping us improve!'
                : 'Analytics disabled — no usage data will be collected.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
