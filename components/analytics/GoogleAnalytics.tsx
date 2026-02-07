'use client';

import Script from 'next/script';
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// GA_MEASUREMENT_ID must be set in environment variables for tracking to work
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Validate GA_MEASUREMENT_ID format (G-XXXXXXXXXX, GT-XXXXXXXXXX, AW-XXXXXXXXXX, DC-XXXXXXXXXX)
const isValidGaMeasurementId = (id: string): boolean => {
  return /^(G|GT|AW|DC)-[A-Z0-9]+$/.test(id);
};

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Helper to get gtag function
const getGtag = () => {
  if (typeof window === 'undefined') return null;

  // Initialize dataLayer if not exists
  window.dataLayer = window.dataLayer || [];

  // Initialize gtag function if not exists
  if (!window.gtag) {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }

  return window.gtag;
};

// Google Analytics tracking events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  const gtag = getGtag();
  if (gtag && GA_MEASUREMENT_ID) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      send_to: GA_MEASUREMENT_ID,
    });
  }
};

// Track page views
export const trackPageView = (url: string) => {
  const gtag = getGtag();
  if (gtag && GA_MEASUREMENT_ID) {
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const trackCustomEvent = (eventName: string, eventParams?: Record<string, string | number | boolean>) => {
  const gtag = getGtag();
  if (gtag && GA_MEASUREMENT_ID) {
    gtag('event', eventName, {
      ...eventParams,
      send_to: GA_MEASUREMENT_ID,
    });
  }
};

// Component that tracks page views (needs Suspense)
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && GA_MEASUREMENT_ID) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  // Don't render if GA ID is not configured or invalid
  if (!GA_MEASUREMENT_ID || !isValidGaMeasurementId(GA_MEASUREMENT_ID)) {
    if (GA_MEASUREMENT_ID && !isValidGaMeasurementId(GA_MEASUREMENT_ID)) {
      console.error('Invalid GA_MEASUREMENT_ID format:', GA_MEASUREMENT_ID);
    }
    return null;
  }

  return (
    <>
      {/* Inline script to initialize GA BEFORE gtag.js loads */}
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: false
            });
          `,
        }}
      />
      {/* Load gtag.js */}
      <Script
        id="ga-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
