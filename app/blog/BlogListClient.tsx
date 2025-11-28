'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowRight, Rss } from 'lucide-react';
import { BlogSearch } from '@/components/blog/BlogSearch';
import type { BlogMeta } from '@/lib/blog';

interface BlogListClientProps {
  posts: BlogMeta[];
  tags: { name: string; count: number }[];
}

export function BlogListClient({ posts, tags }: BlogListClientProps) {
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleFilteredPosts = (filtered: BlogMeta[]) => {
    if (selectedTag) {
      setFilteredPosts(filtered.filter((post) => post.tags.includes(selectedTag)));
    } else {
      setFilteredPosts(filtered);
    }
  };

  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      setSelectedTag(null);
      setFilteredPosts(posts);
    } else {
      setSelectedTag(tagName);
      setFilteredPosts(posts.filter((post) => post.tags.includes(tagName)));
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Search */}
        <BlogSearch
          posts={selectedTag ? posts.filter((p) => p.tags.includes(selectedTag)) : posts}
          onFilteredPosts={handleFilteredPosts}
        />

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">
              {selectedTag
                ? `「${selectedTag}」タグの記事が見つかりませんでした`
                : '記事が見つかりませんでした'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
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
          {/* RSS Feed */}
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Rss size={16} />
              フィード購読
            </h3>
            <div className="flex gap-2">
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 bg-orange-500/10 text-orange-500 text-xs rounded-lg hover:bg-orange-500/20 transition-colors"
              >
                RSS
              </a>
              <a
                href="/atom.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 bg-primary/10 text-primary text-xs rounded-lg hover:bg-primary/20 transition-colors"
              >
                Atom
              </a>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-card border border-border/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Tag size={16} />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedTag === tag.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {tag.name} ({tag.count})
                  </button>
                ))}
              </div>
              {selectedTag && (
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setFilteredPosts(posts);
                  }}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  フィルターを解除
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
