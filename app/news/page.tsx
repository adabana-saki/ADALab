'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Calendar, Megaphone, Wrench, AlertTriangle, Info } from 'lucide-react';
import { getAllNews, type NewsType } from '@/lib/news';

const typeIcons: Record<NewsType, typeof Megaphone> = {
  announcement: Megaphone,
  maintenance: Wrench,
  important: AlertTriangle,
  info: Info,
};

const typeColors: Record<NewsType, string> = {
  announcement: 'text-neon-cyan bg-neon-cyan/20',
  maintenance: 'text-yellow-400 bg-yellow-400/20',
  important: 'text-red-400 bg-red-400/20',
  info: 'text-blue-400 bg-blue-400/20',
};

const typeLabels: Record<'ja' | 'en', Record<NewsType, string>> = {
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
  const news = getAllNews(language);

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
