import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  updateProfile,
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
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let githubProvider: GithubAuthProvider | null = null;

function getFirebaseApp() {
  if (typeof window === 'undefined') return null;
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

function getFirebaseAuth() {
  if (typeof window === 'undefined') return null;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (!auth) {
    auth = getAuth(firebaseApp);
  }
  return auth;
}

function getGoogleProvider() {
  if (typeof window === 'undefined') return null;
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
  }
  return googleProvider;
}

function getGithubProvider() {
  if (typeof window === 'undefined') return null;
  if (!githubProvider) {
    githubProvider = new GithubAuthProvider();
  }
  return githubProvider;
}

// Google認証
export async function signInWithGoogle(): Promise<User | null> {
  const firebaseAuth = getFirebaseAuth();
  const provider = getGoogleProvider();
  if (!firebaseAuth || !provider) {
    throw new Error('Firebase not initialized');
  }
  try {
    const result = await signInWithPopup(firebaseAuth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// GitHub認証
export async function signInWithGithub(): Promise<User | null> {
  const firebaseAuth = getFirebaseAuth();
  const provider = getGithubProvider();
  if (!firebaseAuth || !provider) {
    throw new Error('Firebase not initialized');
  }
  try {
    const result = await signInWithPopup(firebaseAuth, provider);
    return result.user;
  } catch (error) {
    console.error('GitHub sign-in error:', error);
    throw error;
  }
}

// メール/パスワード認証 - サインイン
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User | null> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase not initialized');
  }
  try {
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
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase not initialized');
  }
  try {
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
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase not initialized');
  }
  try {
    await firebaseSignOut(firebaseAuth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

// パスワードリセット
export async function resetPassword(email: string): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase not initialized');
  }
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

// 認証状態の監視
export function onAuthChange(callback: (user: User | null) => void) {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    // Return a no-op unsubscribe function for SSR
    return () => {};
  }
  return onAuthStateChanged(firebaseAuth, callback);
}

// 現在のユーザー取得
export function getCurrentUser(): User | null {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) return null;
  return firebaseAuth.currentUser;
}

// IDトークン取得（API認証用）
export async function getIdToken(): Promise<string | null> {
  const firebaseAuth = getFirebaseAuth();
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
