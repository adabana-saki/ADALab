'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'プライバシーポリシー',
      lastUpdated: '最終更新日: 2025年12月21日',
      sections: [
        {
          title: '収集する情報',
          content: 'お問い合わせフォームから送信されたメールアドレスや名前を収集することがあります。これらはお問い合わせへの返信にのみ使用します。',
        },
        {
          title: 'アクセス解析',
          content: '当サイトではCloudflare Web Analyticsを使用しています。これはプライバシーに配慮した解析ツールで、Cookieを使用せず、個人を特定する情報は収集しません。',
        },
        {
          title: '各サービスでのデータ',
          content: '• Rem bot: Discordサーバー内のコマンド使用履歴を一時保存（サーバー退出時に削除）\n• ブラウザ拡張機能: すべてのデータはローカル保存、外部送信なし\n• モバイルアプリ: 詳細は各アプリのプライバシーポリシーを参照',
        },
        {
          title: '第三者への提供',
          content: '法令に基づく場合を除き、個人情報を第三者に提供することはありません。',
        },
        {
          title: 'お問い合わせ',
          content: 'プライバシーに関するご質問は info.adalabtech@gmail.com までお気軽にどうぞ。',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: December 21, 2025',
      sections: [
        {
          title: 'Information We Collect',
          content: 'We may collect your email address and name when you use our contact form. This is only used to respond to your inquiry.',
        },
        {
          title: 'Analytics',
          content: 'This site uses Cloudflare Web Analytics, a privacy-focused analytics tool that doesn\'t use cookies and doesn\'t collect personally identifiable information.',
        },
        {
          title: 'Data in Our Services',
          content: '• Rem bot: Temporarily stores command usage history within Discord servers (deleted when bot leaves)\n• Browser extensions: All data stored locally, nothing sent externally\n• Mobile apps: See each app\'s privacy policy for details',
        },
        {
          title: 'Third-Party Sharing',
          content: 'We do not share personal information with third parties, except as required by law.',
        },
        {
          title: 'Contact',
          content: 'Privacy questions? Email us at info.adalabtech@gmail.com.',
        },
      ],
    },
  };

  const t = content[language];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background pt-16">
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
        <h1 className="text-4xl md:text-5xl font-bold mb-4 holographic-text">
          {t.title}
        </h1>
        <p className="text-muted-foreground mb-12">{t.lastUpdated}</p>

        {/* Content */}
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

        </div>
      </div>
      <Footer />
    </>
  );
}
