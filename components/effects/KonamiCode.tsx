'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const uiContent = {
  ja: {
    achievement: 'アチーブメント解除',
    title: 'コナミコードマスター!',
    activated: 'ウルトラマトリックスモード発動',
    description: '秘密の開発者モードを解除しました！',
    escHint: 'ESCで無効化',
  },
  en: {
    achievement: 'ACHIEVEMENT UNLOCKED',
    title: 'Konami Code Master!',
    activated: 'ULTRA MATRIX MODE ACTIVATED',
    description: "You've unlocked the secret developer mode!",
    escHint: 'Press ESC to disable',
  },
};

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { language } = useLanguage();
  const content = uiContent[language];

  useEffect(() => {
    let position = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard against undefined or non-string e.key (can happen with browser extensions or bots)
      if (!e.key || typeof e.key !== 'string') return;

      // Ignore if user is typing in an input or contentEditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      // ESC to disable
      if (e.key === 'Escape' && show) {
        setShow(false);
        document.body.classList.remove('konami-active');
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        return;
      }

      const key = e.key.toLowerCase();
      const expected = KONAMI_CODE[position].toLowerCase();

      if (key === expected) {
        position++;

        if (position === KONAMI_CODE.length) {
          setShow(true);
          position = 0;

          // Clear previous timeout if exists
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Hide after 10 seconds
          timeoutRef.current = setTimeout(() => {
            setShow(false);
            document.body.classList.remove('konami-active');
          }, 10000);

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.body.classList.remove('konami-active');
    };
  }, [show]);

  // Matrix rain effect
  useEffect(() => {
    if (!show) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '01アイウエオカキクケコサシスセソタチツテトADALAB';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    function draw() {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#06b6d4';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Random color between cyan and fuchsia
        const colors = ['#06b6d4', '#d946ef', '#8b5cf6'];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [show]);

  return (
    <>
      {/* Matrix rain canvas */}
      {show && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-[299]"
          style={{ opacity: 0.7 }}
        />
      )}

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            className="fixed inset-0 z-[300] pointer-events-none flex items-center justify-center"
          >
          <div className="relative bg-black/90 backdrop-blur-md border-2 neon-border-cyan rounded-2xl p-8 shadow-2xl overflow-hidden">
            {/* Achievement Header */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-6"
            >
              <span className="text-sm text-neon-cyan font-mono mb-2 block">
                🎮 {content.achievement} 🎮
              </span>
              <h2 className="text-4xl font-bold holographic-text mb-2">
                {content.title}
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
                  <span>
                    {key === 'ArrowUp' && '↑'}
                    {key === 'ArrowDown' && '↓'}
                    {key === 'ArrowLeft' && '←'}
                    {key === 'ArrowRight' && '→'}
                    {key === 'b' && 'B'}
                    {key === 'a' && 'A'}
                  </span>
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
                ✨ {content.activated} ✨
              </p>
              <p className="text-sm text-muted-foreground">
                {content.description}
              </p>
              <p className="text-xs text-neon-cyan/70 font-mono">
                {content.escHint}
              </p>
            </motion.div>

            {/* Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-neon-cyan rounded-full pointer-events-none"
                style={{ willChange: 'transform, opacity' }}
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
    </>
  );
}
