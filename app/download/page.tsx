import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Smartphone,
  Star,
  Download,
  CheckCircle2,
  MapPin,
  Bell,
  WifiOff,
  Shield,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Download Where To Wee - Free Toilet Finder App for iOS & Android',
  description:
    'Download the free Where To Wee app for iOS and Android. Find public toilets near you with offline access, accessibility filters, and user ratings.',
  openGraph: {
    title: 'Download Where To Wee - Free Toilet Finder App',
    description: 'Get the free app to find public toilets near you. Available on iOS and Android.',
  },
};

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
    description: 'Get alerts when you\'re near your saved favourite toilets.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'No account required. Your data stays on your device.',
  },
];

const reviews = [
  {
    name: 'Sarah M.',
    rating: 5,
    text: 'As a mum with young kids, this app is a lifesaver! Always know where the nearest baby changing is.',
  },
  {
    name: 'David P.',
    rating: 5,
    text: 'Finally an app that shows wheelchair accessible toilets. Makes day trips so much easier.',
  },
  {
    name: 'Emma T.',
    rating: 5,
    text: 'Simple, fast, and actually works. Found a toilet in 2 minutes flat. Brilliant!',
  },
];

export default function DownloadPage() {
  return (
    <>
      {/* Hero */}
      <section className="gradient-hero text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold">Available on iOS & Android</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Download the <span className="text-mint-400">Free App</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Find clean, accessible public toilets wherever you are in the UK. Free to download,
                no account required.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold -mt-1">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h15c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5zm12.5-8.5l-6-6v12l6-6z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-semibold -mt-1">Google Play</div>
                  </div>
                </a>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-300">4.8 rating • 10K+ downloads</span>
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
            Why Download the App?
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

      {/* Reviews */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-navy-800 text-center mb-12">
            What Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div key={i} className="card">
                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{review.text}"</p>
                <p className="font-semibold text-navy-800">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="section">
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
      <section className="section bg-mint-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Never Get Caught Out Again?</h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Join thousands of users who always know where the nearest toilet is.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="btn btn-lg bg-white text-mint-600 hover:bg-gray-100"
            >
              <Download className="w-5 h-5" />
              Download for iOS
            </a>
            <a
              href="#"
              className="btn btn-lg bg-navy-600 text-white hover:bg-navy-700"
            >
              <Download className="w-5 h-5" />
              Download for Android
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

