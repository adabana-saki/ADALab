'use client';

import { motion } from 'framer-motion';
import { Megaphone, Wrench, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

type NewsType = 'announcement' | 'maintenance' | 'important' | 'info';

interface NewsItem {
  date: string;
  type: NewsType;
  title: string;
  content: string;
}

const newsTypeConfig: Record<NewsType, { icon: typeof Megaphone; color: string; bgColor: string; label: Record<'ja' | 'en', string> }> = {
  announcement: {
    icon: Megaphone,
    color: 'text-neon-cyan',
    bgColor: 'bg-neon-cyan/20',
    label: { ja: 'お知らせ', en: 'Announcement' }
  },
  maintenance: {
    icon: Wrench,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/20',
    label: { ja: 'メンテナンス', en: 'Maintenance' }
  },
  important: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    label: { ja: '重要', en: 'Important' }
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    label: { ja: '情報', en: 'Info' }
  },
};

// お知らせデータ（/news/page.tsxと同期）
const newsData: Record<'ja' | 'en', NewsItem[]> = {
  ja: [
    {
      date: '2025-12-04',
      type: 'info',
      title: '独自ドメインへの移行を検討中',
      content: 'SEO対策強化のため、独自ドメインへの移行を検討しています。',
    },
    {
      date: '2025-12-01',
      type: 'announcement',
      title: 'ブログ機能をリリースしました',
      content: '技術ブログ機能を公開しました。技術情報を発信していきます。',
    },
    {
      date: '2025-11-26',
      type: 'announcement',
      title: 'ADA Lab 公式サイトを公開しました',
      content: 'ADA Labの公式サイトを公開しました。',
    },
  ],
  en: [
    {
      date: '2025-12-04',
      type: 'info',
      title: 'Considering Migration to Custom Domain',
      content: 'We are considering migrating to a custom domain for better SEO.',
    },
    {
      date: '2025-12-01',
      type: 'announcement',
      title: 'Blog Feature Released',
      content: 'We have launched our technical blog.',
    },
    {
      date: '2025-11-26',
      type: 'announcement',
      title: 'ADA Lab Official Site Launched',
      content: 'We have launched the official ADA Lab website.',
    },
  ],
};

const content = {
  ja: {
    title: 'News',
    subtitle: '最新のお知らせ',
    viewAll: 'すべてのお知らせを見る',
  },
  en: {
    title: 'News',
    subtitle: 'Latest Updates',
    viewAll: 'View all news',
  },
};

export function News() {
  const { language } = useLanguage();
  const news = newsData[language].slice(0, 3); // 最新3件を表示
  const t = content[language];

  return (
    <section id="news" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Megaphone className="text-primary" size={40} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{t.title}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* News List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {news.map((item, index) => {
            const config = newsTypeConfig[item.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.05 * index }}
                className="glass rounded-lg p-6 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${config.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${config.color} ${config.bgColor}`}>
                        {config.label[language]}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {item.date}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-8"
        >
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            {t.viewAll}
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
