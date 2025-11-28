import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { BlogMeta } from '@/lib/blog';

interface RelatedPostsProps {
  currentSlug: string;
  currentTags: string[];
  allPosts: BlogMeta[];
  maxPosts?: number;
}

export function RelatedPosts({
  currentSlug,
  currentTags,
  allPosts,
  maxPosts = 3,
}: RelatedPostsProps) {
  // 関連記事を計算（同じタグを持つ記事をスコアリング）
  const relatedPosts = allPosts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const commonTags = post.tags.filter((tag) => currentTags.includes(tag));
      return {
        ...post,
        relevanceScore: commonTags.length,
      };
    })
    .filter((post) => post.relevanceScore > 0)
    .sort((a, b) => {
      // まずスコアで並べ、同スコアなら日付順
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, maxPosts);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">関連記事</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block p-4 bg-card border border-border/50 rounded-lg hover:border-primary/50 transition-all duration-300"
          >
            <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {post.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{post.date}</span>
              <ArrowRight
                size={14}
                className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
