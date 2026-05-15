import type { Metadata } from 'next';
import { Key } from 'lucide-react';
import CategoryLandingPage from '@/components/CategoryLandingPage';

export const metadata: Metadata = {
  title: 'RADAR Key Toilet Locations UK — Where to Use Your National Key',
  description:
    'Find every RADAR key (National Key Scheme) accessible toilet location across the UK. Updated by the community — shopping centres, train stations, motorway services and more.',
  keywords: [
    'radar key toilets uk',
    'radar key locations',
    'national key scheme toilets',
    'NKS toilet uk',
    'radar key accessible toilet',
    'where to use radar key',
  ],
  openGraph: {
    title: 'RADAR Key Toilet Locations Across the UK',
    description:
      'Every RADAR-key locked accessible toilet in our database. Updated daily by the disability community.',
    url: 'https://wheretowee.uk/radar-key-toilets-uk',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RADAR Key Toilet Locations UK',
    description: 'Find every NKS-locked toilet across the UK in one place.',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/radar-key-toilets-uk',
  },
};

export const revalidate = 3600;

export default function RadarKeyToiletsPage() {
  return (
    <CategoryLandingPage
      config={{
        kind: 'radar_key',
        HeroIcon: Key,
        heading: 'Where to use your RADAR key — UK locations',
        subheading: 'Every National Key Scheme toilet in our database',
        intro:
          'A single RADAR key (the National Key Scheme) unlocks over 10,000 accessible toilets across the UK. Where To Wee\'s RADAR-key directory lists every toilet our community has tagged as requiring an NKS key — in shopping centres, train stations, motorway services, council buildings, parks, museums and more. Each listing shows accessibility info, opening hours and one-tap directions so you can plan a day out with confidence.',
        bodySections: [
          {
            heading: 'How the National Key Scheme works',
            body:
              'The National Key Scheme (NKS) was created so that accessible toilets could stay clean, available, and protected from misuse. Every NKS-compliant lock takes the same key, so you only ever need to carry one. If you\'re eligible — anyone with a disability or long-term illness that requires an accessible toilet — a genuine RADAR key is around £5 from Disability Rights UK, the charity that administers the scheme.\n\nThere\'s no formal qualifying process; keys are sold on a self-declaration basis. To claim VAT relief, suppliers will ask you to confirm a qualifying condition. See our RADAR Key guide for the full breakdown.',
          },
          {
            heading: 'Where you\'ll find RADAR-locked toilets',
            body:
              'A RADAR key is your master key for accessible toilets in:\n\n• Shopping centres (almost all of the major ones).\n• Train stations and major bus stations.\n• Motorway services and A-road service areas.\n• Council-run public conveniences in parks and town centres.\n• Some hospitals and council customer-service buildings.\n• National Trust, English Heritage and big tourist attractions.\n• Some private venues — pubs, restaurants and theatres are increasingly joining the scheme.\n\nNot every accessible toilet is RADAR-locked. Many in supermarkets, restaurants and shopping centres are unlocked. Where To Wee tags both types so you can plan accordingly.',
          },
          {
            heading: 'Buying a genuine RADAR key',
            body:
              'The official source is Disability Rights UK at disabilityrightsuk.org. Keys are also widely available from major pharmacies (Boots, Lloyds), Amazon, eBay, and disability-focused retailers.\n\nBe careful of suspiciously cheap counterfeit keys on Amazon and eBay — they sometimes don\'t fit every NKS lock. The official key is around £5 and guarantees compatibility. See our RADAR Key guide for who\'s eligible, where to buy, and how the scheme works.',
          },
        ],
        faq: [
          {
            q: 'Where can I use my RADAR key?',
            a: 'A RADAR key opens any toilet fitted with an NKS-compliant lock — over 10,000 across the UK, including shopping centres, train stations, motorway services, council buildings and parks. Where To Wee shows every RADAR-locked listing we know about.',
          },
          {
            q: 'How much does a RADAR key cost?',
            a: 'A genuine RADAR key is around £5 from the official supplier (Disability Rights UK), with VAT relief available if you have a qualifying condition. High-street pharmacies sell them at a similar price.',
          },
          {
            q: 'Do I need proof of disability to buy a RADAR key?',
            a: 'No. Keys are sold on a self-declaration basis. To claim VAT relief, suppliers will ask you to confirm a qualifying condition.',
          },
          {
            q: 'Are RADAR-key toilets free to use?',
            a: 'Yes. NKS-locked toilets are free to use once you have a key — there\'s no separate fee on top.',
          },
          {
            q: 'What if a RADAR-locked toilet is broken or dirty?',
            a: 'Report it to the venue or council that operates the toilet — most NKS-locked toilets carry a small plaque with the operator\'s contact details. You can also flag the listing in Where To Wee so other users know about the issue.',
          },
          {
            q: 'Can I buy a RADAR key on Amazon?',
            a: 'Yes, but be cautious — there are counterfeit keys on Amazon and eBay that don\'t fit every NKS lock. The official Disability Rights UK key is your safest bet for a guaranteed working key.',
          },
        ],
        related: [
          { href: '/radar-key', title: 'About the RADAR key', description: 'Full National Key Scheme explainer + where to buy.' },
          { href: '/accessible-toilets-uk', title: 'Accessible toilets UK', description: 'Wheelchair-accessible loos across the UK.' },
          { href: '/changing-places-uk', title: 'Changing Places toilets', description: 'Hoists, adult changing benches, more space.' },
          { href: '/toilet-tips', title: 'UK toilet tips', description: 'Practical guidance for finding loos on the move.' },
        ],
      }}
    />
  );
}
