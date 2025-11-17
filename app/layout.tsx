import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ADA Lab | ソフトウェア・アプリ開発',
  description:
    'ADA Labは、最先端の技術で革新的なソフトウェアとアプリを開発する個人事業です。Web開発、モバイルアプリ開発、UI/UXデザインなど、幅広いサービスを提供しています。',
  keywords: [
    'ソフトウェア開発',
    'アプリ開発',
    'Web開発',
    'モバイルアプリ',
    'UI/UX',
    'Next.js',
    'React',
    'TypeScript',
  ],
  authors: [{ name: 'ADA Lab' }],
  openGraph: {
    title: 'ADA Lab | ソフトウェア・アプリ開発',
    description:
      'ADA Labは、最先端の技術で革新的なソフトウェアとアプリを開発する個人事業です。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADA Lab | ソフトウェア・アプリ開発',
    description:
      'ADA Labは、最先端の技術で革新的なソフトウェアとアプリを開発する個人事業です。',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
