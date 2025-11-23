import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Additional ignores:
    'coverage/**',
    '.vscode/**',
    'node_modules/**',
    'packages/**', // Ignore packages folder (has its own ESLint configs)
    'android/**', // Capacitor Android build files
    'ios/**', // Capacitor iOS build files
    'dist/**', // Build output
  ]),
]);

export default eslintConfig;
