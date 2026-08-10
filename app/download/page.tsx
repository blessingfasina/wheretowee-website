'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Star,
  Mail,
  CheckCircle2,
  MapPin,
  Bell,
  WifiOff,
  Shield,
  Sparkles,
  Clock,
  PartyPopper,
  Loader2,
  Apple,
  Download,
} from 'lucide-react';
import { trackWaitlistSignup, trackAppDownload } from '@/lib/analytics';

const features = [
  {
    icon: MapPin,
    title: 'Find Nearest Toilets',
    description: 'Locate the closest public toilets wherever you are in the UK.',
  },
  {
    icon: WifiOff,
    title: 'Works Offline',
    description: 'Access toilet locations even without internet connection.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: "Get alerts when you're near your saved favourite toilets.",
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'No account required. Your data stays on your device.',
  },
];

const earlyBirdPerks = [
  'Be the first to download when we launch',
  'Exclusive early access to new features',
  'Help shape the app with your feedback',
  'Free forever - no premium features locked',
];

interface SiteSettings {
  launched: boolean;
  appStoreUrl: string;
  playStoreUrl: string;
}

export default function DownloadPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState<SiteSettings>({
    launched: false,
    appStoreUrl: '',
    playStoreUrl: '',
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        // Add cache-busting to ensure fresh data
        const res = await fetch('/api/settings', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        const data = await res.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || "You're on the list! We'll notify you when the app launches.");
        setEmail('');
        // Track conversion in GA4
        trackWaitlistSignup();
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Unable to join waitlist. Please try again later.');
    }
  };

  // Show loading state
  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-mint-500" />
      </div>
    );
  }

  // ============================================
  // LAUNCHED MODE - Show Download Buttons
  // ============================================
  if (settings.launched) {
    return (
      <>
        {/* Hero */}
        <section className="gradient-hero text-white py-16 md:py-24">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                {/* Live Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-mint-500 to-emerald-500 rounded-full px-4 py-2 mb-6 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">Now Available on iOS & Android</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Download <span className="text-mint-400">Where To Wee</span>
                </h1>
                <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                  Find public toilets near you instantly. 15,000+ locations across the UK with 
                  filters for free, accessible, and baby changing facilities.
                </p>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0">
                  {settings.appStoreUrl && (
                    <a
                      href={settings.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackAppDownload('app_store')}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      <Apple className="w-8 h-8" />
                      <div className="text-left">
                        <div className="text-xs text-gray-300">Download on the</div>
                        <div className="text-lg font-bold">App Store</div>
                      </div>
                    </a>
                  )}
                  {settings.playStoreUrl && (
                    <a
                      href={settings.playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackAppDownload('play_store')}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      <Download className="w-8 h-8" />
                      <div className="text-left">
                        <div className="text-xs text-gray-300">Get it on</div>
                        <div className="text-lg font-bold">Google Play</div>
                      </div>
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mint-400">15,000+</div>
                    <div className="text-sm text-gray-400">Toilets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mint-400">Free</div>
                    <div className="text-sm text-gray-400">Forever</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-mint-400">4.8★</div>
                    <div className="text-sm text-gray-400">Rating</div>
                  </div>
                </div>
              </div>

              {/* Phone Mockup */}
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  <div className="w-72 h-[580px] bg-gradient-to-b from-white to-gray-100 rounded-[3rem] border-8 border-gray-300 shadow-2xl flex flex-col overflow-hidden">
                    {/* Status bar */}
                    <div className="h-12 bg-navy-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">🚻 Where To Wee</span>
                    </div>
                    {/* Content */}
                    <div className="flex-1 bg-gray-100 p-4">
                      <div className="bg-white rounded-xl p-3 mb-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-navy-800">Costa Coffee</span>
                          <span className="text-sm text-mint-600">0.2 km</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          <span className="bg-mint-100 text-mint-700 text-xs px-2 py-0.5 rounded-full">Free</span>
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">♿</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 mb-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-navy-800">Public Toilet</span>
                          <span className="text-sm text-mint-600">0.4 km</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">20p</span>
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">♿</span>
                          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">🍼</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-navy-800">Sainsbury's</span>
                          <span className="text-sm text-mint-600">0.5 km</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          <span className="bg-mint-100 text-mint-700 text-xs px-2 py-0.5 rounded-full">Free</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < 3 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Bottom nav */}
                    <div className="h-16 bg-white border-t flex items-center justify-around px-4">
                      <div className="text-center">
                        <MapPin className="w-6 h-6 text-mint-500 mx-auto" />
                        <span className="text-xs text-mint-600 font-semibold">Map</span>
                      </div>
                      <div className="text-center">
                        <Star className="w-6 h-6 text-gray-400 mx-auto" />
                        <span className="text-xs text-gray-500">Saved</span>
                      </div>
                      <div className="text-center">
                        <Bell className="w-6 h-6 text-gray-400 mx-auto" />
                        <span className="text-xs text-gray-500">Alerts</span>
                      </div>
                    </div>
                  </div>
                  {/* Decorative */}
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-mint-500/20 rounded-full blur-xl" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-mint-500/20 rounded-full blur-xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-navy-800 text-center mb-12">
              What You Get
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="card text-center">
                  <div className="w-14 h-14 bg-mint-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-mint-600" />
                  </div>
                  <h3 className="font-bold text-navy-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-navy-800 text-center mb-8">
                System Requirements
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="card">
                  <h3 className="font-bold text-navy-800 mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    iOS
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-mint-500" />
                      iOS 13.0 or later
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-mint-500" />
                      iPhone, iPad, iPod touch
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-mint-500" />
                      ~50 MB storage
                    </li>
                  </ul>
                  {settings.appStoreUrl && (
                    <a
                      href={settings.appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 btn btn-primary w-full text-center"
                    >
                      Download for iOS
                    </a>
                  )}
                </div>
                <div className="card">
                  <h3 className="font-bold text-navy-800 mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Android
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-mint-500" />
                      Android 6.0 or later
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-mint-500" />
                      All Android phones & tablets
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-mint-500" />
                      ~40 MB storage
                    </li>
                  </ul>
                  {settings.playStoreUrl && (
                    <a
                      href={settings.playStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 btn btn-primary w-full text-center"
                    >
                      Download for Android
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section bg-gradient-to-r from-navy-600 to-navy-800 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Relief?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Download Where To Wee now and never panic about finding a toilet again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {settings.appStoreUrl && (
                <a
                  href={settings.appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-white text-navy-800 hover:bg-gray-100"
                >
                  🍎 Download for iPhone
                </a>
              )}
              {settings.playStoreUrl && (
                <a
                  href={settings.playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-mint"
                >
                  🤖 Download for Android
                </a>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  // ============================================
  // WAITLIST MODE - Show Signup Form
  // ============================================
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              {/* Coming Soon Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-4 py-2 mb-6 shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-bold">Coming Soon to iOS & Android</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Be the First to <span className="text-mint-400">Find Relief</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Where To Wee is launching soon! Join the waitlist to be notified when the app
                is available for download. It's completely free.
              </p>

              {/* Waitlist Form */}
              {status === 'success' ? (
                <div className="bg-mint-500/20 backdrop-blur-sm border border-mint-400/30 rounded-2xl p-6 max-w-md mx-auto lg:mx-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-mint-500 rounded-full flex items-center justify-center">
                      <PartyPopper className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">You're on the list!</h3>
                      <p className="text-mint-200 text-sm">We'll email you when we launch</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto lg:mx-0">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent"
                        disabled={status === 'loading'}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="px-8 py-4 bg-mint-500 hover:bg-mint-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </button>
                  </div>
                  {status === 'error' && (
                    <p className="mt-3 text-red-300 text-sm">{message}</p>
                  )}
                  <p className="mt-4 text-gray-400 text-sm">
                    🔒 No spam, ever. We'll only email you when the app launches.
                  </p>
                </form>
              )}

              {/* Social Proof */}
              <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {['😊', '🙂', '😄', '🤩', '😎'].map((emoji, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-lg border-2 border-white/30"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="text-gray-300">
                  <span className="font-bold text-white">500+</span> people waiting
                </span>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="bg-navy-800/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-xl border border-white/10">
                    <div className="flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5 text-mint-400" />
                      <span className="font-bold">Launching Soon</span>
                    </div>
                  </div>
                </div>

                <div className="w-72 h-[580px] bg-gradient-to-b from-white to-gray-100 rounded-[3rem] border-8 border-gray-300 shadow-2xl flex flex-col overflow-hidden opacity-80">
                  {/* Status bar */}
                  <div className="h-12 bg-navy-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">🚻 Where To Wee</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 bg-gray-100 p-4">
                    <div className="bg-white rounded-xl p-3 mb-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-navy-800">Costa Coffee</span>
                        <span className="text-sm text-mint-600">0.2 km</span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        <span className="bg-mint-100 text-mint-700 text-xs px-2 py-0.5 rounded-full">
                          Free
                        </span>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          ♿
                        </span>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 mb-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-navy-800">Public Toilet</span>
                        <span className="text-sm text-mint-600">0.4 km</span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                          20p
                        </span>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          ♿
                        </span>
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                          🍼
                        </span>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-navy-800">Sainsbury's</span>
                        <span className="text-sm text-mint-600">0.5 km</span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        <span className="bg-mint-100 text-mint-700 text-xs px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 3 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Bottom nav */}
                  <div className="h-16 bg-white border-t flex items-center justify-around px-4">
                    <div className="text-center">
                      <MapPin className="w-6 h-6 text-mint-500 mx-auto" />
                      <span className="text-xs text-mint-600 font-semibold">Map</span>
                    </div>
                    <div className="text-center">
                      <Star className="w-6 h-6 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500">Saved</span>
                    </div>
                    <div className="text-center">
                      <Bell className="w-6 h-6 text-gray-400 mx-auto" />
                      <span className="text-xs text-gray-500">Alerts</span>
                    </div>
                  </div>
                </div>
                {/* Decorative */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-mint-500/20 rounded-full blur-xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-mint-500/20 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early Bird Perks */}
      <section className="section bg-gradient-to-b from-amber-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold text-sm">Early Bird Perks</span>
            </div>
            <h2 className="text-3xl font-bold text-navy-800">Why Join the Waitlist?</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <ul className="space-y-4">
                {earlyBirdPerks.map((perk, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-mint-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="section">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-navy-800 text-center mb-12">
            What You'll Get
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="card text-center">
                <div className="w-14 h-14 bg-mint-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-mint-600" />
                </div>
                <h3 className="font-bold text-navy-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-navy-800 text-center mb-8">
              System Requirements
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  iOS
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-500" />
                    iOS 13.0 or later
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-500" />
                    iPhone, iPad, iPod touch
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-500" />
                    ~50 MB storage
                  </li>
                </ul>
              </div>
              <div className="card">
                <h3 className="font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Android
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-500" />
                    Android 6.0 or later
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-500" />
                    All Android phones & tablets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-mint-500" />
                    ~40 MB storage
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section bg-gradient-to-r from-navy-600 to-navy-800 text-white">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Clock className="w-4 h-4 text-mint-400" />
            <span className="text-sm font-semibold">Launching Very Soon</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Don't Miss the Launch!</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join our waitlist and be among the first to download Where To Wee when it's available.
          </p>
          {status === 'success' ? (
            <div className="inline-flex items-center gap-2 bg-mint-500 px-6 py-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">You're on the waitlist!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl bg-white text-navy-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-mint-400"
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-8 py-4 bg-mint-500 hover:bg-mint-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Join Waitlist'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
