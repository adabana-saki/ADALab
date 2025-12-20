import type { Metadata } from 'next';

const baseUrl = 'https://adalab.pages.dev';

export const metadata: Metadata = {
  title: 'Products',
  description: 'ADA Labが開発するプロダクト一覧。Rem bot（Discord多機能Bot）やNavi（片手操作アプリ）など、シンプルで使いやすいアプリケーションを提供しています。',
  keywords: ['Discord Bot', 'Rem bot', 'Navi', '片手操作アプリ', 'ADA Lab', 'プロダクト'],
  alternates: {
    canonical: `${baseUrl}/products`,
  },
  openGraph: {
    title: 'Products | ADA Lab',
    description: 'ADA Labが開発するプロダクト一覧。Rem bot、Naviなど、シンプルで使いやすいアプリケーションを提供。',
    url: `${baseUrl}/products`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | ADA Lab',
    description: 'ADA Labが開発するプロダクト一覧。Rem bot、Naviなど、シンプルで使いやすいアプリケーション。',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
