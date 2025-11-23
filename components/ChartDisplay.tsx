'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface ChartDisplayProps {
  type?: 'line' | 'bar' | 'doughnut';
  title?: string;
}

export function ChartDisplay({ type = 'line', title }: ChartDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { language } = useLanguage();

  const content = {
    ja: {
      title: title || 'パフォーマンス推移',
      months: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    en: {
      title: title || 'Performance Trends',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Data
    const data = [30, 45, 60, 55, 80, 95];
    const maxValue = Math.max(...data);

    if (type === 'line') {
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + ((height - padding * 2) / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Draw line
      ctx.strokeStyle = '#0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((value, index) => {
        const x = padding + ((width - padding * 2) / (data.length - 1)) * index;
        const y = height - padding - ((value / maxValue) * (height - padding * 2));

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw points
      data.forEach((value, index) => {
        const x = padding + ((width - padding * 2) / (data.length - 1)) * index;
        const y = height - padding - ((value / maxValue) * (height - padding * 2));

        ctx.fillStyle = '#0ff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw gradient fill
      const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      data.forEach((value, index) => {
        const x = padding + ((width - padding * 2) / (data.length - 1)) * index;
        const y = height - padding - ((value / maxValue) * (height - padding * 2));
        ctx.lineTo(x, y);
      });
      ctx.lineTo(width - padding, height - padding);
      ctx.closePath();
      ctx.fill();

    } else if (type === 'bar') {
      const barWidth = (width - padding * 2) / data.length - 10;

      data.forEach((value, index) => {
        const x = padding + ((width - padding * 2) / data.length) * index + 5;
        const barHeight = (value / maxValue) * (height - padding * 2);
        const y = height - padding - barHeight;

        // Gradient bar
        const gradient = ctx.createLinearGradient(x, y, x, height - padding);
        gradient.addColorStop(0, '#0ff');
        gradient.addColorStop(1, '#f0f');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      });

    } else if (type === 'doughnut') {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - padding;
      const innerRadius = radius * 0.6;

      const colors = ['#0ff', '#f0f', '#ff0', '#0f0', '#00f', '#f00'];
      const total = data.reduce((a, b) => a + b, 0);
      let startAngle = -Math.PI / 2;

      data.forEach((value, index) => {
        const sliceAngle = (value / total) * Math.PI * 2;

        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fill();

        startAngle += sliceAngle;
      });
    }

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    if (type !== 'doughnut') {
      content[language].months.forEach((month, index) => {
        const x = padding + ((width - padding * 2) / (data.length - 1)) * index;
        ctx.fillText(month, x, height - 10);
      });
    }
  }, [type, language]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass p-6 rounded-2xl"
    >
      <h3 className="text-lg font-bold mb-4">{content[language].title}</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-48"
        style={{ maxWidth: '100%' }}
      />
    </motion.div>
  );
}
