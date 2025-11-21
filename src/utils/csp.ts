import crypto from 'crypto';
import { __isDev } from '@/config';

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Build Content Security Policy string
 */
export function buildCSP(nonce?: string): string {
  const policies: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      nonce ? `'nonce-${nonce}'` : "'unsafe-inline'",
      __isDev ? "'unsafe-eval'" : '', // For webpack HMR in development
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS and styled-components
    ],
    'img-src': [
      "'self'",
      'data:', // For inline images
      'https:', // Allow HTTPS images
    ],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
      "'self'",
      __isDev ? 'ws://localhost:*' : '', // Webpack HMR
      __isDev ? 'http://localhost:*' : '', // Development API
      // Sentry error tracking
      'https://*.ingest.sentry.io',
      'https://sentry.io',
      // Development only external APIs
      __isDev ? 'https://flyby-router-demo.herokuapp.com' : '',
      __isDev ? 'https://jsonplaceholder.typicode.com' : '',
      // Add your API domains here
      // 'https://api.yourapp.com',
    ].filter(Boolean),
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"], // Prevent clickjacking
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': __isDev ? [] : [''], // Force HTTPS in production
  };

  // Build CSP string
  return Object.entries(policies)
    .filter(([, values]) => values.length > 0)
    .map(([directive, values]) => {
      const valueString = values.join(' ').trim();
      return valueString ? `${directive} ${valueString}` : directive;
    })
    .join('; ');
}

/**
 * Get all security headers
 */
export function getSecurityHeaders(nonce?: string): Record<string, string> {
  const headers: Record<string, string> = {
    // Content Security Policy
    'Content-Security-Policy': buildCSP(nonce),

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy (formerly Feature-Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Disable FLoC
    ].join(', '),

    // XSS Protection (legacy, but doesn't hurt)
    'X-XSS-Protection': '1; mode=block',
  };

  // Add Strict-Transport-Security in production
  if (!__isDev) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}
