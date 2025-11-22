'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mail, Github, Twitter, Send, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Toast } from '../ui/toast';
import { executeRecaptcha } from '../ReCaptcha';

const socialLinks = [
  { icon: Mail, label: 'Email', href: 'mailto:info.adalabtech@gmail.com' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/adabana-saki' },
  { icon: Twitter, label: 'X', href: 'https://x.com/saki_18191' },
  { icon: FaDiscord, label: 'Discord', href: 'https://discord.com/users/adabana_saki' },
];

const inquiryTypes = [
  'プロダクトに関するお問い合わせ',
  'バグ報告・機能要望',
  'パートナーシップ',
  'その他',
];

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  // 残り回数を取得
  useEffect(() => {
    const fetchRemaining = async () => {
      try {
        const res = await fetch('/api/contact/remaining');
        const data = await res.json();
        setRemaining(data.remaining);
      } catch {
        setRemaining(null);
      }
    };
    fetchRemaining();
  }, [isSubmitted]); // 送信後にも更新

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'お名前を入力してください';
        if (value.length < 2) return 'お名前は2文字以上で入力してください';
        break;
      case 'email':
        if (!value.trim()) return 'メールアドレスを入力してください';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '有効なメールアドレスを入力してください';
        break;
      case 'message':
        if (!value.trim()) return 'メッセージを入力してください';
        if (value.length < 10) return 'メッセージは10文字以上で入力してください';
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    newErrors.name = validateField('name', formData.name);
    newErrors.email = validateField('email', formData.email);
    newErrors.message = validateField('message', formData.message);

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, email: true, message: true });

    if (!validateForm()) {
      setToast({
        message: '入力内容を確認してください',
        type: 'error',
        isVisible: true,
      });
      setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 4000);
      return;
    }

    setIsSubmitting(true);

    try {
      // reCAPTCHAトークン取得
      const recaptchaToken = await executeRecaptcha('contact');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', inquiryType: '', message: '' });
        setErrors({});
        setTouched({});
      } else {
        setToast({
          message: data.message || '送信に失敗しました。もう一度お試しください。',
          type: 'error',
          isVisible: true,
        });
      }
    } catch {
      setToast({
        message: '送信に失敗しました。もう一度お試しください。',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 4000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validate on change if field has been touched
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-muted/20 relative overflow-hidden">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

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
                  <h4 className="font-semibold mb-2">対応時間</h4>
                  <p className="text-muted-foreground">
                    8:00 - 24:00（JST）
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
            {isSubmitted ? (
              <div className="glass p-8 rounded-2xl text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">送信完了</h3>
                <p className="text-muted-foreground mb-4">
                  お問い合わせありがとうございます。<br />
                  確認メールをお送りしましたのでご確認ください。
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  内容を確認次第、ご連絡いたします。
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                >
                  新しいお問い合わせ
                </Button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl" noValidate>
              {/* 残り回数表示 */}
              {remaining !== null && (
                <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${
                  remaining === 0
                    ? 'bg-red-500/10 text-red-500'
                    : remaining <= 10
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-primary/10 text-primary'
                }`}>
                  <Info size={16} />
                  <span>
                    本日の残り送信可能回数: <strong>{remaining}</strong>回
                  </span>
                </div>
              )}
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="山田太郎"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={errors.name && touched.name ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.name && touched.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="example@email.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.email && touched.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
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
                    メッセージ <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="プロダクトに関するご質問やフィードバックをお書きください"
                    rows={5}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className={errors.message && touched.message ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.message && touched.message && (
                    <p id="message-error" className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || remaining === 0}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      送信中...
                    </span>
                  ) : (
                    <>
                      送信する
                      <Send size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
