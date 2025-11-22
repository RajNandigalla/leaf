# Firebase Remote Config Integration

This document outlines the integration of Firebase Remote Config into the LeafInk application.

## Overview

We use Firebase Remote Config to manage application behavior and appearance dynamically without requiring a new deployment. The configuration is fetched once when the application loads and is made available globally via a React Context.

## Architecture

1.  **Initialization (`src/lib/firebase.ts`)**:
    - Initializes the Firebase App instance.
    - Initializes the Remote Config service.
    - Sets default fetch intervals (currently 1 hour).

2.  **Global State (`src/contexts/RemoteConfigContext.tsx`)**:
    - `RemoteConfigProvider`: A component that wraps the application.
    - Fetches and activates the remote config immediately upon mounting.
    - Exposes `isLoaded` and `error` state to the rest of the app.

3.  **Application Wrapper (`src/pages/_app.tsx`)**:
    - The entire application is wrapped with `RemoteConfigProvider` to ensure config is fetched early.

4.  **Consumption Hook (`src/hooks/useRemoteConfig.ts`)**:
    - `useRemoteConfig(key)`: A custom hook for components to retrieve config values.
    - It waits for the global context to be loaded before returning values.
    - Returns `{ value, loading, error }`.

## Setup

### 1. Environment Variables

Add the following keys to your `.env.local` file (copied from `.env.example`):

```bash
NEXT_PUBLIC_ENABLE_FIREBASE='true'
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase Console

1.  Go to the Firebase Console for your project.
2.  Navigate to **Remote Config**.
3.  Add parameters (keys) that match what you use in the code (e.g., `welcome_message`).
4.  Publish the changes.

## Usage

### In a Component

```tsx
import { useRemoteConfig } from '@/hooks/useRemoteConfig';

export default function WelcomeBanner() {
  // Fetch the 'welcome_message' key
  const { value, loading } = useRemoteConfig('welcome_message');

  if (loading) return <Skeleton />;

  // Use .asString(), .asNumber(), or .asBoolean()
  return <div>{value?.asString() || 'Default Welcome'}</div>;
}
```

## Testing

A test page is available at `/playground/remote-config` (source: `src/pages/playground/remote-config.tsx`) to verify the integration. It displays the value of the `welcome_message` key.

## Best Practices

- **Default Values**: Always handle the case where `value` might be null or the fetch fails. Provide fallback UI or values.
- **Keys**: Use snake_case for Remote Config keys in the Firebase Console (e.g., `feature_enabled`, `header_color`).
- **Caching**: The default fetch interval is set to 1 hour to prevent rate limiting. For development, you might want to lower this in `src/lib/firebase.ts`.
