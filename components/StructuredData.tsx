import Script from 'next/script';

export function StructuredData() {
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'ADA Lab',
        description:
          'ADA Labは、自分が困ったものを自分のために作っている個人開発です。集中管理アプリ「adalab focus」や連携拡張「adalab shield」など、実際に使うツールを公開しています。',
        url: 'https://adalabtech.com',
        logo: 'https://adalabtech.com/logo.png',
        foundingDate: '2025',
        sameAs: [
          'https://github.com/adabana-saki',
          'https://x.com/ADA_Lab_tech',
          'https://discord.gg/7Egm8uJPDs',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'info.adalabtech@gmail.com',
          availableLanguage: ['Japanese', 'English'],
        },
      },
      {
        '@type': 'WebSite',
        name: 'ADA Lab',
        alternateName: 'ADA Lab - 個人開発',
        url: 'https://adalabtech.com',
        description:
          '自分が困ったものを自分のために作っている個人開発 ADA Lab。集中管理アプリ「adalab focus」を中心にツールを公開しています。',
        inLanguage: 'ja-JP',
        publisher: {
          '@type': 'Organization',
          name: 'ADA Lab',
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'adalab focus',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'JPY',
          availability: 'https://schema.org/InStock',
        },
        description:
          'TODO・ポモドーロ・学習記録・統計・試験カウントダウンを1つにまとめた集中管理 PWA。PCとスマホで自動同期、オフライン対応。無料で使えます。',
        featureList: [
          'TODO 管理',
          'ポモドーロ',
          '学習統計',
          '試験カウントダウン',
          'オフライン PWA',
          'Google ログイン',
        ],
        url: 'https://study.adalabtech.com',
        author: {
          '@type': 'Organization',
          name: 'ADA Lab',
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'adalab shield',
        applicationCategory: 'UtilitiesApplication',
        applicationSubCategory: 'Browser Extension',
        operatingSystem: 'Chrome, Firefox',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'JPY',
          availability: 'https://schema.org/InStock',
        },
        description:
          'adalab focus と連携し、フォーカス中は誘惑サイトを自動ブロック・休憩中は解除する集中ガード拡張機能。9言語対応。',
        featureList: [
          'adalab focus 連携',
          '読み込み前ブロック',
          'ポップアップからタイマー操作',
          'ショート動画ブロック',
          'ブロック統計',
        ],
        url: 'https://adalabtech.com/products/adalab-shield',
        author: {
          '@type': 'Organization',
          name: 'ADA Lab',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://adalabtech.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: 'https://adalabtech.com/products',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Blog',
            item: 'https://adalabtech.com/blog',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'About',
            item: 'https://adalabtech.com/company',
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: 'Contact',
            item: 'https://adalabtech.com/#contact',
          },
        ],
      },
    ],
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(combinedSchema),
      }}
    />
  );
}
