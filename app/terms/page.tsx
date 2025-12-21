'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function TermsOfServicePage() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: '利用規約',
      lastUpdated: '最終更新日: 2025年11月18日',
      sections: [
        {
          title: '1. はじめに',
          content: 'この利用規約は、ADA Lab（運営: Adabana Saki）が提供するサービスの利用条件を定めるものです。各サービスをご利用いただく際には、本規約に同意いただいたものとみなします。',
        },
        {
          title: '2. 提供サービス',
          content: 'ADA Labでは以下のサービスを提供しています：\n• Rem bot（Discord Bot）\n• ShortShield（ブラウザ拡張機能）\n• Sumio（ブラウザ拡張機能）\n• Navi（Androidアプリ）\n• QRaft（モバイルアプリ）\n\n各サービスの詳細は製品ページをご確認ください。',
        },
        {
          title: '3. 禁止事項',
          content: '以下の行為は禁止します：\n• サービスの不正利用や悪用\n• 他のユーザーへの迷惑行為\n• サービスの改ざんやリバースエンジニアリング\n• 法令に違反する行為',
        },
        {
          title: '4. 免責事項',
          content: '各サービスは「現状のまま」提供されます。サービスの利用により生じた損害について、運営者は故意または重過失がある場合を除き責任を負いません。\n\n無料サービスについては、予告なく終了する場合があります。',
        },
        {
          title: '5. プライバシー',
          content: '個人情報の取り扱いについてはプライバシーポリシーをご確認ください。',
        },
        {
          title: '6. 規約の変更',
          content: '本規約は予告なく変更される場合があります。重要な変更がある場合は、サイト上でお知らせします。',
        },
        {
          title: '7. お問い合わせ',
          content: 'ご質問はお問い合わせフォームまたは info.adalabtech@gmail.com までお気軽にどうぞ。',
        },
      ],
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: November 18, 2025',
      sections: [
        {
          title: '1. Introduction',
          content: 'These Terms of Service define the conditions for using services provided by ADA Lab (operated by Adabana Saki). By using our services, you agree to these terms.',
        },
        {
          title: '2. Services',
          content: 'ADA Lab provides the following services:\n• Rem bot (Discord Bot)\n• ShortShield (Browser Extension)\n• Sumio (Browser Extension)\n• Navi (Android App)\n• QRaft (Mobile App)\n\nSee product pages for details.',
        },
        {
          title: '3. Prohibited Actions',
          content: 'The following are prohibited:\n• Misuse or abuse of services\n• Harassment of other users\n• Tampering with or reverse engineering services\n• Violating any laws',
        },
        {
          title: '4. Disclaimer',
          content: 'Services are provided "as is". We are not liable for damages from service use, except in cases of intentional or gross negligence.\n\nFree services may be discontinued without notice.',
        },
        {
          title: '5. Privacy',
          content: 'See our Privacy Policy for how we handle personal information.',
        },
        {
          title: '6. Changes',
          content: 'These terms may change without notice. Significant changes will be announced on our site.',
        },
        {
          title: '7. Contact',
          content: 'Questions? Contact us via the inquiry form or info.adalabtech@gmail.com.',
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
