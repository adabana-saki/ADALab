'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Search,
  Home,
  User,
  Briefcase,
  Mail,
  FileText,
  Map,
  Sun,
  Moon,
  Globe,
  X,
  LucideIcon,
} from 'lucide-react';

interface Command {
  id: string;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const content = {
    ja: {
      placeholder: 'コマンドを検索...',
      navigation: 'ナビゲーション',
      actions: 'アクション',
      home: 'ホーム',
      about: 'About',
      products: 'プロダクト',
      contact: 'お問い合わせ',
      changelog: '更新履歴',
      roadmap: 'ロードマップ',
      toggleTheme: 'テーマ切り替え',
      toggleLanguage: '言語切り替え',
    },
    en: {
      placeholder: 'Search commands...',
      navigation: 'Navigation',
      actions: 'Actions',
      home: 'Home',
      about: 'About',
      products: 'Products',
      contact: 'Contact',
      changelog: 'Changelog',
      roadmap: 'Roadmap',
      toggleTheme: 'Toggle Theme',
      toggleLanguage: 'Toggle Language',
    },
  };

  const commands: Command[] = [
    {
      id: 'home',
      icon: Home,
      label: content[language].home,
      shortcut: 'H',
      action: () => {
        router.push('/');
        setIsOpen(false);
      },
    },
    {
      id: 'about',
      icon: User,
      label: content[language].about,
      shortcut: 'A',
      action: () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      },
    },
    {
      id: 'products',
      icon: Briefcase,
      label: content[language].products,
      shortcut: 'P',
      action: () => {
        router.push('/products');
        setIsOpen(false);
      },
    },
    {
      id: 'contact',
      icon: Mail,
      label: content[language].contact,
      shortcut: 'C',
      action: () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      },
    },
    {
      id: 'changelog',
      icon: FileText,
      label: content[language].changelog,
      action: () => {
        router.push('/changelog');
        setIsOpen(false);
      },
    },
    {
      id: 'roadmap',
      icon: Map,
      label: content[language].roadmap,
      action: () => {
        router.push('/roadmap');
        setIsOpen(false);
      },
    },
    {
      id: 'theme',
      icon: theme === 'dark' ? Sun : Moon,
      label: content[language].toggleTheme,
      shortcut: '⌘K',
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setIsOpen(false);
      },
    },
    {
      id: 'language',
      icon: Globe,
      label: content[language].toggleLanguage,
      shortcut: '⌘⇧L',
      action: () => {
        setLanguage(language === 'ja' ? 'en' : 'ja');
        setIsOpen(false);
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={content[language].placeholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No results found
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredCommands.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left group"
                      >
                        <cmd.icon className="w-4 h-4 text-muted-foreground group-hover:text-neon-cyan" />
                        <span className="flex-1 text-sm">{cmd.label}</span>
                        {cmd.shortcut && (
                          <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded">
                            {cmd.shortcut}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-white/10 text-xs text-muted-foreground">
                <kbd className="font-mono bg-white/5 px-1.5 py-0.5 rounded">↑↓</kbd> navigate
                <kbd className="font-mono bg-white/5 px-1.5 py-0.5 rounded ml-2">↵</kbd> select
                <kbd className="font-mono bg-white/5 px-1.5 py-0.5 rounded ml-2">esc</kbd> close
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
