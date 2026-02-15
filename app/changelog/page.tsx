'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Calendar, Zap, Bug, Sparkles } from 'lucide-react';

const changelogData = {
  ja: [
    {
      version: '1.1.0',
      date: '2026-01',
      type: 'major',
      title: 'オンライン対戦機能',
      changes: [
        { type: 'feature', text: 'テトリス・2048・スネーク・タイピングのオンライン対戦を追加' },
        { type: 'feature', text: 'ランキングシステムを実装' },
        { type: 'feature', text: 'ユーザー認証（Google/GitHub）を追加' },
      ],
    },
    {
      version: '1.0.0',
      date: '2025-12',
      type: 'major',
      title: '初回リリース',
      changes: [
        { type: 'feature', text: 'ADA Lab公式サイトを公開' },
        { type: 'feature', text: 'テトリス・2048・スネーク・タイピングゲームを追加' },
        { type: 'feature', text: '多言語対応（日本語/英語）' },
        { type: 'feature', text: 'ダークモード対応' },
      ],
    },
  ],
  en: [
    {
      version: '1.1.0',
      date: '2026-01',
      type: 'major',
      title: 'Online Battle Mode',
      changes: [
        { type: 'feature', text: 'Added online battles for Tetris, 2048, Snake, and Typing' },
        { type: 'feature', text: 'Implemented ranking system' },
        { type: 'feature', text: 'Added user authentication (Google/GitHub)' },
      ],
    },
    {
      version: '1.0.0',
      date: '2025-12',
      type: 'major',
      title: 'Initial Release',
      changes: [
        { type: 'feature', text: 'Launched ADA Lab official site' },
        { type: 'feature', text: 'Added Tetris, 2048, Snake, and Typing games' },
        { type: 'feature', text: 'Multilingual support (Japanese/English)' },
        { type: 'feature', text: 'Dark mode support' },
      ],
    },
  ],
};

const typeIcons = {
  feature: Sparkles,
  improvement: Zap,
  fix: Bug,
};

const typeColors = {
  feature: 'text-green-400',
  improvement: 'text-blue-400',
  fix: 'text-orange-400',
};

export default function ChangelogPage() {
  const { language } = useLanguage();
  const changelog = changelogData[language];

  const content = {
    ja: {
      title: 'Changelog',
      subtitle: 'サイトの更新履歴',
    },
    en: {
      title: 'Changelog',
      subtitle: 'Site update history',
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

            <div className="space-y-8">
              {changelog.map((release, index) => (
                <motion.div
                  key={release.version}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass p-6 rounded-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-mono ${
                      release.type === 'major'
                        ? 'bg-neon-cyan/20 text-neon-cyan'
                        : 'bg-neon-fuchsia/20 text-neon-fuchsia'
                    }`}>
                      v{release.version}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {release.date}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-4">{release.title}</h2>

                  <ul className="space-y-2">
                    {release.changes.map((change, i) => {
                      const Icon = typeIcons[change.type as keyof typeof typeIcons];
                      const colorClass = typeColors[change.type as keyof typeof typeColors];
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <Icon className={`w-4 h-4 mt-1 ${colorClass}`} />
                          <span className="text-muted-foreground">{change.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
