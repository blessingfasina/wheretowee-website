import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Accessibility,
  Baby,
  Coins,
  Clock,
  Smartphone,
  ChevronRight,
  Download,
  Search,
  CheckCircle2,
  Users,
  Shield,
} from 'lucide-react';
import DidYouKnow from '@/components/DidYouKnow';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://wheretowee.uk',
  },
};

// Stats - update these with real numbers
const stats = [
  { label: 'Toilets Listed', value: '18,000+' },
  { label: 'UK Cities Covered', value: '500+' },
  { label: 'Monthly Users', value: '50K+' },
  { label: 'User Ratings', value: '10K+' },
];

const features = [
  {
    icon: MapPin,
    title: 'Find Nearby',
    description: 'Instantly locate the closest public toilets wherever you are in the UK.',
  },
  {
    icon: Accessibility,
    title: 'Accessibility Info',
    description: 'Filter by wheelchair access, grab rails, and other accessibility features.',
  },
  {
    icon: Baby,
    title: 'Baby Changing',
    description: 'Find facilities with baby changing tables for parents on the go.',
  },
  {
    icon: Coins,
    title: 'Free vs Paid',
    description: 'Know upfront whether a toilet is free or requires payment.',
  },
  {
    icon: Clock,
    title: 'Opening Hours',
    description: 'Check if a toilet is open before you make the journey.',
  },
  {
    icon: Star,
    title: 'User Ratings',
    description: 'See cleanliness ratings and reviews from other users.',
  },
];

const cities = [
  { name: 'London', count: 2500 },
  { name: 'Birmingham', count: 450 },
  { name: 'Manchester', count: 380 },
  { name: 'Leeds', count: 320 },
  { name: 'Glasgow', count: 290 },
  { name: 'Liverpool', count: 260 },
  { name: 'Bristol', count: 240 },
  { name: 'Sheffield', count: 220 },
];

const howItWorks = [
  {
    step: 1,
    title: 'Download the App',
    description: 'Get Where To Wee free on the App Store or Google Play.',
  },
  {
    step: 2,
    title: 'Allow Location',
    description: 'Enable location services to find toilets near you automatically.',
  },
  {
    step: 3,
    title: 'Find & Go',
    description: 'Browse the map, filter by your needs, and get directions.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="gradient-hero text-white overflow-hidden">
        <div className="container-custom py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-mint-400 font-semibold text-sm">🇬🇧 #1 UK Toilet Finder</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Find Clean Toilets{' '}
                <span className="text-gradient">Near You</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Never get caught out again. Discover 18,000+ public toilets across the UK with
                accessibility info, ratings, and real-time availability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/download" className="btn btn-mint btn-lg">
                  <Download className="w-5 h-5" />
                  Download App
                </Link>
                <Link href="/map" className="btn btn-secondary btn-lg bg-transparent border-white text-white hover:bg-white/10">
                  <Search className="w-5 h-5" />
                  Use Web Version
                </Link>
              </div>
              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-300 ml-2">4.8 App Rating</span>
                </div>
              </div>
            </div>
            
            {/* Hero illustration/phone mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                {/* Phone mockup placeholder */}
                <div className="w-72 h-[580px] bg-gradient-to-b from-navy-500 to-navy-700 rounded-[3rem] border-8 border-navy-400 shadow-2xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-7xl mb-4">🚻</div>
                    <div className="text-2xl font-bold mb-2">Where To Wee</div>
                    <div className="text-gray-300 text-sm">App Preview</div>
                    <div className="mt-8 space-y-2">
                      <div className="bg-white/10 rounded-lg p-3 text-left">
                        <div className="text-sm font-semibold">Costa Coffee</div>
                        <div className="text-xs text-gray-400">0.2 km · Free · ♿</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-left">
                        <div className="text-sm font-semibold">Sainsbury's Local</div>
                        <div className="text-xs text-gray-400">0.4 km · Free · 🍼</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-left">
                        <div className="text-sm font-semibold">Public Toilet</div>
                        <div className="text-xs text-gray-400">0.5 km · 20p · ♿ 🍼</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-mint-500/20 rounded-full blur-xl" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-mint-500/20 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="h-16 md:h-24 bg-gradient-to-b from-transparent to-white" 
             style={{ clipPath: 'ellipse(75% 100% at 50% 100%)' }} />
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 -mt-8 relative z-10">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="card text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-navy-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
              Everything You Need to Find the Perfect Loo
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Packed with features to help you find clean, accessible toilets quickly and easily.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="card group hover:border-mint-500 border-2 border-transparent">
                <div className="w-12 h-12 bg-mint-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-mint-500 transition-colors">
                  <feature.icon className="w-6 h-6 text-mint-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Finding a toilet has never been easier
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="text-center relative">
                <div className="w-16 h-16 bg-navy-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-navy-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                {index < howItWorks.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-6 w-8 h-8 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-4">
              Find Toilets in Your City
            </h2>
            <p className="text-gray-600 text-lg">
              We cover all major UK cities and towns
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((city) => (
              <Link
                key={city.name}
                href={`/toilets/${city.name.toLowerCase()}`}
                className="card hover:border-mint-500 border-2 border-transparent group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-navy-800 group-hover:text-mint-600 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm text-gray-500">{city.count.toLocaleString()} toilets</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-mint-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/toilets" className="btn btn-secondary">
              View All Cities
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-800 mb-6">
                Why Choose Where To Wee?
              </h2>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, text: 'Largest UK toilet database with 18,000+ locations' },
                  { icon: Users, text: 'Community-driven with user ratings and reviews' },
                  { icon: Shield, text: 'Privacy-focused - no account required' },
                  { icon: Smartphone, text: 'Works offline once toilets are loaded' },
                  { icon: Accessibility, text: 'Best-in-class accessibility information' },
                  { icon: Coins, text: '100% free to use, no premium features' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <item.icon className="w-6 h-6 text-mint-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <DidYouKnow />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section gradient-hero text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Never Get Caught Out Again?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Download Where To Wee free on the App Store and Google Play.
            Or use our web version now to find toilets near you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/download" className="btn btn-mint btn-lg">
              <Download className="w-5 h-5" />
              Download App
            </Link>
            <Link href="/map" className="btn btn-lg bg-white/10 text-white hover:bg-white/20">
              <Search className="w-5 h-5" />
              Try Web Version
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

