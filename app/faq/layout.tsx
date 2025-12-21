import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'よくある質問 (FAQ)',
  description: 'ADA Labに関するよくある質問と回答。開発依頼、サービス内容、料金、技術スタック、サポートについてお答えします。',
  keywords: ['FAQ', 'よくある質問', 'ADA Lab', '開発依頼', 'サポート', '質問'],
  alternates: {
    canonical: `${baseUrl}/faq`,
  },
  openGraph: {
    title: 'よくある質問 (FAQ) | ADA Lab',
    description: 'ADA Labに関するよくある質問と回答。開発依頼、サービス内容についてお答えします。',
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
