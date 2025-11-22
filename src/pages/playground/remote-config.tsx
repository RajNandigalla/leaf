import React from 'react';
import { useRemoteConfig } from '@/hooks/useRemoteConfig';

export default function RemoteConfigTest() {
  const { value, loading, error } = useRemoteConfig('welcome_message');

  if (loading) return <div>Loading config...</div>;
  if (error) return <div>Error loading config (expected if no credentials): {error.message}</div>;

  return (
    <div className="p-4">
      <h1>Remote Config Test</h1>
      <p>Value: {value?.asString()}</p>
    </div>
  );
}
