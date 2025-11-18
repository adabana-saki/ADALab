'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ParallaxScroll() {
  useEffect(() => {
    // Find all elements with data-parallax attribute
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    const handleScroll = () => {
      const scrollY = window.scrollY;

      parallaxElements.forEach((el) => {
        const element = el as HTMLElement;
        const speed = parseFloat(element.getAttribute('data-parallax') || '0.5');
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;

        // Only apply parallax when element is in viewport
        if (scrollY + window.innerHeight > elementTop && scrollY < elementTop + elementHeight) {
          const offset = (scrollY - elementTop) * speed;
          element.style.transform = `translateY(${offset}px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}

// React component version with Framer Motion
export function ParallaxSection({
  children,
  speed = 0.5,
  className = '',
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 200]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// Multi-layer parallax background
export function ParallaxLayers() {
  const { scrollYProgress } = useScroll();

  // Different speeds for each layer
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const layer3Y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Layer 1 - Slowest */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: layer1Y,
          background:
            'radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Layer 2 - Medium */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: layer2Y,
          background:
            'radial-gradient(circle at 80% 50%, rgba(217, 70, 239, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Layer 3 - Fastest */}
      <motion.div
        className="absolute inset-0"
        style={{
          y: layer3Y,
          background:
            'radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Floating orbs with parallax */}
      <motion.div
        className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{
          y: layer1Y,
          background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="absolute top-[40%] right-[15%] w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          y: layer2Y,
          background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)',
        }}
      />

      <motion.div
        className="absolute bottom-[20%] left-[30%] w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          y: layer3Y,
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
