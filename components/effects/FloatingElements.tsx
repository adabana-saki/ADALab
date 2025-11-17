'use client';

import { motion } from 'framer-motion';

export function FloatingElements() {
  const elements = [
    { size: 60, delay: 0, duration: 20, x: '10%', color: 'cyan' },
    { size: 40, delay: 2, duration: 25, x: '80%', color: 'fuchsia' },
    { size: 80, delay: 4, duration: 30, x: '50%', color: 'purple' },
    { size: 50, delay: 1, duration: 22, x: '30%', color: 'blue' },
    { size: 70, delay: 3, duration: 28, x: '70%', color: 'pink' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl opacity-20`}
          style={{
            width: el.size,
            height: el.size,
            left: el.x,
            background:
              el.color === 'cyan'
                ? 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%)'
                : el.color === 'fuchsia'
                  ? 'radial-gradient(circle, rgba(217, 70, 239, 0.4) 0%, transparent 70%)'
                  : el.color === 'purple'
                    ? 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)'
                    : el.color === 'blue'
                      ? 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
          }}
          animate={{
            y: ['100vh', '-20vh'],
            x: [0, Math.random() * 100 - 50],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Digital particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 5,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}
