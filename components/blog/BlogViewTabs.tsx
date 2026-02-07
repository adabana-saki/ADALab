'use client';

import { LayoutGrid, Archive, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ViewTab } from './hooks/useBlogFilters';

interface BlogViewTabsProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

const tabs: { id: ViewTab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'posts', label: '記事一覧', icon: LayoutGrid },
  { id: 'archive', label: 'アーカイブ', icon: Archive },
  { id: 'calendar', label: 'カレンダー', icon: CalendarDays },
];

export function BlogViewTabs({ activeTab, onTabChange }: BlogViewTabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-muted/50 backdrop-blur-sm border border-border w-fit">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="blog-view-tab-bg"
                className="absolute inset-0 rounded-lg bg-primary shadow-md pointer-events-none"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
