'use client';

import { motion } from 'framer-motion';

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerColor?: string;
  duration?: number;
  spread?: number;
}

export function ShimmerText({
  children,
  className = '',
  shimmerColor = 'rgba(0, 245, 255, 0.6)',
  duration = 2,
  spread = 100,
}: ShimmerTextProps) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 z-20"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          width: `${spread}%`,
        }}
      />
    </span>
  );
}
