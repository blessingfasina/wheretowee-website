import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Free Toilet Finder App - iOS & Android | 15,000+ Loos',
  description: 'Never get caught short again! Download our FREE app to find toilets near you instantly. Works offline. No ads. 15,000+ UK locations with ratings.',
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
