'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // You can send to your analytics service here
      // Example: analytics.track('Web Vitals', metric);

      const body = JSON.stringify(metric);
      const url = '/api/vitals';

      // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, body);
      } else {
        fetch(url, { body, method: 'POST', keepalive: true }).catch((err) => {
          console.error('Failed to send web vitals:', err);
        });
      }
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
              // Log long tasks (>50ms)
              if (entry.duration > 50) {
                console.warn('Long task detected:', {
                  duration: entry.duration,
                  startTime: entry.startTime,
                });
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
