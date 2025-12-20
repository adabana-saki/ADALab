import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'セキュリティポリシー',
  description: 'ADA Labのセキュリティポリシー。データ暗号化、アクセス制御、プライバシー保護、インシデント対応についての取り組み。',
  keywords: ['セキュリティポリシー', 'セキュリティ', 'データ保護', 'ADA Lab', '暗号化', 'プライバシー'],
  alternates: {
    canonical: `${baseUrl}/security`,
  },
  openGraph: {
    title: 'セキュリティポリシー | ADA Lab',
    description: 'ADA Labのセキュリティポリシー。お客様のデータを守るための取り組み。',
    url: `${baseUrl}/security`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: 'セキュリティポリシー | ADA Lab',
    description: 'ADA Labのセキュリティポリシー。',
  },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
