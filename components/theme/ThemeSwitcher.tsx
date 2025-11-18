'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, Check } from 'lucide-react';

type Theme = 'dark' | 'light';
type ColorScheme = 'default' | 'purple' | 'green' | 'orange';

const colorSchemes: Record<ColorScheme, { name: string; primary: string; secondary: string }> = {
  default: { name: 'サイバーパンク', primary: '#06b6d4', secondary: '#d946ef' },
  purple: { name: 'パープルドリーム', primary: '#8b5cf6', secondary: '#ec4899' },
  green: { name: 'マトリックス', primary: '#10b981', secondary: '#3b82f6' },
  orange: { name: 'サンセット', primary: '#f59e0b', secondary: '#ef4444' },
};

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme and color scheme
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'dark';
    const savedScheme = (localStorage.getItem('colorScheme') as ColorScheme) || 'default';

    setTheme(savedTheme);
    setColorScheme(savedScheme);

    applyTheme(savedTheme);
    applyColorScheme(savedScheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const applyColorScheme = (scheme: ColorScheme) => {
    const { primary, secondary } = colorSchemes[scheme];

    // Update CSS variables
    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-secondary', secondary);

    // Update theme color for PWA
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', primary);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const handleColorSchemeChange = (newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    localStorage.setItem('colorScheme', newScheme);
    applyColorScheme(newScheme);
  };

  return (
    <>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-56 right-4 z-[150] w-12 h-12 rounded-full bg-black/80 backdrop-blur-xl border-2 neon-border-fuchsia hover:scale-110 transition-all shadow-2xl flex items-center justify-center group"
        aria-label="Theme settings"
      >
        <Palette className="w-5 h-5 text-neon-fuchsia" />

        {/* Tooltip */}
        <div className="absolute right-full mr-2 px-3 py-1 bg-black/90 backdrop-blur-md border border-neon-fuchsia/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-xs text-neon-fuchsia font-mono">
            テーマ設定 (Ctrl+Shift+T)
          </span>
        </div>
      </button>

      {/* Theme Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-black/95 backdrop-blur-xl border-l-2 neon-border-fuchsia z-[201] p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold holographic-text">テーマ設定</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Theme Mode */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-neon-cyan">表示モード</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-neon-cyan bg-neon-cyan/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="w-5 h-5" />
                      <span>ダーク</span>
                    </div>
                    {theme === 'dark' && <Check className="w-5 h-5 text-neon-cyan ml-auto" />}
                  </button>

                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-neon-cyan bg-neon-cyan/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="w-5 h-5" />
                      <span>ライト</span>
                    </div>
                    {theme === 'light' && <Check className="w-5 h-5 text-neon-cyan ml-auto" />}
                  </button>
                </div>
              </div>

              {/* Color Schemes */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-neon-fuchsia">カラースキーム</h3>
                <div className="space-y-3">
                  {(Object.keys(colorSchemes) as ColorScheme[]).map((scheme) => (
                    <button
                      key={scheme}
                      onClick={() => handleColorSchemeChange(scheme)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        colorScheme === scheme
                          ? 'border-neon-fuchsia bg-neon-fuchsia/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold mb-1">{colorSchemes[scheme].name}</div>
                          <div className="flex gap-2">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white/30"
                              style={{ backgroundColor: colorSchemes[scheme].primary }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white/30"
                              style={{ backgroundColor: colorSchemes[scheme].secondary }}
                            />
                          </div>
                        </div>
                        {colorScheme === scheme && (
                          <Check className="w-6 h-6 text-neon-fuchsia" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold mb-2 text-sm">ヒント</h4>
                <p className="text-xs text-muted-foreground">
                  設定はブラウザに保存され、次回訪問時も保持されます。
                </p>
              </div>

              {/* Scanline effect */}
              <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
