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
  const [activeSection, setActiveSection] = useState('home');
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const navItems = [
    { name: t.nav.home, href: '#home', id: 'home' },
    { name: t.nav.about, href: '#about', id: 'about' },
    { name: t.nav.technologies, href: '#technologies', id: 'technologies' },
    { name: t.nav.projects, href: '#projects', id: 'projects' },
    { name: t.nav.news, href: '#news', id: 'news' },
    { name: t.nav.contact, href: '#contact', id: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section with Intersection Observer
  useEffect(() => {
    const sectionIds = ['home', 'about', 'technologies', 'projects', 'news', 'contact'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(id);
              }
            });
          },
          { threshold: 0.1, rootMargin: '-10% 0px -60% 0px' }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
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
            {isHomePage ? (
              <motion.a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#home');
                }}
                className="text-xl sm:text-2xl md:text-2xl logo-text cursor-pointer"
                data-text="ADA LAB"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ADA LAB
              </motion.a>
            ) : (
              <Link href="/">
                <motion.span
                  className="text-xl sm:text-2xl md:text-2xl logo-text cursor-pointer"
                  data-text="ADA LAB"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ADA LAB
                </motion.span>
              </Link>
            )}

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                    }}
                    className={cn(
                      "transition-colors relative group cursor-pointer",
                      activeSection === item.id
                        ? "text-neon-cyan"
                        : "text-foreground/80 hover:text-foreground"
                    )}
                  >
                    {item.name}
                    <span className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all",
                      activeSection === item.id ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                  </a>
                </li>
              ))}
            </ul>

            {/* Theme Toggle, Language Toggle & CTA Button (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group"
                aria-label="Toggle language"
              >
                <Globe className="w-4 h-4 text-neon-cyan group-hover:text-neon-fuchsia transition-colors" />
                <span className="text-sm font-medium">{language === 'ja' ? 'JP' : 'EN'}</span>
              </button>
              <Button
                onClick={() => scrollToSection('#contact')}
                variant="default"
              >
                {t.nav.getInTouch}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2 rounded-lg hover:bg-white/10 transition-all active:scale-95"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-3xl font-bold text-foreground hover:text-neon-cyan transition-all cursor-pointer active:scale-95 py-2"
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
                className="flex flex-col gap-4 w-full max-w-xs mt-4"
              >
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-lg bg-white/5 backdrop-blur-md border-2 border-white/10 hover:border-neon-cyan/50 hover:bg-white/10 transition-all group active:scale-95"
                  aria-label="Toggle language"
                >
                  <Globe className="w-6 h-6 text-neon-cyan group-hover:text-neon-fuchsia transition-colors" />
                  <span className="text-lg font-medium">{language === 'ja' ? 'JP' : 'EN'}</span>
                </button>
                <Button
                  onClick={() => scrollToSection('#contact')}
                  variant="default"
                  className="w-full py-6 text-lg"
                >
                  {t.nav.getInTouch}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
