'use client';

import { motion } from 'framer-motion';
import { Mail, Github, Twitter, Heart } from 'lucide-react';
import { SiDiscord, SiQiita } from 'react-icons/si';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const footerLinksData = {
  company: {
    ja: [
      { name: '会社概要', href: '#about' },
      { name: 'プロダクト', href: '/products' },
      { name: 'ブログ', href: '/blog' },
      { name: 'お問い合わせ', href: '#contact' },
    ],
    en: [
      { name: 'About', href: '#about' },
      { name: 'Products', href: '/products' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '#contact' },
    ],
  },
  legal: {
    ja: [
      { name: '会社情報', href: '/company' },
      { name: 'よくある質問', href: '/faq' },
      { name: 'プライバシーポリシー', href: '/privacy' },
      { name: '利用規約', href: '/terms' },
    ],
    en: [
      { name: 'Company Info', href: '/company' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },
  social: [
    { name: 'GitHub', href: 'https://github.com/adabana-saki', icon: Github },
    { name: 'X', href: 'https://x.com/ADA_Lab_tech', icon: Twitter },
    { name: 'Discord', href: 'https://discord.gg/7Egm8uJPDs', icon: SiDiscord },
    { name: 'Qiita', href: 'https://qiita.com/adabana-saki', icon: SiQiita },
    { name: 'Email', href: 'mailto:info.adalabtech@gmail.com', icon: Mail },
  ],
};

export function Footer() {
  const { language } = useLanguage();
  const companyLinks = footerLinksData.company[language];
  const legalLinks = footerLinksData.legal[language];

  const content = {
    ja: {
      description: 'あなたの"ほしい"を、カタチに。シンプルで使いやすいアプリを開発しています。',
      company: '会社',
      legal: '法的情報',
      connect: 'つながる',
      madeWith: '日本で作られました',
    },
    en: {
      description: 'Simple tools for everyday needs. We develop easy-to-use apps.',
      company: 'Company',
      legal: 'Legal',
      connect: 'Connect',
      madeWith: 'Made in Japan',
    },
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold gradient-text mb-4">ADA Lab</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {content[language].description}
            </p>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4">{content[language].company}</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('#') ? (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-semibold mb-4">{content[language].legal}</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social & Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="font-semibold mb-4">{content[language].connect}</h4>
            <div className="flex gap-3 mb-4">
              {footerLinksData.social.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors group"
                  aria-label={social.name}
                >
                  <social.icon
                    size={18}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </a>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              info.adalabtech@gmail.com
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ADA Lab. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            {language === 'ja' ? '作られました' : 'Made with'} <Heart size={14} className="text-red-500 fill-red-500" /> {language === 'ja' ? '日本で' : 'in Japan'}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
