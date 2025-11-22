'use client';

import { motion } from 'framer-motion';

interface HolographicTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HolographicText({
  children,
  className = '',
}: HolographicTextProps) {
  return (
    <motion.span
      className={`holographic-text ${className}`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}
