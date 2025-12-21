import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'Sumio - AI要約アシスタント',
  description: 'Sumioは、閲覧中のWebページをAIが瞬時に要約するブラウザ拡張機能。長文記事も3行で把握でき、情報収集を効率化します。',
  keywords: ['AI要約', '要約', 'ブラウザ拡張機能', 'ChatGPT', 'Claude', 'Gemini', '情報収集', '生産性向上'],
  alternates: {
    canonical: `${baseUrl}/products/sumio`,
  },
  openGraph: {
    title: 'Sumio - AI要約アシスタント | ADA Lab',
    description: '閲覧中のWebページをAIが瞬時に要約。情報収集を効率化するブラウザ拡張機能。',
    url: `${baseUrl}/products/sumio`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sumio - AI要約アシスタント | ADA Lab',
    description: '閲覧中のWebページをAIが瞬時に要約。情報収集を効率化するブラウザ拡張機能。',
  },
};

export default function SumioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
