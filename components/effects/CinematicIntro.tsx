'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CinematicIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has seen the intro before
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');

    if (!hasSeenIntro) {
      setIsVisible(true);

      const timer1 = setTimeout(() => setStep(1), 500);
      const timer2 = setTimeout(() => setStep(2), 2000);
      const timer3 = setTimeout(() => setStep(3), 3500);
      const timer4 = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem('hasSeenIntro', 'true');
      }, 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Scanning lines effect */}
          <div className="absolute inset-0 scanlines opacity-20" />

          {/* Animated grid background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 1 ? 0.3 : 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="cyber-grid" />
          </motion.div>

          {/* Main content */}
          <div className="relative z-10 text-center px-4">
            {/* Step 1: System Boot */}
            <AnimatePresence>
              {step >= 1 && step < 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-neon-cyan text-sm font-mono">
                    <div className="mb-2">SYSTEM INITIALIZING...</div>
                    <div className="flex justify-center gap-2">
                      <span className="animate-pulse">█</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>█</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>█</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Logo reveal */}
            <AnimatePresence>
              {step >= 2 && step < 3 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <h1 className="text-6xl md:text-8xl font-bold mb-4">
                    <span className="holographic-text animate-neon-flicker">
                      ADA Lab
                    </span>
                  </h1>
                  <div className="h-1 w-48 mx-auto bg-gradient-to-r from-neon-cyan via-neon-fuchsia to-neon-purple glow-cyan" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Welcome message */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-2xl md:text-4xl font-bold holographic-text">
                    Welcome to the Future
                  </div>
                  <div className="text-neon-cyan text-lg font-mono">
                    Entering Digital Dimension...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Radial gradient overlay */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 80%)',
            }}
          />

          {/* Particles */}
          {step >= 2 && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-neon-cyan rounded-full"
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    opacity: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 0.5,
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
