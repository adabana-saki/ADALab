'use client';

import { useEffect, useState } from 'react';

export function BloomEffect() {
  const [intensity, setIntensity] = useState(1);

  useEffect(() => {
    // Apply bloom effect to neon elements
    const style = document.createElement('style');
    style.id = 'bloom-effect-style';
    style.textContent = `
      @keyframes bloom-pulse {
        0%, 100% {
          filter: brightness(1) blur(0px);
        }
        50% {
          filter: brightness(1.3) blur(1px);
        }
      }

      .bloom-effect {
        position: relative;
      }

      .bloom-effect::before {
        content: '';
        position: absolute;
        inset: -10px;
        background: inherit;
        filter: blur(20px) brightness(${intensity});
        opacity: 0.6;
        z-index: -1;
        pointer-events: none;
      }

      /* Apply to neon text */
      .holographic-text::after {
        content: attr(data-text);
        position: absolute;
        left: 0;
        top: 0;
        filter: blur(10px) brightness(1.5);
        opacity: 0.5;
        z-index: -1;
        background: linear-gradient(90deg, #06b6d4, #d946ef, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: bloom-pulse 3s ease-in-out infinite;
      }

      /* Apply to glowing borders */
      .neon-border-cyan,
      .neon-border-purple,
      .neon-border-pink {
        position: relative;
        box-shadow:
          0 0 10px currentColor,
          0 0 20px currentColor,
          0 0 40px currentColor,
          inset 0 0 10px currentColor;
      }

      /* Enhanced glow for buttons */
      button.bloom-effect:hover::before,
      a.bloom-effect:hover::before {
        filter: blur(25px) brightness(${intensity * 1.5});
        opacity: 0.8;
      }

      /* Bloom on cyberpunk grid lines */
      .cyber-grid-line {
        box-shadow:
          0 0 5px var(--color-primary, #06b6d4),
          0 0 10px var(--color-primary, #06b6d4),
          0 0 20px var(--color-primary, #06b6d4);
      }

      /* Bloom on particles */
      .particle {
        filter: blur(2px) brightness(1.3);
        box-shadow:
          0 0 10px currentColor,
          0 0 20px currentColor;
      }

      /* Bloom on floating elements */
      .floating-element::before {
        content: '';
        position: absolute;
        inset: -5px;
        background: inherit;
        filter: blur(15px);
        opacity: 0.4;
        z-index: -1;
        border-radius: inherit;
      }
    `;
    document.head.appendChild(style);

    // Intensity variation based on time of day
    const updateIntensity = () => {
      const hour = new Date().getHours();
      // Stronger bloom at night (18:00-06:00)
      const nightBloom = (hour >= 18 || hour < 6) ? 1.2 : 0.8;
      setIntensity(nightBloom);
    };

    updateIntensity();
    const interval = setInterval(updateIntensity, 60000); // Update every minute

    return () => {
      const styleElement = document.getElementById('bloom-effect-style');
      if (styleElement) {
        styleElement.remove();
      }
      clearInterval(interval);
    };
  }, [intensity]);

  return null;
}
