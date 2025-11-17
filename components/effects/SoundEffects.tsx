'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

type SoundType = 'hover' | 'click' | 'success' | 'error' | 'navigation';

export function SoundEffects() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize Audio Context on user interaction
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
    };

    // Enable on first click
    const handleFirstInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!isEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create oscillator and gain nodes
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure sound based on type
    switch (type) {
      case 'hover':
        // Soft high beep
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.type = 'sine';
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'click':
        // Sharp electronic click
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscillator.type = 'square';
        oscillator.start(now);
        oscillator.stop(now + 0.08);
        break;

      case 'success':
        // Rising tone
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.type = 'triangle';
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'error':
        // Descending buzz
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.type = 'sawtooth';
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'navigation':
        // Smooth transition sound
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.linearRampToValueAtTime(900, now + 0.12);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        oscillator.type = 'sine';
        oscillator.start(now);
        oscillator.stop(now + 0.12);
        break;
    }
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    // Add sound to interactive elements
    const addSoundToElements = () => {
      // Buttons
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      buttons.forEach((element) => {
        const handleMouseEnter = () => playSound('hover');
        const handleClick = () => playSound('click');

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('click', handleClick);

        // Store handlers for cleanup
        (element as Element & { _soundHandlers?: { handleMouseEnter: () => void; handleClick: () => void } })._soundHandlers = { handleMouseEnter, handleClick };
      });

      // Links
      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach((link) => {
        const handleNavigation = () => playSound('navigation');
        link.addEventListener('click', handleNavigation);
        (link as Element & { _navHandler?: () => void })._navHandler = handleNavigation;
      });
    };

    // Initial setup
    addSoundToElements();

    // Re-add on DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      addSoundToElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();

      // Cleanup event listeners
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      buttons.forEach((element) => {
        const handlers = (element as Element & { _soundHandlers?: { handleMouseEnter: () => void; handleClick: () => void } })._soundHandlers;
        if (handlers) {
          element.removeEventListener('mouseenter', handlers.handleMouseEnter);
          element.removeEventListener('click', handlers.handleClick);
        }
      });

      const links = document.querySelectorAll('a[href^="#"]');
      links.forEach((link) => {
        const handler = (link as Element & { _navHandler?: () => void })._navHandler;
        if (handler) {
          link.removeEventListener('click', handler);
        }
      });
    };
  }, [isEnabled, playSound]);

  // Toggle with keyboard shortcut (Ctrl+Shift+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsEnabled((prev) => {
          const newState = !prev;
          setShowIndicator(true);
          setTimeout(() => setShowIndicator(false), 2000);

          // Fire achievement event
          window.dispatchEvent(new Event('sound-toggled'));

          // Play confirmation sound
          if (newState && audioContextRef.current) {
            setTimeout(() => playSound('success'), 100);
          }

          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playSound]);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsEnabled(!isEnabled);
          setShowIndicator(true);
          setTimeout(() => setShowIndicator(false), 2000);
          // Fire achievement event
          window.dispatchEvent(new Event('sound-toggled'));
        }}
        className="fixed bottom-24 right-4 z-[150] w-12 h-12 rounded-full bg-black/80 backdrop-blur-xl border-2 neon-border-purple hover:scale-110 transition-all shadow-2xl flex items-center justify-center group"
        aria-label="Toggle sound effects"
      >
        {isEnabled ? (
          <Volume2 className="w-5 h-5 text-neon-purple" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}

        {/* Tooltip */}
        <div className="absolute right-full mr-2 px-3 py-1 bg-black/90 backdrop-blur-md border border-neon-purple/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <span className="text-xs text-neon-purple font-mono">
            {isEnabled ? 'Sound ON' : 'Sound OFF'} (Ctrl+Shift+S)
          </span>
        </div>
      </button>

      {/* Status Indicator */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed bottom-40 right-4 z-[150] px-4 py-2 bg-black/90 backdrop-blur-xl border-2 neon-border-purple rounded-lg shadow-2xl"
          >
            <div className="flex items-center gap-2">
              {isEnabled ? (
                <Volume2 className="w-4 h-4 text-neon-purple animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-mono text-neon-purple">
                {isEnabled ? '🎵 Sound Effects Enabled' : 'Sound Effects Disabled'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
