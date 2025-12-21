import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: {
    default: 'Games | ADA Lab',
    template: '%s | ADA Lab Games',
  },
  description: 'ブラウザで遊べるミニゲームコレクション。テトリスなど、無料で楽しめるゲームを公開しています。',
  keywords: ['ゲーム', 'ブラウザゲーム', 'テトリス', '無料ゲーム', 'ADA Lab'],
  alternates: {
    canonical: `${baseUrl}/games`,
  },
  openGraph: {
    title: 'Games | ADA Lab',
    description: 'ブラウザで遊べるミニゲームコレクション',
    url: `${baseUrl}/games`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Games | ADA Lab',
    description: 'ブラウザで遊べるミニゲームコレクション',
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
    </>
  );
}
