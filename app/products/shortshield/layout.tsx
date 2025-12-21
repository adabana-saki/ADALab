import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'ShortShield - ショート動画ブロッカー',
  description: 'ShortShieldは、YouTube Shorts、TikTok、Instagramリールなどのショート動画を制限し、集中力を取り戻すためのブラウザ拡張機能です。',
  keywords: ['ショート動画', 'ブロッカー', '集中力', 'YouTube Shorts', 'TikTok', '時間管理', 'ブラウザ拡張機能', 'Chrome拡張'],
  alternates: {
    canonical: `${baseUrl}/products/shortshield`,
  },
  openGraph: {
    title: 'ShortShield - ショート動画ブロッカー | ADA Lab',
    description: 'ショート動画の視聴を制限し、集中力を取り戻すためのブラウザ拡張機能。',
    url: `${baseUrl}/products/shortshield`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShortShield - ショート動画ブロッカー | ADA Lab',
    description: 'ショート動画の視聴を制限し、集中力を取り戻すためのブラウザ拡張機能。',
  },
};

export default function ShortShieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
