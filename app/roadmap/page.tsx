'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Rocket } from 'lucide-react';

const roadmapData = {
  ja: [
    {
      quarter: 'Q1 2024',
      status: 'completed',
      title: '基盤構築',
      items: [
        { text: 'ADA Lab公式サイト公開', done: true },
        { text: 'Rem bot v1.0リリース', done: true },
        { text: '多言語対応', done: true },
      ],
    },
    {
      quarter: 'Q2 2024',
      status: 'in-progress',
      title: '機能拡張',
      items: [
        { text: 'Rem bot v2.0 - AI機能追加', done: false },
        { text: 'Naviアプリ正式リリース', done: false },
        { text: 'ユーザーダッシュボード', done: false },
      ],
    },
    {
      quarter: 'Q3 2024',
      status: 'planned',
      title: 'エコシステム',
      items: [
        { text: 'API公開', done: false },
        { text: 'プラグインシステム', done: false },
        { text: 'コミュニティ機能', done: false },
      ],
    },
    {
      quarter: 'Q4 2024',
      status: 'planned',
      title: '次世代',
      items: [
        { text: '新プロダクト発表', done: false },
        { text: 'エンタープライズ対応', done: false },
        { text: 'グローバル展開', done: false },
      ],
    },
  ],
  en: [
    {
      quarter: 'Q1 2024',
      status: 'completed',
      title: 'Foundation',
      items: [
        { text: 'Launch ADA Lab official site', done: true },
        { text: 'Release Rem bot v1.0', done: true },
        { text: 'Multilingual support', done: true },
      ],
    },
    {
      quarter: 'Q2 2024',
      status: 'in-progress',
      title: 'Feature Expansion',
      items: [
        { text: 'Rem bot v2.0 - AI features', done: false },
        { text: 'Navi app official release', done: false },
        { text: 'User dashboard', done: false },
      ],
    },
    {
      quarter: 'Q3 2024',
      status: 'planned',
      title: 'Ecosystem',
      items: [
        { text: 'Public API', done: false },
        { text: 'Plugin system', done: false },
        { text: 'Community features', done: false },
      ],
    },
    {
      quarter: 'Q4 2024',
      status: 'planned',
      title: 'Next Generation',
      items: [
        { text: 'New product announcement', done: false },
        { text: 'Enterprise support', done: false },
        { text: 'Global expansion', done: false },
      ],
    },
  ],
};

const statusIcons = {
  completed: CheckCircle2,
  'in-progress': Clock,
  planned: Circle,
};

const statusColors = {
  completed: 'text-green-400 border-green-400/50',
  'in-progress': 'text-neon-cyan border-neon-cyan/50',
  planned: 'text-muted-foreground border-muted-foreground/50',
};

export default function RoadmapPage() {
  const { language } = useLanguage();
  const roadmap = roadmapData[language];

  const content = {
    ja: {
      title: 'Roadmap',
      subtitle: '開発ロードマップ',
    },
    en: {
      title: 'Roadmap',
      subtitle: 'Development Roadmap',
    },
  };

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
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

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-cyan via-neon-fuchsia to-transparent hidden md:block" />

              <div className="space-y-8">
                {roadmap.map((phase, index) => {
                  const StatusIcon = statusIcons[phase.status as keyof typeof statusIcons];
                  const colorClass = statusColors[phase.status as keyof typeof statusColors];

                  return (
                    <motion.div
                      key={phase.quarter}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="relative md:pl-20"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-6 top-6 w-4 h-4 rounded-full border-2 bg-background hidden md:block ${colorClass}`} />

                      <div className={`glass p-6 rounded-2xl border-l-4 ${colorClass.split(' ')[1]}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <StatusIcon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
                          <span className="font-mono text-sm text-muted-foreground">
                            {phase.quarter}
                          </span>
                        </div>

                        <h2 className="text-xl font-bold mb-4">{phase.title}</h2>

                        <ul className="space-y-2">
                          {phase.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-3">
                              {item.done ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className={item.done ? 'text-muted-foreground line-through' : ''}>
                                {item.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
