import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'QRaft - QRコードユーティリティ',
  description: 'QRaftは、QRコードの読み取り・生成・保存を素早く行えるオールインワンアプリ。Wi-FiのQRコード化や履歴管理も可能です。',
  keywords: ['QRコード', 'QRコードリーダー', 'QRコード生成', 'Wi-Fi QR', 'バーコード', 'スキャナー', 'Android', 'iOS'],
  alternates: {
    canonical: `${baseUrl}/products/qraft`,
  },
  openGraph: {
    title: 'QRaft - QRコードユーティリティ | ADA Lab',
    description: 'QRコードの読み取り・生成・保存を素早く行えるオールインワンアプリ。',
    url: `${baseUrl}/products/qraft`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QRaft - QRコードユーティリティ | ADA Lab',
    description: 'QRコードの読み取り・生成・保存を素早く行えるオールインワンアプリ。',
  },
};

export default function QRaftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
