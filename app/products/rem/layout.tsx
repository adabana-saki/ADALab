import type { Metadata } from 'next';

const baseUrl = 'https://adalab.pages.dev';

export const metadata: Metadata = {
  title: 'Rem bot - Discord多機能Bot',
  description: 'Rem botは、リマインダー、タスク管理、ロール管理、自動応答など多彩な機能を備えたDiscord Bot。無料で導入でき、サーバー管理を効率化します。',
  keywords: ['Discord Bot', 'Rem bot', 'リマインダー', 'タスク管理', 'ロール管理', '自動応答', 'サーバー管理', '無料Bot'],
  alternates: {
    canonical: `${baseUrl}/products/rem`,
  },
  openGraph: {
    title: 'Rem bot - Discord多機能Bot | ADA Lab',
    description: 'リマインダー、タスク管理、ロール管理、自動応答など多彩な機能を備えた無料Discord Bot。',
    url: `${baseUrl}/products/rem`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rem bot - Discord多機能Bot | ADA Lab',
    description: 'リマインダー、タスク管理、ロール管理など多彩な機能を備えた無料Discord Bot。',
  },
};

export default function RemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
