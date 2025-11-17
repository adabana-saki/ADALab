'use client';

import { useEffect, useRef } from 'react';

export function LiquidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize points around cursor
    const numPoints = 20;
    const radius = 30;
    for (let i = 0; i < numPoints; i++) {
      pointsRef.current.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x, y } = cursorRef.current;
      const points = pointsRef.current;

      // Update points with liquid physics
      points.forEach((point, i) => {
        const angle = (i / points.length) * Math.PI * 2;
        const targetX = x + Math.cos(angle) * radius;
        const targetY = y + Math.sin(angle) * radius;

        // Spring physics
        const spring = 0.15;
        const friction = 0.85;

        point.vx += (targetX - point.x) * spring;
        point.vy += (targetY - point.y) * spring;

        point.vx *= friction;
        point.vy *= friction;

        point.x += point.vx;
        point.y += point.vy;
      });

      // Draw liquid blob
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length];
        const cx = (current.x + next.x) / 2;
        const cy = (current.y + next.y) / 2;

        ctx.quadraticCurveTo(current.x, current.y, cx, cy);
      }

      ctx.closePath();

      // Gradient fill
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
      gradient.addColorStop(1, 'rgba(217, 70, 239, 0.2)');

      ctx.fillStyle = gradient;
      ctx.fill();

      // Glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
      ctx.fill();

      // Inner dot
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 1)';
      ctx.fill();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ cursor: 'none' }}
    />
  );
}
