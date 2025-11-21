import { __isDev, __hasWindow } from '@/config';

/**
 * Global error handler utility
 * Centralizes error logging and reporting
 */

export interface ErrorContext {
  url?: string;
  userAgent?: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
}

/**
 * Log error to console in development
 */
function logErrorToConsole(error: Error, context: ErrorContext): void {
  console.group('🔴 Error Caught');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('Context:', context);
  console.groupEnd();
}

/**
 * Send error to monitoring service (Sentry)
 */
function sendErrorToMonitoring(error: Error, context: ErrorContext): void {
  // Sentry will be initialized separately
  // This function will be called by Sentry's error handlers
  if (__hasWindow && window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  }
}

/**
 * Global error handler
 */
export function handleError(error: Error, additionalContext: Partial<ErrorContext> = {}): void {
  const context: ErrorContext = {
    url: __hasWindow ? window.location.href : undefined,
    userAgent: __hasWindow ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };

  // Always log to console in development
  if (__isDev) {
    logErrorToConsole(error, context);
  }

  // Send to monitoring service in production
  if (!__isDev) {
    sendErrorToMonitoring(error, context);
  }
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown, endpoint: string): void {
  const apiError = error instanceof Error ? error : new Error('API request failed');

  handleError(apiError, {
    type: 'API_ERROR',
    endpoint,
  });
}

/**
 * Handle promise rejections
 */
export function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

  handleError(error, {
    type: 'UNHANDLED_REJECTION',
  });
}

/**
 * Handle runtime errors
 */
export function handleRuntimeError(
  message: string | Event,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
): void {
  const runtimeError = error || new Error(String(message));

  handleError(runtimeError, {
    type: 'RUNTIME_ERROR',
    source,
    line: lineno,
    column: colno,
  });
}

// Extend Window interface for Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, context?: unknown) => void;
    };
  }
}
