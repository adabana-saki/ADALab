import type { Metadata, Viewport } from 'next';
import { Audiowide, Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { StructuredData } from '@/components/StructuredData';
import { WebVitals } from '@/components/WebVitals';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const audiowide = Audiowide({
  subsets: ['latin'],
  variable: '--font-audiowide',
  weight: ['400'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#06b6d4',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://adalab.dev'),
  title: {
    default: 'ADA Lab | あなたの"ほしい"を、カタチに',
    template: '%s | ADA Lab',
  },
  description:
    'ADA Labは、シンプルで使いやすいアプリやサービスを開発する個人開発チーム。Rem bot（Discord多機能Bot）やNavi（片手操作アプリ）など、かゆいところに手が届くプロダクトを提供します。',
  keywords: [
    'Discord Bot',
    'Rem bot',
    'Navi',
    'モバイルアプリ',
    '個人開発',
    'シンプル',
    '使いやすい',
    'Next.js',
    'React',
    'TypeScript',
    'ADA Lab',
    'アダラボ',
  ],
  authors: [{ name: 'Adabana Saki' }],
  creator: 'ADA Lab',
  publisher: 'ADA Lab',
  category: 'technology',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'ADA Lab | あなたの"ほしい"を、カタチに',
    description:
      'シンプルで使いやすいアプリを開発する個人開発チーム。Rem bot、Naviなど、かゆいところに手が届くプロダクトを提供します。',
    url: 'https://adalab.dev',
    siteName: 'ADA Lab',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US'],
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ADA Lab - あなたの"ほしい"を、カタチに',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADA Lab | あなたの"ほしい"を、カタチに',
    description:
      'シンプルで使いやすいアプリを開発する個人開発チーム。Rem bot、Naviなど、かゆいところに手が届くプロダクトを提供。',
    images: ['/og-image.png'],
    creator: '@saki_18191',
  },
  alternates: {
    canonical: 'https://adalab.dev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`scroll-smooth ${audiowide.variable} ${inter.variable} ${notoSansJP.variable}`}>
      <head>
        <StructuredData />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          メインコンテンツへスキップ
        </a>
        <GoogleAnalytics />
        <ThemeProvider>
          <LanguageProvider>
            <WebVitals />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
