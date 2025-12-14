'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface DotPatternProps {
  className?: string;
  dotSize?: number;
  dotColor?: string;
  gap?: number;
  animate?: boolean;
  fadeEdges?: boolean;
}

export function DotPattern({
  className = '',
  dotSize = 2,
  dotColor = '#00f5ff',
  gap = 20,
  animate = true,
  fadeEdges = true,
}: DotPatternProps) {
  const svgPattern = useMemo(() => {
    return `
      <svg width="${gap}" height="${gap}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${gap / 2}" cy="${gap / 2}" r="${dotSize}" fill="${dotColor}" opacity="0.3" />
      </svg>
    `;
  }, [gap, dotSize, dotColor]);

  const encodedPattern = useMemo(() => {
    return `data:image/svg+xml,${encodeURIComponent(svgPattern)}`;
  }, [svgPattern]);

  const patternStyle = {
    backgroundImage: `url("${encodedPattern}")`,
    backgroundSize: `${gap}px ${gap}px`,
    backgroundRepeat: 'repeat',
  };

  if (!animate) {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={patternStyle}
      >
        {fadeEdges && (
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={patternStyle}
      animate={{
        backgroundPosition: ['0px 0px', `${gap}px ${gap}px`],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {fadeEdges && (
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      )}
    </motion.div>
  );
}
