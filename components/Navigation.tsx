'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import dynamic from 'next/dynamic';

const ThemeToggle = dynamic(
  () => import('./ThemeToggle').then((mod) => mod.ThemeToggle),
  { ssr: false }
);

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // シンプルなナビ項目
  const navItems = [
    { name: 'Blog', href: '/blog' },
    { name: 'Products', href: '/products' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    if (isHomePage) {
      const element = document.querySelector('#contact');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  const isActiveLink = (href: string) => {
    if (href === '/blog') return pathname.startsWith('/blog');
    if (href === '/products') return pathname.startsWith('/products');
    return pathname === href;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/90 backdrop-blur-xl shadow-lg shadow-neon-cyan/10 border-b border-border/50'
            : 'bg-transparent'
        )}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <motion.span
                className="text-xl sm:text-2xl logo-text cursor-pointer"
                data-text="ADA LAB"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ADA LAB
              </motion.span>
            </Link>

            {/* Desktop Navigation - シンプルに */}
            <div className="hidden md:flex items-center gap-8">
              <ul className="flex items-center gap-1">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        isActiveLink(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* 右側のコントロール */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-all"
                  aria-label="Toggle language"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{language.toUpperCase()}</span>
                </button>
                {isHomePage && (
                  <Button onClick={scrollToContact} variant="default" size="sm">
                    {t.nav.getInTouch}
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2 rounded-lg hover:bg-muted/50 transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[72px] z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 md:hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-all",
                    isActiveLink(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <ThemeToggle />
                <button
                  onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50"
                  aria-label="Toggle language"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{language.toUpperCase()}</span>
                </button>
                {isHomePage && (
                  <Button onClick={scrollToContact} variant="default" size="sm" className="ml-auto">
                    {t.nav.getInTouch}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
