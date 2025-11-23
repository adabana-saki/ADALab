'use client';

import { useKeyboardShortcuts, scrollToTop } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      handler: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      description: 'Toggle theme',
    },
    {
      key: 'l',
      ctrl: true,
      shift: true,
      handler: () => setLanguage(language === 'ja' ? 'en' : 'ja'),
      description: 'Toggle language',
    },
    {
      key: 'Home',
      handler: scrollToTop,
      description: 'Scroll to top',
    },
    {
      key: '/',
      ctrl: true,
      handler: () => {
        const helpModal = document.getElementById('shortcuts-help');
        if (helpModal) {
          helpModal.classList.toggle('hidden');
        }
      },
      description: 'Show keyboard shortcuts',
    },
  ]);

  return <>{children}</>;
}
