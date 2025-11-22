# Environment Variables

This document covers the type-safe environment variable system in the LeafInk application.

## Overview

The application uses a custom `env()` utility for type-safe access to environment variables with IntelliSense support and automatic fallbacks.

## Configuration

### Files

- **`src/utils/env.ts`** - Type-safe environment variable utility
- **`.env.example`** - Example environment variables

## Usage

### Basic Usage

```typescript
import { env } from '@/utils/env';

const apiKey = env('NEXT_PUBLIC_FIREBASE_API_KEY');
const isEnabled = env('NEXT_PUBLIC_ENABLE_FIREBASE') === 'true';
```

### With Custom Fallback

```typescript
import { getEnv } from '@/utils/env';

const baseUrl = getEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');
```

## Available Environment Variables

### Firebase

```bash
NEXT_PUBLIC_ENABLE_FIREBASE=false
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Sentry

```bash
NEXT_PUBLIC_SENTRY_DSN=
```

### Feature Flags

```bash
NEXT_PUBLIC_API_MOCKING=enabled
```

### General

```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Adding New Environment Variables

1. **Add to `.env.example`:**

   ```bash
   NEXT_PUBLIC_MY_NEW_VAR=
   ```

2. **Update TypeScript types:**

   ```typescript
   // src/utils/env.ts
   type EnvVars = {
     NODE_ENV: 'development' | 'production' | 'test';
     NEXT_PUBLIC_MY_NEW_VAR?: string; // Add here
   };
   ```

3. **Add default value (optional):**

   ```typescript
   // src/utils/env.ts
   const ENV_DEFAULTS: Partial<Record<keyof EnvVars, string>> = {
     NEXT_PUBLIC_MY_NEW_VAR: 'default_value',
   };
   ```

4. **Use in code:**

   ```typescript
   import { env } from '@/utils/env';

   const myVar = env('NEXT_PUBLIC_MY_NEW_VAR');
   ```

## Benefits

- ✅ **Type Safety** - TypeScript errors for invalid variable names
- ✅ **IntelliSense** - Autocomplete for available variables
- ✅ **Automatic Fallbacks** - Default values when variables are missing
- ✅ **Centralized** - All environment variables defined in one place

## Best Practices

1. **Use `NEXT_PUBLIC_` prefix** - For client-side variables
2. **Never commit `.env.local`** - Keep secrets out of version control
3. **Update `.env.example`** - Document all required variables
4. **Use type-safe utility** - Always use `env()` instead of `process.env`
5. **Provide defaults** - Add sensible defaults for development
