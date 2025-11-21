import '@/styles/index.scss';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apollo';
import { useEffect } from 'react';
import { logVersion } from '@/utils/version';
import ErrorBoundary from '@/components/ErrorBoundary';
import { handleRuntimeError, handleUnhandledRejection } from '@/utils/errorHandler';
import { __hasWindow } from '@/config';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    logVersion();

    // Set up global error handlers
    if (__hasWindow) {
      // Handle runtime errors
      window.onerror = (message, source, lineno, colno, error) => {
        handleRuntimeError(message, source, lineno, colno, error);
        return false; // Let default error handling continue
      };

      // Handle unhandled promise rejections
      window.onunhandledrejection = (event) => {
        handleUnhandledRejection(event);
        return false; // Let default error handling continue
      };
    }

    // Cleanup
    return () => {
      if (__hasWindow) {
        window.onerror = null;
        window.onunhandledrejection = null;
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ErrorBoundary>
  );
}
