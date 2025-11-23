'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ExternalLink, Heart, Calendar } from 'lucide-react';

interface QiitaArticle {
  id: string;
  title: string;
  url: string;
  likes_count: number;
  created_at: string;
  tags: { name: string }[];
}

export function QiitaArticles() {
  const [articles, setArticles] = useState<QiitaArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQiitaArticles() {
      try {
        const response = await fetch('https://qiita.com/api/v2/users/adabana-saki/items?per_page=5');
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError('記事の取得に失敗しました');
        console.error('Failed to fetch Qiita articles:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQiitaArticles();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <motion.div
          className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-sm text-muted-foreground mt-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">まだ記事がありません</p>
        <a
          href="https://qiita.com/adabana-saki"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:text-green-400 text-sm inline-flex items-center gap-1"
        >
          Qiitaプロフィールを見る
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article, index) => (
        <motion.a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="block p-4 bg-black/40 rounded-xl border border-green-500/20 hover:border-green-500/50 transition-colors group"
        >
          <h4 className="font-semibold text-sm mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
            {article.title}
          </h4>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart size={12} className="text-red-400" />
              {article.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(article.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.name}
                  className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </motion.a>
      ))}

      <a
        href="https://qiita.com/adabana-saki"
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-sm text-green-500 hover:text-green-400 mt-4"
      >
        すべての記事を見る →
      </a>
    </div>
  );
}
