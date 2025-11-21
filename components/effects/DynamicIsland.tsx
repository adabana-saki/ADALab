'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Activity, Zap, Code, Star } from 'lucide-react';

interface Notification {
  id: number;
  icon: React.ReactNode;
  title: string;
  message: string;
  color: string;
}

export function DynamicIsland() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [status, setStatus] = useState({ cpu: 0, memory: 0, fps: 60 });

  useEffect(() => {
    // Simulate notifications
    const notifications: Omit<Notification, 'id'>[] = [
      {
        icon: <Wifi className="w-4 h-4" />,
        title: 'Connection Status',
        message: 'Secure connection established',
        color: '#06b6d4',
      },
      {
        icon: <Activity className="w-4 h-4" />,
        title: 'Performance',
        message: 'All systems optimal',
        color: '#10b981',
      },
      {
        icon: <Zap className="w-4 h-4" />,
        title: 'Achievement Unlocked',
        message: 'Discovered hidden feature',
        color: '#d946ef',
      },
      {
        icon: <Code className="w-4 h-4" />,
        title: 'System Update',
        message: 'New features available',
        color: '#8b5cf6',
      },
      {
        icon: <Star className="w-4 h-4" />,
        title: 'Special Event',
        message: 'Premium experience activated',
        color: '#f59e0b',
      },
    ];

    let notificationId = 0;

    const showNotification = () => {
      const randomNotification =
        notifications[Math.floor(Math.random() * notifications.length)];
      setNotification({
        ...randomNotification,
        id: notificationId++,
      });
      setIsExpanded(true);

      // Auto collapse after 3 seconds
      setTimeout(() => {
        setIsExpanded(false);
        setTimeout(() => {
          setNotification(null);
        }, 300);
      }, 3000);
    };

    // Show first notification after 3 seconds
    const initialTimeout = setTimeout(showNotification, 3000);

    // Show random notifications every 10-20 seconds
    const interval = setInterval(() => {
      if (!isExpanded) {
        showNotification();
      }
    }, 10000 + Math.random() * 10000);

    // Update status metrics
    const statusInterval = setInterval(() => {
      setStatus({
        cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
        fps: 60,
      });
    }, 2000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      clearInterval(statusInterval);
    };
  }, [isExpanded]);

  return (
    <div className="fixed bottom-20 right-4 z-[250]">
      <motion.div
        className="relative"
        initial={false}
        animate={{
          width: isExpanded ? 320 : 120,
          height: isExpanded ? 120 : 32,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 40,
        }}
      >
        {/* Island container */}
        <motion.div
          className="absolute inset-0 bg-black/90 backdrop-blur-2xl rounded-full overflow-hidden"
          style={{
            boxShadow:
              '0 0 20px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              // Compact state - Status indicators
              <motion.div
                key="compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full gap-2 px-4"
              >
                {/* Animated pulse */}
                <motion.div
                  className="w-2 h-2 rounded-full bg-neon-cyan"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Status text */}
                <span className="text-xs text-neon-cyan font-mono">
                  {status.cpu}% CPU
                </span>
              </motion.div>
            ) : (
              // Expanded state - Notification
              <motion.div
                key="expanded"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center h-full p-4"
              >
                {notification && (
                  <>
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 20,
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                      style={{
                        backgroundColor: `${notification.color}20`,
                        color: notification.color,
                        boxShadow: `0 0 20px ${notification.color}40`,
                      }}
                    >
                      {notification.icon}
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm font-bold text-white mb-1"
                    >
                      {notification.title}
                    </motion.h3>

                    {/* Message */}
                    <motion.p
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-xs text-gray-400 text-center"
                    >
                      {notification.message}
                    </motion.p>

                    {/* Status bar */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex gap-4 mt-3 text-xs font-mono"
                    >
                      <span className="text-neon-cyan">{status.cpu}% CPU</span>
                      <span className="text-neon-purple">{status.memory}% MEM</span>
                      <span className="text-neon-green">{status.fps} FPS</span>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 20px rgba(6, 182, 212, 0.3)',
                '0 0 40px rgba(217, 70, 239, 0.3)',
                '0 0 20px rgba(6, 182, 212, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Scanlines effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.5) 2px, rgba(6, 182, 212, 0.5) 4px)',
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
