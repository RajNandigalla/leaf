import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.leafink.lens',
  appName: 'Leaf Lens',
  server: {
    url: 'http://192.168.1.110:5173',
    cleartext: true,
  },
};

export default config;
