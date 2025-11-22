'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MagneticElements() {
  useEffect(() => {
    // Find all elements with data-magnetic attribute
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    const cleanupFunctions: Array<() => void> = [];

    magneticElements.forEach((element) => {
      const el = element as HTMLElement;
      const strength = parseFloat(el.getAttribute('data-magnetic') || '0.3');

      let rect = el.getBoundingClientRect();

      const handleMouseMove = (e: MouseEvent) => {
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = Math.max(rect.width, rect.height);

        if (distance < maxDistance) {
          const power = (maxDistance - distance) / maxDistance;
          const moveX = x * strength * power;
          const moveY = y * strength * power;

          el.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
          el.style.transition = 'transform 0.1s ease-out';
        }
      };

      const handleMouseLeave = () => {
        el.style.transform = 'translate(0, 0) scale(1)';
        el.style.transition = 'transform 0.3s ease-out';
      };

      const updateRect = () => {
        rect = el.getBoundingClientRect();
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, { passive: true });

      // Store cleanup function
      cleanupFunctions.push(() => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
      });
    });

    // Apply magnetic effect to buttons automatically
    const applyMagneticToButtons = () => {
      const buttons = document.querySelectorAll('button:not([data-magnetic]), a.button:not([data-magnetic])');
      buttons.forEach((btn) => {
        if (!btn.hasAttribute('data-magnetic')) {
          btn.setAttribute('data-magnetic', '0.2');
        }
      });
    };

    applyMagneticToButtons();

    // Re-apply when DOM changes
    const observer = new MutationObserver(applyMagneticToButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      // Cleanup all event listeners
      cleanupFunctions.forEach((cleanup) => cleanup());
      observer.disconnect();
    };
  }, []);

  return null;
}

// React component version for individual use
export function MagneticButton({
  children,
  strength = 0.3,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block cursor-pointer ${className}`}
      style={{
        x: springX,
        y: springY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
}
