import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'About ADA Lab',
  description: 'ADA Labは「あなたの"ほしい"を、カタチに」をモットーに、シンプルで使いやすいアプリを開発する個人開発チーム。受託開発のご相談も承ります。',
  keywords: ['ADA Lab', '個人開発', '開発チーム', 'アプリ開発', '受託開発', 'Web開発'],
  alternates: {
    canonical: `${baseUrl}/company`,
  },
  openGraph: {
    title: 'About ADA Lab | あなたの"ほしい"を、カタチに',
    description: 'シンプルで使いやすいアプリを開発する個人開発チーム。受託開発のご相談も承ります。',
    url: `${baseUrl}/company`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ADA Lab',
    description: 'シンプルで使いやすいアプリを開発する個人開発チーム。',
  },
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
