'use client';

import { motion } from 'framer-motion';
import { WifiOff, SlidersHorizontal, Hand, MessageSquare } from 'lucide-react';
import { CounterAnimation } from '../effects/CounterAnimation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GitHubHologram } from '../effects/GitHubHologram';
import { QiitaFeed } from '../QiitaFeed';
import { GitHubContributions } from '../GitHubContributions';
import { WakaTimeStats } from '../WakaTimeStats';
import { WakaTimeProjects } from '../WakaTimeProjects';

// 作るときに決めているルール（一人称・言い切り）
const rulesData = {
  ja: [
    {
      icon: WifiOff,
      title: 'まずオフラインで動かす',
      description: 'ネットが無くても使えること。サーバーが落ちても手元で完結する作りを優先します。',
    },
    {
      icon: SlidersHorizontal,
      title: '設定を増やさない',
      description: '機能を足すより、迷う画面を減らす。初見で使い方が分かるのを目標にしています。',
    },
    {
      icon: Hand,
      title: '自分が毎日使うものだけ',
      description: '「たぶん誰か使う」では作りません。自分が困って、自分が毎日開くものだけ作ります。',
    },
  ],
  en: [
    {
      icon: WifiOff,
      title: 'Offline first',
      description: 'It has to work without a connection. If the server goes down, the app should still run on your device.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Fewer settings, not more',
      description: 'Instead of adding features, I remove screens that make you hesitate. It should be obvious on first use.',
    },
    {
      icon: Hand,
      title: 'Only what I use daily',
      description: 'I don\'t build things because "someone might use it." I build the things I got stuck on and open every day.',
    },
  ],
};

// サイトに嘘の数字を置かないため、実際に稼働している事実だけを表示
const stats = [
  { value: 2, suffix: '', label: 'Live' },
  { value: 2025, suffix: '', label: 'Since' },
  { value: 1, suffix: '', label: 'Developer' },
];

export function About() {
  const { language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const rules = rulesData[language];

  const content = {
    ja: {
      description: '自分が困ったものを、自分のために作っています。',
      missionLabel: 'なぜ作っているか',
      mission: '大学の勉強と作業を並行していて、タイマー・TODO・学習記録アプリを3つ行き来するのが面倒でした。それなら1つにまとめようと思って作ったのが「adalab focus」です。他のプロダクトも、だいたい「自分が困ったから」という理由から始まっています。',
      philosophy: '要望はだいたい取り込みます',
      philosophyDesc: '個人開発なので大企業のような対応速度はありませんが、Discord や X でもらった意見はかなりの割合でそのまま入れています。',
    },
    en: {
      description: 'I build the things I got stuck on, for myself first.',
      missionLabel: 'Why I build this',
      mission: 'I was juggling three apps — a timer, a to-do list, and a study log — while studying and working at the same time. It was annoying, so I put them into one app. That became adalab focus. Most of my other projects started the same way: I got stuck on something.',
      philosophy: 'I usually take requests',
      philosophyDesc: 'As a solo developer I can\'t match a big company\'s response time, but a good chunk of what people ask for on Discord or X ends up shipped as-is.',
    },
  };

  return (
    <section id="about" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className={`hidden md:block absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] ${
        isLight ? 'bg-primary/10' : 'bg-primary/5'
      }`} />
      <div className={`hidden md:block absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[120px] ${
        isLight ? 'bg-secondary/10' : 'bg-secondary/5'
      }`} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {content[language].missionLabel}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content[language].description}
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Mission Statement - Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-1 md:col-span-4 lg:col-span-8 row-span-2"
          >
            <div className="bento-card h-full p-8 md:p-10 rounded-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-fuchsia/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{language === 'ja' ? 'はじまり' : 'The story'}</span>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-snug">
                  {content[language].missionLabel}
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {content[language].mission}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-1 md:col-span-2 lg:col-span-4 row-span-2"
          >
            <div className="bento-card h-full p-6 md:p-8 rounded-3xl">
              <div className="grid grid-cols-3 gap-4 h-full content-center">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold mb-1">
                      <span className="holographic-text">
                        <CounterAnimation
                          end={stat.value}
                          suffix={stat.suffix}
                          duration={2.5}
                          className="text-3xl md:text-4xl"
                        />
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 作るときのルール（一人称・言い切り） */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-1 md:col-span-6 lg:col-span-12"
          >
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              {language === 'ja' ? '作るときに決めていること' : 'How I decide what to build'}
            </p>
          </motion.div>

          {rules.map((rule, index) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 2) }}
              className="col-span-1 md:col-span-2 lg:col-span-4"
            >
              <div className="bento-card p-6 rounded-3xl h-full group">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <rule.icon className="text-primary" size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{rule.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Philosophy Card - Wide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="col-span-1 md:col-span-6 lg:col-span-12"
          >
            <div className="bento-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="text-primary" size={26} />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{content[language].philosophy}</h3>
                  <p className="text-muted-foreground">
                    {content[language].philosophyDesc}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* GitHub Stats & Contributions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="col-span-1 md:col-span-3 lg:col-span-4 h-full"
          >
            <div className="h-full">
              <GitHubHologram />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="col-span-1 md:col-span-3 lg:col-span-8 h-full"
          >
            <div className="h-full">
              <GitHubContributions />
            </div>
          </motion.div>

          {/* WakaTime & Qiita/Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="col-span-1 md:col-span-3 lg:col-span-6"
          >
            <WakaTimeStats />
          </motion.div>

          <div className="col-span-1 md:col-span-3 lg:col-span-6 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex-1"
            >
              <QiitaFeed />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex-1"
            >
              <WakaTimeProjects />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
