'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  onAuthChange,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
  getIdToken,
  User,
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

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
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
    });

    return () => unsubscribe();
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
      setError(getErrorMessage(err));
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

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithEmail: handleSignInWithEmail,
    signUpWithEmail: handleSignUpWithEmail,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    getIdToken,
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

// Firebase エラーメッセージを日本語に変換
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code;
    switch (code) {
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
      case 'auth/popup-closed-by-user':
        return 'ログインがキャンセルされました';
      default:
        return error.message || 'エラーが発生しました';
    }
  }
  return 'エラーが発生しました';
}
