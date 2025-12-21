'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const roadmapData = {
  ja: [
    {
      quarter: '2025年1月末',
      status: 'in-progress',
      title: 'Discord Bot',
      items: [
        { text: 'Rem bot - Discord多機能管理Bot', done: false },
      ],
    },
    {
      quarter: 'D-U-N-S番号取得後',
      status: 'planned',
      title: 'モバイルアプリ',
      items: [
        { text: 'Navi - スマホカーソル操作アプリ (Android)', done: false },
      ],
    },
    {
      quarter: 'D-U-N-S番号取得後',
      status: 'planned',
      title: 'ブラウザ拡張機能',
      items: [
        { text: 'ShortShield - ショート動画・SNSブロック (Chrome/Edge/Firefox)', done: false },
        { text: 'Sumio - サイト要約・比較サービス (Chrome/Edge/Firefox)', done: false },
      ],
    },
    {
      quarter: '近日公開',
      status: 'planned',
      title: 'CLIツール',
      items: [
        { text: 'dedupr - ファイル重複削除ツール', done: false },
      ],
    },
  ],
  en: [
    {
      quarter: 'End of Jan 2025',
      status: 'in-progress',
      title: 'Discord Bot',
      items: [
        { text: 'Rem bot - Multi-functional Discord Bot', done: false },
      ],
    },
    {
      quarter: 'After D-U-N-S Acquisition',
      status: 'planned',
      title: 'Mobile Apps',
      items: [
        { text: 'Navi - One-handed Cursor App (Android)', done: false },
      ],
    },
    {
      quarter: 'After D-U-N-S Acquisition',
      status: 'planned',
      title: 'Browser Extensions',
      items: [
        { text: 'ShortShield - Short Video & SNS Blocker (Chrome/Edge/Firefox)', done: false },
        { text: 'Sumio - Site Summary & Comparison (Chrome/Edge/Firefox)', done: false },
      ],
    },
    {
      quarter: 'Coming Soon',
      status: 'planned',
      title: 'CLI Tools',
      items: [
        { text: 'dedupr - File Deduplication Tool', done: false },
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
