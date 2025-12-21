'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Calendar, Zap, Bug, Sparkles } from 'lucide-react';

const changelogData = {
  ja: [
    {
      version: '2.1.0',
      date: '2025-12-21',
      type: 'major',
      title: 'プロダクトページ追加',
      changes: [
        { type: 'feature', text: 'ShortShield, Sumio, QRaft製品ページを追加' },
        { type: 'feature', text: '各製品ページに画像を追加' },
        { type: 'improvement', text: 'ライトモード対応を強化' },
        { type: 'improvement', text: 'FAQ導線を改善' },
      ],
    },
    {
      version: '2.0.0',
      date: '2025-12-01',
      type: 'major',
      title: 'メジャーアップデート',
      changes: [
        { type: 'feature', text: '多言語対応（日本語/英語）を追加' },
        { type: 'feature', text: 'ダークモード切り替え機能を実装' },
        { type: 'improvement', text: 'パフォーマンスを50%改善' },
        { type: 'improvement', text: 'UIアニメーションを最適化' },
      ],
    },
    {
      version: '1.1.0',
      date: '2025-11-15',
      type: 'minor',
      title: 'マイナーアップデート',
      changes: [
        { type: 'feature', text: 'お問い合わせフォームを追加' },
        { type: 'feature', text: '3Dパーティクル背景を実装' },
        { type: 'fix', text: 'モバイルナビゲーションの不具合を修正' },
      ],
    },
    {
      version: '1.0.0',
      date: '2025-11-01',
      type: 'major',
      title: '初回リリース',
      changes: [
        { type: 'feature', text: 'ADA Lab公式サイトを公開' },
        { type: 'feature', text: 'Rem bot製品ページを追加' },
        { type: 'feature', text: 'Navi製品ページを追加' },
      ],
    },
  ],
  en: [
    {
      version: '2.1.0',
      date: '2025-12-21',
      type: 'major',
      title: 'Product Pages Added',
      changes: [
        { type: 'feature', text: 'Added ShortShield, Sumio, QRaft product pages' },
        { type: 'feature', text: 'Added images to all product pages' },
        { type: 'improvement', text: 'Enhanced light mode support' },
        { type: 'improvement', text: 'Improved FAQ navigation' },
      ],
    },
    {
      version: '2.0.0',
      date: '2025-12-01',
      type: 'major',
      title: 'Major Update',
      changes: [
        { type: 'feature', text: 'Added multilingual support (Japanese/English)' },
        { type: 'feature', text: 'Implemented dark mode toggle' },
        { type: 'improvement', text: 'Improved performance by 50%' },
        { type: 'improvement', text: 'Optimized UI animations' },
      ],
    },
    {
      version: '1.1.0',
      date: '2025-11-15',
      type: 'minor',
      title: 'Minor Update',
      changes: [
        { type: 'feature', text: 'Added contact form' },
        { type: 'feature', text: 'Implemented 3D particle background' },
        { type: 'fix', text: 'Fixed mobile navigation bug' },
      ],
    },
    {
      version: '1.0.0',
      date: '2025-11-01',
      type: 'major',
      title: 'Initial Release',
      changes: [
        { type: 'feature', text: 'Launched ADA Lab official site' },
        { type: 'feature', text: 'Added Rem bot product page' },
        { type: 'feature', text: 'Added Navi product page' },
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
