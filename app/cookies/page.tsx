import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie policy for Where To Wee - how we use cookies and similar technologies.',
  alternates: {
    canonical: 'https://wheretowee.uk/cookies',
  },
};

export default function CookiesPage() {
  return (
    <div className="section">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">Cookie Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2026</p>

          <div className="prose prose-lg text-gray-600">
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information 
              to website owners.
            </p>

            <h2>How We Use Cookies</h2>
            <p>
              Where To Wee uses minimal cookies to ensure our website functions properly. We respect 
              your privacy and keep cookie usage to a minimum.
            </p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function and cannot be switched off. 
              They are usually only set in response to actions made by you, such as setting your 
              privacy preferences or filling in forms.
            </p>
            <table className="w-full border-collapse border border-gray-300 my-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Cookie</th>
                  <th className="border border-gray-300 p-2 text-left">Purpose</th>
                  <th className="border border-gray-300 p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Session</td>
                  <td className="border border-gray-300 p-2">Maintains your session while browsing</td>
                  <td className="border border-gray-300 p-2">Session</td>
                </tr>
              </tbody>
            </table>

            <h3>Analytics Cookies</h3>
            <p>
              We may use analytics cookies to understand how visitors interact with our website. 
              This helps us improve our service. All analytics data is anonymised.
            </p>
            <table className="w-full border-collapse border border-gray-300 my-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Cookie</th>
                  <th className="border border-gray-300 p-2 text-left">Purpose</th>
                  <th className="border border-gray-300 p-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">_ga</td>
                  <td className="border border-gray-300 p-2">Google Analytics - distinguishes users</td>
                  <td className="border border-gray-300 p-2">2 years</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">_gid</td>
                  <td className="border border-gray-300 p-2">Google Analytics - distinguishes users</td>
                  <td className="border border-gray-300 p-2">24 hours</td>
                </tr>
              </tbody>
            </table>

            <h2>Third-Party Cookies</h2>
            <p>
              Our website may include content from third parties, such as embedded maps. These third 
              parties may set their own cookies. We do not control third-party cookies.
            </p>
            <ul>
              <li><strong>Google Maps</strong> - Used to display interactive maps</li>
            </ul>

            <h2>Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul>
              <li>View what cookies are stored on your device</li>
              <li>Delete all or specific cookies</li>
              <li>Block cookies from being set</li>
              <li>Set your browser to notify you when cookies are being set</li>
            </ul>
            <p>
              Please note that blocking essential cookies may affect the functionality of our website.
            </p>

            <h3>Browser Cookie Settings</h3>
            <p>Find out how to manage cookies in your browser:</p>
            <ul>
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
                  Safari
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
                  Microsoft Edge
                </a>
              </li>
            </ul>

            <h2>Mobile App</h2>
            <p>
              The Where To Wee mobile app does not use cookies. Instead, it may use local storage 
              on your device to save your preferences and favourites. This data stays on your device 
              and is not transmitted to our servers.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Any changes will be posted on this 
              page with an updated revision date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
              <br />
              Email: <a href="mailto:privacy@wheretowee.uk">privacy@wheretowee.uk</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
