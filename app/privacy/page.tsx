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
      lastUpdated: '最終更新日: 2025年11月18日',
      sections: [
        {
          title: '1. 個人情報の収集',
          content: '当社は、お問い合わせフォームやサービスの利用を通じて、お客様の氏名、メールアドレス、電話番号などの個人情報を収集する場合があります。これらの情報は、お客様へのサービス提供、お問い合わせへの対応、および当社サービスの改善のためにのみ使用されます。',
        },
        {
          title: '2. 個人情報の利用目的',
          content: '収集した個人情報は、以下の目的で利用します：\n• お客様へのサービス提供\n• お問い合わせへの対応\n• メールマガジンやお知らせの配信\n• サービスの改善および新サービスの開発\n• 利用状況の分析',
        },
        {
          title: '3. 個人情報の第三者提供',
          content: '当社は、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。',
        },
        {
          title: '4. 個人情報の管理',
          content: '当社は、個人情報の正確性および安全性を確保するため、適切な管理体制を整備し、個人情報への不正アクセス、紛失、破壊、改ざん、漏洩などを防止します。',
        },
        {
          title: '5. Cookie の使用',
          content: '当サイトでは、サービスの利便性向上のため Cookie を使用しています。Cookie により、お客様のブラウザを識別し、より良いユーザー体験を提供することができます。Cookie の使用を希望されない場合は、ブラウザの設定から無効化することができます。',
        },
        {
          title: '6. 個人情報の開示・訂正・削除',
          content: 'お客様は、当社が保有するご自身の個人情報について、開示、訂正、削除を請求することができます。詳細については、お問い合わせフォームよりご連絡ください。',
        },
        {
          title: '7. プライバシーポリシーの変更',
          content: '当社は、法令の変更や事業内容の変更に伴い、本プライバシーポリシーを変更する場合があります。変更後のプライバシーポリシーは、本ページに掲載した時点から効力を生じるものとします。',
        },
        {
          title: '8. お問い合わせ',
          content: 'プライバシーポリシーに関するお問い合わせは、当サイトのお問い合わせフォームよりご連絡ください。',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: November 18, 2025',
      sections: [
        {
          title: '1. Collection of Personal Information',
          content: 'We may collect personal information such as your name, email address, and phone number through contact forms and service usage. This information is used solely for providing services, responding to inquiries, and improving our services.',
        },
        {
          title: '2. Purpose of Use',
          content: 'Collected personal information is used for the following purposes:\n• Providing services to customers\n• Responding to inquiries\n• Sending newsletters and notifications\n• Service improvement and new service development\n• Usage analysis',
        },
        {
          title: '3. Third-Party Disclosure',
          content: 'We will not provide personal information to third parties without customer consent, except as required by law.',
        },
        {
          title: '4. Information Security',
          content: 'We maintain appropriate management systems to ensure the accuracy and security of personal information, preventing unauthorized access, loss, destruction, falsification, and leakage.',
        },
        {
          title: '5. Use of Cookies',
          content: 'This site uses cookies to improve service convenience. Cookies allow us to identify your browser and provide a better user experience. You can disable cookies through your browser settings if you prefer.',
        },
        {
          title: '6. Disclosure, Correction, and Deletion',
          content: 'You may request disclosure, correction, or deletion of your personal information held by us. Please contact us through the inquiry form for details.',
        },
        {
          title: '7. Policy Changes',
          content: 'We may change this privacy policy in accordance with legal changes or business changes. The updated policy becomes effective when posted on this page.',
        },
        {
          title: '8. Contact',
          content: 'For inquiries regarding this privacy policy, please contact us through our inquiry form.',
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
