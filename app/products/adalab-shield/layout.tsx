import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'adalab shield - ショート動画ブロッカー',
  description: 'adalab shieldは、YouTube Shorts、TikTok、Instagramリールなどのショート動画を制限し、集中力を取り戻すためのブラウザ拡張機能です。',
  keywords: ['ショート動画', 'ブロッカー', '集中力', 'YouTube Shorts', 'TikTok', '時間管理', 'ブラウザ拡張機能', 'Chrome拡張'],
  alternates: {
    canonical: `${baseUrl}/products/adalab-shield`,
  },
  openGraph: {
    title: 'adalab shield - ショート動画ブロッカー | ADA Lab',
    description: 'ショート動画の視聴を制限し、集中力を取り戻すためのブラウザ拡張機能。',
    url: `${baseUrl}/products/adalab-shield`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'adalab shield - ショート動画ブロッカー | ADA Lab',
    description: 'ショート動画の視聴を制限し、集中力を取り戻すためのブラウザ拡張機能。',
  },
};

export default function AdalabShieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
