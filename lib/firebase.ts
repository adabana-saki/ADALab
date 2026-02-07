import type { FirebaseApp } from 'firebase/app';
import type {
  Auth,
  User,
  GoogleAuthProvider as GoogleAuthProviderType,
  GithubAuthProvider as GithubAuthProviderType,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization for client-side only (prevents SSG errors)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProviderType | null = null;
let githubProvider: GithubAuthProviderType | null = null;

async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (typeof window === 'undefined') return null;
  if (!app) {
    const { initializeApp, getApps } = await import('firebase/app');
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

async function getFirebaseAuth(): Promise<Auth | null> {
  if (typeof window === 'undefined') return null;
  const firebaseApp = await getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) {
    const { getAuth } = await import('firebase/auth');
    auth = getAuth(firebaseApp);
  }
  return auth;
}

async function getGoogleProvider(): Promise<GoogleAuthProviderType | null> {
  if (typeof window === 'undefined') return null;
  if (!googleProvider) {
    const { GoogleAuthProvider } = await import('firebase/auth');
    googleProvider = new GoogleAuthProvider();
  }
  return googleProvider;
}

async function getGithubProvider(): Promise<GithubAuthProviderType | null> {
  if (typeof window === 'undefined') return null;
  if (!githubProvider) {
    const { GithubAuthProvider } = await import('firebase/auth');
    githubProvider = new GithubAuthProvider();
  }
  return githubProvider;
}

// モバイル判定
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// Google認証
export async function signInWithGoogle(): Promise<User | null> {
  const firebaseAuth = await getFirebaseAuth();
  const provider = await getGoogleProvider();
  if (!firebaseAuth || !provider) {
    throw new Error('Firebase not initialized');
  }

  const { signInWithPopup, signInWithRedirect, browserPopupRedirectResolver } =
    await import('firebase/auth');

  // モバイルの場合はリダイレクト認証を使用
  if (isMobile()) {
    await signInWithRedirect(firebaseAuth, provider);
    return null; // リダイレクト後に戻ってくる
  }

  try {
    const result = await signInWithPopup(firebaseAuth, provider, browserPopupRedirectResolver);
    return result.user;
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code;
    // ユーザーがキャンセルした場合は静かに終了
    if (errorCode === 'auth/popup-closed-by-user') {
      return null;
    }
    // ポップアップがブロックされた場合はリダイレクトにフォールバック
    if (errorCode === 'auth/popup-blocked') {
      console.log('Popup blocked, falling back to redirect');
      await signInWithRedirect(firebaseAuth, provider);
      return null;
    }
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// GitHub認証
export async function signInWithGithub(): Promise<User | null> {
  const firebaseAuth = await getFirebaseAuth();
  const provider = await getGithubProvider();
  if (!firebaseAuth || !provider) {
    throw new Error('Firebase not initialized');
  }

  const { signInWithPopup, signInWithRedirect, browserPopupRedirectResolver } =
    await import('firebase/auth');

  // モバイルの場合はリダイレクト認証を使用
  if (isMobile()) {
    await signInWithRedirect(firebaseAuth, provider);
    return null; // リダイレクト後に戻ってくる
  }

  try {
    const result = await signInWithPopup(firebaseAuth, provider, browserPopupRedirectResolver);
    return result.user;
  } catch (error: unknown) {
    const errorCode = (error as { code?: string }).code;
    // ユーザーがキャンセルした場合は静かに終了
    if (errorCode === 'auth/popup-closed-by-user') {
      return null;
    }
    // ポップアップがブロックされた場合はリダイレクトにフォールバック
    if (errorCode === 'auth/popup-blocked') {
      console.log('Popup blocked, falling back to redirect');
      await signInWithRedirect(firebaseAuth, provider);
      return null;
    }
    console.error('GitHub sign-in error:', error);
    throw error;
  }
}

// メール/パスワード認証 - サインイン
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User | null> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase not initialized');
  }
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
}

// メール/パスワード認証 - サインアップ
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User | null> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase not initialized');
  }
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    if (result.user) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
}

// サインアウト
export async function signOut(): Promise<void> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase not initialized');
  }
  try {
    const { signOut: firebaseSignOut } = await import('firebase/auth');
    await firebaseSignOut(firebaseAuth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

// パスワードリセット
export async function resetPassword(email: string): Promise<void> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase not initialized');
  }
  try {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(firebaseAuth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

// リダイレクト結果の処理
export async function handleRedirectResult(): Promise<User | null> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) return null;
  try {
    const { getRedirectResult } = await import('firebase/auth');
    const result = await getRedirectResult(firebaseAuth);
    if (result) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Redirect result error:', error);
    throw error;
  }
}

// 認証状態の監視
export async function onAuthChange(
  callback: (user: User | null) => void
): Promise<() => void> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) {
    return () => {};
  }
  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(firebaseAuth, callback);
}

// 現在のユーザー取得
export async function getCurrentUser(): Promise<User | null> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) return null;
  return firebaseAuth.currentUser;
}

// IDトークン取得（API認証用）
export async function getIdToken(): Promise<string | null> {
  const firebaseAuth = await getFirebaseAuth();
  if (!firebaseAuth) return null;
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Get ID token error:', error);
    return null;
  }
}

export type { User };
