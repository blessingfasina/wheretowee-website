import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Where To Wee App - Free Toilet Finder for iOS & Android',
  description: 'Download the free Where To Wee app to find public toilets near you. Available on iOS and Android with 18,000+ UK toilet locations, accessibility info, and ratings.',
  alternates: {
    canonical: 'https://wheretowee.uk/download',
  },
  openGraph: {
    title: 'Download Where To Wee - Free UK Toilet Finder App',
    description: 'Find public toilets near you instantly. Download the free app for iOS and Android.',
    url: 'https://wheretowee.uk/download',
    type: 'website',
  },
};

export default function DownloadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
