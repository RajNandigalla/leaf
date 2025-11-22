import {
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  User as FirebaseUser,
  getRedirectResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  // Initialize loading based on whether auth is available
  const [loading, setLoading] = useState(() => !!auth);

  useEffect(() => {
    if (!auth) {
      console.warn(
        'Firebase Auth is not initialized. Make sure NEXT_PUBLIC_ENABLE_FIREBASE is set to "true"'
      );
      return;
    }

    // Handle redirect result when user returns from OAuth provider
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('Successfully signed in via redirect:', result.user.email);
          // User state will be updated by onAuthStateChanged below
        }
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error.code, error.message);
        setLoading(false);
        // You can add custom error handling here, e.g.:
        // - Show toast notification
        // - Redirect to error page
        // - Store error in state
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const signInWithGitHub = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const provider = new GithubAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const signInWithApple = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const provider = new OAuthProvider('apple.com');
    await signInWithRedirect(auth, provider);
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGitHub,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
