// TypeScript environment variable definitions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_BASE_URL?: string;
      NEXT_PUBLIC_SENTRY_DSN?: string;
      SENTRY_AUTH_TOKEN?: string;
      // Add more environment variables here as needed
    }
  }
}

export {};
