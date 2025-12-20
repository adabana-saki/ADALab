import type { Metadata } from 'next';

const baseUrl = 'https://adalab.pages.dev';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'ADA Labのプライバシーポリシー。個人情報の収集、利用目的、第三者提供、Cookie使用について説明しています。',
  keywords: ['プライバシーポリシー', '個人情報', 'Cookie', 'ADA Lab', '個人情報保護'],
  alternates: {
    canonical: `${baseUrl}/privacy`,
  },
  openGraph: {
    title: 'プライバシーポリシー | ADA Lab',
    description: 'ADA Labのプライバシーポリシー。個人情報の取り扱いについて説明しています。',
    url: `${baseUrl}/privacy`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: 'プライバシーポリシー | ADA Lab',
    description: 'ADA Labのプライバシーポリシー。',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
