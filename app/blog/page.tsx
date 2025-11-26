import { getAllPosts, getAllTags } from '@/lib/blog';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | ADA Lab',
  description: 'ADA Labのブログ - 技術記事やプロジェクトの進捗を発信しています',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
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

        <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="text-center py-20 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">記事を準備中です。お楽しみに！</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article
                    key={post.slug}
                    className="group bg-card border border-border/50 rounded-lg p-6 hover:border-primary/50 transition-all duration-300"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {post.readingTime}
                        </span>
                        {post.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag size={14} />
                            {post.tags.slice(0, 3).join(', ')}
                          </span>
                        )}
                        <span className="ml-auto flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          続きを読む
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Tags */}
              {tags.length > 0 && (
                <div className="bg-card border border-border/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Tag size={16} />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag.name}
                        className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        {tag.name} ({tag.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
