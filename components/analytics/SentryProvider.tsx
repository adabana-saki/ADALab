'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/react';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export function SentryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (SENTRY_DSN && process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 1.0,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
      });
    }
  }, []);

  return <>{children}</>;
}

// Error boundary wrapper
export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  if (!SENTRY_DSN) {
    return <>{children}</>;
  }

  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
            <p className="text-muted-foreground mb-4">
              問題が発生しました。ページを再読み込みしてください。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              再読み込み
            </button>
          </div>
        </div>
      )}
      onError={(error) => {
        console.error('Caught error:', error);
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
