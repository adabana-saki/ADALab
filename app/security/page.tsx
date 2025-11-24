'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, FileCheck, AlertTriangle } from 'lucide-react';

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
          title: 'データ暗号化',
          description: 'すべての通信はTLS 1.3で暗号化され、保存データはAES-256で保護されています。',
        },
        {
          icon: Shield,
          title: 'アクセス制御',
          description: '最小権限の原則に基づき、必要最小限のアクセス権限のみを付与しています。',
        },
        {
          icon: Eye,
          title: 'プライバシー保護',
          description: '個人情報は目的外使用せず、第三者への提供は法令に基づく場合のみ行います。',
        },
        {
          icon: Server,
          title: 'インフラセキュリティ',
          description: 'Cloudflareの DDoS保護、WAF、Bot管理を活用し、インフラを保護しています。',
        },
        {
          icon: FileCheck,
          title: 'コード品質',
          description: '自動化されたセキュリティスキャン、依存関係の脆弱性チェックを実施しています。',
        },
        {
          icon: AlertTriangle,
          title: 'インシデント対応',
          description: 'セキュリティインシデント発生時は24時間以内に影響範囲を特定し、対応します。',
        },
      ],
      certifications: 'セキュリティ対策',
      contact: 'セキュリティに関するお問い合わせ',
      contactDesc: 'セキュリティに関する問題を発見された場合は、以下までご連絡ください。',
    },
    en: {
      title: 'Security Policy',
      subtitle: 'Our commitment to protecting your data',
      lastUpdated: 'Last Updated',
      sections: [
        {
          icon: Lock,
          title: 'Data Encryption',
          description: 'All communications are encrypted with TLS 1.3, and stored data is protected with AES-256.',
        },
        {
          icon: Shield,
          title: 'Access Control',
          description: 'We follow the principle of least privilege, granting only minimum necessary access rights.',
        },
        {
          icon: Eye,
          title: 'Privacy Protection',
          description: 'Personal information is not used beyond its intended purpose and is only shared with third parties as required by law.',
        },
        {
          icon: Server,
          title: 'Infrastructure Security',
          description: 'We utilize Cloudflare DDoS protection, WAF, and Bot management to secure our infrastructure.',
        },
        {
          icon: FileCheck,
          title: 'Code Quality',
          description: 'We perform automated security scans and dependency vulnerability checks.',
        },
        {
          icon: AlertTriangle,
          title: 'Incident Response',
          description: 'We identify the scope of impact within 24 hours of a security incident and respond accordingly.',
        },
      ],
      certifications: 'Security Measures',
      contact: 'Security Inquiries',
      contactDesc: 'If you discover a security issue, please contact us at:',
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
                {content[language].lastUpdated}: 2024-01-01
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
