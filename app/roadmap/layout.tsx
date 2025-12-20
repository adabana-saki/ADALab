import type { Metadata } from 'next';

const baseUrl = 'https://adalab.pages.dev';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'ADA Labの開発ロードマップ。今後の機能追加、新プロダクト、API公開など、開発計画を公開しています。',
  keywords: ['ロードマップ', '開発計画', 'ADA Lab', 'プロダクト', '新機能'],
  alternates: {
    canonical: `${baseUrl}/roadmap`,
  },
  openGraph: {
    title: 'Roadmap | ADA Lab',
    description: 'ADA Labの開発ロードマップ。今後の機能追加、新プロダクト、API公開などの開発計画。',
    url: `${baseUrl}/roadmap`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roadmap | ADA Lab',
    description: 'ADA Labの開発ロードマップ。今後の開発計画を公開。',
  },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
