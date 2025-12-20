import type { Metadata } from 'next';

const baseUrl = 'https://adalab.pages.dev';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'ADA Labサイトの更新履歴。新機能、改善、バグ修正などの変更内容を時系列で確認できます。',
  keywords: ['Changelog', '更新履歴', 'ADA Lab', 'リリースノート', 'アップデート'],
  alternates: {
    canonical: `${baseUrl}/changelog`,
  },
  openGraph: {
    title: 'Changelog | ADA Lab',
    description: 'ADA Labサイトの更新履歴。新機能、改善、バグ修正などの変更内容。',
    url: `${baseUrl}/changelog`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog | ADA Lab',
    description: 'ADA Labサイトの更新履歴。',
  },
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
