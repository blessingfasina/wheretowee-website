import type { Metadata } from 'next';
import { Coins } from 'lucide-react';
import CategoryLandingPage from '@/components/CategoryLandingPage';

export const metadata: Metadata = {
  title: 'Free Public Toilets Near Me — UK Map & City Directory',
  description:
    'Find free public toilets near you across the UK. 18,000+ locations including council loos, supermarkets, libraries and hospitals. No fee, no sign-up.',
  keywords: [
    'free public toilets near me',
    'free toilets uk',
    'where can I find a free toilet',
    'free public toilets london',
    'no charge public toilet',
    'free council toilets',
    'public conveniences uk',
  ],
  openGraph: {
    title: 'Free Public Toilets Near Me — UK Directory',
    description:
      'Free public toilets across the UK with accessibility info, opening hours and directions. 18,000+ locations, no sign-up.',
    url: 'https://wheretowee.uk/free-public-toilets',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Public Toilets Near Me — UK Directory',
    description: 'Free public toilets across the UK — find the nearest one in seconds.',
  },
  alternates: {
    canonical: 'https://wheretowee.uk/free-public-toilets',
  },
};

export const revalidate = 3600;

export default function FreePublicToiletsPage() {
  return (
    <CategoryLandingPage
      config={{
        kind: 'free',
        HeroIcon: Coins,
        heading: 'Free public toilets near me',
        subheading: 'No fee, no sign-up, no fuss',
        intro:
          'Need a free public toilet right now? Where To Wee lists thousands of free public toilets across the UK — from council-run public conveniences and motorway services to libraries, museums, supermarkets and shopping centres. Every listing shows accessibility info, opening hours and one-tap directions, so you can find the nearest free loo in seconds. No fees, no sign-up, and the database is updated daily by our community.',
        bodySections: [
          {
            heading: 'Where to find free toilets in the UK',
            body:
              'Free public toilets in the UK fall into a few predictable categories — knowing them is half the battle when you\'re caught short.\n\nCouncil-run public conveniences are the classic option: standalone toilet blocks in town centres, parks and seaside fronts. Most are free, though a few city councils now charge 20-50p. Libraries, hospitals and council customer-service buildings keep free toilets for visitors during opening hours.\n\nMotorway service areas are required by law to keep their toilets open 24/7 free of charge, even when the shops are closed. Major train stations are now free too, since Network Rail dropped the charge in 2019. Supermarkets (Sainsbury\'s, Tesco, Asda, Morrisons), department stores (John Lewis, M&S) and free national museums (Tate, V&A, British Museum) all keep customer toilets that you don\'t need to spend money to use.',
          },
          {
            heading: 'Tips for finding a free loo on the move',
            body:
              'A few patterns work everywhere in the UK:\n\n• Aim for public buildings — libraries and town halls almost always have free toilets, with no expectation that you spend anything.\n• Look up before you go — Where To Wee\'s map shows free vs paid filter so you can plan a 5-minute walk to a guaranteed free loo rather than gamble on the high street.\n• Coffee-shop toilets are usually customer-only these days, but most chains share the code if you ask politely.\n• Accessible toilets in the RADAR key network are free to use — if you have a key, you have 10,000+ extra free options across the UK.',
          },
          {
            heading: 'Why we list free toilets',
            body:
              'Charging for the toilet is a tax on being human, especially for older people, parents with young children, and anyone with a medical condition. We started Where To Wee to make every free public toilet in the UK as easy to find as the nearest paid one. The map is free to use on the web, the app is free to download, and there\'s no account required — your privacy stays yours.',
          },
        ],
        faq: [
          {
            q: 'How do I find the nearest free public toilet?',
            a: 'Open the Where To Wee app or visit our map at wheretowee.uk/map and tap the "Free" filter. We\'ll show you every free toilet within walking distance, with directions, ratings, and accessibility info. No account needed.',
          },
          {
            q: 'Are motorway service toilets really free?',
            a: 'Yes. All UK motorway service areas are required by law to keep their toilets open 24/7 free of charge, even when the shops and restaurants are closed. Look for the blue "WC" sign from the slip road.',
          },
          {
            q: 'Are train station toilets free in the UK?',
            a: 'Most major UK train stations dropped paid toilets in 2019 when Network Rail rolled out a free-toilets policy. Smaller stations sometimes only open with the ticket office, but the days of 30p turnstiles at London termini are over.',
          },
          {
            q: 'Do supermarkets have free toilets?',
            a: 'Yes — most big-format supermarkets (Sainsbury\'s, Tesco, Asda, Morrisons, Waitrose) keep customer toilets. You don\'t need to buy anything to use them, though staff appreciate basic courtesy. Smaller convenience stores typically do not.',
          },
          {
            q: 'What if a free toilet on Where To Wee turns out to charge?',
            a: 'Tap "Report" on the toilet detail page in our app — your report updates the listing for everyone. Listings with a RADAR key requirement should be tagged separately; if one is mis-tagged, please flag it.',
          },
        ],
        related: [
          { href: '/accessible-toilets-uk', title: 'Accessible toilets in the UK', description: 'Wheelchair-accessible loos with grab rails and hoists.' },
          { href: '/baby-changing-near-me', title: 'Baby changing facilities', description: 'Find baby change tables near you, including parents\' rooms.' },
          { href: '/radar-key', title: 'About the RADAR key', description: 'How the National Key Scheme unlocks 10,000+ accessible toilets.' },
          { href: '/toilet-tips', title: 'UK toilet tips', description: 'Practical guidance for finding loos on the move.' },
        ],
      }}
    />
  );
}
