// TypeScript environment variable definitions
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly NEXT_PUBLIC_BASE_URL?: string;
      // Add more environment variables here as needed
    }
  }
}

export {};
