import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Where To Wee - how we handle your data and protect your privacy.',
  alternates: {
    canonical: 'https://wheretowee.uk/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="section">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: October 2026</p>

          <div className="prose prose-lg text-gray-600">
            <h2>Introduction</h2>
            <p>
              Where To Wee (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, and safeguard your information when you
              use our mobile application and website (collectively, the &quot;Service&quot;).
            </p>

            <h2>Information We Collect</h2>

            <h3>Device identifier</h3>
            <p>
              We generate a random device identifier on your device and store it locally. We use it
              to associate your toilet submissions, ratings, reports, chat messages, notification
              preferences, and (if you enable analytics) anonymous usage events. It is not your
              name, email, phone number, or Apple/Google account ID.
            </p>

            <h3>Location Data</h3>
            <p>
              When you use our Service, we may request access to your device&apos;s location to show
              you nearby toilets and distances. Foreground location is:
            </p>
            <ul>
              <li>Processed on your device to calculate distances</li>
              <li>Not stored on our servers as a location trail</li>
              <li>Not sold or shared with advertisers</li>
            </ul>
            <p>
              If you enable nearby-toilet alerts, we also request <strong>background
              (&quot;Always&quot;) location</strong>. Background location is checked on your device only to
              measure distance to toilets you have saved. It is not uploaded as a continuous
              tracking history. You can turn nearby-toilet alerts off at any time in Notification
              Settings; the rest of the app works with When-In-Use location or with location denied
              (search by place or postcode instead).
            </p>

            <h3>User Submissions</h3>
            <p>
              If you submit a new toilet, rating, review, or report, we store the content you
              provide (for example location details, ratings, and comments), linked to your device
              identifier.
            </p>

            <h3>Live chat (Other User Content)</h3>
            <p>
              If you use in-app chat, we store the messages you send and our replies so we can
              support you. Messages are linked to your device identifier and platform (app or web).
              Do not include passwords or unnecessary personal details in chat.
            </p>

            <h3>Push notifications (Device ID / tokens)</h3>
            <p>
              If you allow notifications, we store a push token (for example an FCM token) with your
              device identifier and platform so we can send optional alerts such as submission
              approvals, re-verify reminders, and nearby-toilet alerts. You can disable
              notifications in the app or in system Settings; turning notifications off in the app
              removes the stored token when possible. The app&apos;s core features (map, list,
              search, favourites, and adding toilets) work without enabling notifications.
            </p>

            <h3>Analytics</h3>
            <p>
              If analytics are enabled, we send anonymous usage events (for example screen views and
              feature use) to Firebase Analytics, tied to your device identifier — not to your name
              or email. You can opt out in the app under About → Privacy.
            </p>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Show nearby toilets and distances</li>
              <li>Publish and moderate community toilet data, ratings, and reports</li>
              <li>Provide optional push alerts and live chat support</li>
              <li>Improve the Service (when analytics are on)</li>
            </ul>

            <h2>Data Storage</h2>
            <p>
              Toilet data, ratings, reports, chat messages, notification preferences, and push
              tokens are stored on servers hosted by Supabase. We apply appropriate security
              measures to protect this data.
            </p>
            <p>
              Saved favourites and many preferences are stored locally on your device. Some
              preferences (for example re-verify reminders) are also stored server-side so we can
              respect them when sending optional pushes.
            </p>

            <h2>Third-Party Services</h2>
            <p>Our Service uses the following third-party services:</p>
            <ul>
              <li>
                <strong>Supabase</strong> — database and backend (
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Google Maps</strong> — map display
              </li>
              <li>
                <strong>Firebase Cloud Messaging</strong> — optional push delivery (
                <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy
                </a>
                )
              </li>
              <li>
                <strong>Firebase Analytics</strong> — optional anonymous analytics (
                <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy
                </a>
                )
              </li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Deny location and/or notification access and still use the core Service</li>
              <li>Turn off nearby-toilet alerts, other notification types, and analytics in the app</li>
              <li>Request deletion of data you have submitted</li>
              <li>Contact us with questions about your data</li>
            </ul>

            <h2>Children&apos;s Privacy</h2>
            <p>
              Our Service is suitable for all ages. We do not knowingly collect personal information
              from children under 13.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot;
              date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@wheretowee.uk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
