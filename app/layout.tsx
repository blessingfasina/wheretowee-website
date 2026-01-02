import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wheretowee.uk'),
  title: {
    default: 'Where To Wee - Find Public Toilets Near You | UK Toilet Finder',
    template: '%s | Where To Wee',
  },
  description:
    'Find clean, accessible public toilets near you across the UK. Free app with 18,000+ toilets, wheelchair accessibility info, baby changing facilities, and user ratings.',
  keywords: [
    'public toilets',
    'toilet finder',
    'nearest toilet',
    'accessible toilets',
    'wheelchair toilet',
    'baby changing',
    'UK toilets',
    'public loo',
    'restroom finder',
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
    title: 'Where To Wee - Find Public Toilets Near You',
    description:
      'Find clean, accessible public toilets near you across the UK. 18,000+ toilets with ratings and accessibility info.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Where To Wee - UK Toilet Finder App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Where To Wee - Find Public Toilets Near You',
    description: 'Find clean, accessible public toilets across the UK. Free app with 18,000+ locations.',
    images: ['/og-image.png'],
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
    // Add your verification codes here
    // google: 'your-google-verification-code',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1E3A5F" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

