import { registerPlugin } from '@capacitor/core';

export interface LensLoaderPlugin {
  setServerUrl(options: { url: string }): Promise<void>;
  getServerUrl(): Promise<{ url: string }>;
  resetServerUrl(): Promise<void>;
}

const LensLoader = registerPlugin<LensLoaderPlugin>('LensLoader');

export default LensLoader;
