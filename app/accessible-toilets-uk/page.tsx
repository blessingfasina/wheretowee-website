import type { Metadata } from 'next';
import { Accessibility } from 'lucide-react';
import CategoryLandingPage from '@/components/CategoryLandingPage';

export const metadata: Metadata = {
  title: 'Accessible Toilets UK — Wheelchair-Accessible Loos Near You',
  description:
    'Find wheelchair-accessible public toilets near you across the UK. Grab rails, RADAR-key locks, Changing Places hoists and more — 15,000+ locations, free to search.',
  keywords: [
    'accessible toilets uk',
    'wheelchair accessible toilets',
    'disabled toilets near me',
    'accessible loo uk',
    'disabled public toilets',
    'grab rail toilets',
    'changing places toilets',
    'radar key toilets',
  ],
  openGraph: {
    title: 'Accessible Toilets UK — Wheelchair-Accessible Loos',
    description:
      'Wheelchair-accessible public toilets across the UK with grab rails, RADAR-key info and Changing Places tags.',
    url: 'https://wheretowee.uk/accessible-toilets-uk',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessible Toilets UK',
    description: 'Wheelchair-accessible loos across the UK — RADAR-key, Changing Places and grab-rail info.',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/accessible-toilets-uk',
  },
};

export const revalidate = 3600;

export default function AccessibleToiletsPage() {
  return (
    <CategoryLandingPage
      config={{
        kind: 'accessible',
        HeroIcon: Accessibility,
        heading: 'Accessible toilets across the UK',
        subheading: 'Wheelchair access, grab rails, RADAR key and Changing Places',
        intro:
          'Where To Wee\'s accessible-toilet directory lists every wheelchair-accessible loo our community has confirmed across the UK. Each listing flags grab rails, RADAR-key requirements, and (where available) Changing Places features like a ceiling hoist and adult-sized changing bench. We carry council-verified facilities, partner-imported datasets, and community confirmations — so you can see at a glance how trusted the accessibility info is.',
        bodySections: [
          {
            heading: 'What "accessible toilet" actually means',
            body:
              'In the UK, an "accessible toilet" typically refers to a wheelchair-accessible cubicle that meets the BS 8300 standard: step-free access, adequate turning space (1.5m diameter), grab rails on at least one side of the WC, a low-level basin, and an emergency pull cord that reaches the floor.\n\nA "Changing Places toilet" is a step beyond — these have a height-adjustable adult-sized changing bench, a ceiling hoist, more floor space, and a privacy screen. They\'re essential for people with profound and multiple disabilities. There are only around 1,700 Changing Places in the UK (vs ~250,000 people who need them), so finding one matters. Where To Wee tags them explicitly on the toilet detail page.',
          },
          {
            heading: 'RADAR key & the National Key Scheme',
            body:
              'A single RADAR key (the National Key Scheme) unlocks more than 10,000 accessible toilets across the UK — in shopping centres, train stations, motorway services, council buildings and more. Listings tagged "RADAR key required" need your key to enter. If you\'re eligible (anyone with a disability or long-term illness that requires an accessible toilet), a genuine key is around £5 from Disability Rights UK.\n\nSee our full RADAR Key guide for who can buy one, where to get a genuine key, and how the scheme works.',
          },
          {
            heading: 'How we keep accessibility data trustworthy',
            body:
              'Inaccurate accessibility info isn\'t just inconvenient — it can ruin someone\'s day. Each listing on Where To Wee carries a verification badge:\n\n• Council verified — imported from a local authority or trusted partner dataset.\n• Community verified — confirmed by three or more users (or admin-flagged).\n• Recently confirmed — visited and confirmed by the community in the last 30 days.\n\nWe also surface a 0-100 confidence score that aggregates upstream verification, community confirmations, freshness and ratings. Toilets nobody has confirmed yet show a "Help us verify this loo" prompt instead — so you always know what you\'re looking at.',
          },
        ],
        faq: [
          {
            q: 'How do I find accessible toilets near me in the UK?',
            a: 'Open the Where To Wee map and apply the "Accessible" filter, or browse our city directory below. Every wheelchair-accessible toilet shows grab-rail info, RADAR-key requirements, and where available Changing Places tags.',
          },
          {
            q: 'What is the difference between an accessible toilet and a Changing Places?',
            a: 'A standard accessible toilet is wheelchair-accessible with grab rails. A Changing Places toilet adds a height-adjustable adult-sized changing bench, a ceiling hoist, and more floor space. Changing Places facilities are essential for people with profound disabilities and there are fewer of them — about 1,700 across the UK.',
          },
          {
            q: 'Do I need a RADAR key to use accessible toilets?',
            a: 'Many accessible toilets are unlocked (typically in shopping centres, supermarkets and restaurants). Others — usually unattended public conveniences and high-traffic facilities — require a RADAR key. Where To Wee flags every RADAR-locked listing so you know before you go.',
          },
          {
            q: 'Where can I buy a RADAR key?',
            a: 'A genuine RADAR key is around £5 from Disability Rights UK, who administer the scheme. They\'re also widely available from major pharmacies and disability-focused retailers. See our RADAR Key guide for details and to avoid counterfeit keys.',
          },
          {
            q: 'How can I report a broken or inaccessible toilet?',
            a: 'Tap "Report" on the toilet detail page in our app. Your report contributes to the confidence score and helps the next visitor know what to expect. Council-verified toilets also get re-checked periodically by our team.',
          },
        ],
        related: [
          { href: '/changing-places-uk', title: 'Changing Places toilets UK', description: 'Hoists, adult changing benches, more space.' },
          { href: '/radar-key', title: 'About the RADAR key', description: 'National Key Scheme explainer + where to buy.' },
          { href: '/radar-key-toilets-uk', title: 'RADAR key toilet locations', description: 'Every RADAR-key listing in our database, by city.' },
          { href: '/free-public-toilets', title: 'Free public toilets near me', description: 'No-fee public conveniences across the UK.' },
        ],
      }}
    />
  );
}
