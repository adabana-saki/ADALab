'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((_metric) => {
    // Development logging handled by browser devtools

    // Send to analytics in production
    // Note: Disabled because Cloudflare Pages doesn't support API routes
    // To enable, use a third-party analytics service (e.g., Vercel Analytics, Google Analytics)
    if (process.env.NODE_ENV === 'production') {
      // console.log('Web Vitals:', metric);
    }
  });

  useEffect(() => {
    // Additional performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Track long tasks (>50ms) - metrics sent via Web Vitals
              if (entry.duration > 50) {
                // Long task detected - can be sent to analytics
              }
            }
          });

          observer.observe({ entryTypes: ['longtask'] });

          return () => observer.disconnect();
        } catch {
          // PerformanceObserver not supported for this entry type
        }
      }
    }
  }, []);

  return null;
}
