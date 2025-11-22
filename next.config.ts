import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Check if building for Capacitor (static export)
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

// Only load i18n config if not building for Capacitor
let i18nConfig = {};
if (!isCapacitorBuild) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { i18n } = require('./next-i18next.config');
    i18nConfig = { i18n };
  } catch (error) {
    console.warn('i18n config not found, skipping...');
  }
}

const nextConfig: NextConfig = {
  ...i18nConfig,
  /* config options here */
  reactStrictMode: true,

  // Conditional config based on build target
  ...(isCapacitorBuild && {
    output: 'export',
    distDir: 'out',
    images: {
      unoptimized: true,
    },
  }),

  // Standard config (non-Capacitor builds)
  ...(!isCapacitorBuild &&
    {
      // Add any SSR-specific config here
    }),

  // Security headers (fallback, middleware handles most cases)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
};

// Sentry configuration options
const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,

  // Suppresses source map uploading logs during build
  silent: true,
};

export default withSentryConfig(bundleAnalyzer(nextConfig), sentryOptions);
