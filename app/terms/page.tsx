'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: '利用規約',
      lastUpdated: '最終更新日: 2025年11月18日',
      sections: [
        {
          title: '1. はじめに',
          content: 'この利用規約（以下「本規約」）は、株式会社ADA Lab（以下「当社」）が提供するサービス（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただく際には、本規約に同意いただいたものとみなします。',
        },
        {
          title: '2. サービスの内容',
          content: '本サービスは、Web開発、モバイルアプリ開発、UI/UXデザインなどのソフトウェア開発サービスを提供します。サービスの詳細については、個別の契約により定めるものとします。',
        },
        {
          title: '3. ユーザーの責任',
          content: 'ユーザーは、以下の事項を遵守するものとします：\n• 法令および本規約を遵守すること\n• 正確な情報を提供すること\n• アカウント情報を適切に管理すること\n• 第三者の権利を侵害しないこと\n• 本サービスの運営を妨げる行為をしないこと',
        },
        {
          title: '4. 知的財産権',
          content: '本サービスに関する知的財産権は、当社または正当な権利者に帰属します。ユーザーは、当社の事前の書面による許可なく、本サービスのコンテンツを複製、転載、配布することはできません。',
        },
        {
          title: '5. 免責事項',
          content: '当社は、本サービスの内容の正確性、完全性、有用性について保証するものではありません。また、本サービスの利用により生じた損害について、当社は一切の責任を負いません。ただし、当社の故意または重過失による場合はこの限りではありません。',
        },
        {
          title: '6. サービスの変更・中断',
          content: '当社は、ユーザーへの事前通知なく、本サービスの内容を変更、追加、削除、または一時的に中断することができます。これによりユーザーに生じた損害について、当社は一切の責任を負いません。',
        },
        {
          title: '7. 契約の解除',
          content: 'ユーザーが本規約に違反した場合、当社は事前の通知なく、本サービスの利用を停止または契約を解除することができます。',
        },
        {
          title: '8. 準拠法および管轄裁判所',
          content: '本規約は日本法に準拠し、本規約に関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。',
        },
        {
          title: '9. お問い合わせ',
          content: '本規約に関するお問い合わせは、当サイトのお問い合わせフォームよりご連絡ください。',
        },
      ],
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: November 18, 2025',
      sections: [
        {
          title: '1. Introduction',
          content: 'These Terms of Service ("Terms") define the conditions for using services ("Services") provided by ADA Lab Inc. ("Company"). By using our Services, you agree to these Terms.',
        },
        {
          title: '2. Service Description',
          content: 'Our Services include software development services such as web development, mobile app development, and UI/UX design. Specific details shall be defined in individual contracts.',
        },
        {
          title: '3. User Responsibilities',
          content: 'Users must comply with the following:\n• Comply with laws and these Terms\n• Provide accurate information\n• Properly manage account information\n• Not infringe on third-party rights\n• Not interfere with service operations',
        },
        {
          title: '4. Intellectual Property',
          content: 'Intellectual property rights related to our Services belong to the Company or legitimate rights holders. Users may not reproduce, reprint, or distribute service content without prior written permission.',
        },
        {
          title: '5. Disclaimer',
          content: 'We do not guarantee the accuracy, completeness, or usefulness of our Services. We shall not be liable for any damages arising from service use, except in cases of intentional or gross negligence.',
        },
        {
          title: '6. Service Changes and Interruptions',
          content: 'We may change, add, delete, or temporarily interrupt service content without prior notice. We shall not be liable for any damages resulting from such actions.',
        },
        {
          title: '7. Contract Termination',
          content: 'If users violate these Terms, we may suspend service use or terminate the contract without prior notice.',
        },
        {
          title: '8. Governing Law and Jurisdiction',
          content: 'These Terms are governed by Japanese law. Tokyo District Court shall have exclusive jurisdiction as the court of first instance for disputes.',
        },
        {
          title: '9. Contact',
          content: 'For inquiries regarding these Terms, please contact us through our inquiry form.',
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

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 ADA Lab. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
