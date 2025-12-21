import type { Metadata, Viewport } from 'next';
import { Audiowide, Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { StructuredData } from '@/components/StructuredData';
import { WebVitals } from '@/components/WebVitals';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { SentryProvider, SentryErrorBoundary } from '@/components/analytics/SentryProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcutsProvider';

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
  metadataBase: new URL('https://adalabtech.com'),
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
    url: 'https://adalabtech.com',
    siteName: 'ADA Lab',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US'],
    images: [
      {
        url: 'https://adalabtech.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'ADA Lab - あなたの"ほしい"を、カタチに',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ADA_Lab_tech',
    creator: '@ADA_Lab_tech',
    title: 'ADA Lab | あなたの"ほしい"を、カタチに',
    description:
      'シンプルで使いやすいアプリを開発する個人開発チーム。Rem bot、Naviなど、かゆいところに手が届くプロダクトを提供。',
    images: {
      url: 'https://adalabtech.com/twitter-image.png',
      alt: 'ADA Lab - あなたの"ほしい"を、カタチに',
    },
  },
  alternates: {
    canonical: 'https://adalabtech.com',
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
      'yandex-verification': process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`scroll-smooth ${audiowide.variable} ${inter.variable} ${notoSansJP.variable}`}>
      <body className="font-sans antialiased">
        <StructuredData />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          メインコンテンツへスキップ
        </a>
        <GoogleAnalytics />
        <SentryProvider>
          <SentryErrorBoundary>
            <ThemeProvider>
              <LanguageProvider>
                <KeyboardShortcutsProvider>
                  <WebVitals />
                  {children}
                </KeyboardShortcutsProvider>
              </LanguageProvider>
            </ThemeProvider>
          </SentryErrorBoundary>
        </SentryProvider>
      </body>
    </html>
  );
}
