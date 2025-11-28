import { getPostBySlug, getAllSlugs, getAllPosts } from '@/lib/blog';
import { MDXContent } from '@/components/blog/MDXContent';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} | ADA Lab Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const allPosts = getAllPosts();

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <article className="container mx-auto px-4 max-w-3xl">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            ブログ一覧に戻る
          </Link>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-muted-foreground mb-4">{post.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {post.readingTime}
              </span>
              {post.author && (
                <span className="flex items-center gap-1">By {post.author}</span>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <hr className="border-border/50 mb-8" />

          {/* Table of Contents */}
          <TableOfContents content={post.content} />

          {/* Content */}
          <div className="blog-content">
            <MDXContent content={post.content} />
          </div>

          <hr className="border-border/50 my-8" />

          {/* Share Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              他の記事を読む
            </Link>
            <ShareButtons title={post.title} slug={post.slug} />
          </div>

          {/* Related Posts */}
          <RelatedPosts
            currentSlug={post.slug}
            currentTags={post.tags}
            allPosts={allPosts}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
