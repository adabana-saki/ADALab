'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <div className="pt-20">
        {children}
      </div>
      <Footer />
    </>
  );
}
