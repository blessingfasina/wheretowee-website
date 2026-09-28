import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ChevronLeft, Share2, BookOpen } from 'lucide-react';
import { getPostBySlug, getRelatedPosts, getAllSlugs, BlogPost } from '@/lib/blog';

// Revalidate every 60 seconds
export const revalidate = 60;

// Generate static params for all published posts
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      robots: { index: false, follow: false },
    };
  }
  
  return {
    title: `${post.title} - Where To Wee Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author],
      images: post.image_url ? [post.image_url] : undefined,
      url: `https://wheretowee.uk/blog/${slug}`,
    },
    alternates: {
      canonical: `https://wheretowee.uk/blog/${slug}`,
    },
  };
}

// Parse inline formatting (bold, links)
function parseInlineFormatting(text: string): React.ReactNode[] {
  // Split by both bold (**text**) and links ([text](url))
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  
  return parts.map((part, i) => {
    // Bold text
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-navy-700">{part.slice(2, -2)}</strong>;
    }
    // Links [text](url)
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const [, linkText, linkUrl] = linkMatch;
      const isExternal = linkUrl.startsWith('http');
      return (
        <Link 
          key={i} 
          href={linkUrl}
          className="text-mint-600 hover:text-mint-700 underline font-medium transition-colors"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {linkText}
        </Link>
      );
    }
    return part;
  });
}

// Render markdown-like content
function renderContent(content: string) {
  return content.split('\n').map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    
    // Headers
    if (trimmed.startsWith('## ')) {
      return <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-navy-800">{trimmed.slice(3)}</h2>;
    }
    if (trimmed.startsWith('### ')) {
      return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-navy-700">{trimmed.slice(4)}</h3>;
    }
    
    // Horizontal rule
    if (trimmed === '---') {
      return <hr key={index} className="my-8 border-gray-200" />;
    }
    
    // Bold paragraphs (full line)
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return <p key={index} className="font-semibold text-navy-700 mb-2">{trimmed.slice(2, -2)}</p>;
    }
    
    // List items
    if (trimmed.startsWith('- ')) {
      const listContent = trimmed.slice(2);
      return (
        <li key={index} className="ml-6 mb-1 text-gray-600 list-disc">
          {parseInlineFormatting(listContent)}
        </li>
      );
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const listContent = trimmed.replace(/^\d+\.\s/, '');
      return (
        <li key={index} className="ml-6 mb-1 text-gray-600 list-decimal">
          {parseInlineFormatting(listContent)}
        </li>
      );
    }
    
    // Italics (full line)
    if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
      return <p key={index} className="italic text-gray-500 my-4">{trimmed.slice(1, -1)}</p>;
    }
    
    // Regular paragraphs with inline formatting
    return (
      <p key={index} className="mb-4 text-gray-600 leading-relaxed">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = await getRelatedPosts(slug, post.category, 2);
  
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <span className="inline-block bg-mint-500 text-navy-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-300">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.read_time} read
              </span>
              <span>By {post.author}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image_url && (
        <section className="bg-gray-100">
          <div className="container-custom py-8">
            <div className="max-w-4xl mx-auto">
              <img
                src={post.image_url}
                alt={post.title}
                width={1200}
                height={630}
                loading="lazy"
                decoding="async"
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <article className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Share buttons */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b">
              <span className="text-gray-500 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share:
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://wheretowee.uk/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-navy-600 transition-colors"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://wheretowee.uk/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-navy-600 transition-colors"
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://wheretowee.uk/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-navy-600 transition-colors"
              >
                LinkedIn
              </a>
            </div>

            {/* Article content */}
            <div className="prose prose-lg max-w-none">
              {renderContent(post.content)}
            </div>

            {/* Author box */}
            <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-navy-400 to-navy-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  WTW
                </div>
                <div>
                  <p className="font-semibold text-navy-800">{post.author}</p>
                  <p className="text-gray-600 text-sm">
                    Helping you find the perfect loo since 2025.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="section bg-gray-50">
          <div className="container-custom">
            <h2 className="text-2xl font-bold text-navy-800 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((related: BlogPost) => (
                <article key={related.slug} className="card group hover:border-mint-500 border-2 border-transparent">
                  <div className="h-32 bg-gradient-to-br from-navy-100 to-navy-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {related.image_url ? (
                      <img
                        src={related.image_url}
                        alt={related.title}
                        width={400}
                        height={128}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-navy-400" />
                    )}
                  </div>
                  <span className="bg-mint-100 text-mint-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {related.category}
                  </span>
                  <h3 className="text-lg font-bold text-navy-800 mt-2 mb-2 group-hover:text-mint-600 transition-colors">
                    <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                  </h3>
                  <p className="text-gray-600 text-sm">{related.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-br from-mint-500 via-mint-400 to-emerald-500 rounded-3xl p-8 md:p-12 text-white overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />
              
              <div className="relative text-center">
                <span className="text-4xl mb-4 block">🚽</span>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Find Toilets Near You
                </h2>
                <p className="text-white/90 mb-8 text-lg">
                  Download our free mobile app or try the web version now!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/download"
                    className="inline-flex items-center justify-center px-8 py-3 bg-white text-mint-600 font-bold rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    📱 Download App
                  </Link>
                  <Link 
                    href="/map" 
                    className="inline-flex items-center justify-center px-8 py-3 bg-white/20 text-white font-bold rounded-full hover:bg-white/30 transition-all border-2 border-white/50"
                  >
                    🗺️ Try the Web Map
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
