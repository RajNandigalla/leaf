import { useMemo } from 'react';
import { getValue } from 'firebase/remote-config';
import { remoteConfig } from '@/lib/firebase';
import { useRemoteConfigContext } from '@/contexts/RemoteConfigContext';

export function useRemoteConfig(key: string) {
  const { isLoaded, error } = useRemoteConfigContext();

  const value = useMemo(() => {
    if (isLoaded) {
      return getValue(remoteConfig, key);
    }
    return null;
  }, [isLoaded, key]);

  return {
    value,
    loading: !isLoaded,
    error,
  };
}
