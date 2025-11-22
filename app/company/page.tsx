'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowLeft, Code, Mail, Calendar, Heart } from 'lucide-react';

export default function CompanyInfoPage() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'About ADA Lab',
      subtitle: 'あなたの"ほしい"を、カタチに。',
      info: [
        { icon: Code, label: '運営', value: '個人開発' },
        { icon: Calendar, label: '活動開始', value: '2024年' },
        { icon: Mail, label: 'メール', value: 'info.adalabtech@gmail.com' },
      ],
      sections: [
        {
          title: 'ADA Labとは',
          content: 'ADA Labは、日常の「あったらいいな」を形にするプロダクトカンパニーです。\n\n個人開発として、使いやすさとシンプルさを追求したアプリケーションを開発しています。大きな組織ではできない素早い開発と、ユーザーの声に寄り添った改善を強みとしています。',
        },
        {
          title: 'ミッション',
          content: 'Build. Ship. Scale.\n\n素早く作り、素早く届け、成長させる。\n\n完璧を目指すよりも、まず価値を届けることを大切にしています。ユーザーからのフィードバックを元に、継続的に改善を重ねていきます。',
        },
        {
          title: '現在のプロダクト',
          content: '• Rem bot - Discord多機能管理Bot（開発中）\n• Navi - 片手操作モバイルアプリ（開発中）\n\nこれからも、人々の生活を少しでも便利にするプロダクトを開発していきます。',
        },
        {
          title: '技術スタック',
          content: '• フロントエンド: React, Next.js, TypeScript\n• バックエンド: Node.js, Python\n• モバイル: React Native, Expo\n• インフラ: Google Cloud, Vercel\n• データベース: MongoDB, PostgreSQL',
        },
        {
          title: 'お問い合わせ',
          content: 'プロダクトへのご質問、機能リクエスト、バグ報告など、お気軽にお問い合わせください。\n\nメール: info.adalabtech@gmail.com\nX: @ADA_Lab_tech',
        },
      ],
    },
    en: {
      title: 'About ADA Lab',
      subtitle: 'Simple tools for everyday needs.',
      info: [
        { icon: Code, label: 'Operation', value: 'Independent Development' },
        { icon: Calendar, label: 'Started', value: '2024' },
        { icon: Mail, label: 'Email', value: 'info.adalabtech@gmail.com' },
      ],
      sections: [
        {
          title: 'What is ADA Lab',
          content: 'ADA Lab is a product company that turns everyday "nice to haves" into reality.\n\nAs an independent developer, we focus on creating applications that prioritize usability and simplicity. Our strengths are rapid development and user-centric improvements.',
        },
        {
          title: 'Mission',
          content: 'Build. Ship. Scale.\n\nBuild fast, deliver fast, grow.\n\nWe value delivering value over pursuing perfection. We continuously improve based on user feedback.',
        },
        {
          title: 'Current Products',
          content: '• Rem bot - Discord multi-function management Bot (In Development)\n• Navi - One-hand operation mobile app (In Development)\n\nWe will continue to develop products that make people\'s lives a little more convenient.',
        },
        {
          title: 'Tech Stack',
          content: '• Frontend: React, Next.js, TypeScript\n• Backend: Node.js, Python\n• Mobile: React Native, Expo\n• Infrastructure: Google Cloud, Vercel\n• Database: MongoDB, PostgreSQL',
        },
        {
          title: 'Contact',
          content: 'Feel free to contact us for product questions, feature requests, or bug reports.\n\nEmail: info.adalabtech@gmail.com\nX: @ADA_Lab_tech',
        },
      ],
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
        <div className="scanlines opacity-10" />
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-neon-cyan hover:text-neon-purple transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'ja' ? 'ホームに戻る' : 'Back to Home'}</span>
        </Link>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-2 holographic-text">
          {t.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-12">{t.subtitle}</p>

        {/* Info Cards */}
        <div className="grid gap-4 mb-12">
          {t.info.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="glass rounded-xl p-6 border border-border flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {t.sections.map((section, index) => (
            <section key={index} className="glass rounded-xl p-6 border border-border">
              <h2 className="text-2xl font-bold mb-4 text-neon-cyan">
                {section.title}
              </h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> by ADA Lab
          </p>
        </div>
      </div>
    </div>
  );
}
