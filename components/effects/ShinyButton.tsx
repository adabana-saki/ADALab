'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ShinyButtonProps {
  children: React.ReactNode;
  className?: string;
  shineColor?: string;
  shineDuration?: number;
  shineWidth?: number;
  onClick?: () => void;
}

export function ShinyButton({
  children,
  className = '',
  shineColor = 'rgba(255, 255, 255, 0.5)',
  shineDuration = 1.5,
  shineWidth = 100,
  onClick,
}: ShinyButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{children}</span>
      {isHovered && (
        <motion.span
          className="absolute inset-0 z-0"
          initial={{ x: '-100%', rotate: 20 }}
          animate={{ x: '200%' }}
          transition={{
            duration: shineDuration,
            ease: 'easeInOut',
          }}
          style={{
            background: `linear-gradient(90deg, transparent, ${shineColor}, transparent)`,
            width: `${shineWidth}%`,
            transformOrigin: 'center',
          }}
        />
      )}
    </motion.button>
  );
}
