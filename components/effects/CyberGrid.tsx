'use client';

import { motion } from 'framer-motion';

export function CyberGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Perspective grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Horizontal lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(6, 182, 212, 0.1)"
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" />
            <stop offset="50%" stopColor="rgba(6, 182, 212, 0.3)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Glowing lines */}
      <motion.div
        className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
        animate={{
          y: ['0vh', '100vh'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.8)',
        }}
      />

      <motion.div
        className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-fuchsia-500 to-transparent"
        animate={{
          x: ['0vw', '100vw'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          boxShadow: '0 0 20px rgba(217, 70, 239, 0.8)',
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/50" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-fuchsia-500/50" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-purple-500/50" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/50" />
    </div>
  );
}
