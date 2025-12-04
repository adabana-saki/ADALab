'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Calendar, Megaphone, Wrench, AlertTriangle, Info } from 'lucide-react';

interface NewsItem {
  date: string;
  type: 'announcement' | 'maintenance' | 'important' | 'info';
  title: string;
  content: string;
}

const newsData: Record<'ja' | 'en', NewsItem[]> = {
  ja: [
    {
      date: '2025-12-04',
      type: 'info',
      title: '独自ドメインへの移行を検討中',
      content: 'SEO対策強化のため、独自ドメインへの移行を検討しています。移行時にはURLが変更される可能性がありますが、リダイレクト設定により既存のリンクは引き続きアクセス可能です。',
    },
    {
      date: '2025-12-01',
      type: 'announcement',
      title: 'ブログ機能をリリースしました',
      content: '技術ブログ機能を公開しました。Omarchy、Linux、Web開発などの技術情報を発信していきます。',
    },
    {
      date: '2025-11-26',
      type: 'announcement',
      title: 'ADA Lab 公式サイトを公開しました',
      content: 'ADA Labの公式サイトを公開しました。プロダクト情報や技術ブログを発信していきます。',
    },
  ],
  en: [
    {
      date: '2025-12-04',
      type: 'info',
      title: 'Considering Migration to Custom Domain',
      content: 'We are considering migrating to a custom domain for better SEO. URLs may change during migration, but existing links will remain accessible through redirects.',
    },
    {
      date: '2025-12-01',
      type: 'announcement',
      title: 'Blog Feature Released',
      content: 'We have launched our technical blog. We will share information about Omarchy, Linux, Web development and more.',
    },
    {
      date: '2025-11-26',
      type: 'announcement',
      title: 'ADA Lab Official Site Launched',
      content: 'We have launched the official ADA Lab website. We will share product information and technical blog posts.',
    },
  ],
};

const typeIcons = {
  announcement: Megaphone,
  maintenance: Wrench,
  important: AlertTriangle,
  info: Info,
};

const typeColors = {
  announcement: 'text-neon-cyan bg-neon-cyan/20',
  maintenance: 'text-yellow-400 bg-yellow-400/20',
  important: 'text-red-400 bg-red-400/20',
  info: 'text-blue-400 bg-blue-400/20',
};

const typeLabels = {
  ja: {
    announcement: 'お知らせ',
    maintenance: 'メンテナンス',
    important: '重要',
    info: '情報',
  },
  en: {
    announcement: 'Announcement',
    maintenance: 'Maintenance',
    important: 'Important',
    info: 'Info',
  },
};

export default function NewsPage() {
  const { language } = useLanguage();
  const news = newsData[language];

  const content = {
    ja: {
      title: 'News',
      subtitle: 'サービスに関するお知らせ',
    },
    en: {
      title: 'News',
      subtitle: 'Service announcements',
    },
  };

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">{content[language].title}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {content[language].subtitle}
              </p>
            </motion.div>

            <div className="space-y-6">
              {news.map((item, index) => {
                const Icon = typeIcons[item.type];
                const colorClass = typeColors[item.type];
                const label = typeLabels[language][item.type];

                return (
                  <motion.article
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass p-6 rounded-2xl"
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                        {label}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {item.date}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold mb-3">{item.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.content}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
