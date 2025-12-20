import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'News',
  description: 'ADA Labからのお知らせ。新機能リリース、メンテナンス情報、重要なお知らせを掲載しています。',
  keywords: ['News', 'お知らせ', 'ADA Lab', 'リリース情報', 'メンテナンス'],
  alternates: {
    canonical: `${baseUrl}/news`,
  },
  openGraph: {
    title: 'News | ADA Lab',
    description: 'ADA Labからのお知らせ。新機能リリース、メンテナンス情報を掲載。',
    url: `${baseUrl}/news`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News | ADA Lab',
    description: 'ADA Labからのお知らせ。',
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
