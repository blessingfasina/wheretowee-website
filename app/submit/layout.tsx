import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add a Toilet - Submit New Location | Where To Wee',
  description: 'Help others by adding a public toilet to our database. Submit toilets near you including accessibility info, baby changing, and opening hours.',
  alternates: {
    canonical: 'https://wheretowee.uk/submit',
  },
  openGraph: {
    title: 'Add a Toilet - Where To Wee',
    description: 'Help others by adding a public toilet to our database.',
    url: 'https://wheretowee.uk/submit',
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
