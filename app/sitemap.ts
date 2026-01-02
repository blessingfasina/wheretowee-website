import { MetadataRoute } from 'next';

const cities = [
  'london', 'birmingham', 'manchester', 'leeds', 'glasgow', 'liverpool',
  'bristol', 'sheffield', 'edinburgh', 'leicester', 'coventry', 'bradford',
  'cardiff', 'belfast', 'nottingham', 'newcastle', 'brighton', 'southampton',
  'portsmouth', 'oxford', 'cambridge', 'york', 'bath', 'bournemouth',
  'reading', 'milton-keynes', 'exeter', 'aberdeen', 'dundee', 'swansea',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://wheretowee.uk';

  // Static pages
  const staticPages = [
    '',
    '/map',
    '/toilets',
    '/download',
    '/about',
    '/blog',
    '/privacy',
    '/terms',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
    priority: route === '' ? 1 : route === '/map' ? 0.9 : 0.8,
  }));

  // City pages
  const cityPages = cities.map((city) => ({
    url: `${baseUrl}/toilets/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...cityPages];
}

