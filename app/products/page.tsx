'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const productsData = {
  ja: [
    {
      slug: 'adalabstudy',
      name: 'adalab focus',
      tagline: '集中力を可視化する PWA',
      description: 'TODO・ポモドーロ・学習記録・統計・カウントダウンを 1 つのダークなネオン画面に統合した集中管理 PWA。PC とスマホで自動同期、オフライン対応。',
      image: '/images/products/Adalabstudy.png',
      features: ['TODO 管理', 'ポモドーロ', '学習統計', 'オフライン PWA'],
      externalUrl: 'https://study.adalabtech.com',
    },
    {
      slug: 'adalab-shield',
      name: 'adalab shield',
      tagline: '集中ガード拡張機能',
      description: 'adalab focus と連携し、フォーカス中の誘惑サイトを自動ブロック・休憩中は解除するブラウザ拡張機能',
      image: '/images/products/adalab-shield-v2.png',
      features: ['adalab focus 連携', '読み込み前ブロック', 'タイマー操作', 'ブロック統計'],
    },
    {
      slug: 'sumio',
      name: 'Sumio',
      tagline: 'AI要約アシスタント',
      description: '閲覧中のWebページをAIが瞬時に要約。情報収集を効率化するブラウザ拡張機能',
      image: '/images/products/Sumio.png',
      features: ['AI要約', 'ワンクリック', '多言語対応', '要約履歴'],
    },
    {
      slug: 'rem',
      name: 'Rem bot',
      tagline: 'Discord多機能Bot',
      description: 'リマインダー、タスク管理、サーバー管理など、Discordライフを便利にする多機能Bot',
      image: '/images/products/Rembot.png',
      features: ['リマインダー', 'タスク管理', 'ロール管理', '自動応答'],
    },
    {
      slug: 'navi',
      name: 'Navi',
      tagline: '片手操作トラックパッド',
      description: '画面下部をトラックパッドにして、片手でカーソル操作・タップ・スクロールを実現するAndroidアプリ',
      image: '/images/products/Navi.png',
      features: ['トラックパッド操作', 'カーソル＆タップ', 'スクロール＆ドラッグ', '37種のアクション'],
    },
    {
      slug: 'qraft',
      name: 'QRaft',
      tagline: 'QRコードユーティリティ',
      description: 'QRコードの読み取り・生成・保存を素早く行えるオールインワンアプリ',
      image: '/images/products/QRaft.png',
      features: ['高速読み取り', 'Wi-Fi QR生成', '履歴保存', 'バッチ処理'],
    },
  ],
  en: [
    {
      slug: 'adalabstudy',
      name: 'adalab focus',
      tagline: 'Visualize Your Focus',
      description: 'An integrated focus management PWA combining TODO, Pomodoro, study records, statistics, and countdowns in a single dark neon interface. Auto-syncs between PC and phone with full offline support.',
      image: '/images/products/Adalabstudy.png',
      features: ['TODO', 'Pomodoro', 'Stats', 'Offline PWA'],
      externalUrl: 'https://study.adalabtech.com',
    },
    {
      slug: 'adalab-shield',
      name: 'adalab shield',
      tagline: 'Focus Guard Extension',
      description: 'A browser extension that syncs with adalab focus: distracting sites are blocked during focus sessions and unblocked during breaks',
      image: '/images/products/adalab-shield-v2.png',
      features: ['adalab focus sync', 'Pre-load blocking', 'Timer control', 'Block stats'],
    },
    {
      slug: 'sumio',
      name: 'Sumio',
      tagline: 'AI Summary Assistant',
      description: 'AI instantly summarizes web pages you\'re viewing. Browser extension for efficient information gathering',
      image: '/images/products/Sumio.png',
      features: ['AI Summary', 'One-click', 'Multi-language', 'History'],
    },
    {
      slug: 'rem',
      name: 'Rem bot',
      tagline: 'Multi-functional Discord Bot',
      description: 'A feature-rich bot for reminders, task management, server management, and more to enhance your Discord experience',
      image: '/images/products/Rembot.png',
      features: ['Reminders', 'Task Management', 'Role Management', 'Auto Response'],
    },
    {
      slug: 'navi',
      name: 'Navi',
      tagline: 'One-handed Trackpad',
      description: 'An Android app that turns the bottom of your screen into a trackpad for one-handed cursor control, tapping, and scrolling',
      image: '/images/products/Navi.png',
      features: ['Trackpad Control', 'Cursor & Tap', 'Scroll & Drag', '37 Actions'],
    },
    {
      slug: 'qraft',
      name: 'QRaft',
      tagline: 'QR Code Utility',
      description: 'An all-in-one app for quick QR code reading, generation, and saving',
      image: '/images/products/QRaft.png',
      features: ['Fast Scan', 'Wi-Fi QR', 'History', 'Batch Processing'],
    },
  ],
};

// 公開状況（トップの「ステータスは正直に書いています」と一致させる）
const productStatus: Record<string, 'live' | 'dev'> = {
  adalabstudy: 'live',
  'adalab-shield': 'dev',
  sumio: 'dev',
  rem: 'dev',
  navi: 'dev',
  qraft: 'dev',
};

export default function ProductsPage() {
  const { language } = useLanguage();
  const products = productsData[language];

  const content = {
    ja: {
      subtitle: 'シンプルで使いやすいプロダクト',
      viewDetails: '詳細を見る',
      live: '公開中',
      dev: '開発中',
    },
    en: {
      subtitle: 'Simple and easy-to-use products',
      viewDetails: 'View Details',
      live: 'Live',
      dev: 'In Development',
    },
  };

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Products</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              {content[language].subtitle}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product) => {
                const cardClass = 'glass p-6 rounded-2xl hover:bg-muted/30 transition-all group';
                const Inner = (
                  <>
                    <div className="w-14 h-14 rounded-xl overflow-hidden mb-4">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {product.name}
                      </h2>
                      {productStatus[product.slug] === 'live' ? (
                        <span className="px-2 py-0.5 bg-emerald-500/90 text-black text-[10px] font-bold rounded-full">
                          {content[language].live}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/90 text-black text-[10px] font-bold rounded-full">
                          {content[language].dev}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary mb-3">{product.tagline}</p>
                    <p className="text-muted-foreground mb-4">{product.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs bg-muted px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                      {product.externalUrl ? (language === 'ja' ? 'サイトを開く' : 'Open Site') : content[language].viewDetails}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </>
                );
                return product.externalUrl ? (
                  <a
                    key={product.slug}
                    href={product.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {Inner}
                  </a>
                ) : (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className={cardClass}
                  >
                    {Inner}
                  </Link>
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
