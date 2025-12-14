'use client';

import { motion } from 'framer-motion';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationDuration?: number;
  animate?: boolean;
}

export function GradientText({
  children,
  className = '',
  colors = ['#00f5ff', '#ff00ff', '#00f5ff'],
  animationDuration = 3,
  animate = true,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
    backgroundSize: animate ? '200% auto' : '100% auto',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  if (!animate) {
    return (
      <span className={className} style={gradientStyle}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      style={gradientStyle}
      animate={{
        backgroundPosition: ['0% center', '200% center'],
      }}
      transition={{
        duration: animationDuration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}
