import type { Metadata, Viewport } from 'next';
import { Orbitron, Inter } from 'next/font/google';
import './globals.css';
import { StructuredData } from '@/components/StructuredData';
import { WebVitals } from '@/components/WebVitals';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

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
    default: 'ADA Lab | ソフトウェア・アプリ開発',
    template: '%s | ADA Lab',
  },
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
    'フロントエンド開発',
    'バックエンド開発',
    'フルスタック開発',
    'ADA Lab',
  ],
  authors: [{ name: 'ADA Lab' }],
  creator: 'ADA Lab',
  publisher: 'ADA Lab',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'ADA Lab | ソフトウェア・アプリ開発',
    description:
      'ADA Labは、最先端の技術で革新的なソフトウェアとアプリを開発する個人事業です。',
    url: 'https://adalab.dev',
    siteName: 'ADA Lab',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ADA Lab - ソフトウェア・アプリ開発',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADA Lab | ソフトウェア・アプリ開発',
    description:
      'ADA Labは、最先端の技術で革新的なソフトウェアとアプリを開発する個人事業です。',
    images: ['/og-image.png'],
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
        <PWAProvider>
          <WebVitals />
          {children}
        </PWAProvider>
      </body>
    </html>
  );
}
