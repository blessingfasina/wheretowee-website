import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for using Where To Wee - the UK toilet finder app.',
};

export default function TermsPage() {
  return (
    <div className="section">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2025</p>

          <div className="prose prose-lg text-gray-600">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Where To Wee mobile application and website (the "Service"),
              you agree to be bound by these Terms of Service. If you do not agree to these terms,
              please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Where To Wee provides information about public toilet locations across the United
              Kingdom, including accessibility features, user ratings, and directions. The Service
              is provided free of charge.
            </p>

            <h2>3. User Responsibilities</h2>
            <p>When using our Service, you agree to:</p>
            <ul>
              <li>Provide accurate information when submitting new toilets or ratings</li>
              <li>Not submit false, misleading, or inappropriate content</li>
              <li>Not attempt to disrupt or harm the Service</li>
              <li>Respect other users and their contributions</li>
            </ul>

            <h2>4. Content Accuracy</h2>
            <p>
              While we strive to maintain accurate and up-to-date information, we cannot guarantee
              the accuracy of all toilet listings. Information may be outdated, incorrect, or
              incomplete. Users should verify important details (such as accessibility or opening
              hours) before relying on them.
            </p>
            <p>
              We are not responsible for any inconvenience caused by inaccurate information in our
              database.
            </p>

            <h2>5. User Submissions</h2>
            <p>
              By submitting content to our Service (such as new toilet locations, ratings, or
              reports), you:
            </p>
            <ul>
              <li>Grant us a non-exclusive, royalty-free license to use, modify, and display the content</li>
              <li>Confirm that the content is accurate to the best of your knowledge</li>
              <li>Confirm that the content does not violate any third-party rights</li>
            </ul>
            <p>
              We reserve the right to remove any content that violates these terms or is otherwise
              inappropriate.
            </p>

            <h2>6. Intellectual Property</h2>
            <p>
              The Where To Wee name, logo, and application design are our intellectual property. You
              may not use these without our written permission.
            </p>
            <p>
              Our toilet database includes data from various sources including OpenStreetMap
              (licensed under ODbL), Refuge Restrooms, and user submissions.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We are not liable for:
            </p>
            <ul>
              <li>Any damages arising from your use of the Service</li>
              <li>Inaccurate or outdated information in our database</li>
              <li>Service interruptions or technical issues</li>
              <li>The condition or availability of listed toilets</li>
            </ul>

            <h2>8. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued use of the Service
              after changes constitutes acceptance of the new terms.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes will be subject
              to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2>10. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at:
              <br />
              Email: legal@wheretowee.uk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

