'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function KonamiCode() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let position = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const expected = KONAMI_CODE[position].toLowerCase();

      if (key === expected) {
        position++;

        if (position === KONAMI_CODE.length) {
          setShow(true);
          position = 0;

          // Hide after 10 seconds
          setTimeout(() => setShow(false), 10000);

          // Enable matrix mode
          document.body.classList.add('konami-active');

          // Fire achievement event
          window.dispatchEvent(new Event('konami-unlocked'));
        }
      } else {
        position = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[300] pointer-events-none"
        >
          <div className="bg-black/90 backdrop-blur-md border-2 neon-border-cyan rounded-2xl p-8 shadow-2xl">
            {/* Achievement Header */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-6"
            >
              <div className="text-sm text-neon-cyan font-mono mb-2">
                🎮 ACHIEVEMENT UNLOCKED 🎮
              </div>
              <h2 className="text-4xl font-bold holographic-text mb-2">
                Konami Code Master!
              </h2>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-neon-cyan via-neon-fuchsia to-neon-purple" />
            </motion.div>

            {/* Code Display */}
            <div className="flex gap-2 justify-center mb-6 flex-wrap">
              {KONAMI_CODE.map((key, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-10 h-10 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/50 rounded-lg flex items-center justify-center text-xs font-mono neon-cyan"
                >
                  {key === 'ArrowUp' && '↑'}
                  {key === 'ArrowDown' && '↓'}
                  {key === 'ArrowLeft' && '←'}
                  {key === 'ArrowRight' && '→'}
                  {key === 'b' && 'B'}
                  {key === 'a' && 'A'}
                </motion.div>
              ))}
            </div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center space-y-2"
            >
              <p className="text-neon-fuchsia font-medium">
                ✨ ULTRA MATRIX MODE ACTIVATED ✨
              </p>
              <p className="text-sm text-muted-foreground">
                You've unlocked the secret developer mode!
              </p>
              <p className="text-xs text-neon-cyan/70 font-mono">
                Press ESC to disable
              </p>
            </motion.div>

            {/* Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-neon-cyan rounded-full"
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 0,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 200}%`,
                  y: `${50 + (Math.random() - 0.5) * 200}%`,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
