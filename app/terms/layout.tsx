import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: '利用規約',
  description: 'ADA Labの利用規約。サービスの利用条件、ユーザーの責任、知的財産権、免責事項について定めています。',
  keywords: ['利用規約', 'Terms of Service', 'ADA Lab', 'サービス利用条件'],
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: '利用規約 | ADA Lab',
    description: 'ADA Labの利用規約。サービスの利用条件を定めています。',
    url: `${baseUrl}/terms`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary',
    title: '利用規約 | ADA Lab',
    description: 'ADA Labの利用規約。',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
