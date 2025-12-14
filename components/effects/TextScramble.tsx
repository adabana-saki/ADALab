'use client';

import { useEffect, useState } from 'react';

interface TextScrambleProps {
  children: string;
  className?: string;
  scrambleSpeed?: number;
  characters?: string;
  revealDelay?: number;
}

export function TextScramble({
  children,
  className = '',
  scrambleSpeed = 50,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?',
  revealDelay = 0,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    let frame = 0;
    const targetText = children;
    const maxFrames = targetText.length * 3;

    const scrambleInterval = setInterval(() => {
      if (frame >= maxFrames) {
        setDisplayText(targetText);
        setIsScrambling(false);
        clearInterval(scrambleInterval);
        return;
      }

      const scrambled = targetText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';

          const progress = (frame - index * 2) / targetText.length;
          if (progress >= 1) return char;
          if (progress < 0) return characters[Math.floor(Math.random() * characters.length)];

          return Math.random() < 0.5
            ? char
            : characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');

      setDisplayText(scrambled);
      frame++;
    }, scrambleSpeed);

    const delayTimeout = setTimeout(() => {
      setIsScrambling(true);
    }, revealDelay);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(delayTimeout);
    };
  }, [children, scrambleSpeed, characters, revealDelay]);

  return (
    <span className={`${className} ${isScrambling ? 'animate-pulse' : ''}`}>
      {displayText}
    </span>
  );
}
