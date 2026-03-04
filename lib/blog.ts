import { supabase } from './supabase';

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  read_time: string;
  image_url: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published blog posts
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

/**
 * Fetch posts by category
 */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch featured posts
 */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch related posts (same category, different slug)
 */
export async function getRelatedPosts(slug: string, category: string, limit: number = 2): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .neq('slug', slug)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('published', true);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categories = Array.from(new Set(data?.map(post => post.category) || []));
  return categories;
}

/**
 * Get all slugs for static generation
 */
export async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true);

  if (error) {
    console.error('Error fetching slugs:', error);
    return [];
  }

  return data?.map(post => post.slug) || [];
}
