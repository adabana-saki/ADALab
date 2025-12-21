'use client';

import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Bot, Smartphone, ArrowRight, Shield, Brain, QrCode } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const productsData = {
  ja: [
    {
      slug: 'shortshield',
      name: 'ShortShield',
      tagline: 'ショート動画ブロッカー',
      description: 'ショート動画の視聴を制限し、集中力を取り戻すためのブラウザ拡張機能',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      features: ['ショート動画ブロック', '時間制限設定', '集中モード', '統計表示'],
    },
    {
      slug: 'sumio',
      name: 'Sumio',
      tagline: 'AI要約アシスタント',
      description: '閲覧中のWebページをAIが瞬時に要約。情報収集を効率化するブラウザ拡張機能',
      icon: Brain,
      color: 'from-emerald-500 to-teal-500',
      features: ['AI要約', 'ワンクリック', '多言語対応', '要約履歴'],
    },
    {
      slug: 'rem',
      name: 'Rem bot',
      tagline: 'Discord多機能Bot',
      description: 'リマインダー、タスク管理、サーバー管理など、Discordライフを便利にする多機能Bot',
      icon: Bot,
      color: 'from-cyan-500 to-blue-500',
      features: ['リマインダー', 'タスク管理', 'ロール管理', '自動応答'],
    },
    {
      slug: 'navi',
      name: 'Navi',
      tagline: '片手操作アプリ',
      description: 'スマートフォンを片手で快適に操作するためのユーティリティアプリ',
      icon: Smartphone,
      color: 'from-purple-500 to-pink-500',
      features: ['片手操作最適化', 'カスタムジェスチャー', 'クイックアクション', 'ウィジェット'],
    },
    {
      slug: 'qraft',
      name: 'QRaft',
      tagline: 'QRコードユーティリティ',
      description: 'QRコードの読み取り・生成・保存を素早く行えるオールインワンアプリ',
      icon: QrCode,
      color: 'from-violet-500 to-purple-500',
      features: ['高速読み取り', 'Wi-Fi QR生成', '履歴保存', 'バッチ処理'],
    },
  ],
  en: [
    {
      slug: 'shortshield',
      name: 'ShortShield',
      tagline: 'Short Video Blocker',
      description: 'A browser extension to limit short video viewing and regain your focus',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      features: ['Block Shorts', 'Time Limits', 'Focus Mode', 'Statistics'],
    },
    {
      slug: 'sumio',
      name: 'Sumio',
      tagline: 'AI Summary Assistant',
      description: 'AI instantly summarizes web pages you\'re viewing. Browser extension for efficient information gathering',
      icon: Brain,
      color: 'from-emerald-500 to-teal-500',
      features: ['AI Summary', 'One-click', 'Multi-language', 'History'],
    },
    {
      slug: 'rem',
      name: 'Rem bot',
      tagline: 'Multi-functional Discord Bot',
      description: 'A feature-rich bot for reminders, task management, server management, and more to enhance your Discord experience',
      icon: Bot,
      color: 'from-cyan-500 to-blue-500',
      features: ['Reminders', 'Task Management', 'Role Management', 'Auto Response'],
    },
    {
      slug: 'navi',
      name: 'Navi',
      tagline: 'One-handed Operation App',
      description: 'A utility app for comfortable one-handed smartphone operation',
      icon: Smartphone,
      color: 'from-purple-500 to-pink-500',
      features: ['One-hand Optimization', 'Custom Gestures', 'Quick Actions', 'Widgets'],
    },
    {
      slug: 'qraft',
      name: 'QRaft',
      tagline: 'QR Code Utility',
      description: 'An all-in-one app for quick QR code reading, generation, and saving',
      icon: QrCode,
      color: 'from-violet-500 to-purple-500',
      features: ['Fast Scan', 'Wi-Fi QR', 'History', 'Batch Processing'],
    },
  ],
};

export default function ProductsPage() {
  const { language } = useLanguage();
  const products = productsData[language];

  const content = {
    ja: {
      subtitle: 'シンプルで使いやすいプロダクト',
      viewDetails: '詳細を見る',
    },
    en: {
      subtitle: 'Simple and easy-to-use products',
      viewDetails: 'View Details',
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
              {products.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="glass p-6 rounded-2xl hover:bg-muted/30 transition-all group"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${product.color} mb-4`}>
                    <product.icon className="w-6 h-6 text-white" />
                  </div>

                  <h2 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h2>
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
                    {content[language].viewDetails}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
