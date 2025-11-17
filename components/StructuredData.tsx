export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ADA Lab',
    description:
      'ADA Labは、最先端の技術で革新的なソフトウェアとアプリを開発する個人事業です。',
    url: 'https://adalab.dev',
    logo: 'https://adalab.dev/logo.png',
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
      'ADA Labは、最先端の技術で革新的なソフトウェアとアプリを開発する個人事業です。',
    inLanguage: 'ja-JP',
  };

  const professionalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'ADA Lab',
    image: 'https://adalab.dev/logo.png',
    '@id': 'https://adalab.dev',
    url: 'https://adalab.dev',
    telephone: '',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tokyo',
      addressCountry: 'JP',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.6762,
      longitude: 139.6503,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    sameAs: [
      'https://github.com/adalab',
      'https://twitter.com/adalab',
      'https://linkedin.com/company/adalab',
    ],
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
        name: 'Services',
        item: 'https://adalab.dev#services',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Projects',
        item: 'https://adalab.dev#projects',
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
          __html: JSON.stringify(professionalServiceSchema),
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
