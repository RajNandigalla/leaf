import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leafink.app',
  appName: 'LeafInk',
  webDir: 'out',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
