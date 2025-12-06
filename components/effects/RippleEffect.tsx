'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleContainerProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
  disabled?: boolean;
}

// マイクロインタラクション: ボタンクリック時のリップルエフェクト
export function RippleContainer({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
  disabled = false,
}: RippleContainerProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // メモリリーク防止: コンポーネントアンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  const createRipple = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      const container = event.currentTarget;
      const rect = container.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // リップルサイズは要素の対角線長
      const size = Math.max(rect.width, rect.height) * 2;

      const ripple: Ripple = {
        id: Date.now(),
        x,
        y,
        size,
      };

      setRipples((prev) => [...prev, ripple]);

      // アニメーション完了後にリップルを削除
      const timeoutId = setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
        timeoutRefs.current.delete(ripple.id);
      }, duration);
      timeoutRefs.current.set(ripple.id, timeoutId);
    },
    [disabled, duration]
  );

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={createRipple}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              marginLeft: -ripple.size / 2,
              marginTop: -ripple.size / 2,
              backgroundColor: color,
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ホバー時のグロー効果
interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}

export function GlowEffect({
  children,
  className = '',
  glowColor = 'hsl(var(--primary))',
  intensity = 20,
}: GlowEffectProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        boxShadow: isHovered
          ? `0 0 ${intensity}px ${glowColor}, 0 0 ${intensity * 2}px ${glowColor}40`
          : '0 0 0 transparent',
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// クリック時のスケールフィードバック
interface ScaleFeedbackProps {
  children: React.ReactNode;
  className?: string;
  scaleDown?: number;
  scaleUp?: number;
}

export function ScaleFeedback({
  children,
  className = '',
  scaleDown = 0.95,
  scaleUp = 1.02,
}: ScaleFeedbackProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: scaleUp }}
      whileTap={{ scale: scaleDown }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// フォーカス時のアウトラインアニメーション
interface FocusRingProps {
  children: React.ReactNode;
  className?: string;
  ringColor?: string;
}

export function FocusRing({
  children,
  className = '',
  ringColor = 'hsl(var(--primary))',
}: FocusRingProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className={`relative ${className}`}
      // onFocusCaptureで子要素のフォーカスイベントをキャプチャ
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
      animate={{
        outline: isFocused ? `2px solid ${ringColor}` : 'none',
        outlineOffset: isFocused ? '2px' : '0px',
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// 成功/エラー時のシェイクアニメーション
interface ShakeEffectProps {
  children: React.ReactNode;
  isShaking: boolean;
  className?: string;
}

export function ShakeEffect({ children, isShaking, className = '' }: ShakeEffectProps) {
  return (
    <motion.div
      className={className}
      animate={
        isShaking
          ? {
              x: [0, -10, 10, -10, 10, 0],
            }
          : { x: 0 }
      }
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// パルスアニメーション（注目を引くため）
interface PulseEffectProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  color?: string;
}

export function PulseEffect({
  children,
  className = '',
  isActive = true,
  color = 'hsl(var(--primary))',
}: PulseEffectProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: 'inherit' }}
          animate={{
            boxShadow: [
              `0 0 0 0 ${color}40`,
              `0 0 0 10px ${color}00`,
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </div>
  );
}
