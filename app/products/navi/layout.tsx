import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'Navi - 片手操作アプリ',
  description: 'Naviは、スマートフォンを片手で快適に操作するためのユーティリティアプリ。カスタムジェスチャー、クイックアクション、ウィジェットで操作効率を向上。',
  keywords: ['片手操作', 'Android アプリ', 'Navi', 'ジェスチャー', 'ユーティリティ', 'スマートフォン', '操作効率化'],
  alternates: {
    canonical: `${baseUrl}/products/navi`,
  },
  openGraph: {
    title: 'Navi - 片手操作アプリ | ADA Lab',
    description: 'スマートフォンを片手で快適に操作。カスタムジェスチャー、クイックアクションで操作効率を向上。',
    url: `${baseUrl}/products/navi`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Navi - 片手操作アプリ | ADA Lab',
    description: 'スマートフォンを片手で快適に操作。カスタムジェスチャーで操作効率を向上。',
  },
};

export default function NaviLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
