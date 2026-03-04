import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Policy',
  description: 'Content policy and community guidelines for Where To Wee - how we moderate user-generated content.',
  alternates: {
    canonical: 'https://wheretowee.uk/content-policy',
  },
};

export default function ContentPolicyPage() {
  return (
    <div className="section">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">Content Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: March 2026</p>

          <div className="prose prose-lg text-gray-600">
            <h2>1. Overview</h2>
            <p>
              Where To Wee relies on community contributions to keep our toilet database accurate and
              helpful. To maintain a safe and respectful environment for all users, we moderate all
              user-generated content including toilet submissions, ratings, reviews, and reports.
            </p>

            <h2>2. Community Standards</h2>
            <p>All content submitted to Where To Wee must be:</p>
            <ul>
              <li>Accurate and relevant to public toilet facilities</li>
              <li>Respectful and appropriate for all ages</li>
              <li>Free from hate speech, harassment, or discrimination</li>
              <li>Free from spam, advertising, or promotional material</li>
              <li>Free from personally identifiable information about others</li>
            </ul>

            <h2>3. Prohibited Content</h2>
            <p>The following types of content are strictly prohibited:</p>
            <ul>
              <li>Offensive, abusive, or threatening language</li>
              <li>Sexually explicit or suggestive material</li>
              <li>Content that promotes violence or illegal activity</li>
              <li>
                Hate speech or content targeting individuals or groups based on race, ethnicity,
                religion, gender, sexual orientation, disability, or any other protected
                characteristic
              </li>
              <li>Deliberately false or misleading information</li>
              <li>Spam, advertisements, or repetitive submissions</li>
              <li>Personal information about other individuals</li>
            </ul>

            <h2>4. How to Report Content</h2>
            <p>
              If you encounter content that violates this policy, you can report it in the following
              ways:
            </p>
            <ul>
              <li>
                <strong>Flag a review:</strong> Tap the flag icon next to any review in the app to
                report it directly
              </li>
              <li>
                <strong>Report a listing:</strong> Use the &quot;Report&quot; button on any toilet
                detail page to report incorrect or inappropriate listings
              </li>
              <li>
                <strong>Contact us:</strong> Email{' '}
                <a href="mailto:hello@wheretowee.uk">hello@wheretowee.uk</a> with details of the
                content you wish to report
              </li>
            </ul>

            <h2>5. Moderation &amp; Enforcement</h2>
            <p>We take the following approach to content moderation:</p>
            <ul>
              <li>
                <strong>Review within 24 hours:</strong> All flagged content is reviewed within 24
                hours of being reported
              </li>
              <li>
                <strong>Content removal:</strong> Content that violates this policy will be removed
                promptly
              </li>
              <li>
                <strong>User action:</strong> Users who submit content that violates this policy
                will be blocked from making future submissions. Repeat or severe offenders will be
                permanently blocked from the platform
              </li>
              <li>
                <strong>Submission review:</strong> All new toilet submissions are reviewed before
                being published to ensure accuracy and appropriateness
              </li>
            </ul>

            <h2>6. Appeals</h2>
            <p>
              If you believe your content was removed in error, you may contact us at{' '}
              <a href="mailto:hello@wheretowee.uk">hello@wheretowee.uk</a> to request a review of
              the decision. We aim to respond to all appeals within 48 hours.
            </p>

            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Content Policy from time to time. We will notify users of any
              significant changes by updating the &quot;Last updated&quot; date at the top of this
              page.
            </p>

            <h2>8. Contact</h2>
            <p>
              For questions about this Content Policy, please contact us at:
              <br />
              Email: <a href="mailto:hello@wheretowee.uk">hello@wheretowee.uk</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
