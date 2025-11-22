import '@/styles/index.scss';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import client from '@/lib/apollo';
import { queryClient } from '@/lib/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';

import { RemoteConfigProvider } from '@/contexts/RemoteConfigContext';
import { env } from '@/utils/env';
import { useAppInitialization } from '@/hooks/useAppInitialization';

if (env('NEXT_PUBLIC_API_MOCKING') === 'true') {
  import('@/mocks').then(({ initMocks }) => {
    initMocks();
  });
}

import { appWithTranslation } from 'next-i18next';

function App({ Component, pageProps }: AppProps) {
  useAppInitialization();

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
