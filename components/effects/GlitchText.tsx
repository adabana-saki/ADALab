'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GlitchText({ children, className = '' }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      {isGlitching && (
        <>
          <motion.span
            className="absolute top-0 left-0 text-cyan-500 opacity-70"
            initial={{ x: 0, y: 0 }}
            animate={{
              x: [-2, 2, -2],
              y: [0, 1, -1],
            }}
            transition={{
              duration: 0.2,
              repeat: 0,
            }}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
            }}
          >
            {children}
          </motion.span>
          <motion.span
            className="absolute top-0 left-0 text-fuchsia-500 opacity-70"
            initial={{ x: 0, y: 0 }}
            animate={{
              x: [2, -2, 2],
              y: [1, -1, 0],
            }}
            transition={{
              duration: 0.2,
              repeat: 0,
            }}
            style={{
              clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
            }}
          >
            {children}
          </motion.span>
        </>
      )}
    </span>
  );
}
