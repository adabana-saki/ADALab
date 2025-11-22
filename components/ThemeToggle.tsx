'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
        }`}
        aria-label="ライトモード"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
        }`}
        aria-label="ダークモード"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
        }`}
        aria-label="システム設定"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
