import type { Metadata } from 'next';
import Link from 'next/link';
import { ToiletTipsImpression } from '@/components/PageImpression';
import {
  Car,
  ShoppingBag,
  Accessibility,
  Building2,
  Fuel,
  TrainFront,
  Footprints,
  Store,
  ShoppingCart,
  Coffee,
  KeyRound,
  HeartPulse,
  Library,
  Landmark,
  Building,
  PersonStanding,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Toilet Tips & UK Travel Advice — Where To Find Free Toilets',
  description:
    'Practical tips for finding free public toilets in the UK. Motorway services, train stations, shopping centres, libraries, hospitals and accessible facilities — where to go when you\'re caught short.',
  keywords: [
    'where to find toilets',
    'free public toilets UK',
    'toilets in shopping centres',
    'motorway services toilets',
    'train station toilets',
    'changing places',
    'NHS hospital toilets',
    'library toilets UK',
    'department store toilets',
    'public toilets advice',
  ],
  openGraph: {
    title: 'Toilet Tips & UK Travel Advice — Where To Find Free Toilets',
    description:
      'A practical guide to finding free, accessible toilets across the UK — on the move, on the high street, and in inclusive facilities.',
    url: 'https://wheretowee.uk/toilet-tips',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Toilet Tips & UK Travel Advice',
    description: 'Where to find free, clean, accessible toilets across the UK — a practical guide.',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/toilet-tips',
  },
};

interface Tip {
  icon: React.ElementType;
  title: string;
  body: string;
}

interface TipCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentBg: string;
  accentText: string;
  tips: Tip[];
}

// Ports the content from lib/data/toilet_tips_content.dart so the
// website and mobile app render the same guidance. Mirroring the
// `kToiletTipCategories` list one-to-one keeps copy in sync without
// a separate CMS.
const CATEGORIES: TipCategory[] = [
  {
    id: 'on-the-move',
    title: 'On the move',
    subtitle: 'Plan ahead when travelling',
    icon: Car,
    accentBg: 'bg-sky-100',
    accentText: 'text-sky-700',
    tips: [
      {
        icon: Fuel,
        title: 'Motorway services',
        body:
          'All UK motorway service areas are required to keep public toilets open 24/7, free of charge, even when the shops are closed. Look for the blue "WC" signs from the slip road.',
      },
      {
        icon: TrainFront,
        title: 'Train stations',
        body:
          'Major stations (London termini, Manchester Piccadilly, Edinburgh Waverley, etc.) have toilets — most are now free since the 2019 Network Rail policy change. Smaller stations sometimes only open with the ticket office.',
      },
      {
        icon: Footprints,
        title: 'Walking route tip',
        body:
          'Public parks, council buildings and libraries usually have free toilets. Plan a longer walk around these landmarks rather than relying on shops along the way.',
      },
    ],
  },
  {
    id: 'shopping-high-streets',
    title: 'Shopping & high streets',
    subtitle: 'Where to find toilets in town',
    icon: ShoppingBag,
    accentBg: 'bg-pink-100',
    accentText: 'text-pink-700',
    tips: [
      {
        icon: Store,
        title: 'Department stores',
        body:
          'John Lewis, Marks & Spencer, House of Fraser and Debenhams all keep customer toilets — usually on an upper floor near the cafe. You don\'t need to buy anything to use them.',
      },
      {
        icon: ShoppingCart,
        title: 'Shopping centres',
        body:
          'Shopping centres like Westfield, Bluewater and the Trafford Centre have signposted facilities including accessible and baby-change rooms. Most are open until 21:00 or later.',
      },
      {
        icon: Coffee,
        title: 'Coffee shops',
        body:
          'Most chain coffee shops (Costa, Starbucks, Pret, Caffè Nero) keep their toilets for customers only and now ask for a code or app receipt. Sometimes staff will share the code if you ask politely.',
      },
    ],
  },
  {
    id: 'accessible-inclusive',
    title: 'Accessible & inclusive',
    subtitle: 'Resources for accessible facilities',
    icon: Accessibility,
    accentBg: 'bg-mint-100',
    accentText: 'text-mint-700',
    tips: [
      {
        icon: KeyRound,
        title: 'RADAR key network',
        body:
          'A single RADAR key (National Key Scheme) unlocks 10,000+ accessible toilets across the UK. Look for the "RADAR Key Required" badge on a listing in Where To Wee.',
      },
      {
        icon: PersonStanding,
        title: 'Changing Places',
        body:
          'Changing Places facilities offer a hoist, adult-sized changing bench and more space than a standard accessible toilet. They\'re a lifeline for people with profound and multiple disabilities — we flag them in the app where available.',
      },
      {
        icon: HeartPulse,
        title: 'Hospitals',
        body:
          'NHS hospitals are required to provide free public toilets 24/7 in their main entrance areas. They\'re usually well signposted and many have accessible cubicles and baby-change rooms.',
      },
    ],
  },
  {
    id: 'public-buildings',
    title: 'Public buildings',
    subtitle: 'Free, no-questions-asked options',
    icon: Building2,
    accentBg: 'bg-amber-100',
    accentText: 'text-amber-700',
    tips: [
      {
        icon: Library,
        title: 'Public libraries',
        body:
          'Libraries are an under-used resource: free toilets, usually with accessible cubicles, and no expectation that you buy anything or check in.',
      },
      {
        icon: Landmark,
        title: 'Museums & galleries',
        body:
          'Free national museums (Tate, V&A, British Museum, National Gallery) have free toilets too. You don\'t need a ticket to enter the foyer in most cases.',
      },
      {
        icon: Building,
        title: 'Council buildings',
        body:
          'Town halls, civic centres and council customer-service points have public toilets during office hours. Useful on weekdays in town centres where commercial options are scarce.',
      },
    ],
  },
];

export default function ToiletTipsPage() {
  return (
    <>
      <ToiletTipsImpression />
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Toilet Tips</span>
          </nav>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-white/10 rounded-2xl p-3 flex-shrink-0">
              <Lightbulb className="w-10 h-10 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                Toilet tips &amp; UK travel advice
              </h1>
              <p className="text-lg text-gray-300">
                Where to go when you&apos;re caught short
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-200 max-w-2xl">
            A practical guide to finding free, clean, accessible toilets across the UK —
            on the road, on the high street, and in inclusive facilities.
          </p>
        </div>
      </section>

      {/* Category nav */}
      <section className="py-6 bg-white border-b sticky top-16 md:top-20 z-40 hidden md:block">
        <div className="container-custom">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm font-semibold text-gray-500 flex-shrink-0">Jump to:</span>
            {CATEGORIES.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${cat.accentBg} ${cat.accentText} hover:opacity-80 flex-shrink-0`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container-custom max-w-4xl">
          {CATEGORIES.map((cat, idx) => {
            const CatIcon = cat.icon;
            return (
              <div
                key={cat.id}
                id={cat.id}
                className={idx > 0 ? 'mt-12 scroll-mt-24' : 'scroll-mt-24'}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${cat.accentBg} ${cat.accentText} rounded-xl p-2.5`}>
                    <CatIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-navy-800">
                      {cat.title}
                    </h2>
                    <p className="text-gray-500">{cat.subtitle}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-5">
                  {cat.tips.map((tip) => {
                    const TipIcon = tip.icon;
                    return (
                      <div key={tip.title} className="card">
                        <div className={`${cat.accentBg} ${cat.accentText} rounded-lg p-2 inline-flex mb-3`}>
                          <TipIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-navy-800 mb-2">{tip.title}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{tip.body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Cross-link to RADAR + city directory */}
          <div className="mt-12 grid md:grid-cols-2 gap-4">
            <Link
              href="/radar-key"
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">
                    About the RADAR key
                  </h3>
                  <p className="text-sm text-gray-600">
                    How the National Key Scheme works and where to buy a genuine key.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
            <Link
              href="/toilets"
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-mint-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">
                    Find a toilet near me
                  </h3>
                  <p className="text-sm text-gray-600">
                    Browse our city directory of 15,000+ UK toilets.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD: Article + ItemList of tips for richer SERPs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            '@id': 'https://wheretowee.uk/toilet-tips',
            headline: 'Toilet Tips & UK Travel Advice — Where To Find Free Toilets',
            description:
              'A practical guide to finding free, clean, accessible toilets across the UK — on the move, on the high street, and in inclusive facilities.',
            author: { '@type': 'Organization', name: 'Where To Wee' },
            publisher: {
              '@type': 'Organization',
              name: 'Where To Wee',
              logo: { '@type': 'ImageObject', url: 'https://wheretowee.uk/icon-512.png' },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wheretowee.uk/toilet-tips' },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wheretowee.uk' },
              { '@type': 'ListItem', position: 2, name: 'Toilet Tips', item: 'https://wheretowee.uk/toilet-tips' },
            ],
          }),
        }}
      />
      {/*
        HowTo schema per category. Google's classic HowTo rich result
        was retired for most queries in late-2023, but the markup still
        contributes to semantic understanding and powers some answer-
        box treatments — and it costs us nothing to keep emitting it.
      */}
      {CATEGORIES.map((cat) => (
        <script
          key={cat.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: `How to find a toilet — ${cat.title.toLowerCase()}`,
              description: cat.subtitle,
              totalTime: 'PT5M',
              step: cat.tips.map((t, i) => ({
                '@type': 'HowToStep',
                position: i + 1,
                name: t.title,
                text: t.body,
                url: `https://wheretowee.uk/toilet-tips#${cat.id}`,
              })),
            }),
          }}
        />
      ))}
    </>
  );
}
