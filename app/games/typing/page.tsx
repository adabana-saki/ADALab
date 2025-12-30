'use client';

import { TypingGame } from '@/components/games/TypingGame';

export default function TypingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8">
        <TypingGame />
      </div>
    </div>
  );
}
