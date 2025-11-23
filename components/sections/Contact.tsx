'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mail, Github, Twitter, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Toast } from '../ui/toast';
import emailjs from '@emailjs/browser';
import { useLanguage } from '@/contexts/LanguageContext';

const socialLinks = [
  { icon: Mail, label: 'Email', href: 'mailto:info.adalabtech@gmail.com' },
  { icon: Github, label: 'GitHub', href: 'https://github.com/adabana-saki' },
  { icon: Twitter, label: 'X', href: 'https://x.com/saki_18191' },
  { icon: FaDiscord, label: 'Discord', href: 'https://discord.com/users/adabana_saki' },
];

const inquiryTypesData = {
  ja: [
    'プロダクトに関するお問い合わせ',
    'バグ報告・機能要望',
    'パートナーシップ',
    'その他',
  ],
  en: [
    'Product Inquiry',
    'Bug Report / Feature Request',
    'Partnership',
    'Other',
  ],
};

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function Contact() {
  const { language } = useLanguage();
  const inquiryTypes = inquiryTypesData[language];

  const content = {
    ja: {
      subtitle: 'プロダクトに関するお問い合わせ、ご質問などお気軽にご連絡ください',
      contactUs: 'お気軽にご連絡ください',
      email: 'メールアドレス',
      hours: '対応時間',
      operator: '運営者',
      name: 'お名前',
      namePlaceholder: '山田太郎',
      emailLabel: 'メールアドレス',
      inquiryType: 'お問い合わせ種別',
      selectPlaceholder: '選択してください',
      message: 'メッセージ',
      messagePlaceholder: 'プロダクトに関するご質問やフィードバックをお書きください',
      submit: '送信する',
      submitting: '送信中...',
      submitted: '送信完了',
      thankYou: 'お問い合わせありがとうございます。',
      confirmEmail: '確認メールをお送りしましたのでご確認ください。',
      willContact: '内容を確認次第、ご連絡いたします。',
      newInquiry: '新しいお問い合わせ',
      formUnavailable: 'お問い合わせフォームは現在ご利用いただけません。',
      contactByEmail: 'メールにてお問い合わせください: ',
      checkInput: '入力内容を確認してください',
      sendFailed: '送信に失敗しました。もう一度お試しください。',
      nameRequired: 'お名前を入力してください',
      nameMinLength: 'お名前は2文字以上で入力してください',
      emailRequired: 'メールアドレスを入力してください',
      emailInvalid: '有効なメールアドレスを入力してください',
      messageRequired: 'メッセージを入力してください',
      messageMinLength: 'メッセージは10文字以上で入力してください',
    },
    en: {
      subtitle: 'Feel free to contact us with any questions about our products',
      contactUs: 'Get in Touch',
      email: 'Email',
      hours: 'Hours',
      operator: 'Operator',
      name: 'Name',
      namePlaceholder: 'John Doe',
      emailLabel: 'Email',
      inquiryType: 'Inquiry Type',
      selectPlaceholder: 'Please select',
      message: 'Message',
      messagePlaceholder: 'Please write your questions or feedback about our products',
      submit: 'Send Message',
      submitting: 'Sending...',
      submitted: 'Message Sent',
      thankYou: 'Thank you for your inquiry.',
      confirmEmail: 'Please check your email for confirmation.',
      willContact: 'We will contact you as soon as we review your message.',
      newInquiry: 'New Inquiry',
      formUnavailable: 'The contact form is currently unavailable.',
      contactByEmail: 'Please contact us by email: ',
      checkInput: 'Please check your input',
      sendFailed: 'Failed to send. Please try again.',
      nameRequired: 'Please enter your name',
      nameMinLength: 'Name must be at least 2 characters',
      emailRequired: 'Please enter your email',
      emailInvalid: 'Please enter a valid email address',
      messageRequired: 'Please enter a message',
      messageMinLength: 'Message must be at least 10 characters',
    },
  };

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    setIsConfigured(!!(serviceId && templateId && publicKey));
  }, []);

  const validateField = (name: string, value: string): string | undefined => {
    const c = content[language];
    switch (name) {
      case 'name':
        if (!value.trim()) return c.nameRequired;
        if (value.length < 2) return c.nameMinLength;
        break;
      case 'email':
        if (!value.trim()) return c.emailRequired;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return c.emailInvalid;
        break;
      case 'message':
        if (!value.trim()) return c.messageRequired;
        if (value.length < 10) return c.messageMinLength;
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
        message: content[language].checkInput,
        type: 'error',
        isVisible: true,
      });
      setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 4000);
      return;
    }

    setIsSubmitting(true);

    try {
      // EmailJS設定
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS is not configured');
      }

      // 管理者への通知メール
      await emailjs.send(
        serviceId,
        templateId,
        {
          name: formData.name,
          email: formData.email,
          inquiry_type: formData.inquiryType || '未選択',
          message: formData.message,
          time: new Date().toLocaleString('ja-JP'),
        },
        publicKey
      );

      // 自動返信テンプレートがあれば送信
      const autoReplyTemplateId = process.env.NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID;
      if (autoReplyTemplateId) {
        await emailjs.send(
          serviceId,
          autoReplyTemplateId,
          {
            name: formData.name,
            email: formData.email,
            inquiry_type: formData.inquiryType || '未選択',
            message: formData.message,
          },
          publicKey
        );
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', inquiryType: '', message: '' });
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error('EmailJS error:', error);
      setToast({
        message: content[language].sendFailed,
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

  if (!isConfigured) {
    return (
      <section id="contact" className="py-20 md:py-32 bg-muted/20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-muted-foreground">
            {content[language].formUnavailable}<br />
            {content[language].contactByEmail}<a href="mailto:info.adalabtech@gmail.com" className="text-primary hover:underline">info.adalabtech@gmail.com</a>
          </p>
        </div>
      </section>
    );
  }

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
            {content[language].subtitle}
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
              <h3 className="text-2xl font-bold mb-6">{content[language].contactUs}</h3>

              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-semibold mb-2">{content[language].email}</h4>
                  <a
                    href="mailto:info.adalabtech@gmail.com"
                    className="text-primary hover:underline"
                  >
                    info.adalabtech@gmail.com
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{content[language].hours}</h4>
                  <p className="text-muted-foreground">
                    8:00 - 24:00（JST）
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">{content[language].operator}</h4>
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
                <h3 className="text-2xl font-bold mb-2">{content[language].submitted}</h3>
                <p className="text-muted-foreground mb-4">
                  {content[language].thankYou}<br />
                  {content[language].confirmEmail}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  {content[language].willContact}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                >
                  {content[language].newInquiry}
                </Button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl" noValidate>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    {content[language].name} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={content[language].namePlaceholder}
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
                    {content[language].emailLabel} <span className="text-red-500">*</span>
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
                    {content[language].inquiryType}
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">{content[language].selectPlaceholder}</option>
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
                    {content[language].message} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={content[language].messagePlaceholder}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      {content[language].submitting}
                    </span>
                  ) : (
                    <>
                      {content[language].submit}
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
