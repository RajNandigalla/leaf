import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getRemoteConfig, RemoteConfig } from 'firebase/remote-config';
import { env } from '@/utils/env';

const firebaseConfig = {
  apiKey: env('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: env('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: env('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: env('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

let app: FirebaseApp | null = null;
let remoteConfig: RemoteConfig | null = null;

const isFirebaseEnabled = env('NEXT_PUBLIC_ENABLE_FIREBASE') === 'true';

if (isFirebaseEnabled) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    remoteConfig = getRemoteConfig(app);
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour default
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.log('Firebase is disabled via NEXT_PUBLIC_ENABLE_FIREBASE');
}

export { app, remoteConfig };
