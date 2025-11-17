'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MouseGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
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
      {/* Main glow */}
      <motion.div
        className="fixed pointer-events-none z-40 rounded-full mix-blend-screen"
        style={{
          width: 400,
          height: 400,
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          background:
            'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(217, 70, 239, 0.1) 50%, transparent 70%)',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.3 } }}
      />

      {/* Inner glow */}
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
            'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.3 } }}
      />

      {/* Cursor trail */}
      <motion.div
        className="fixed pointer-events-none z-50 w-2 h-2 rounded-full border border-cyan-400"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
          boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)',
        }}
        transition={{ opacity: { duration: 0.3 } }}
      />
    </>
  );
}
