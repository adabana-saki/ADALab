'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function GlitchEffect() {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    // Inject glitch CSS animations
    const style = document.createElement('style');
    style.id = 'glitch-effect-style';
    style.textContent = `
      @keyframes glitch-anim {
        0% {
          clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
          transform: translate(0);
        }
        10% {
          clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%);
          transform: translate(-5px, 5px);
        }
        20% {
          clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%);
          transform: translate(5px, -5px);
        }
        30% {
          clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
          transform: translate(0);
        }
        40% {
          clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
          transform: translate(-3px, 3px);
        }
        50% {
          clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
          transform: translate(3px, -3px);
        }
        60% {
          clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
          transform: translate(0);
        }
        70% {
          clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
          transform: translate(-2px, 2px);
        }
        80% {
          clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
          transform: translate(2px, -2px);
        }
        90% {
          clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
          transform: translate(0);
        }
        100% {
          clip-path: polygon(0 70%, 100% 70%, 100% 71%, 0 71%);
          transform: translate(0);
        }
      }

      @keyframes glitch-skew {
        0% {
          transform: skew(0deg);
        }
        20% {
          transform: skew(-2deg);
        }
        40% {
          transform: skew(2deg);
        }
        60% {
          transform: skew(-1deg);
        }
        80% {
          transform: skew(1deg);
        }
        100% {
          transform: skew(0deg);
        }
      }

      @keyframes glitch-color {
        0% {
          filter: hue-rotate(0deg);
        }
        25% {
          filter: hue-rotate(-30deg);
        }
        50% {
          filter: hue-rotate(30deg);
        }
        75% {
          filter: hue-rotate(-15deg);
        }
        100% {
          filter: hue-rotate(0deg);
        }
      }

      .glitch-active {
        position: relative;
      }

      .glitch-active::before,
      .glitch-active::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
      }

      .glitch-active::before {
        animation: glitch-anim 0.3s infinite;
        color: #06b6d4;
        z-index: -1;
        text-shadow: 2px 0 #06b6d4;
      }

      .glitch-active::after {
        animation: glitch-anim 0.3s infinite reverse;
        color: #d946ef;
        z-index: -2;
        text-shadow: -2px 0 #d946ef;
      }

      .glitch-container {
        position: relative;
      }

      .glitch-container.active {
        animation: glitch-skew 0.3s ease-in-out;
      }

      /* Full screen glitch overlay */
      .glitch-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
      }

      .glitch-overlay::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          transparent 0%,
          rgba(6, 182, 212, 0.1) 2%,
          transparent 3%,
          transparent 9%,
          rgba(217, 70, 239, 0.1) 10%,
          transparent 11%
        );
        background-size: 100% 3px;
        animation: glitch-scanline 0.5s steps(60) infinite;
      }

      @keyframes glitch-scanline {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 0 100%;
        }
      }

      /* RGB split effect */
      .glitch-rgb-split {
        position: relative;
      }

      .glitch-rgb-split::before,
      .glitch-rgb-split::after {
        content: '';
        position: absolute;
        inset: 0;
        background: inherit;
        mix-blend-mode: screen;
      }

      .glitch-rgb-split::before {
        background-color: rgba(255, 0, 0, 0.5);
        animation: glitch-anim 0.2s infinite;
      }

      .glitch-rgb-split::after {
        background-color: rgba(0, 255, 255, 0.5);
        animation: glitch-anim 0.2s infinite reverse;
      }
    `;
    document.head.appendChild(style);

    // Random glitch triggers
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);

      // Add glitch class to random elements
      const glitchableElements = document.querySelectorAll(
        'h1, h2, h3, .holographic-text, .neon-text'
      );

      if (glitchableElements.length > 0) {
        const randomIndex = Math.floor(Math.random() * glitchableElements.length);
        const element = glitchableElements[randomIndex];

        // Store original text content
        const text = element.textContent || '';
        element.setAttribute('data-text', text);
        element.classList.add('glitch-active');

        setTimeout(() => {
          element.classList.remove('glitch-active');
        }, 300);
      }
    };

    // Trigger glitch every 5-15 seconds randomly
    const scheduleNextGlitch = () => {
      const delay = 5000 + Math.random() * 10000; // 5-15 seconds
      return setTimeout(triggerGlitch, delay);
    };

    const timeoutId = scheduleNextGlitch();

    // Also trigger on scroll (occasionally)
    const handleScroll = () => {
      if (Math.random() < 0.02) { // 2% chance on each scroll
        triggerGlitch();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      const styleElement = document.getElementById('glitch-effect-style');
      if (styleElement) {
        styleElement.remove();
      }
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {isGlitching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="glitch-overlay"
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: [0, 1, 0, 1, 0],
              scale: [1, 1.01, 1, 1.01, 1],
            }}
            transition={{ duration: 0.3 }}
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(6, 182, 212, 0.03) 2px,
                rgba(6, 182, 212, 0.03) 4px
              )`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
