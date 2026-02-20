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
      lastUpdated: '最終更新日: 2026年2月20日',
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
          content: '• Rem bot: Discordサーバー内のコマンド使用履歴を一時保存（サーバー退出時に削除）\n• ブラウザ拡張機能: すべてのデータはローカル保存、外部送信なし\n• モバイルアプリ（Navi）: 下記「Navi プライバシーポリシー」をご参照ください',
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
      naviTitle: 'Navi プライバシーポリシー',
      naviSections: [
        {
          title: '基本方針',
          content: 'Naviはユーザーのプライバシーを最優先に設計されたAndroidアプリです。\n\n• アカウント登録不要\n• すべての設定はお客様の端末にローカル保存（Android DataStore使用）\n• 個人データの外部送信なし\n• トラッキング、Cookie、分析なし',
        },
        {
          title: 'ユーザー補助サービス（アクセシビリティサービス）の使用',
          content: 'Naviは、トラックパッドでのカーソル操作・タップ・スクロールを実現するためにAndroidユーザー補助サービスを使用します。\n\n【使用する内容】\n• トラックパッド領域内のタッチ座標とジェスチャーの検出\n• カーソル位置でのタップ・スクロールのジェスチャー注入（dispatchGesture）\n• 戻る・ホーム・通知などのシステムアクション実行（performGlobalAction）\n\n【アクセスしない内容】\n• 画面に表示されているコンテンツ\n• 他のアプリで入力されたテキストやパスワード\n• ブラウジング履歴やアプリ使用状況\n• 個人を特定できる情報\n\nすべてのジェスチャー処理は完全に端末上で行われ、外部に送信されることはありません。',
        },
        {
          title: '広告について',
          content: 'Naviの無料版ではGoogle AdMobによるバナー広告およびリワード広告を表示します。\n\n• AdMobは広告配信のために広告IDを使用します\n• 広告のパーソナライズはGoogleの設定に従います\n• プレミアム版（¥490・買い切り）では広告は完全に非表示になります\n\nGoogle AdMobのプライバシーポリシー:\nhttps://policies.google.com/privacy',
        },
        {
          title: '購入情報',
          content: 'プレミアム版の購入はGoogle Play課金で処理されます。\n\n• 支払い情報（クレジットカード等）には当方はアクセスできません\n• Google Playから匿名化された購入検証トークンのみ提供されます\n• 購入状態はローカルに保存されます',
        },
        {
          title: '必要な権限',
          content: '• SYSTEM_ALERT_WINDOW: カーソルとトラックパッドをオーバーレイ表示するために必要\n• ユーザー補助サービス: タップ・スクロール等のジェスチャー実行に必要\n• INTERNET: 広告表示およびGoogle Play課金通信に使用\n\n個人データの送信には使用しません。',
        },
        {
          title: 'データの削除',
          content: 'アプリをアンインストールすると、すべてのローカルデータが自動的に削除されます。アプリ内の設定画面からいつでも設定をデフォルトにリセットできます。',
        },
        {
          title: '児童のプライバシー',
          content: 'Naviは13歳未満の児童を対象としていません。13歳未満の児童から故意に情報を収集することはありません。',
        },
        {
          title: '対応法令',
          content: '本ポリシーは以下に準拠しています:\n• 一般データ保護規則（GDPR）\n• カリフォルニア州消費者プライバシー法（CCPA）\n• 個人情報保護法（日本）\n• Google Play Developer Program Policies',
        },
      ],
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: February 20, 2026',
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
          content: '• Rem bot: Temporarily stores command usage history within Discord servers (deleted when bot leaves)\n• Browser extensions: All data stored locally, nothing sent externally\n• Mobile apps (Navi): See "Navi Privacy Policy" section below',
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
      naviTitle: 'Navi Privacy Policy',
      naviSections: [
        {
          title: 'Core Principles',
          content: 'Navi is an Android app designed with user privacy as the top priority.\n\n• No account registration required\n• All settings stored locally on your device (Android DataStore)\n• No personal data transmitted externally\n• No tracking, cookies, or analytics',
        },
        {
          title: 'Accessibility Service Usage',
          content: 'Navi uses the Android Accessibility Service to enable cursor control, tapping, and scrolling via the trackpad.\n\n[What we use]\n• Touch coordinate detection within the trackpad area\n• Gesture injection at cursor position (dispatchGesture)\n• System actions like Back, Home, Notifications (performGlobalAction)\n\n[What we do NOT access]\n• Screen content displayed by other apps\n• Text or passwords entered in other apps\n• Browsing history or app usage data\n• Personally identifiable information\n\nAll gesture processing is performed entirely on your device and is never transmitted externally.',
        },
        {
          title: 'Advertising',
          content: 'The free version of Navi displays banner and rewarded ads via Google AdMob.\n\n• AdMob uses the advertising ID for ad delivery\n• Ad personalization follows Google\'s settings\n• Premium (¥490, one-time purchase) removes all ads\n\nGoogle AdMob Privacy Policy:\nhttps://policies.google.com/privacy',
        },
        {
          title: 'Purchase Information',
          content: 'Premium purchases are processed through Google Play Billing.\n\n• We have no access to payment information (credit cards, etc.)\n• Google Play only provides anonymized purchase verification tokens\n• Purchase status is stored locally on your device',
        },
        {
          title: 'Required Permissions',
          content: '• SYSTEM_ALERT_WINDOW: Required to display cursor and trackpad as overlay\n• Accessibility Service: Required for tap, scroll, and gesture execution\n• INTERNET: Used for ad display and Google Play Billing\n\nNo personal data is transmitted.',
        },
        {
          title: 'Data Deletion',
          content: 'Uninstalling the app automatically deletes all local data. You can reset settings to default anytime from the app\'s settings screen.',
        },
        {
          title: 'Children\'s Privacy',
          content: 'Navi is not directed at children under 13. We do not knowingly collect information from children under 13.',
        },
        {
          title: 'Legal Compliance',
          content: 'This policy complies with:\n• General Data Protection Regulation (GDPR)\n• California Consumer Privacy Act (CCPA)\n• Act on Protection of Personal Information (Japan)\n• Google Play Developer Program Policies',
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

        {/* Navi Privacy Policy */}
        <div id="navi" className="mt-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 holographic-text">
            {t.naviTitle}
          </h2>
          <div className="space-y-8">
            {t.naviSections.map((section, index) => (
              <section key={index} className="glass rounded-xl p-6 border border-border">
                <h3 className="text-2xl font-bold mb-4 text-neon-cyan">
                  {section.title}
                </h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
