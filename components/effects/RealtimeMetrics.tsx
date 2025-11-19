'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Code, Zap, Cpu, TrendingUp } from 'lucide-react';

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  changeRate: number;
}

export function RealtimeMetrics() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'fps',
      label: 'FPS',
      value: 60,
      unit: '',
      icon: Activity,
      color: 'text-neon-cyan',
      changeRate: 0,
    },
    {
      id: 'components',
      label: 'Active Components',
      value: 42,
      unit: '',
      icon: Code,
      color: 'text-neon-purple',
      changeRate: 0,
    },
    {
      id: 'animations',
      label: 'Animations',
      value: 28,
      unit: '',
      icon: Zap,
      color: 'text-neon-fuchsia',
      changeRate: 0,
    },
    {
      id: 'performance',
      label: 'Performance',
      value: 98,
      unit: '%',
      icon: Cpu,
      color: 'text-neon-yellow',
      changeRate: 0,
    },
    {
      id: 'uptime',
      label: 'Session Time',
      value: 0,
      unit: 's',
      icon: TrendingUp,
      color: 'text-neon-pink',
      changeRate: 0,
    },
  ]);

  useEffect(() => {
    // Show metrics panel after 2 seconds
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      // Fire achievement event
      window.dispatchEvent(new Event('metrics-opened'));
    }, 2000);

    // Auto-hide after 8 seconds
    const hideTimer = setTimeout(() => setIsVisible(false), 10000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const updateMetrics = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      frameCount++;

      // Update FPS every second
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / deltaTime);

        setMetrics((prev) =>
          prev.map((metric) => {
            if (metric.id === 'fps') {
              return { ...metric, value: fps, changeRate: fps - metric.value };
            }
            if (metric.id === 'uptime') {
              const uptime = Math.floor((Date.now() - startTime) / 1000);
              return { ...metric, value: uptime, changeRate: 1 };
            }
            if (metric.id === 'animations') {
              // Simulate animation activity
              const variation = Math.floor(Math.random() * 3) - 1;
              const newValue = Math.max(20, Math.min(35, metric.value + variation));
              return { ...metric, value: newValue, changeRate: variation };
            }
            if (metric.id === 'performance') {
              // Performance fluctuation
              const variation = (Math.random() - 0.5) * 2;
              const newValue = Math.max(92, Math.min(100, metric.value + variation));
              return { ...metric, value: Math.floor(newValue), changeRate: variation };
            }
            return metric;
          })
        );

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(updateMetrics);
    };

    animationFrameId = requestAnimationFrame(updateMetrics);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Toggle visibility on Ctrl+Shift+M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-24 right-4 z-[100] pointer-events-none select-none"
          style={{
            maxHeight: 'calc(100vh - 8rem)',
            overflowY: 'auto'
          }}
        >
          <div className="bg-black/90 backdrop-blur-xl border-2 neon-border-cyan rounded-xl p-4 min-w-[280px] shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neon-cyan/30">
              <Activity className="w-4 h-4 text-neon-cyan animate-pulse" />
              <h3 className="text-sm font-mono text-neon-cyan uppercase tracking-wider">
                System Metrics
              </h3>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-2">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-2 px-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${metric.color}`} />
                      <span className="text-xs text-muted-foreground font-mono">
                        {metric.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.span
                        key={metric.value}
                        initial={{ scale: 1.2, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`text-sm font-bold font-mono ${metric.color}`}
                      >
                        {metric.value}{metric.unit}
                      </motion.span>

                      {/* Change indicator */}
                      {metric.changeRate !== 0 && (
                        <motion.span
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`text-xs font-mono ${
                            metric.changeRate > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {metric.changeRate > 0 ? '↑' : '↓'}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Press Ctrl+Shift+M to toggle</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400">LIVE</span>
                </div>
              </div>
            </div>

            {/* Scanline effect */}
            <div className="absolute inset-0 scanlines opacity-30 pointer-events-none rounded-xl" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
