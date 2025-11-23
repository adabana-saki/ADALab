'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ExternalLink, BookOpen } from 'lucide-react';

// サンプルのQiita記事データ（実際はAPIから取得）
const qiitaArticles = [
  {
    title: 'Next.js 15の新機能を徹底解説',
    url: 'https://qiita.com',
    likes: 120,
    date: '2024-01-15',
    tags: ['Next.js', 'React', 'TypeScript'],
  },
  {
    title: 'Tailwind CSS v4の変更点まとめ',
    url: 'https://qiita.com',
    likes: 85,
    date: '2024-01-10',
    tags: ['Tailwind CSS', 'CSS'],
  },
  {
    title: 'Framer Motionで魅力的なアニメーションを作る',
    url: 'https://qiita.com',
    likes: 64,
    date: '2024-01-05',
    tags: ['Framer Motion', 'Animation'],
  },
];

export function QiitaFeed() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: '技術ブログ',
      viewAll: 'Qiitaで全て見る',
      likes: 'いいね',
    },
    en: {
      title: 'Tech Blog',
      viewAll: 'View all on Qiita',
      likes: 'Likes',
    },
  };

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
        {qiitaArticles.map((article, index) => (
          <motion.a
            key={article.title}
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
                  <span key={tag} className="px-1.5 py-0.5 bg-white/5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <span>❤️ {article.likes}</span>
            </div>
          </motion.a>
        ))}
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
