export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ADA Lab',
    description:
      'ADA Labは、テクノロジーで世界を変えるプロダクトカンパニー。ADA Analytics、ADA Connect、ADA Guardなど、革新的なSaaSプロダクトを開発・運営しています。',
    url: 'https://adalab.dev',
    logo: 'https://adalab.dev/logo.png',
    foundingDate: '2024',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: 15,
    },
    sameAs: [
      'https://github.com/adalab',
      'https://twitter.com/adalab',
      'https://linkedin.com/company/adalab',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Japanese', 'English'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ADA Lab',
    url: 'https://adalab.dev',
    description:
      'テクノロジーで世界を変えるプロダクトカンパニー。50,000+のアクティブユーザーに支持される革新的なSaaSプロダクトを提供。',
    inLanguage: 'ja-JP',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://adalab.dev/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const adaAnalyticsSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ADA Analytics',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '2500',
    },
    description: 'AIを活用した高度なデータ分析プラットフォーム',
  };

  const adaConnectSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ADA Connect',
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      ratingCount: '1800',
    },
    description: 'リアルタイムコラボレーションツール',
  };

  const adaGuardSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ADA Guard',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '3200',
    },
    description: '次世代セキュリティ監視システム',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://adalab.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://adalab.dev#about',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Products',
        item: 'https://adalab.dev#products',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Team',
        item: 'https://adalab.dev#team',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Contact',
        item: 'https://adalab.dev#contact',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(adaAnalyticsSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(adaConnectSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(adaGuardSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}
