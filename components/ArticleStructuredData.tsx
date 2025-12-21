import Script from 'next/script';

interface ArticleStructuredDataProps {
  title: string;
  description: string;
  slug: string;
  date: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
}

export function ArticleStructuredData({
  title,
  description,
  slug,
  date,
  updatedAt,
  author = 'Adabana Saki',
  tags = [],
}: ArticleStructuredDataProps) {
  const baseUrl = 'https://adalabtech.com';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: `${baseUrl}/og/${slug}/og-image.png`,
    datePublished: date,
    dateModified: updatedAt || date,
    author: {
      '@type': 'Person',
      name: author,
      url: `${baseUrl}/company`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ADA Lab',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${slug}`,
    },
    keywords: tags.join(', '),
    articleSection: 'Technology',
    inLanguage: 'ja-JP',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${baseUrl}/blog/${slug}`,
      },
    ],
  };

  return (
    <Script
      id="article-structured-data"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([articleSchema, breadcrumbSchema]),
      }}
    />
  );
}
