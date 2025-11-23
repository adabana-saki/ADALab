'use client';

import { useEffect, useRef } from 'react';

class TextScrambler {
  private el: HTMLElement;
  private chars: string;
  private resolve?: () => void;
  private queue: Array<{ from: string; to: string; start: number; end: number; char?: string }>;
  private frameRequest?: number;
  private frame: number;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.queue = [];
    this.frame = 0;
  }

  setText(newText: string): Promise<void> {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }

    cancelAnimationFrame(this.frameRequest!);
    this.frame = 0;
    this.update();
    return promise;
  }

  private update = () => {
    let output = '';
    let complete = 0;

    for (let i = 0, n = this.queue.length; i < n; i++) {
      const { from, to, start, end, char } = this.queue[i];

      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          this.queue[i].char = this.randomChar();
        }
        output += `<span class="text-neon-cyan">${this.queue[i].char}</span>`;
      } else {
        output += from;
      }
    }

    // Safe: output contains only predefined chars from this.chars and <span> tags
    this.el.innerHTML = output;

    if (complete === this.queue.length) {
      this.resolve?.();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  };

  private randomChar(): string {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

export function TextScrambleEffect() {
  const scrambleRefs = useRef<Map<HTMLElement, TextScrambler>>(new Map());

  useEffect(() => {
    const refs = scrambleRefs.current;

    // Find all elements with data-scramble attribute
    const elements = document.querySelectorAll('[data-scramble]');

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const originalText = htmlEl.textContent || '';

      // Store original text
      htmlEl.setAttribute('data-original-text', originalText);

      // Create scrambler instance
      const scrambler = new TextScrambler(htmlEl);
      refs.set(htmlEl, scrambler);

      // Initial scramble on mount
      setTimeout(() => {
        scrambler.setText(originalText);
      }, Math.random() * 1000);

      // Add hover effect
      const handleMouseEnter = () => {
        const text = htmlEl.getAttribute('data-original-text') || '';
        scrambler.setText(text);
      };

      htmlEl.addEventListener('mouseenter', handleMouseEnter);

      // Cleanup
      return () => {
        htmlEl.removeEventListener('mouseenter', handleMouseEnter);
      };
    });

    // Auto-scramble headings periodically
    const autoScramble = setInterval(() => {
      const headings = document.querySelectorAll('h1, h2, h3');
      if (headings.length > 0) {
        const randomHeading = headings[Math.floor(Math.random() * headings.length)] as HTMLElement;
        const originalText = randomHeading.textContent || '';

        if (!refs.has(randomHeading)) {
          const scrambler = new TextScrambler(randomHeading);
          refs.set(randomHeading, scrambler);
          scrambler.setText(originalText);
        } else {
          refs.get(randomHeading)?.setText(originalText);
        }
      }
    }, 15000); // Every 15 seconds

    return () => {
      clearInterval(autoScramble);
      refs.clear();
    };
  }, []);

  return null;
}
