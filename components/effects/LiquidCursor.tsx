'use client';

import { useEffect, useRef } from 'react';

export function LiquidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth follow - スムーズな追従
      cursorRef.current.x += (targetRef.current.x - cursorRef.current.x) * 0.15;
      cursorRef.current.y += (targetRef.current.y - cursorRef.current.y) * 0.15;

      const { x, y } = cursorRef.current;

      // Outer ring - 外側のリング（遅延）
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner dot - 内側のドット
      ctx.beginPath();
      ctx.arc(targetRef.current.x, targetRef.current.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(6, 182, 212, 1)';
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
