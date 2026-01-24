import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Where To Wee',
  description: 'Get in touch with the Where To Wee team. Report issues, suggest improvements, or enquire about partnerships for the UK toilet finder app.',
  alternates: {
    canonical: 'https://wheretowee.uk/contact',
  },
  openGraph: {
    title: 'Contact Us - Where To Wee',
    description: 'Get in touch with the Where To Wee team.',
    url: 'https://wheretowee.uk/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
