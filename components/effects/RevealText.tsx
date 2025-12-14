'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  revealDirection?: 'up' | 'down' | 'left' | 'right';
  stagger?: number;
}

export function RevealText({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  revealDirection = 'up',
  stagger = 0.03,
}: RevealTextProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{children}</span>;
  }

  const letters = children.split('');

  const directionVariants = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  const initialVariant = directionVariants[revealDirection];

  return (
    <span className={className}>
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          initial={{ ...initialVariant, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          transition={{
            duration,
            delay: delay + index * stagger,
            ease: 'easeOut',
          }}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  );
}
