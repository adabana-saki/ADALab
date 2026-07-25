import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'よくある質問 (FAQ)',
  description: 'ADA Lab のプロダクトに関するよくある質問と回答。adalab focus のデータ同期・オフライン・アカウント・料金・不具合報告などについてまとめています。',
  keywords: ['FAQ', 'よくある質問', 'adalab focus', 'ADA Lab', 'サポート', 'データ同期'],
  alternates: {
    canonical: `${baseUrl}/faq`,
  },
  openGraph: {
    title: 'よくある質問 (FAQ) | ADA Lab',
    description: 'ADA Lab のプロダクトに関するよくある質問と回答。adalab focus の使い方・データ・料金・不具合報告など。',
    url: `${baseUrl}/faq`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'よくある質問 (FAQ) | ADA Lab',
    description: 'ADA Labに関するよくある質問と回答。',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
