'use client';

import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Step {
  label: string;
  completed: boolean;
  active?: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

// 目標勾配効果：目標に近づくほどモチベーションが上がる
export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      {/* プログレスバー */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan to-neon-fuchsia rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* グローエフェクト */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan/50 to-neon-fuchsia/50 rounded-full blur-sm"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* ステップインジケーター */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
          >
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                index < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : index === currentStep
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-muted-foreground/30 text-muted-foreground'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              {index < currentStep ? (
                <Check size={16} />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </motion.div>
            <motion.span
              className={`mt-2 text-xs ${
                index <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              {step.label}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}

// フォーム用の簡易プログレス
interface FormProgressProps {
  filledFields: number;
  totalFields: number;
  showPercentage?: boolean;
}

export function FormProgress({ filledFields, totalFields, showPercentage = true }: FormProgressProps) {
  const { language } = useLanguage();
  const percentage = Math.round((filledFields / totalFields) * 100);
  const isComplete = filledFields === totalFields;

  const getMessage = () => {
    if (isComplete) return language === 'ja' ? '入力完了！' : 'All done!';
    if (percentage >= 75) return language === 'ja' ? 'あと少し！' : 'Almost there!';
    if (percentage >= 50) return language === 'ja' ? '半分完了' : 'Halfway done';
    if (percentage >= 25) return language === 'ja' ? '順調です' : 'Good progress';
    return language === 'ja' ? '入力を開始してください' : 'Start filling';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <motion.span
          key={getMessage()}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`font-medium ${isComplete ? 'text-green-500' : 'text-muted-foreground'}`}
        >
          {getMessage()}
        </motion.span>
        {showPercentage && (
          <span className="text-muted-foreground">
            {filledFields}/{totalFields}
          </span>
        )}
      </div>
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-neon-cyan to-neon-fuchsia'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// 読書/スクロールプログレス（記事ページ用）
interface ReadingProgressProps {
  progress: number; // 0-100
}

export function ReadingProgress({ progress }: ReadingProgressProps) {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: progress > 0 ? 1 : 0 }}
    >
      <div className="h-full bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-fuchsia"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
}

// 達成度バッジ
interface AchievementBadgeProps {
  title: string;
  description: string;
  progress: number;
  icon?: React.ReactNode;
}

export function AchievementBadge({ title, description, progress, icon }: AchievementBadgeProps) {
  const isComplete = progress >= 100;

  return (
    <motion.div
      className={`p-4 rounded-xl border ${
        isComplete ? 'border-green-500/50 bg-green-500/10' : 'border-border bg-muted/30'
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isComplete
              ? 'bg-green-500 text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {icon || (isComplete ? <Check size={20} /> : <Circle size={20} />)}
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${isComplete ? 'text-green-500' : ''}`}>{title}</h4>
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isComplete ? 'bg-green-500' : 'bg-primary'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
