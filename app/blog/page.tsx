import { getAllPosts, getAllTags } from '@/lib/blog';
import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { BlogListClient } from './BlogListClient';

export const metadata: Metadata = {
  title: 'Blog | ADA Lab',
  description: 'ADA Labのブログ - 技術記事やプロジェクトの進捗を発信しています',
  alternates: {
    types: {
      'application/rss+xml': '/feed.xml',
      'application/atom+xml': '/atom.xml',
    },
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

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

          <BlogListClient posts={posts} tags={tags} />
        </div>
      </main>
      <Footer />
    </>
  );
}
