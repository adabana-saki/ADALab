'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const shortcuts = [
  { keys: ['H'], description: 'ホームへ移動' },
  { keys: ['A'], description: 'About セクションへ移動' },
  { keys: ['S'], description: 'Services セクションへ移動' },
  { keys: ['T'], description: 'Technologies セクションへ移動' },
  { keys: ['P'], description: 'Projects セクションへ移動' },
  { keys: ['C'], description: 'Contact セクションへ移動' },
  { keys: ['↑'], description: 'ページトップへスクロール' },
  { keys: ['?'], description: 'このヘルプを表示' },
  { keys: ['Esc'], description: 'モーダル/ヘルプを閉じる' },
];

export function KeyboardShortcutsHelper() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-40 p-3 rounded-full bg-muted/80 backdrop-blur-sm text-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
        aria-label="キーボードショートカットヘルプ"
        title="キーボードショートカット (Press ?)"
      >
        <Keyboard
          size={20}
          className="group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Help modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
            >
              <div className="glass rounded-xl p-6 shadow-2xl border border-border">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Keyboard className="text-primary" size={24} />
                    <h2 className="text-2xl font-bold">
                      キーボードショートカット
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="閉じる"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Shortcuts list */}
                <div className="space-y-3">
                  {shortcuts.map((shortcut, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-2">
                        {shortcut.keys.map((key, i) => (
                          <kbd
                            key={i}
                            className="px-3 py-1 bg-background border border-border rounded-md text-sm font-mono shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
                  Press <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>{' '}
                  to toggle this help
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
