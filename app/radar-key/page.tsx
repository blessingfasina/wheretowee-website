import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Key,
  HelpCircle,
  User,
  ShoppingBag,
  Unlock,
  ExternalLink,
  Accessibility,
  ChevronRight,
} from 'lucide-react';
import { RadarKeyImpression, RadarKeyExternalLink } from '@/components/PageImpression';

export const metadata: Metadata = {
  title: 'RADAR Key Guide — National Key Scheme for UK Accessible Toilets',
  description:
    'What is a RADAR key? Who can buy one? Where to get a genuine RADAR key (£5) and how it unlocks 10,000+ accessible UK toilets. Full National Key Scheme guide.',
  keywords: [
    'radar key',
    'national key scheme',
    'where to buy radar key',
    'radar key cost',
    'accessible toilet key',
    'NKS key',
    'disability toilet key UK',
    'radar key disability',
    'accessible toilets UK',
  ],
  openGraph: {
    title: 'RADAR Key Guide — National Key Scheme for UK Accessible Toilets',
    description:
      'Everything you need to know about the RADAR key: cost, eligibility, where to buy, and how it unlocks 10,000+ accessible UK toilets.',
    url: 'https://wheretowee.uk/radar-key',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RADAR Key Guide — National Key Scheme',
    description:
      'One key unlocks 10,000+ accessible toilets across the UK. Here\'s everything you need to know.',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/radar-key',
  },
};

interface InfoBlock {
  icon: React.ElementType;
  title: string;
  body: string;
}

const blocks: InfoBlock[] = [
  {
    icon: HelpCircle,
    title: 'What is it?',
    body:
      'The RADAR key (officially the National Key Scheme, or NKS) unlocks over 10,000 accessible toilets across the UK — in shopping centres, train stations, motorway services, council buildings and more. The single key fits all NKS-compliant locks, so you only ever need to carry one.',
  },
  {
    icon: User,
    title: 'Who can use one?',
    body:
      'Anyone with a disability, long-term illness or condition that means they need access to an accessible toilet. There is no formal qualifying process — buying a key is on a self-declaration basis, and most suppliers sell them VAT-free if you have a relevant condition.',
  },
  {
    icon: ShoppingBag,
    title: 'Where to buy a genuine RADAR key',
    body:
      'The official source is Disability Rights UK, the charity that administers the scheme. Keys are also widely available from major pharmacies (Boots, Lloyds), Amazon, eBay, and disability-focused retailers. Expect to pay around £5 for a genuine key — be wary of suspiciously cheap counterfeit keys that may not fit every lock.',
  },
  {
    icon: Unlock,
    title: 'How to spot a RADAR-locked toilet',
    body:
      'Look for a small round keyhole on or beside the door of an accessible cubicle, often with a "National Key Scheme" or "RADAR" plaque nearby. In the Where To Wee app and website, any listing tagged "RADAR Key Required" needs your key — we surface this on every toilet card so you can plan ahead.',
  },
];

export default function RadarKeyPage() {
  return (
    <>
      <RadarKeyImpression />
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>RADAR Key Guide</span>
          </nav>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-white/10 rounded-2xl p-3 flex-shrink-0">
              <Key className="w-10 h-10 text-mint-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                RADAR Key Guide
              </h1>
              <p className="text-lg text-gray-300">
                National Key Scheme — UK accessible toilets
              </p>
            </div>
          </div>
          <p className="text-lg text-gray-200 max-w-2xl">
            One small key unlocks more than <strong>10,000 accessible toilets</strong>
            {' '}across the UK. Here&apos;s what it is, who can get one, and where to buy
            a genuine RADAR key for around £5.
          </p>
        </div>
      </section>

      {/* Quick facts strip */}
      <section className="py-6 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy-600">10,000+</div>
              <div className="text-gray-600 text-sm">Accessible toilets unlocked</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-mint-600">£5</div>
              <div className="text-gray-600 text-sm">Approx. price of a genuine key</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-orange-600">1</div>
              <div className="text-gray-600 text-sm">Key fits every NKS lock in the UK</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600">VAT-free</div>
              <div className="text-gray-600 text-sm">For qualifying conditions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Info blocks */}
      <section className="section">
        <div className="container-custom max-w-3xl">
          <div className="grid gap-6">
            {blocks.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="card flex gap-4 items-start">
                  <div className="bg-blue-50 rounded-lg p-3 flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy-800 mb-2">{b.title}</h2>
                    <p className="text-gray-700 leading-relaxed">{b.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Learn-more CTA */}
          <div className="card mt-6 bg-blue-50 border-blue-200 border text-center">
            <h2 className="text-xl font-bold text-navy-800 mb-2">
              Buy a genuine RADAR key
            </h2>
            <p className="text-gray-700 mb-4">
              Disability Rights UK is the charity that administers the National Key Scheme.
              Buying directly supports their advocacy work and guarantees a working key.
            </p>
            <RadarKeyExternalLink
              href="https://www.disabilityrightsuk.org/get-radar-key"
              className="btn btn-primary"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Disability Rights UK
            </RadarKeyExternalLink>
            <p className="text-xs text-gray-500 mt-4 max-w-md mx-auto">
              Where To Wee is not affiliated with Disability Rights UK. We surface scheme
              information to help users plan their visits.
            </p>
          </div>

          {/* Cross-link to the rest of the site */}
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            <Link
              href="/toilets"
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <Accessibility className="w-6 h-6 text-mint-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">
                    Find an accessible toilet
                  </h3>
                  <p className="text-sm text-gray-600">
                    Browse our city directory of 15,000+ UK toilets.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
            <Link
              href="/toilet-tips"
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-navy-800 group-hover:text-navy-900">
                    Toilet tips &amp; travel advice
                  </h3>
                  <p className="text-sm text-gray-600">
                    Practical guidance for finding toilets on the move.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ section — pulls double duty as on-page FAQ + schema-rich result */}
      <section className="section bg-gray-50">
        <div className="container-custom max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            <FAQ
              q="How much does a RADAR key cost?"
              a="A genuine RADAR key costs around £5 from the official supplier (Disability Rights UK), with VAT relief available if you have a qualifying condition. High-street pharmacies sell them for a similar price."
            />
            <FAQ
              q="Where can I use my RADAR key?"
              a="The key opens any toilet that has been fitted with an NKS-compliant lock — over 10,000 toilets across the UK. This includes facilities in shopping centres, train stations, motorway services, council buildings, parks, and some private venues."
            />
            <FAQ
              q="Do I need proof of disability to buy a RADAR key?"
              a="No. Keys are sold on a self-declaration basis. To claim VAT relief, suppliers will ask you to confirm a qualifying condition."
            />
            <FAQ
              q="Can I buy a RADAR key on Amazon?"
              a="Yes, but be cautious — there are counterfeit keys on Amazon that don't fit every NKS lock. The official Disability Rights UK key is your safest bet for a guaranteed working key."
            />
            <FAQ
              q="What if a RADAR-locked toilet is broken or dirty?"
              a="Report it to the venue or council that operates the toilet. You can also flag the listing in Where To Wee so other users know about the issue."
            />
          </div>
        </div>
      </section>

      {/* JSON-LD: Article + FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            '@id': 'https://wheretowee.uk/radar-key',
            headline: 'RADAR Key Guide — National Key Scheme for UK Accessible Toilets',
            description:
              'Everything you need to know about the RADAR key: cost, eligibility, where to buy, and how it unlocks 10,000+ accessible UK toilets.',
            author: { '@type': 'Organization', name: 'Where To Wee' },
            publisher: {
              '@type': 'Organization',
              name: 'Where To Wee',
              logo: { '@type': 'ImageObject', url: 'https://wheretowee.uk/icon-512.png' },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wheretowee.uk/radar-key' },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How much does a RADAR key cost?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'A genuine RADAR key costs around £5 from the official supplier (Disability Rights UK), with VAT relief available if you have a qualifying condition.',
                },
              },
              {
                '@type': 'Question',
                name: 'Where can I use my RADAR key?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'The key opens any toilet fitted with an NKS-compliant lock — over 10,000 across the UK, including shopping centres, train stations, motorway services, council buildings and parks.',
                },
              },
              {
                '@type': 'Question',
                name: 'Do I need proof of disability to buy a RADAR key?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'No. Keys are sold on a self-declaration basis. VAT relief requires confirming a qualifying condition.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I buy a RADAR key on Amazon?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text:
                    'Yes, but be cautious of counterfeit keys. The official Disability Rights UK key is the safest option for a guaranteed working key.',
                },
              },
            ],
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
              { '@type': 'ListItem', position: 2, name: 'RADAR Key Guide', item: 'https://wheretowee.uk/radar-key' },
            ],
          }),
        }}
      />
    </>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="card group">
      <summary className="cursor-pointer font-bold text-navy-800 list-none flex items-center justify-between">
        <span>{q}</span>
        <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
      </summary>
      <p className="mt-3 text-gray-700 leading-relaxed">{a}</p>
    </details>
  );
}
