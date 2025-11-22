import '@/styles/index.scss';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import client from '@/lib/apollo';
import { queryClient } from '@/lib/react-query';
import { useEffect } from 'react';
import { logVersion } from '@/utils/version';
import ErrorBoundary from '@/components/ErrorBoundary';
import { handleRuntimeError, handleUnhandledRejection } from '@/utils/errorHandler';
import { __hasWindow } from '@/config';

import { RemoteConfigProvider } from '@/contexts/RemoteConfigContext';
import { env } from '@/utils/env';

if (env('NEXT_PUBLIC_API_MOCKING') === 'enabled') {
  import('@/mocks').then(({ initMocks }) => {
    initMocks();
  });
}

import { appWithTranslation } from 'next-i18next';

function App({ Component, pageProps }: AppProps) {
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
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={client}>
          <RemoteConfigProvider>
            <Component {...pageProps} />
          </RemoteConfigProvider>
        </ApolloProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default appWithTranslation(App);
