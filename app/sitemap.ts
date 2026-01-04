import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const cities = [
  'london', 'birmingham', 'manchester', 'leeds', 'glasgow', 'liverpool',
  'bristol', 'sheffield', 'edinburgh', 'leicester', 'coventry', 'bradford',
  'cardiff', 'belfast', 'nottingham', 'newcastle', 'brighton', 'southampton',
  'portsmouth', 'oxford', 'cambridge', 'york', 'bath', 'bournemouth',
  'reading', 'milton-keynes', 'exeter', 'aberdeen', 'dundee', 'swansea',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wheretowee.uk';

  // Static pages
  const staticPages = [
    { route: '', priority: 1, changeFreq: 'weekly' as const },
    { route: '/map', priority: 0.9, changeFreq: 'daily' as const },
    { route: '/toilets', priority: 0.8, changeFreq: 'weekly' as const },
    { route: '/download', priority: 0.8, changeFreq: 'monthly' as const },
    { route: '/about', priority: 0.6, changeFreq: 'monthly' as const },
    { route: '/blog', priority: 0.8, changeFreq: 'daily' as const },
    { route: '/faq', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/submit', priority: 0.7, changeFreq: 'monthly' as const },
    { route: '/contact', priority: 0.5, changeFreq: 'monthly' as const },
    { route: '/privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { route: '/terms', priority: 0.3, changeFreq: 'yearly' as const },
  ].map((page) => ({
    url: `${baseUrl}${page.route}`,
    lastModified: new Date(),
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));

  // City pages - good for local SEO
  const cityPages = cities.map((city) => ({
    url: `${baseUrl}/toilets/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Blog posts - fetch from Supabase
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true);

    if (posts) {
      blogPages = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  return [...staticPages, ...cityPages, ...blogPages];
}
