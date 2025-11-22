'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export function ChromaticAberration() {
  const [intensity, setIntensity] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  // Separate effect for mouse tracking
  useEffect(() => {
    // Mouse move effect - increase aberration near edges
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      // Calculate distance from center
      const centerX = 0.5;
      const centerY = 0.5;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      // Increase intensity at edges
      setIntensity(distance * 2);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Separate effect for canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const drawChromaticNoise = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle chromatic noise
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (Math.random() > 0.99) {
          const color = Math.random() > 0.5 ? 1 : 0;
          if (color) {
            data[i] = 255;     // R
            data[i + 1] = 0;   // G
            data[i + 2] = 0;   // B
          } else {
            data[i] = 0;       // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
          }
          data[i + 3] = 30 * intensity; // A
        }
      }

      ctx.putImageData(imageData, 0, 0);
      rafRef.current = requestAnimationFrame(drawChromaticNoise);
    };

    drawChromaticNoise();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [intensity]);

  // Separate effect for CSS injection
  useEffect(() => {
    // Inject chromatic aberration CSS
    const style = document.createElement('style');
    style.id = 'chromatic-aberration-style';
    style.textContent = `
      @keyframes chromatic-pulse {
        0%, 100% {
          filter:
            drop-shadow(2px 0 0 rgba(255, 0, 0, 0.5))
            drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.5));
        }
        50% {
          filter:
            drop-shadow(3px 0 0 rgba(255, 0, 0, 0.7))
            drop-shadow(-3px 0 0 rgba(0, 255, 255, 0.7));
        }
      }

      @keyframes chromatic-shift {
        0% {
          text-shadow:
            2px 0 0 rgba(255, 0, 0, 0.5),
            -2px 0 0 rgba(0, 255, 255, 0.5);
        }
        33% {
          text-shadow:
            -2px 0 0 rgba(255, 0, 0, 0.5),
            2px 0 0 rgba(0, 255, 255, 0.5);
        }
        66% {
          text-shadow:
            0 2px 0 rgba(255, 0, 0, 0.5),
            0 -2px 0 rgba(0, 255, 255, 0.5);
        }
        100% {
          text-shadow:
            2px 0 0 rgba(255, 0, 0, 0.5),
            -2px 0 0 rgba(0, 255, 255, 0.5);
        }
      }

      .chromatic-text {
        position: relative;
        display: inline-block;
      }

      .chromatic-text::before,
      .chromatic-text::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        mix-blend-mode: screen;
      }

      .chromatic-text::before {
        color: #ff0000;
        transform: translateX(-2px);
        opacity: 0.7;
      }

      .chromatic-text::after {
        color: #00ffff;
        transform: translateX(2px);
        opacity: 0.7;
      }

      /* Hover effect */
      .chromatic-hover:hover {
        animation: chromatic-shift 0.3s ease-in-out infinite;
      }

      /* Apply to headings on hover */
      h1:hover, h2:hover, h3:hover {
        animation: chromatic-shift 0.5s ease-in-out 1;
      }

      /* Subtle chromatic aberration on images */
      .chromatic-image {
        position: relative;
        overflow: hidden;
      }

      .chromatic-image::before,
      .chromatic-image::after {
        content: '';
        position: absolute;
        inset: 0;
        background: inherit;
        mix-blend-mode: screen;
        pointer-events: none;
      }

      .chromatic-image::before {
        background-color: rgba(255, 0, 0, 0.3);
        transform: translateX(-1px);
      }

      .chromatic-image::after {
        background-color: rgba(0, 255, 255, 0.3);
        transform: translateX(1px);
      }

      /* Edge vignette with chromatic aberration */
      .chromatic-vignette {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 100;
        opacity: 0.3;
        background:
          radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 60%,
            rgba(255, 0, 0, 0.1) 80%,
            rgba(255, 0, 0, 0.2) 100%
          ),
          radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 60%,
            rgba(0, 255, 255, 0.1) 80%,
            rgba(0, 255, 255, 0.2) 100%
          );
        background-blend-mode: screen;
      }

      /* Button chromatic effect */
      button.chromatic-button::before,
      button.chromatic-button::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.3s;
      }

      button.chromatic-button::before {
        box-shadow: 2px 0 10px rgba(255, 0, 0, 0.5);
      }

      button.chromatic-button::after {
        box-shadow: -2px 0 10px rgba(0, 255, 255, 0.5);
      }

      button.chromatic-button:hover::before,
      button.chromatic-button:hover::after {
        opacity: 1;
      }

      /* Animated chromatic grid overlay */
      .chromatic-grid {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 99;
        opacity: 0.05;
        background-image:
          repeating-linear-gradient(
            0deg,
            rgba(255, 0, 0, 0.5) 0px,
            transparent 1px,
            transparent 2px,
            rgba(255, 0, 0, 0.5) 3px
          ),
          repeating-linear-gradient(
            90deg,
            rgba(0, 255, 255, 0.5) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0, 255, 255, 0.5) 3px
          );
        animation: chromatic-grid-shift 10s linear infinite;
      }

      @keyframes chromatic-grid-shift {
        0% {
          transform: translate(0, 0);
        }
        100% {
          transform: translate(3px, 3px);
        }
      }
    `;

    // Remove old style if exists
    const oldStyle = document.getElementById('chromatic-aberration-style');
    if (oldStyle) {
      oldStyle.remove();
    }

    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById('chromatic-aberration-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <>
      {/* Chromatic vignette overlay */}
      <div className="chromatic-vignette" />

      {/* Chromatic grid overlay */}
      <div className="chromatic-grid" />

      {/* Canvas for dynamic chromatic noise */}
      <motion.canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[98]"
        style={{
          opacity: 0.1,
          mixBlendMode: 'screen',
        }}
        animate={{
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </>
  );
}
