import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'About ADA Lab',
  description: '自分が困ったものを自分のために作っている個人開発 ADA Lab について。集中管理アプリ「adalab focus」を中心に、実際に使うツールを公開しています。',
  keywords: ['ADA Lab', '個人開発', 'adalab focus', 'アプリ開発', '作っている人', 'Web開発'],
  alternates: {
    canonical: `${baseUrl}/company`,
  },
  openGraph: {
    title: 'About ADA Lab | 作っている人',
    description: '自分が困ったものを自分のために作っている個人開発 ADA Lab について。adalab focus を中心に公開しています。',
    url: `${baseUrl}/company`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ADA Lab',
    description: '自分が困ったものを自分のために作っている個人開発 ADA Lab について。',
  },
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
