import '@/styles/index.scss';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apollo';
import { useEffect } from 'react';
import { logVersion } from '@/utils/version';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    logVersion();
  }, []);

  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ErrorBoundary>
  );
}
