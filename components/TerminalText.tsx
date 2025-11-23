'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TerminalTextProps {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
  prefix?: string;
}

export function TerminalText({
  text,
  speed = 50,
  className = '',
  showCursor = true,
  prefix = '$ ',
}: TerminalTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`font-mono ${className}`}
    >
      <span className="text-neon-cyan">{prefix}</span>
      <span>{displayText}</span>
      {showCursor && (
        <span
          className={`inline-block w-2 h-4 bg-neon-cyan ml-1 ${
            isComplete ? 'animate-pulse' : ''
          }`}
        />
      )}
    </motion.div>
  );
}

export function TerminalWindow({
  children,
  title = 'terminal',
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-black/50 border-b border-white/10">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">
          {title}
        </span>
      </div>
      <div className="p-4 bg-black/30">{children}</div>
    </div>
  );
}
