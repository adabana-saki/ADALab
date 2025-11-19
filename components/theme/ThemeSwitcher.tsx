'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, Check } from 'lucide-react';

type Theme = 'dark' | 'light';
type ColorScheme = 'default' | 'purple' | 'green' | 'orange';

const colorSchemes: Record<ColorScheme, { name: string; primary: string; secondary: string; accent: string }> = {
  default: { name: 'サイバーパンク', primary: '189 94% 43%', secondary: '271 91% 65%', accent: '331 86% 65%' },
  purple: { name: 'パープルドリーム', primary: '271 91% 65%', secondary: '330 81% 60%', accent: '217 91% 60%' },
  green: { name: 'マトリックス', primary: '160 84% 39%', secondary: '217 91% 60%', accent: '189 94% 43%' },
  orange: { name: 'サンセット', primary: '38 92% 50%', secondary: '4 90% 58%', accent: '271 91% 65%' },
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
    const { primary, secondary, accent } = colorSchemes[scheme];

    // Update CSS variables (HSL format)
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--secondary', secondary);
    document.documentElement.style.setProperty('--accent', accent);

    // Update theme color for PWA (convert HSL to hex for meta tag)
    const hslToHex = (hsl: string) => {
      const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
      const lightness = l / 100;
      const saturation = s / 100;
      const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
      const huePrime = h / 60;
      const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));

      let r = 0, g = 0, b = 0;
      if (huePrime >= 0 && huePrime < 1) [r, g, b] = [chroma, secondComponent, 0];
      else if (huePrime >= 1 && huePrime < 2) [r, g, b] = [secondComponent, chroma, 0];
      else if (huePrime >= 2 && huePrime < 3) [r, g, b] = [0, chroma, secondComponent];
      else if (huePrime >= 3 && huePrime < 4) [r, g, b] = [0, secondComponent, chroma];
      else if (huePrime >= 4 && huePrime < 5) [r, g, b] = [secondComponent, 0, chroma];
      else if (huePrime >= 5 && huePrime < 6) [r, g, b] = [chroma, 0, secondComponent];

      const lightnessAdjustment = lightness - chroma / 2;
      r = Math.round((r + lightnessAdjustment) * 255);
      g = Math.round((g + lightnessAdjustment) * 255);
      b = Math.round((b + lightnessAdjustment) * 255);

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', hslToHex(primary));
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
        className="fixed bottom-68 right-4 z-[100] w-12 h-12 rounded-full bg-black/90 backdrop-blur-xl border-2 neon-border-fuchsia hover:scale-110 transition-all shadow-2xl flex items-center justify-center group"
        aria-label="Theme settings"
      >
        <Palette className="w-5 h-5 text-neon-fuchsia" />

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/90 backdrop-blur-md border border-neon-fuchsia/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-xs text-neon-fuchsia font-mono">
            テーマ設定
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
                              style={{ backgroundColor: `hsl(${colorSchemes[scheme].primary})` }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white/30"
                              style={{ backgroundColor: `hsl(${colorSchemes[scheme].secondary})` }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white/30"
                              style={{ backgroundColor: `hsl(${colorSchemes[scheme].accent})` }}
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
