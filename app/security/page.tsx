'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Lock, Eye, Server, FileCheck } from 'lucide-react';

export default function SecurityPage() {
  const { language } = useLanguage();

  const content = {
    ja: {
      title: 'セキュリティポリシー',
      subtitle: 'お客様のデータを守るための取り組み',
      lastUpdated: '最終更新',
      sections: [
        {
          icon: Lock,
          title: 'HTTPS通信',
          description: 'すべての通信はHTTPS（TLS 1.3）で暗号化されています。',
        },
        {
          icon: Server,
          title: 'Cloudflare保護',
          description: 'Cloudflare PagesでホスティングしているためDDoS保護とWAFが適用されています。',
        },
        {
          icon: Eye,
          title: 'プライバシー優先',
          description: '不要な個人情報は収集しません。アクセス解析もCookieを使わないCloudflare Web Analyticsを採用。',
        },
        {
          icon: FileCheck,
          title: 'オープンソース',
          description: 'サイトのソースコードはGitHubで公開しています。透明性を大切にしています。',
        },
      ],
      certifications: 'セキュリティ対策',
      contact: 'セキュリティに関するお問い合わせ',
      contactDesc: 'セキュリティに関する問題を発見された場合は、以下までご連絡ください。',
    },
    en: {
      title: 'Security Policy',
      subtitle: 'How we protect your data',
      lastUpdated: 'Last Updated',
      sections: [
        {
          icon: Lock,
          title: 'HTTPS Encryption',
          description: 'All communications are encrypted with HTTPS (TLS 1.3).',
        },
        {
          icon: Server,
          title: 'Cloudflare Protection',
          description: 'Hosted on Cloudflare Pages with DDoS protection and WAF enabled.',
        },
        {
          icon: Eye,
          title: 'Privacy First',
          description: 'We don\'t collect unnecessary personal data. Our analytics (Cloudflare Web Analytics) doesn\'t use cookies.',
        },
        {
          icon: FileCheck,
          title: 'Open Source',
          description: 'Our site\'s source code is public on GitHub. Transparency matters to us.',
        },
      ],
      certifications: 'Security Measures',
      contact: 'Security Inquiries',
      contactDesc: 'Found a security issue? Please contact us at:',
    },
  };

  const certBadges = [
    { name: 'SSL/TLS', status: 'active' },
    { name: 'HTTPS Only', status: 'active' },
    { name: 'CSP Headers', status: 'active' },
    { name: 'HSTS', status: 'active' },
  ];

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">{content[language].title}</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                {content[language].subtitle}
              </p>
              <p className="text-sm text-muted-foreground">
                {content[language].lastUpdated}: 2025-12-21
              </p>
            </motion.div>

            {/* Security Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass p-6 rounded-2xl mb-8"
            >
              <h2 className="text-xl font-bold mb-4">{content[language].certifications}</h2>
              <div className="flex flex-wrap gap-3">
                {certBadges.map((badge) => (
                  <div
                    key={badge.name}
                    className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Security Sections */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {content[language].sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 2) }}
                  className="glass p-6 rounded-2xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">{section.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="glass p-6 rounded-2xl text-center"
            >
              <h2 className="text-xl font-bold mb-2">{content[language].contact}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {content[language].contactDesc}
              </p>
              <a
                href="mailto:info.adalabtech@gmail.com"
                className="text-neon-cyan hover:text-neon-cyan/80 font-mono"
              >
                info.adalabtech@gmail.com
              </a>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
