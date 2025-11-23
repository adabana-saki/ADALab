'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Development logging handled by browser devtools

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
