'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { User } from '@/lib/firebase';
import {
  onAuthChange,
  signInWithGoogle,
  signInWithGithub,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
  getIdToken,
  handleRedirectResult,
} from '@/lib/firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  nickname?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // リダイレクト認証の結果を処理
  useEffect(() => {
    handleRedirectResult().catch((err) => {
      const message = getErrorMessage(err);
      if (message) {
        setError(message);
      }
    });
  }, []);

  // 認証状態の監視
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        // バックエンドにユーザー情報を同期
        await syncUserToBackend(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }).then((unsub) => {
      if (cancelled) {
        unsub();
      } else {
        unsubscribe = unsub;
      }
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  // バックエンドにユーザー情報を同期
  const syncUserToBackend = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });
    } catch (err) {
      console.error('Failed to sync user to backend:', err);
    }
  };

  const handleSignInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = getErrorMessage(err);
      if (message) {
        setError(message);
      }
    }
  }, []);

  const handleSignInWithGithub = useCallback(async () => {
    setError(null);
    try {
      await signInWithGithub();
    } catch (err) {
      const message = getErrorMessage(err);
      if (message) {
        setError(message);
      }
    }
  }, []);

  const handleSignInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  const handleSignUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      setError(null);
      try {
        await signUpWithEmail(email, password, displayName);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // getIdTokenをuseCallbackでラップして安定した参照を提供
  const memoizedGetIdToken = useCallback(() => getIdToken(), []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithGithub: handleSignInWithGithub,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    getIdToken: memoizedGetIdToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Default auth context for SSG/SSR (when AuthProvider is not available)
const defaultAuthContext: AuthContextType = {
  user: null,
  profile: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  getIdToken: async () => null,
  clearError: () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  // Return default context for SSG/SSR - AuthProvider will hydrate on client
  if (context === undefined) {
    return defaultAuthContext;
  }
  return context;
}

// Firebase エラーメッセージを日本語に変換（nullの場合はエラーを表示しない）
function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    switch (code) {
      // キャンセル関連（エラーとして表示しない）
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
      case 'auth/user-cancelled':
        return null;
      // メール/パスワード認証エラー
      case 'auth/email-already-in-use':
        return 'このメールアドレスは既に使用されています';
      case 'auth/invalid-email':
        return 'メールアドレスの形式が正しくありません';
      case 'auth/operation-not-allowed':
        return 'この認証方法は現在使用できません';
      case 'auth/weak-password':
        return 'パスワードは6文字以上で入力してください';
      case 'auth/user-disabled':
        return 'このアカウントは無効化されています';
      case 'auth/user-not-found':
        return 'アカウントが見つかりません';
      case 'auth/wrong-password':
        return 'パスワードが正しくありません';
      case 'auth/invalid-credential':
        return 'メールアドレスまたはパスワードが正しくありません';
      case 'auth/too-many-requests':
        return 'ログイン試行回数が多すぎます。しばらく待ってから再度お試しください';
      // OAuth固有のエラー
      case 'auth/account-exists-with-different-credential':
        return '別の認証方法で登録されたアカウントが存在します。元の方法でログインしてください';
      // ネットワーク・設定エラー
      case 'auth/network-request-failed':
        return 'ネットワークエラーが発生しました。接続を確認してください';
      case 'auth/unauthorized-domain':
        return '認証ドメインが許可されていません';
      case 'auth/internal-error':
        return '認証サービスでエラーが発生しました。しばらく待ってから再度お試しください';
      // 未知のエラーは汎用メッセージ
      default:
        return 'ログインに失敗しました。しばらく待ってから再度お試しください';
    }
  }
  return 'ログインに失敗しました。しばらく待ってから再度お試しください';
}
