/**
 * Type-safe environment variable access
 * Use this instead of process.env to get strict type checking and IntelliSense
 */

type EnvVars = {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_BASE_URL?: string;
  // Add more environment variables here as needed
};

/**
 * Default fallback values for environment variables
 */
const ENV_DEFAULTS: Partial<Record<keyof EnvVars, string>> = {
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
  // Add more defaults here as needed
};

/**
 * Get environment variable with type safety and automatic fallback
 * @example
 * const baseUrl = env('NEXT_PUBLIC_BASE_URL'); // Returns value or default
 */
export function env<K extends keyof EnvVars>(key: K): EnvVars[K] {
  const value = process.env[key] as EnvVars[K];
  if (value !== undefined) {
    return value;
  }
  return ENV_DEFAULTS[key] as EnvVars[K];
}

/**
 * Get environment variable with a custom fallback value
 * @example
 * const baseUrl = getEnv('NEXT_PUBLIC_BASE_URL', 'https://example.com');
 */
export function getEnv<K extends keyof EnvVars>(
  key: K,
  fallback: NonNullable<EnvVars[K]>
): NonNullable<EnvVars[K]> {
  return (process.env[key] as EnvVars[K]) ?? fallback;
}
