'use client';

import { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'circle' | 'square' | 'triangle' | 'line' | 'star';
  rotation: number;
  rotationSpeed: number;
}

export function EnhancedParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, moving: false });
  const rafRef = useRef<number>();
  const [particleCount, setParticleCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle colors (cyberpunk palette)
    const colors = [
      '#06b6d4', // cyan
      '#d946ef', // purple
      '#ec4899', // pink
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#10b981', // green
    ];

    // Create a particle
    const createParticle = (x: number, y: number, type?: Particle['type']): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;

      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 100 + 50,
        type: type || (['circle', 'square', 'triangle', 'line', 'star'] as const)[
          Math.floor(Math.random() * 5)
        ],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      };
    };

    // Draw particle based on type
    const drawParticle = (p: Particle) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;

      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      switch (p.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          // Add glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          break;

        case 'square':
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          break;

        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size, p.size);
          ctx.lineTo(-p.size, p.size);
          ctx.closePath();
          ctx.fill();
          break;

        case 'line':
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(p.size, 0);
          ctx.stroke();
          break;

        case 'star':
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const radius = i % 2 === 0 ? p.size : p.size / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }

      ctx.restore();
    };

    // Update particle
    const updateParticle = (p: Particle): boolean => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // Gravity
      p.rotation += p.rotationSpeed;
      p.life++;

      // Fade out
      p.alpha = 1 - (p.life / p.maxLife);

      // Remove if dead or out of bounds
      return (
        p.life < p.maxLife &&
        p.x > -50 &&
        p.x < canvas.width + 50 &&
        p.y > -50 &&
        p.y < canvas.height + 50
      );
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        const alive = updateParticle(p);
        if (alive) drawParticle(p);
        return alive;
      });

      // Add ambient particles randomly
      if (Math.random() < 0.1 && particlesRef.current.length < 200) {
        particlesRef.current.push(
          createParticle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
          )
        );
      }

      // Add particles from mouse if moving
      if (mouseRef.current.moving && particlesRef.current.length < 300) {
        for (let i = 0; i < 3; i++) {
          particlesRef.current.push(
            createParticle(
              mouseRef.current.x + (Math.random() - 0.5) * 20,
              mouseRef.current.y + (Math.random() - 0.5) * 20
            )
          );
        }
      }

      setParticleCount(particlesRef.current.length);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse interaction
    let mouseMoveTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.moving = true;

      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        mouseRef.current.moving = false;
      }, 100);
    };

    // Click to burst
    const handleClick = (e: MouseEvent) => {
      const burstCount = 30;
      for (let i = 0; i < burstCount; i++) {
        const angle = (i / burstCount) * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        const particle = createParticle(e.clientX, e.clientY, 'star');
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particlesRef.current.push(particle);
      }
    };

    // Scroll particles
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const x = Math.random() * canvas.width;
      const y = (scrollY % viewportHeight) + Math.random() * 100;

      for (let i = 0; i < 5; i++) {
        particlesRef.current.push(
          createParticle(x + (Math.random() - 0.5) * 50, y)
        );
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[5]"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.6,
        }}
      />
      {/* Particle counter for debugging */}
      <div className="fixed bottom-4 left-4 z-[201] text-xs text-muted-foreground opacity-30 font-mono">
        Particles: {particleCount}
      </div>
    </>
  );
}
