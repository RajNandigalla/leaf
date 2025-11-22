import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leafink.app',
  appName: 'LeafInk',
  // webDir: 'out', NOTE: For Static App
  server: {
    url: 'http://192.168.1.110:3000',
    cleartext: true,
  },
};

export default config;
