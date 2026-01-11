// Google Analytics 4 Event Tracking
// These events can be set as conversions in GA4 dashboard

declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// Track when user successfully joins the waitlist
export function trackWaitlistSignup(email?: string) {
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
