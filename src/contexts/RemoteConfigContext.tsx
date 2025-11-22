import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAndActivate } from 'firebase/remote-config';
import { remoteConfig } from '@/lib/firebase';

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
        await fetchAndActivate(remoteConfig);
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to fetch remote config:', err);
        setError(err as Error);
        // Even if it fails, we mark as loaded so the app doesn't hang (it will use defaults)
        setIsLoaded(true);
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
