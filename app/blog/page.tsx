import { Suspense } from 'react';
import { getAllPosts, getAllTags, getAllCategories, getScheduledPosts } from '@/lib/blog';
import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { BlogListClient } from './BlogListClient';

export const metadata: Metadata = {
  title: 'Blog | ADA Lab',
  description: 'ADA Labのブログ - 技術記事やプロジェクトの進捗を発信しています',
  keywords: ['ブログ', '技術記事', 'Next.js', 'React', 'TypeScript', 'Discord Bot', '個人開発'],
  alternates: {
    canonical: 'https://adalabtech.com/blog',
    types: {
      'application/rss+xml': '/feed.xml',
      'application/atom+xml': '/atom.xml',
    },
  },
  openGraph: {
    title: 'Blog | ADA Lab',
    description: 'ADA Labのブログ - 技術記事やプロジェクトの進捗を発信しています',
    url: 'https://adalabtech.com/blog',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: 'https://adalabtech.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'ADA Lab Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | ADA Lab',
    description: 'ADA Labのブログ - 技術記事やプロジェクトの進捗を発信しています',
    images: ['https://adalabtech.com/twitter-image.png'],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();
  const categories = getAllCategories();
  const scheduledPosts = getScheduledPosts();

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              技術記事やプロジェクトの進捗、学んだことを発信しています
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <BlogListClient
              posts={posts}
              tags={tags}
              categories={categories}
              scheduledPosts={scheduledPosts}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
