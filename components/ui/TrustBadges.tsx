'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Users, Star, CheckCircle, Globe, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrustBadge {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

export function TrustBadges() {
  const { language } = useLanguage();

  const badges: TrustBadge[] = language === 'ja' ? [
    { icon: Shield, label: 'セキュア', value: 'SSL暗号化', color: 'from-green-400 to-green-600' },
    { icon: Zap, label: '高速', value: '平均50ms', color: 'from-yellow-400 to-orange-500' },
    { icon: Globe, label: '日本製', value: 'Made in Japan', color: 'from-blue-400 to-blue-600' },
  ] : [
    { icon: Shield, label: 'Secure', value: 'SSL Encrypted', color: 'from-green-400 to-green-600' },
    { icon: Zap, label: 'Fast', value: 'Avg 50ms', color: 'from-yellow-400 to-orange-500' },
    { icon: Globe, label: 'Japanese', value: 'Made in Japan', color: 'from-blue-400 to-blue-600' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 py-4">
      {badges.map((badge, index) => {
        const IconComponent = badge.icon;
        return (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50 hover:border-primary/30 transition-colors"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center`}>
              <IconComponent size={14} className="text-white" />
            </div>
            <div className="text-xs">
              <span className="font-medium">{badge.label}</span>
              <span className="text-muted-foreground ml-1">• {badge.value}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// テクノロジーバッジ（技術スタックの信頼性を示す）
export function TechStackBadges() {
  const techBadges = [
    { name: 'Next.js 15', icon: '▲', verified: true },
    { name: 'TypeScript', icon: 'TS', verified: true },
    { name: 'React 19', icon: '⚛', verified: true },
    { name: 'Cloudflare', icon: '☁', verified: true },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 py-2">
      {techBadges.map((tech, index) => (
        <motion.div
          key={tech.name}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium group cursor-default"
        >
          <span className="text-primary">{tech.icon}</span>
          <span>{tech.name}</span>
          {tech.verified && (
            <CheckCircle size={12} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// スターレーティング表示
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
}

export function StarRating({ rating, maxRating = 5, size = 16, showValue = true }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

// ユーザー数カウンター（社会的証明）
interface UserCounterProps {
  count: number;
  label?: string;
}

export function UserCounter({ count, label }: UserCounterProps) {
  const { language } = useLanguage();
  const defaultLabel = language === 'ja' ? '人が利用中' : 'users';

  return (
    <motion.div
      className="flex items-center gap-2 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 border-2 border-background flex items-center justify-center"
          >
            <Users size={10} className="text-white" />
          </div>
        ))}
      </div>
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{count.toLocaleString()}+</span> {label || defaultLabel}
      </span>
    </motion.div>
  );
}
