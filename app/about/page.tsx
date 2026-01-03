import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Heart, Users, Shield, Mail, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Where To Wee - Our Mission & Story',
  description:
    'Learn about Where To Wee, the UK\'s most comprehensive toilet finder app. Our mission is to help everyone find clean, accessible toilets easily.',
  openGraph: {
    title: 'About Where To Wee',
    description: 'Learn about our mission to help everyone find clean, accessible toilets in the UK.',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Making Toilet Trips <span className="text-mint-400">Stress-Free</span>
            </h1>
            <p className="text-lg text-gray-300">
              Where To Wee is on a mission to ensure everyone can find clean, accessible public
              toilets whenever they need one.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-navy-800 mb-6">Our Story</h2>
            <div className="prose prose-lg text-gray-600">
              <p>
                Where To Wee was born from a simple frustration: why is it so hard to find a public
                toilet when you really need one? Whether you're a parent with young children, someone
                with a medical condition, or simply caught short while out and about, we believe
                everyone deserves easy access to clean toilet facilities.
              </p>
              <p>
                We started by mapping public toilets across the UK, gathering data from local
                councils, user submissions, and open data sources. Today, our database includes over
                18,000 toilets across the country, with detailed information about accessibility,
                baby changing facilities, opening hours, and user ratings.
              </p>
              <p>
                Our team is passionate about accessibility and inclusion. We work to ensure our app
                is useful for everyone, regardless of their needs or abilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-navy-800 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-mint-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">Accessibility First</h3>
              <p className="text-gray-600">
                We prioritize accessibility information because everyone deserves to know if they can
                use a facility before they arrive.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-mint-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">Privacy Matters</h3>
              <p className="text-gray-600">
                We don't require accounts or track your movements. Your location data stays on your
                device and is only used to find nearby toilets.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-mint-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Our database grows through user contributions. Every rating, review, and new toilet
                submission helps others in need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-navy-600 mb-2">18,000+</div>
              <div className="text-gray-600">Toilets Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-navy-600 mb-2">500+</div>
              <div className="text-gray-600">UK Towns & Cities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-navy-600 mb-2">50K+</div>
              <div className="text-gray-600">Monthly Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-navy-600 mb-2">4.8★</div>
              <div className="text-gray-600">App Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-navy-800 mb-6">Our Data</h2>
            <div className="prose prose-lg text-gray-600">
              <p>Our toilet database is compiled from multiple sources:</p>
              <ul>
                <li>
                  <strong>OpenStreetMap</strong> - Community-maintained geographic data
                </li>
                <li>
                  <strong>Refuge Restrooms</strong> - Database of safe restrooms for the LGBTQ+
                  community
                </li>
                <li>
                  <strong>Local Council Data</strong> - Official public toilet locations
                </li>
                <li>
                  <strong>User Submissions</strong> - Toilets added by our community
                </li>
              </ul>
              <p>
                We regularly update our database and verify information through user reports and
                ratings. If you find incorrect information, please let us know!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-navy-800 mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions, feedback, or want to partner with us? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@wheretowee.uk"
                className="btn btn-primary"
              >
                <Mail className="w-5 h-5" />
                hello@wheretowee.uk
              </a>
              <Link href="/contact" className="btn btn-secondary">
                Contact Form
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Help us build the most comprehensive toilet database in the UK. Submit new toilets, rate
            facilities, and help others find what they need.
          </p>
          <Link href="/download" className="btn btn-mint btn-lg">
            Join Waitlist
          </Link>
        </div>
      </section>
    </>
  );
}

