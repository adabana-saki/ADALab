import type { Metadata } from 'next';

const baseUrl = 'https://adalabtech.com';

export const metadata: Metadata = {
  title: 'Tech Stack',
  description: 'ADA Labで使用している技術スタック。Next.js、React、TypeScript、Tailwind CSS、Node.js、PostgreSQL、Cloudflareなど最新技術を採用。',
  keywords: ['技術スタック', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Cloudflare'],
  alternates: {
    canonical: `${baseUrl}/tech-stack`,
  },
  openGraph: {
    title: 'Tech Stack | ADA Lab',
    description: 'ADA Labで使用している技術スタック。Next.js、React、TypeScriptなど最新技術を採用。',
    url: `${baseUrl}/tech-stack`,
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tech Stack | ADA Lab',
    description: 'ADA Labで使用している技術スタック。最新技術を採用。',
  },
};

export default function TechStackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
