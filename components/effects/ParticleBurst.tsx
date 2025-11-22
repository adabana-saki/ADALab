'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export function ParticleBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Array<{ x: number; y: number; radius: number; life: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      '#06b6d4', // cyan
      '#8b5cf6', // purple
      '#d946ef', // fuchsia
    ];

    const createBurst = (x: number, y: number) => {
      // リップル効果 - Ripple effect
      ripplesRef.current.push({
        x,
        y,
        radius: 0,
        life: 1,
      });

      // シンプルなパーティクル - Simple particles
      const particleCount = 12; // 30から12に削減

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2 + Math.random() * 3; // 速度を抑える

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          maxLife: 1,
          size: 3 + Math.random() * 2, // サイズを少し大きく
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      createBurst(e.clientX, e.clientY);
    };

    window.addEventListener('click', handleClick);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // リップルを描画 - Draw ripples
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        ripple.radius += 4;
        ripple.life -= 0.015;

        if (ripple.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${ripple.life * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 2つ目のリング
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168, 85, 247, ${ripple.life * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        return true;
      });

      // パーティクルを描画 - Draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.95; // 摩擦を強く
        particle.vy *= 0.95;
        particle.life -= 0.025; // 早く消える

        if (particle.life <= 0) return false;

        const alpha = particle.life / particle.maxLife;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

        // Convert hex to rgba
        const r = parseInt(particle.color.slice(1, 3), 16);
        const g = parseInt(particle.color.slice(3, 5), 16);
        const b = parseInt(particle.color.slice(5, 7), 16);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = particle.color;
        ctx.fill();

        return true;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[90]"
    />
  );
}
