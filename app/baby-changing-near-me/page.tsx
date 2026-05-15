import type { Metadata } from 'next';
import { Baby } from 'lucide-react';
import CategoryLandingPage from '@/components/CategoryLandingPage';

export const metadata: Metadata = {
  title: 'Baby Changing Near Me — Find Baby Change Facilities Across the UK',
  description:
    'Find baby changing facilities near you across the UK. Mums, dads and carers — see baby change tables in shopping centres, supermarkets, libraries and family rooms.',
  keywords: [
    'baby changing near me',
    'baby change facilities',
    'baby change near me',
    'baby changing uk',
    'nappy change near me',
    'family room near me',
    'baby change shopping centre',
  ],
  openGraph: {
    title: 'Baby Changing Near Me — UK Directory',
    description:
      'Find baby change tables and family rooms across the UK — shopping centres, supermarkets, libraries and more.',
    url: 'https://wheretowee.uk/baby-changing-near-me',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baby Changing Near Me',
    description: 'Find baby change facilities across the UK in seconds.',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/baby-changing-near-me',
  },
};

export const revalidate = 3600;

export default function BabyChangingPage() {
  return (
    <CategoryLandingPage
      config={{
        kind: 'baby_changing',
        HeroIcon: Baby,
        unitNoun: 'facilities',
        heading: 'Baby changing facilities near you',
        subheading: 'For mums, dads, carers and very small humans on the move',
        intro:
          'Every parent and carer has been there: a small human suddenly needs a change, and the nearest baby change table feels miles away. Where To Wee\'s baby-changing directory lists every toilet in our UK database that has a baby change unit — shopping centres, supermarkets, libraries, family rooms and dedicated parents\' areas. Every listing shows whether the facility is in the ladies\', gents\', or a dedicated family / accessible room, so dads and same-gender parents aren\'t caught out.',
        bodySections: [
          {
            heading: 'Where to find baby changing in the UK',
            body:
              'A few patterns work everywhere:\n\n• Shopping centres almost always have signposted baby change rooms — most also have feeding chairs and a microwave.\n• Big-format supermarkets (Sainsbury\'s, Tesco, Asda, Morrisons) keep customer toilets with baby change. You don\'t need to buy anything.\n• Department stores (John Lewis, M&S) have well-equipped family rooms, usually on an upper floor near the cafe.\n• Most NHS hospital main entrance toilets have baby change, free and open 24/7.\n• Libraries are an underused gem — quiet, clean, no expectation that you spend.\n• National museums (Tate, V&A, British Museum) have free family facilities — you don\'t need a museum ticket.',
          },
          {
            heading: 'For dads, same-gender parents and carers',
            body:
              'Until recently, "baby change" usually meant inside the ladies\'. That has changed — many newer facilities have baby change in both gents\' and ladies\', or in a separate gender-neutral family room. Where To Wee tags the room type wherever the data is available so you know before you go.\n\nIf you find a baby change unit in the gents\' that\'s not listed on Where To Wee, please submit it — visibility for dad-accessible facilities is steadily improving and crowd-sourced data is part of how that happens.',
          },
          {
            heading: 'Why we tag baby change separately from accessibility',
            body:
              'Some accessible (RADAR-key) toilets include a baby change unit, but a baby change is NOT the same as an adult-sized Changing Places bench. We tag them as separate fields on each listing so families looking for either can filter accurately. If you\'re looking for an adult-sized changing bench (for older children or disabled adults), see our Changing Places page.',
          },
        ],
        faq: [
          {
            q: 'Where can I find baby changing near me?',
            a: 'Browse by city below, open our map at wheretowee.uk/map with the "Baby Change" filter, or download the app for the fastest experience. Every listing shows whether the baby change is in the ladies\', gents\', or a separate family / accessible room.',
          },
          {
            q: 'Do supermarkets have baby changing?',
            a: 'Most big-format supermarkets do — Sainsbury\'s, Tesco, Asda, Morrisons, Waitrose. Smaller convenience stores typically don\'t. You don\'t need to buy anything to use the facilities.',
          },
          {
            q: 'Are baby change units in men\'s toilets?',
            a: 'Increasingly yes. Shopping centres, motorway services, supermarkets and newer council facilities often have baby change in both ladies\' and gents\', or in a separate gender-neutral family room. Where To Wee flags this where the data is available.',
          },
          {
            q: 'Is the same thing as a Changing Places toilet?',
            a: 'No. A baby change is a small table for changing infants and toddlers. A Changing Places is a fully accessible toilet with a hoist and adult-sized changing bench — for older children and adults with profound disabilities. We track them separately. See our Changing Places page for details.',
          },
          {
            q: 'What if there\'s baby change at a location but it\'s not on Where To Wee?',
            a: 'Add it via Submit a Toilet — your contribution helps other parents and carers across the UK. Include where the baby change is located (ladies\'/gents\'/family room) and whether it\'s clean and stocked.',
          },
        ],
        related: [
          { href: '/free-public-toilets', title: 'Free public toilets near me', description: 'No-fee public conveniences across the UK.' },
          { href: '/accessible-toilets-uk', title: 'Accessible toilets UK', description: 'Wheelchair-accessible loos with grab rails.' },
          { href: '/changing-places-uk', title: 'Changing Places toilets', description: 'Hoists and adult-changing benches for older children and disabled adults.' },
          { href: '/toilet-tips', title: 'UK toilet tips', description: 'Practical guidance for finding loos on the move.' },
        ],
      }}
    />
  );
}
