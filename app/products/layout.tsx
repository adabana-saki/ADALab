import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'Products',
  description: 'ADA Labが開発するプロダクト一覧。集中管理PWA「adalab focus」と連携拡張「adalab shield」を中心に、個人開発のアプリを公開しています。',
  keywords: ['adalab focus', 'adalab shield', '集中アプリ', 'ポモドーロ', 'サイトブロック', 'ADA Lab', 'プロダクト'],
  alternates: {
    canonical: `${baseUrl}/products`,
  },
  openGraph: {
    title: 'Products | ADA Lab',
    description: 'ADA Labが開発するプロダクト一覧。集中管理PWA「adalab focus」と連携拡張「adalab shield」を中心に、個人開発のアプリを公開。',
    url: `${baseUrl}/products`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Products | ADA Lab',
    description: 'ADA Labが開発するプロダクト一覧。adalab focus・adalab shield など個人開発のアプリ。',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
