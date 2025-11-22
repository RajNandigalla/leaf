import { remoteConfig } from '@/lib/firebase';
import { fetchAndActivate } from 'firebase/remote-config';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface RemoteConfigContextType {
  isLoaded: boolean;
  error: Error | null;
}

const RemoteConfigContext = createContext<RemoteConfigContextType>({
  isLoaded: false,
  error: null,
});

export function RemoteConfigProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initRemoteConfig = async () => {
      try {
        if (remoteConfig) await fetchAndActivate(remoteConfig!);
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to fetch remote config:', err);
        setError(err as Error);
      }
    };

    initRemoteConfig();
  }, []);

  return (
    <RemoteConfigContext.Provider value={{ isLoaded, error }}>
      {children}
    </RemoteConfigContext.Provider>
  );
}

export function useRemoteConfigContext() {
  return useContext(RemoteConfigContext);
}
