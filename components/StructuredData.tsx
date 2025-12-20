import Script from 'next/script';

export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ADA Lab',
    description:
      'ADA Labは、シンプルで使いやすいアプリやサービスを開発する個人開発チーム。Rem bot（Discord多機能Bot）やNavi（片手操作アプリ）など、日常の「あったらいいな」を形にしています。',
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
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ADA Lab',
    alternateName: 'ADA Lab - あなたの"ほしい"を、カタチに',
    url: 'https://adalabtech.com',
    description:
      'シンプルで使いやすいアプリを開発する個人開発チーム。Discord Bot、モバイルアプリなど、使いやすさを追求したプロダクトを提供。',
    inLanguage: 'ja-JP',
    publisher: {
      '@type': 'Organization',
      name: 'ADA Lab',
    },
  };

  const remBotSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Rem bot',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'Discord Bot',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock',
    },
    description:
      'リマインダー、タスク管理、ロール管理、自動応答など多彩な機能を備えたDiscord多機能Bot。無料で導入でき、サーバー管理を効率化します。',
    featureList: [
      'リマインダー機能',
      'タスク管理',
      'ロール管理',
      '自動応答',
      '繰り返し設定',
    ],
    url: 'https://adalabtech.com/products/rem',
    author: {
      '@type': 'Organization',
      name: 'ADA Lab',
    },
  };

  const naviAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Navi',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: 'One-handed Operation App',
    operatingSystem: 'Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
      availability: 'https://schema.org/PreOrder',
    },
    description:
      'スマートフォンを片手で快適に操作するためのユーティリティアプリ。カスタムジェスチャー、クイックアクション、ウィジェットで操作効率を向上。',
    featureList: [
      '片手操作最適化',
      'カスタムジェスチャー',
      'クイックアクション',
      'ウィジェット',
    ],
    url: 'https://adalabtech.com/products/navi',
    author: {
      '@type': 'Organization',
      name: 'ADA Lab',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
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
  };

  // Combine all schemas into a single array for one script tag
  const allSchemas = [
    organizationSchema,
    websiteSchema,
    remBotSchema,
    naviAppSchema,
    breadcrumbSchema,
  ];

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(allSchemas),
      }}
    />
  );
}
