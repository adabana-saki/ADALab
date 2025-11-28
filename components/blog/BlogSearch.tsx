'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { BlogMeta } from '@/lib/blog';

interface BlogSearchProps {
  posts: BlogMeta[];
  onFilteredPosts: (posts: BlogMeta[]) => void;
}

export function BlogSearch({ posts, onFilteredPosts }: BlogSearchProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      onFilteredPosts(posts);
      return;
    }

    const searchTerms = value.toLowerCase().split(/\s+/).filter(Boolean);

    const filtered = posts.filter((post) => {
      const searchableText = [
        post.title,
        post.description,
        ...post.tags,
      ].join(' ').toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    });

    onFilteredPosts(filtered);
  };

  const clearSearch = () => {
    setQuery('');
    onFilteredPosts(posts);
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="記事を検索..."
          className="w-full pl-10 pr-10 py-2.5 bg-card border border-border/50 rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="検索をクリア"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
