'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MouseGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 300 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Subtle glow - シンプルなグロー */}
      <motion.div
        className="fixed pointer-events-none z-40 rounded-full mix-blend-screen"
        style={{
          width: 200,
          height: 200,
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          background:
            'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.2 } }}
      />

      {/* Cursor ring - カーソルリング */}
      <motion.div
        className="fixed pointer-events-none z-50 w-8 h-8 rounded-full border-2 border-cyan-400/60"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.2 } }}
      />

      {/* Cursor dot - カーソルドット */}
      <motion.div
        className="fixed pointer-events-none z-50 w-1.5 h-1.5 rounded-full bg-cyan-400"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
          boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)',
        }}
        transition={{ opacity: { duration: 0.2 } }}
      />
    </>
  );
}
