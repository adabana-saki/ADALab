'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface FloatingActionsProps {
  children: React.ReactNode;
}

export function FloatingActions({ children }: FloatingActionsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse items-end gap-3">
      {/* Collapse/Expand Button */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 hover:scale-110 transition-all shadow-2xl flex items-center justify-center group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isCollapsed ? 'メニューを開く' : 'メニューを閉じる'}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-5 h-5 text-white/80" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white/80" />
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 right-0 px-3 py-1 bg-black/90 backdrop-blur-md border border-white/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-xs text-white font-mono">
            {isCollapsed ? 'メニューを開く' : 'メニューを閉じる'}
          </span>
        </div>
      </motion.button>

      {/* Action Buttons */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ staggerChildren: 0.05 }}
            className="flex flex-col-reverse items-end gap-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
