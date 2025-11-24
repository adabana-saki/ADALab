'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, Heart, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QiitaArticle {
  id: string;
  title: string;
  url: string;
  likes_count: number;
  created_at: string;
  tags: { name: string }[];
}

export function QiitaFeed() {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<QiitaArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const content = {
    ja: {
      title: '技術ブログ',
      viewAll: 'Qiitaで全て見る',
      likes: 'いいね',
      loading: '読み込み中...',
      noArticles: 'まだ記事がありません',
      error: '記事の取得に失敗しました',
    },
    en: {
      title: 'Tech Blog',
      viewAll: 'View all on Qiita',
      likes: 'Likes',
      loading: 'Loading...',
      noArticles: 'No articles yet',
      error: 'Failed to fetch articles',
    },
  };

  useEffect(() => {
    async function fetchQiitaArticles() {
      try {
        const response = await fetch('https://qiita.com/api/v2/users/adabana-saki/items?per_page=3');
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError('Failed to fetch articles');
        console.error('Failed to fetch Qiita articles:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQiitaArticles();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-bold">{content[language].title}</h3>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <motion.div
              className="inline-block w-5 h-5 border-2 border-neon-cyan border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              role="status"
              aria-label={content[language].loading}
            />
            <p className="text-sm text-muted-foreground mt-2">{content[language].loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>{content[language].noArticles}</p>
          </div>
        ) : (
          articles.map((article, index) => (
            <motion.a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="block p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm group-hover:text-neon-cyan transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex gap-2">
                  {article.tags.slice(0, 2).map((tag) => (
                    <span key={tag.name} className="px-1.5 py-0.5 bg-white/5 rounded">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart size={12} className="text-red-400" />
                    {article.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {(() => {
                      const date = new Date(article.created_at);
                      return isNaN(date.getTime()) ? '-' : date.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US');
                    })()}
                  </span>
                </div>
              </div>
            </motion.a>
          ))
        )}
      </div>

      <a
        href="https://qiita.com/adabana-saki"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block text-center text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
      >
        {content[language].viewAll} →
      </a>
    </motion.div>
  );
}
