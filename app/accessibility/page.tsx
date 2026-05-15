import type { Metadata } from 'next';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'Accessibility statement for Where To Wee - our commitment to making toilet finding accessible for everyone.',
  alternates: {
    canonical: 'https://wheretowee.uk/accessibility',
  },
};

export default function AccessibilityPage() {
  return (
    <div className="section">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-navy-800 mb-4">Accessibility Statement</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2026</p>

          <div className="prose prose-lg text-gray-600">
            <h2>Our Commitment</h2>
            <p>
              Where To Wee is committed to ensuring digital accessibility for people with disabilities. 
              We are continually improving the user experience for everyone and applying the relevant 
              accessibility standards.
            </p>

            <h2>Accessibility Features</h2>
            <h3>In Our App</h3>
            <ul>
              <li>Clear, high-contrast text and icons</li>
              <li>Screen reader compatibility</li>
              <li>Scalable text sizes</li>
              <li>Simple, intuitive navigation</li>
              <li>Wheelchair accessibility filters for toilet listings</li>
            </ul>

            <h3>On Our Website</h3>
            <ul>
              <li>Semantic HTML structure</li>
              <li>Keyboard navigation support</li>
              <li>Alt text for images</li>
              <li>Sufficient colour contrast ratios</li>
              <li>Responsive design for all device sizes</li>
            </ul>

            <h2>Toilet Accessibility Information</h2>
            <p>
              We understand that finding an accessible toilet is crucial for many people. Our database 
              includes accessibility information for each toilet listing:
            </p>
            <ul>
              <li><strong>Wheelchair accessible</strong> - Whether the toilet has step-free access and adequate space</li>
              <li><strong>RADAR key required</strong> - Whether a National Key Scheme (RADAR) key is needed</li>
              <li><strong>Baby changing facilities</strong> - Availability of changing tables</li>
              <li><strong>Unisex/Gender neutral</strong> - Single-occupancy toilets suitable for all</li>
            </ul>

            <h2>Conformance Status</h2>
            <p>
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. 
              These guidelines explain how to make web content more accessible for people with disabilities.
            </p>

            <h2>Feedback</h2>
            <p>
              We welcome your feedback on the accessibility of Where To Wee. Please let us know if you 
              encounter accessibility barriers:
            </p>
            <ul>
              <li>Email: <a href="mailto:accessibility@wheretowee.uk">accessibility@wheretowee.uk</a></li>
              <li>Use the Contact form on our website</li>
            </ul>
            <p>
              We try to respond to accessibility feedback within 5 business days.
            </p>

            <h2>Limitations</h2>
            <p>
              Despite our best efforts, some limitations may exist:
            </p>
            <ul>
              <li>User-submitted toilet information may not always include complete accessibility details</li>
              <li>Third-party map components may have their own accessibility limitations</li>
              <li>Older content may not yet meet all accessibility standards</li>
            </ul>
            <p>
              We are actively working to address these limitations and improve accessibility across all 
              aspects of our service.
            </p>

            <h2>Technical Specifications</h2>
            <p>
              Accessibility of Where To Wee relies on the following technologies:
            </p>
            <ul>
              <li>HTML</li>
              <li>CSS</li>
              <li>JavaScript</li>
              <li>WAI-ARIA</li>
            </ul>
            <p>
              These technologies are relied upon for conformance with WCAG 2.1.
            </p>

            <h2>Assessment Approach</h2>
            <p>
              Where To Wee assessed the accessibility of this website and application through:
            </p>
            <ul>
              <li>Self-evaluation</li>
              <li>Automated testing tools</li>
              <li>Manual testing with assistive technologies</li>
            </ul>
          </div>
        </div>
      </div>
      <BreadcrumbJsonLd trail={[{ name: 'Accessibility', url: 'https://wheretowee.uk/accessibility' }]} />
    </div>
  );
}
