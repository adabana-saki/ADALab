'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            重大なエラーが発生しました
          </h1>

          <p className="text-zinc-400 mb-8">
            申し訳ございません。アプリケーションで重大なエラーが発生しました。
            ページを再読み込みしてください。
          </p>

          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            再読み込み
          </button>
        </div>
      </body>
    </html>
  );
}
