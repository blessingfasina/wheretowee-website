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
          <p className="text-gray-500 mb-8">Last updated: January 2025</p>

          <div className="prose prose-lg text-gray-600">
            <h2>Introduction</h2>
            <p>
              Where To Wee ("we", "our", or "us") is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, and safeguard your information when you
              use our mobile application and website (collectively, the "Service").
            </p>

            <h2>Information We Collect</h2>
            <h3>Location Data</h3>
            <p>
              When you use our Service, we may request access to your device's location to show you
              nearby toilets. This location data is:
            </p>
            <ul>
              <li>Processed locally on your device</li>
              <li>Used only to find toilets near your current location</li>
              <li>Not stored on our servers</li>
              <li>Not shared with third parties</li>
            </ul>
            <p>
              You can deny location access and still use the Service by manually searching for
              locations.
            </p>

            <h3>User Submissions</h3>
            <p>
              If you submit a new toilet, rating, or report, we collect the information you provide.
              This may include:
            </p>
            <ul>
              <li>Toilet location and details</li>
              <li>Ratings and comments</li>
              <li>Report descriptions</li>
            </ul>
            <p>
              We use a randomly generated device identifier for submissions - we do not collect your
              name, email, or any personally identifiable information.
            </p>

            <h3>Analytics</h3>
            <p>
              We may collect anonymous usage statistics to improve our Service, such as which
              features are most used. This data is aggregated and cannot be used to identify
              individual users.
            </p>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Show you nearby toilets based on your location</li>
              <li>Add new toilets and ratings to our database</li>
              <li>Process and respond to reports</li>
              <li>Improve our Service</li>
            </ul>

            <h2>Data Storage</h2>
            <p>
              Toilet data, ratings, and reports are stored securely on our servers hosted by
              Supabase. We implement appropriate security measures to protect this data.
            </p>
            <p>
              Your saved favourites and preferences are stored locally on your device and are not
              transmitted to our servers.
            </p>

            <h2>Third-Party Services</h2>
            <p>Our Service uses the following third-party services:</p>
            <ul>
              <li>
                <strong>Supabase</strong> - Database hosting (
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Google Maps / OpenStreetMap</strong> - Map display
              </li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Deny location access and still use the Service</li>
              <li>Request deletion of any data you have submitted</li>
              <li>Contact us with questions about your data</li>
            </ul>

            <h2>Children's Privacy</h2>
            <p>
              Our Service is suitable for all ages. We do not knowingly collect personal information
              from children under 13.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
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

