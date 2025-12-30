'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, error, clearError } =
    useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName);
        onClose();
      } else if (mode === 'reset') {
        await resetPassword(email);
        setResetSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearError();
    try {
      await signInWithGoogle();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'signup' | 'reset') => {
    setMode(newMode);
    clearError();
    setResetSent(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {mode === 'login' && 'ログイン'}
                {mode === 'signup' && 'アカウント作成'}
                {mode === 'reset' && 'パスワードリセット'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* リセット完了メッセージ */}
            {resetSent && mode === 'reset' && (
              <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600">
                パスワードリセットメールを送信しました。メールをご確認ください。
              </div>
            )}

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
                {error}
              </div>
            )}

            {/* Google認証 */}
            {mode !== 'reset' && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Googleでログイン</span>
                </button>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">または</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            {/* フォーム */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-2">ニックネーム</label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="ニックネーム"
                      required
                      maxLength={20}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">メールアドレス</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium mb-2">パスワード</label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                {mode === 'login' && 'ログイン'}
                {mode === 'signup' && 'アカウント作成'}
                {mode === 'reset' && 'リセットメール送信'}
              </button>
            </form>

            {/* フッター */}
            <div className="mt-6 text-center text-sm">
              {mode === 'login' && (
                <>
                  <button
                    onClick={() => switchMode('reset')}
                    className="text-primary hover:underline"
                  >
                    パスワードを忘れた場合
                  </button>
                  <div className="mt-2">
                    アカウントをお持ちでない方は{' '}
                    <button
                      onClick={() => switchMode('signup')}
                      className="text-primary hover:underline font-medium"
                    >
                      新規登録
                    </button>
                  </div>
                </>
              )}
              {mode === 'signup' && (
                <div>
                  既にアカウントをお持ちの方は{' '}
                  <button
                    onClick={() => switchMode('login')}
                    className="text-primary hover:underline font-medium"
                  >
                    ログイン
                  </button>
                </div>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => switchMode('login')}
                  className="text-primary hover:underline"
                >
                  ログイン画面に戻る
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
