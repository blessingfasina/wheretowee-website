import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { getAllPosts, getCategories, BlogPost } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog - Toilet Tips, Accessibility Guides & News',
  description:
    'Helpful articles about finding public toilets, accessibility guides, and tips for parents. Read the Where To Wee blog.',
  openGraph: {
    title: 'Where To Wee Blog',
    description: 'Helpful articles about finding public toilets and accessibility guides.',
  },
};

// Revalidate every 60 seconds (or on-demand)
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getAllPosts();
  const categoryList = await getCategories();
  const categories = ['All', ...categoryList];

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-600 text-white py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              The Where To Wee Blog
            </h1>
            <p className="text-lg text-gray-300">
              Tips, guides, and articles to help you find the perfect loo wherever you are.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-white border-b sticky top-16 md:top-20 z-30">
        <div className="container-custom">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  category === 'All'
                    ? 'bg-navy-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="section">
        <div className="container-custom">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">No posts yet</h2>
              <p className="text-gray-500">Check back soon for new articles!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: BlogPost) => (
                <article key={post.slug} className="card group hover:border-mint-500 border-2 border-transparent">
                  {/* Placeholder image */}
                  <div className="h-48 bg-gradient-to-br from-navy-100 to-navy-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-navy-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="bg-mint-100 text-mint-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(post.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.read_time}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-navy-800 mb-2 group-hover:text-mint-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-mint-600 font-semibold hover:text-mint-700"
                  >
                    Read more
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-600 mb-6">
              Get the latest articles, tips, and updates delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-navy-600 focus:outline-none"
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-3">
              No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
