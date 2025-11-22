'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export function RippleEffect() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextIdRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const colors = ['#06b6d4', '#d946ef', '#ec4899', '#8b5cf6'];

    const handleClick = (e: MouseEvent) => {
      const ripple: Ripple = {
        id: nextIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 100 + 50,
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      setRipples((prev) => [...prev, ripple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 1000);
    };

    // Canvas-based ripple effect
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const rippleQueue: Array<{
          x: number;
          y: number;
          radius: number;
          maxRadius: number;
          color: string;
          alpha: number;
        }> = [];

        const handleCanvasClick = (e: MouseEvent) => {
          rippleQueue.push({
            x: e.clientX,
            y: e.clientY,
            radius: 0,
            maxRadius: Math.random() * 200 + 100,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.5,
          });
        };

        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Update and draw ripples
          for (let i = rippleQueue.length - 1; i >= 0; i--) {
            const ripple = rippleQueue[i];
            ripple.radius += 4;
            ripple.alpha = 1 - ripple.radius / ripple.maxRadius;

            if (ripple.radius >= ripple.maxRadius) {
              rippleQueue.splice(i, 1);
              continue;
            }

            // Draw ripple
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = ripple.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = ripple.alpha;
            ctx.stroke();

            // Draw inner ripple
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = ripple.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = ripple.alpha * 0.5;
            ctx.stroke();

            // Draw outer glow
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.shadowBlur = 20;
            ctx.shadowColor = ripple.color;
            ctx.strokeStyle = ripple.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = ripple.alpha * 0.3;
            ctx.stroke();

            ctx.shadowBlur = 0;
          }

          ctx.globalAlpha = 1;
          requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('click', handleCanvasClick);

        const handleResize = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('click', handleCanvasClick);
          window.removeEventListener('resize', handleResize);
        };
      }
    }

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      {/* Canvas-based ripples */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[97]"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.6,
        }}
      />

      {/* React-based ripples */}
      <div className="fixed inset-0 pointer-events-none z-[96]">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{
                x: ripple.x,
                y: ripple.y,
                scale: 0,
                opacity: 0.8,
              }}
              animate={{
                scale: 3,
                opacity: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 1,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: -ripple.size / 2,
                top: -ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
                borderRadius: '50%',
                border: `2px solid ${ripple.color}`,
                boxShadow: `0 0 20px ${ripple.color}, inset 0 0 20px ${ripple.color}`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
