import type { Metadata } from 'next';
import { Accessibility } from 'lucide-react';
import CategoryLandingPage from '@/components/CategoryLandingPage';

export const metadata: Metadata = {
  title: 'Changing Places Toilets UK — Find a Hoist & Adult-Changing Bench',
  description:
    'Find Changing Places toilets across the UK. Hoist, adult-changing bench, and more space than a standard accessible toilet. Updated by the disability community.',
  keywords: [
    'changing places toilets',
    'changing places near me',
    'changing places uk',
    'adult changing bench',
    'hoist toilet',
    'profound disability toilet',
    'accessible toilet with hoist',
  ],
  openGraph: {
    title: 'Changing Places Toilets UK — Find a Hoist Near You',
    description:
      'Changing Places facilities across the UK. Hoists, adult-changing benches, and more space — updated by the community.',
    url: 'https://wheretowee.uk/changing-places-uk',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changing Places Toilets UK',
    description: 'Find a Changing Places toilet near you — hoist, bench, more space.',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/changing-places-uk',
  },
};

export const revalidate = 3600;

export default function ChangingPlacesPage() {
  return (
    <CategoryLandingPage
      config={{
        kind: 'changing_places',
        HeroIcon: Accessibility,
        unitNoun: 'facilities',
        heading: 'Changing Places toilets across the UK',
        subheading: 'Hoists, adult-changing benches and the space families actually need',
        intro:
          'For around 250,000 people in the UK, a standard accessible toilet isn\'t enough — they need a Changing Places facility with a height-adjustable adult-sized changing bench, a ceiling hoist, and more floor space than a typical accessible cubicle provides. There are only around 1,700 Changing Places across the UK. Where To Wee\'s Changing Places directory pulls every listing tagged with a hoist from our community database, so families, carers and disabled people can plan a trip with confidence.',
        bodySections: [
          {
            heading: 'What makes a toilet a Changing Places?',
            body:
              'A genuine Changing Places facility meets the official specification set by the Changing Places Consortium. The essentials:\n\n• A height-adjustable, adult-sized changing bench (not a baby change unit).\n• A ceiling track hoist covering the WC, basin and bench.\n• Enough floor space for a wheelchair user plus two carers (12m² minimum).\n• A peninsular toilet that allows side-transfer.\n• A privacy screen or curtain.\n• A non-slip floor, with an emergency pull cord that reaches the floor.\n\nA toilet labelled "accessible" but lacking a hoist and adult bench is not a Changing Places, even if it\'s spacious. Where To Wee flags the hoist field explicitly so you can tell at a glance.',
          },
          {
            heading: 'Where to find Changing Places facilities',
            body:
              'Most Changing Places sit in venues where families and disabled adults need them most:\n\n• Big shopping centres (Westfield, Bluewater, Trafford Centre).\n• Major train stations and motorway services.\n• National museums and galleries (Tate, V&A, British Museum, National Gallery).\n• Theme parks, zoos and tourist attractions.\n• Some hospitals (especially specialist children\'s hospitals) and large council leisure centres.\n\nThe Changing Places Consortium maintains the canonical map at changing-places.org. Where To Wee mirrors that data alongside community-reported facilities so you have a single search for "Changing Places near me" that also picks up the newest installations.',
          },
          {
            heading: 'Help us close the gap',
            body:
              'There are only ~1,700 Changing Places for ~250,000 people in the UK who need them — a ratio that\'s nowhere near enough. The simplest way to help: if you spot a new Changing Places that\'s not on Where To Wee, add it via Submit a Toilet. If you see one with broken equipment, report it so the next family knows. And if you\'re a venue owner considering installing one, Mencap and the Changing Places Consortium have free design guidance — installing a Changing Places typically pays for itself in additional visits from disabled people and their families.',
          },
        ],
        faq: [
          {
            q: 'What is a Changing Places toilet?',
            a: 'A Changing Places toilet is a fully accessible facility with a ceiling hoist, height-adjustable adult-sized changing bench, more floor space than a standard accessible toilet, and a peninsular WC that allows side transfer. They\'re essential for people with profound and multiple disabilities.',
          },
          {
            q: 'How many Changing Places are there in the UK?',
            a: 'There are around 1,700 registered Changing Places across the UK — compared to ~250,000 people who need them. The number is growing thanks to the Changing Places Consortium, Mencap and government funding rounds, but coverage is still patchy outside major cities.',
          },
          {
            q: 'Where can I find a Changing Places near me?',
            a: 'Use the city directory below to browse our Changing Places listings, or search the canonical map at changing-places.org. The Where To Wee app and map will also show every Changing Places we know about within walking distance of your location.',
          },
          {
            q: 'Is a Changing Places the same as an accessible toilet?',
            a: 'No. A standard accessible toilet meets BS 8300 (wheelchair access, grab rails, emergency cord). A Changing Places adds a hoist, adult-changing bench, and significantly more space. If a venue tells you they have a Changing Places but it lacks the hoist and bench, it\'s not a genuine Changing Places.',
          },
          {
            q: 'Do I need a RADAR key for a Changing Places?',
            a: 'Most Changing Places facilities are RADAR-key controlled to protect the equipment. A single RADAR key opens any NKS-compliant Changing Places. See our RADAR Key guide for where to buy a genuine key.',
          },
        ],
        related: [
          { href: '/accessible-toilets-uk', title: 'Accessible toilets UK', description: 'Wheelchair-accessible loos with grab rails.' },
          { href: '/radar-key', title: 'About the RADAR key', description: 'How the National Key Scheme unlocks 10,000+ toilets.' },
          { href: '/toilet-tips', title: 'UK toilet tips', description: 'Practical guidance for finding loos on the move.' },
          { href: '/accessibility', title: 'Our accessibility commitment', description: 'How we keep accessibility data accurate.' },
        ],
      }}
    />
  );
}
