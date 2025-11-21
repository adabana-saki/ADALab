import type { Metadata, Viewport } from 'next';
import { Orbitron, Inter, Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { StructuredData } from '@/components/StructuredData';
import { WebVitals } from '@/components/WebVitals';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { LanguageProvider } from '@/contexts/LanguageContext';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '600', '700', '800', '900'],
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
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ADA Lab',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`scroll-smooth ${orbitron.variable} ${inter.variable} ${notoSansJP.variable}`}>
      <head>
        <StructuredData />
      </head>
      <body className="font-sans antialiased">
        <GoogleAnalytics />
        <LanguageProvider>
          <PWAProvider>
            <WebVitals />
            {children}
          </PWAProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
