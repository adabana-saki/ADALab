import type { Metadata, Viewport } from 'next';
import { Orbitron, Inter } from 'next/font/google';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#06b6d4',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://adalab.dev'),
  title: {
    default: 'ADA Lab | 革新的なプロダクトで世界を変える',
    template: '%s | ADA Lab',
  },
  description:
    'ADA Labは、テクノロジーで世界を変えるプロダクトカンパニー。ADA Analytics、ADA Connect、ADA Guardなど、革新的なSaaSプロダクトを開発・運営しています。50,000+のアクティブユーザーに支持されています。',
  keywords: [
    'SaaS',
    'プロダクト開発',
    'スタートアップ',
    'データ分析',
    'AIソリューション',
    'セキュリティ',
    'コラボレーションツール',
    '自社開発',
    'プロダクトカンパニー',
    'Next.js',
    'React',
    'TypeScript',
    'ADA Lab',
    'ADA Analytics',
    'ADA Connect',
  ],
  authors: [{ name: 'ADA Lab' }],
  creator: 'ADA Lab',
  publisher: 'ADA Lab',
  category: 'technology',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'ADA Lab | 革新的なプロダクトで世界を変える',
    description:
      'テクノロジーで世界を変えるプロダクトカンパニー。ADA Analytics、ADA Connect、ADA Guardなど、革新的なSaaSプロダクトを開発・運営。50,000+のアクティブユーザーに支持されています。',
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
        alt: 'ADA Lab - 革新的なプロダクトで世界を変える',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADA Lab | 革新的なプロダクトで世界を変える',
    description:
      'テクノロジーで世界を変えるプロダクトカンパニー。ADA Analytics、ADA Connect、ADA Guardなど、革新的なSaaSプロダクトを開発・運営。',
    images: ['/og-image.png'],
    creator: '@adalab',
  },
  alternates: {
    canonical: 'https://adalab.dev',
    languages: {
      'ja': 'https://adalab.dev',
      'en': 'https://adalab.dev/en',
    },
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
    <html lang="ja" className={`scroll-smooth ${orbitron.variable} ${inter.variable}`}>
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
