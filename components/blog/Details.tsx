'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface DetailsProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Details({ title, children, defaultOpen = false }: DetailsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="my-6 rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={isOpen}
      >
        <ChevronRight
          size={18}
          className={`text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
        <span className="font-medium text-foreground">{title}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 border-t border-border/30">
          <div className="prose prose-invert max-w-none text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
