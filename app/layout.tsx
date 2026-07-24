import type { Metadata, Viewport } from 'next';
import { Audiowide, Space_Grotesk, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';
import { StructuredData } from '@/components/StructuredData';
import { WebVitals } from '@/components/WebVitals';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { SentryProvider, SentryErrorBoundary } from '@/components/analytics/SentryProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcutsProvider';

const audiowide = Audiowide({
  subsets: ['latin'],
  variable: '--font-audiowide',
  weight: ['400'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  variable: '--font-zen-kaku',
  weight: ['400', '500', '700'],
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
    default: 'ADA Lab | 集中できない人のための集中アプリ adalab focus',
    template: '%s | ADA Lab',
  },
  description:
    '勉強に集中できなかったので、集中するためのアプリを作りました。adalab focus はポモドーロ・TODO・学習記録・誘惑サイトブロックを1つにまとめた無料の学習集中アプリ（Web / PWA）。個人開発です。',
  keywords: [
    'adalab focus',
    '集中アプリ',
    'ポモドーロ',
    '学習記録',
    '勉強タイマー',
    'サイトブロック',
    'PWA',
    '個人開発',
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
    title: 'ADA Lab | 集中できない人のための集中アプリ adalab focus',
    description:
      '勉強に集中できなかったので、集中するためのアプリを作りました。ポモドーロ・TODO・学習記録・誘惑サイトブロックを1つに。無料の学習集中アプリ、個人開発です。',
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
        alt: 'ADA Lab - 集中できない人のための集中アプリ',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ADA_Lab_tech',
    creator: '@ADA_Lab_tech',
    title: 'ADA Lab | 集中できない人のための集中アプリ adalab focus',
    description:
      '勉強に集中できなかったので、集中するためのアプリを作りました。ポモドーロ・TODO・学習記録・誘惑サイトブロックを1つに。無料・個人開発。',
    images: {
      url: 'https://adalabtech.com/twitter-image.png',
      alt: 'ADA Lab - 集中できない人のための集中アプリ',
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
    <html lang="ja" className={`dark scroll-smooth ${audiowide.variable} ${spaceGrotesk.variable} ${zenKakuGothicNew.variable}`}>
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
              <AuthProvider>
                <LanguageProvider>
                  <KeyboardShortcutsProvider>
                    <WebVitals />
                    {children}
                  </KeyboardShortcutsProvider>
                </LanguageProvider>
              </AuthProvider>
            </ThemeProvider>
          </SentryErrorBoundary>
        </SentryProvider>
      </body>
    </html>
  );
}
