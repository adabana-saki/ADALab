'use client';

import { motion } from 'framer-motion';

interface WaveBackgroundProps {
  className?: string;
  waveColor?: string;
  waveOpacity?: number;
  waveCount?: number;
  animationDuration?: number;
}

export function WaveBackground({
  className = '',
  waveColor = '#00f5ff',
  waveOpacity = 0.1,
  waveCount = 3,
  animationDuration = 20,
}: WaveBackgroundProps) {
  const waves = Array.from({ length: waveCount }, (_, i) => i);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {waves.map((wave) => (
        <motion.div
          key={wave}
          className="absolute inset-0"
          initial={{ y: 0 }}
          animate={{ y: [-20, 20, -20] }}
          transition={{
            duration: animationDuration + wave * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: wave * 0.5,
          }}
          style={{
            background: `radial-gradient(ellipse at 50% ${50 + wave * 10}%, ${waveColor} 0%, transparent 50%)`,
            opacity: waveOpacity - wave * 0.02,
            transform: `scale(${1 + wave * 0.1})`,
          }}
        />
      ))}
    </div>
  );
}
