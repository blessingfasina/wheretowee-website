import type { Metadata } from 'next';
import { Mail, MapPin, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Where To Wee team. We\'d love to hear your feedback, suggestions, or questions.',
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-gray-300">
              Have a question, feedback, or suggestion? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-navy-800 mb-6">Send us a Message</h2>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy-600 focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy-600 focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy-600 focus:outline-none"
                  >
                    <option value="">Select a topic</option>
                    <option value="feedback">General Feedback</option>
                    <option value="bug">Report a Bug</option>
                    <option value="data">Data Correction</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="press">Press/Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy-600 focus:outline-none resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full sm:w-auto">
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-navy-800 mb-6">Other Ways to Reach Us</h2>
              <div className="space-y-6">
                <div className="card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-mint-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-mint-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-800 mb-1">Email</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        For general inquiries and support
                      </p>
                      <a
                        href="mailto:hello@wheretowee.uk"
                        className="text-mint-600 font-semibold hover:text-mint-700"
                      >
                        hello@wheretowee.uk
                      </a>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-mint-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-mint-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-800 mb-1">Data Corrections</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Found incorrect information? Let us know!
                      </p>
                      <a
                        href="mailto:data@wheretowee.uk"
                        className="text-mint-600 font-semibold hover:text-mint-700"
                      >
                        data@wheretowee.uk
                      </a>
                    </div>
                  </div>
                </div>

                <div className="card bg-navy-50 border-none">
                  <h3 className="font-bold text-navy-800 mb-2">Response Time</h3>
                  <p className="text-gray-600 text-sm">
                    We typically respond to inquiries within 24-48 hours. For urgent data
                    corrections (e.g., a toilet is permanently closed), we aim to respond within
                    a few hours during business days.
                  </p>
                </div>

                <div className="card bg-mint-50 border-none">
                  <h3 className="font-bold text-navy-800 mb-2">Want to Partner With Us?</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    We're always looking for partnerships with councils, businesses, and
                    accessibility organizations. If you'd like to provide data or collaborate,
                    get in touch!
                  </p>
                  <a
                    href="mailto:partnerships@wheretowee.uk"
                    className="text-mint-600 font-semibold hover:text-mint-700 text-sm"
                  >
                    partnerships@wheretowee.uk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

