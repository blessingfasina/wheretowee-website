'use client';

import { useState } from 'react';
import { Mail, MapPin, MessageSquare, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setResponseMessage(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setResponseMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setResponseMessage('Unable to send message. Please try again later.');
    }
  };

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
              
              {status === 'success' ? (
                <div className="bg-mint-50 border-2 border-mint-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-mint-600" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">{responseMessage}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn btn-primary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy-600 focus:outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
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
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy-600 focus:outline-none"
                    >
                      <option value="">Select a topic</option>
                      <option value="General Feedback">General Feedback</option>
                      <option value="Report a Bug">Report a Bug</option>
                      <option value="Data Correction">Data Correction</option>
                      <option value="Partnership Inquiry">Partnership Inquiry</option>
                      <option value="Press/Media">Press/Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy-600 focus:outline-none resize-none"
                      placeholder="Tell us what's on your mind..."
                    />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{responseMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn btn-primary w-full sm:w-auto disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
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
