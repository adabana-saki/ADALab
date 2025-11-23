'use client';

import { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  connections: number[];
}

export function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for mobile and reduced motion preference
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const colors = ['#06b6d4', '#d946ef', '#ec4899', '#8b5cf6', '#10b981'];
    const nodeCount = isMobile ? 30 : 60;
    const maxDistance = isMobile ? 120 : 150;

    // Initialize nodes - defined at the top to ensure availability
    const initNodes = () => {
      nodesRef.current = [];
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          connections: [],
        });
      }
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    resizeCanvas();

    // Find connections between nodes
    const updateConnections = () => {
      nodesRef.current.forEach((node, i) => {
        node.connections = [];
        nodesRef.current.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < maxDistance) {
              node.connections.push(j);
            }
          }
        });
      });
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient mask to fade out at the top (to avoid clipping with header)
      const gradientMask = ctx.createLinearGradient(0, 0, 0, 120);
      gradientMask.addColorStop(0, 'rgba(0,0,0,0)');
      gradientMask.addColorStop(0.5, 'rgba(0,0,0,0.5)');
      gradientMask.addColorStop(1, 'rgba(0,0,0,1)');

      // Update connections
      updateConnections();

      // Draw connections
      nodesRef.current.forEach((node) => {
        node.connections.forEach((connectedIndex) => {
          const connectedNode = nodesRef.current[connectedIndex];
          const dx = node.x - connectedNode.x;
          const dy = node.y - connectedNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const opacity = 1 - distance / maxDistance;

          // Calculate fade factor for top area
          const avgY = (node.y + connectedNode.y) / 2;
          const topFade = avgY < 120 ? Math.max(0, avgY / 120) : 1;

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connectedNode.x, connectedNode.y);

          // Gradient line
          const gradient = ctx.createLinearGradient(
            node.x,
            node.y,
            connectedNode.x,
            connectedNode.y
          );
          gradient.addColorStop(0, node.color);
          gradient.addColorStop(1, connectedNode.color);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.globalAlpha = opacity * 0.3 * topFade;
          ctx.stroke();

          // Pulse effect on active connections
          if (node.connections.length > 5) {
            ctx.lineWidth = 2;
            ctx.globalAlpha = opacity * 0.5 * topFade;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;

      // Update and draw nodes
      nodesRef.current.forEach((node) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Mouse interaction
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const force = (100 - distance) / 100;
          node.x -= (dx / distance) * force * 2;
          node.y -= (dy / distance) * force * 2;
        }

        // Calculate fade factor for top area
        const topFade = node.y < 120 ? Math.max(0, (node.y - 0) / 120) : 1;

        // Draw node with top fade
        ctx.globalAlpha = topFade;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Glow effect
        if (topFade > 0.3) {
          ctx.shadowBlur = 15 * topFade;
          ctx.shadowColor = node.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Active node highlight
        if (node.connections.length > 5 && topFade > 0.5) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5 * topFade;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Data flow animation
        if (Math.random() < 0.01) {
          node.connections.forEach((connectedIndex) => {
            const connectedNode = nodesRef.current[connectedIndex];
            const particles = 3;

            for (let i = 0; i < particles; i++) {
              const progress = i / particles;
              const x = node.x + (connectedNode.x - node.x) * progress;
              const y = node.y + (connectedNode.y - node.y) * progress;

              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fillStyle = node.color;
              ctx.globalAlpha = 0.8;
              ctx.fill();
            }
            ctx.globalAlpha = 1;
          });
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        opacity: 0.7,
        mixBlendMode: 'screen',
      }}
    />
  );
}
