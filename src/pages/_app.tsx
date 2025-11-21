import '@/styles/index.scss';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apollo';
import { useEffect } from 'react';
import { logVersion } from '@/utils/version';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    logVersion();
  }, []);

  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
