# Firebase Authentication Setup Guide

Complete guide to set up and use Firebase Authentication with Google and GitHub social logins.

---

## Prerequisites

Before using Firebase Auth, you need to complete these setup steps.

### 1. Enable Firebase in Your Project

Add to `.env.local`:

```bash
NEXT_PUBLIC_ENABLE_FIREBASE='true'
```

### 2. Configure Firebase Providers

Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → **Authentication** → **Sign-in method**

#### Enable Google Provider

1. Click **Google** in the providers list
2. Toggle **Enable**
3. Set **Project support email** (your email)
4. Click **Save**

#### Enable GitHub Provider

1. **Create GitHub OAuth App:**
   - Go to [GitHub Settings](https://github.com/settings/developers) → **Developer settings** → **OAuth Apps** → **New OAuth App**
   - **Application name**: Your app name (e.g., "LeafInk")
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: Copy from Firebase Console (shown in GitHub provider settings)
   - Click **Register application**
   - Copy **Client ID** and generate **Client Secret**

2. **Add to Firebase:**
   - Click **GitHub** in Firebase providers list
   - Toggle **Enable**
   - Paste **Client ID** and **Client Secret** from GitHub
   - Click **Save**

#### Enable Apple Provider

1. **Create Apple Services ID:**
   - Go to [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId) → **Certificates, Identifiers & Profiles**
   - Click **+** → Select **Services IDs** → Continue
   - **Description**: Your app name (e.g., "LeafInk")
   - **Identifier**: Reverse domain (e.g., `com.leafink.signin`)
   - Check **Sign In with Apple** → Configure
   - **Primary App ID**: Select your app's bundle ID
   - **Domains and Subdomains**: Add your domain (e.g., `leafink.com`)
   - **Return URLs**: Copy from Firebase Console (shown in Apple provider settings)
   - Save

2. **Create Apple Key:**
   - Go to **Keys** → Click **+**
   - **Key Name**: "Sign in with Apple Key"
   - Check **Sign In with Apple** → Configure
   - Select your **Primary App ID**
   - Save and download the `.p8` key file (save it securely!)
   - Note the **Key ID**

3. **Add to Firebase:**
   - Click **Apple** in Firebase providers list
   - Toggle **Enable**
   - Paste **Services ID** (e.g., `com.leafink.signin`)
   - Upload the `.p8` key file
   - Enter **Key ID** and **Team ID** (from Apple Developer account)
   - Click **Save**

### 3. Wrap Your App with AuthProvider

Update `src/pages/_app.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      {/* Your existing providers */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default App;
```

---

## Usage

### Access Auth State

Use the `useAuth` hook in any component:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, signInWithGoogle, signInWithGitHub, signInWithApple, signOut } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
        <button onClick={signInWithGitHub}>Sign in with GitHub</button>
        <button onClick={signInWithApple}>Sign in with Apple</button>
      </div>
    );
  }

  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <p>Email: {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Create a Login Page

Example: `src/pages/auth/login.tsx`

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Login() {
  const { user, loading, signInWithGoogle, signInWithGitHub, signInWithApple } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Sign In</h2>
          <p className="mt-2 text-center text-gray-600">
            Choose your preferred sign-in method
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              {/* Google icon SVG */}
            </svg>
            Continue with Google
          </button>

          <button
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              {/* GitHub icon SVG */}
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={signInWithApple}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm bg-black text-white hover:bg-gray-900 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              {/* Apple icon SVG */}
            </svg>
            Continue with Apple
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Protect Routes

Use the `ProtectedRoute` component:

```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Protected Dashboard</h1>
        <p>Only authenticated users can see this.</p>
      </div>
    </ProtectedRoute>
  );
}
```

### Access User Data

The `user` object from Firebase contains:

```typescript
{
  uid: string; // Unique user ID
  email: string | null; // User email
  displayName: string | null; // User's name
  photoURL: string | null; // Profile picture URL
  emailVerified: boolean; // Email verification status
  // ... and more
}
```

---

## How It Works

### Authentication Flow

1. **User clicks sign-in button** → Calls `signInWithGoogle()` or `signInWithGitHub()`
2. **Browser redirects** to OAuth provider (Google/GitHub)
3. **User authorizes** the application
4. **Provider redirects back** to your app
5. **Firebase processes result** → User is signed in
6. **`onAuthStateChanged` fires** → Updates user state
7. **App shows authenticated UI**

### Session Persistence

- Firebase automatically stores auth tokens in **IndexedDB**
- Sessions persist across:
  - Page reloads
  - Browser restarts
  - Tab closures
- Users stay logged in until:
  - They explicitly sign out
  - Token expires (auto-refreshes)
  - They clear browser data

### Redirect vs Popup

This implementation uses **redirect flow** instead of popups:

✅ **Advantages:**

- No popup blockers
- Better mobile experience
- More reliable across browsers
- Native app-like feel

❌ **Disadvantages:**

- Page reload required
- Slightly slower (full redirect)

---

## API Reference

### `useAuth()` Hook

Returns an object with:

```typescript
{
  user: FirebaseUser | null; // Current user or null
  loading: boolean; // Auth state loading
  signInWithGoogle: () => Promise<void>; // Google sign-in
  signInWithGitHub: () => Promise<void>; // GitHub sign-in
  signOut: () => Promise<void>; // Sign out
}
```

### `ProtectedRoute` Component

Props:

```typescript
{
  children: ReactNode;      // Content to protect
  redirectTo?: string;      // Where to redirect if not authenticated (default: '/auth/login')
}
```

---

## Troubleshooting

### "Firebase Auth is not initialized"

**Cause:** `NEXT_PUBLIC_ENABLE_FIREBASE` is not set to `'true'`

**Solution:** Add to `.env.local`:

```bash
NEXT_PUBLIC_ENABLE_FIREBASE='true'
```

### Sign-in redirect not working

**Cause:** OAuth provider not enabled in Firebase Console

**Solution:** Follow [Configure Firebase Providers](#2-configure-firebase-providers) above

### "Invalid redirect URI"

**Cause:** Callback URL mismatch between GitHub OAuth app and Firebase

**Solution:** Copy the exact callback URL from Firebase Console → GitHub provider settings

### User is null after sign-in

**Cause:** `AuthProvider` not wrapping the app

**Solution:** Ensure `_app.tsx` wraps components with `<AuthProvider>`

---

## Production Deployment

### Update OAuth Settings

When deploying to production:

1. **Firebase Console:**
   - Add production domain to **Authorized domains**

2. **GitHub OAuth App:**
   - Update **Homepage URL** to production domain
   - Update **Authorization callback URL** to production Firebase callback

3. **Environment Variables:**
   - Ensure `NEXT_PUBLIC_ENABLE_FIREBASE='true'` in production
   - All Firebase config vars must be set

---

## Security Best Practices

1. **Never expose Firebase Admin SDK** credentials in client code
2. **Use Firebase Security Rules** for Firestore/Storage
3. **Validate user tokens** on your backend API routes
4. **Enable email verification** for sensitive operations
5. **Implement rate limiting** for auth endpoints

---

## Next Steps

- [ ] Enable Firebase in `.env.local`
- [ ] Configure Google provider in Firebase Console
- [ ] Configure GitHub provider in Firebase Console
- [ ] Wrap app with `AuthProvider` in `_app.tsx`
- [ ] Create login page
- [ ] Test sign-in flow
- [ ] Add protected routes
- [ ] Deploy and update OAuth settings for production
