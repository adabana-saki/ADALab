'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Github, Twitter, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const socialLinks = [
  { icon: Mail, label: 'Email', href: 'mailto:info.adalabtech@gmail.com' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/adabana-saki' },
  { icon: Twitter, label: 'X', href: 'https://x.com/saki_18191' },
];

const inquiryTypes = [
  'プロダクトに関するお問い合わせ',
  'バグ報告・機能要望',
  'パートナーシップ',
  'その他',
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ダミー送信処理（実際のAPI呼び出しに置き換え可能）
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', inquiryType: '', message: '' });

      // 3秒後にステータスをリセット
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            プロダクトに関するお問い合わせ、ご質問などお気軽にご連絡ください
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6">お気軽にご連絡ください</h3>

              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-semibold mb-2">メールアドレス</h4>
                  <a
                    href="mailto:info.adalabtech@gmail.com"
                    className="text-primary hover:underline"
                  >
                    info.adalabtech@gmail.com
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Discord</h4>
                  <p className="text-muted-foreground">
                    adabana_saki
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">運営者</h4>
                  <p className="text-muted-foreground">
                    Adabana Saki
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                      aria-label={social.label}
                    >
                      <social.icon
                        size={20}
                        className="text-primary group-hover:scale-110 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl">
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    お名前 *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="山田太郎"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    メールアドレス *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                  />
                </div>

                {/* Inquiry Type */}
                <div>
                  <label htmlFor="inquiryType" className="block text-sm font-medium mb-2">
                    お問い合わせ種別
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">選択してください</option>
                    {inquiryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    メッセージ *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="プロジェクトの詳細やご質問をお書きください"
                    rows={5}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    '送信中...'
                  ) : (
                    <>
                      送信する
                      <Send size={18} className="ml-2" />
                    </>
                  )}
                </Button>

                {/* Status Message */}
                {submitStatus === 'success' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-500 text-center text-sm"
                  >
                    送信完了しました。ご連絡ありがとうございます！
                  </motion.p>
                )}
                {submitStatus === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-center text-sm"
                  >
                    送信に失敗しました。もう一度お試しください。
                  </motion.p>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
