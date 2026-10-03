import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';
import ChatWidget from '@/components/ChatWidget';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wheretowee.uk'),
  title: {
    default: 'Toilets Near Me - Find 15,000+ Public Toilets UK | Free Map',
    template: '%s | Where To Wee',
  },
  description:
    'Need a toilet NOW? Find the nearest public toilet in seconds. 15,000+ locations across UK with wheelchair access, baby changing & ratings. 100% free!',
  keywords: [
    'toilets near me',
    'toilet near me',
    'public toilets near me',
    'public toilets close to me',
    'nearest public toilets near me',
    'public toilet near me',
    'accessible toilets UK',
    'baby changing facilities near me',
    'free public toilets',
    'wheelchair accessible toilets',
    'find toilet',
    'toilet finder UK',
    'public loo near me',
  ],
  authors: [{ name: 'Where To Wee' }],
  creator: 'Where To Wee',
  publisher: 'Where To Wee',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://wheretowee.uk',
    siteName: 'Where To Wee',
    title: 'Find Toilets Near Me | Public Toilets UK Map',
    description:
      'Find clean, accessible public toilets near you across the UK. 15,000+ toilets with ratings and accessibility info.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Where To Wee app showing interactive map to find public toilets near me across the UK with accessibility filters',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Toilets Near Me | Free UK Toilet Finder',
    description: 'Find clean, accessible public toilets across the UK. Free app with 15,000+ locations.',
    images: ['/og-image.png'],
    creator: '@wheretowee',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here after setting up Search Console
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={nunito.variable}>
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Favicons and PWA */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1E3A5F" />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Where To Wee',
              url: 'https://wheretowee.uk',
              logo: 'https://wheretowee.uk/icon-512.png',
              description: 'The UK\'s leading public toilet finder app helping millions find clean, accessible toilets near them.',
              foundingDate: '2024',
              founders: [{
                '@type': 'Person',
                name: 'Where To Wee Team'
              }],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'hello@wheretowee.uk',
                contactType: 'customer service',
                availableLanguage: 'English'
              },
              sameAs: [
                'https://twitter.com/wheretowee',
                'https://www.linkedin.com/company/wheretowee',
                'https://www.instagram.com/wheretowee'
              ]
            }),
          }}
        />
        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Where To Wee - Toilet Finder',
              description: 'Find public toilets near me instantly. 15,000+ toilets across the UK with wheelchair accessibility, baby changing facilities, and ratings.',
              url: 'https://wheretowee.uk',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'iOS, Android, Web',
              browserRequirements: 'Requires JavaScript',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'GBP',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '500',
                bestRating: '5',
                worstRating: '1'
              },
              featureList: [
                'Find toilets near me',
                'Wheelchair accessible toilet filter',
                'Baby changing facilities filter',
                'Free toilet filter',
                'User ratings and reviews',
                'Offline access'
              ]
            }),
          }}
        />
        {/* WebSite Schema for Sitelinks Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Where To Wee',
              url: 'https://wheretowee.uk',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://wheretowee.uk/toilets/{search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              }
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Analytics />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <VercelAnalytics />
      </body>
    </html>
  );
}
