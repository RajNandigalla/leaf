import { jest } from '@jest/globals';

// Mock cosmiconfig before importing capacitor
const mockExplorer = {
  search: jest.fn(),
};

let tsLoader;
const mockCosmiconfigSync = jest.fn((name, options) => {
  // Capture the .ts loader for testing
  if (options && options.loaders && options.loaders['.ts']) {
    tsLoader = options.loaders['.ts'];
  }
  return mockExplorer;
});

jest.unstable_mockModule('cosmiconfig', () => ({
  cosmiconfigSync: mockCosmiconfigSync,
}));

// Import after mocking
const { shouldSkipBuild, getServerUrl } = await import('../../utils/capacitor.mjs');

describe('capacitor utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldSkipBuild', () => {
    it('should return true when server URL is configured', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          server: {
            url: 'http://localhost:3000',
          },
        },
      });

      expect(shouldSkipBuild()).toBeTruthy();
    });

    it('should return false when no server URL', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          appId: 'com.test.app',
        },
      });

      expect(shouldSkipBuild()).toBeFalsy();
    });

    it('should return false when config not found', () => {
      mockExplorer.search.mockReturnValue(null);

      expect(shouldSkipBuild()).toBeFalsy();
    });

    it('should handle search errors gracefully', () => {
      mockExplorer.search.mockImplementation(() => {
        throw new Error('Config error');
      });

      expect(shouldSkipBuild()).toBeFalsy();
    });
  });

  describe('getServerUrl', () => {
    it('should return server URL when configured', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          server: {
            url: 'http://192.168.1.100:3000',
          },
        },
      });

      expect(getServerUrl()).toBe('http://192.168.1.100:3000');
    });

    it('should return null when no server URL', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          appId: 'com.test.app',
        },
      });

      expect(getServerUrl()).toBeNull();
    });

    it('should return null when config not found', () => {
      mockExplorer.search.mockReturnValue(null);

      expect(getServerUrl()).toBeNull();
    });

    it('should handle nested server config', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          appId: 'com.test.app',
          server: {
            url: 'https://example.com:8080',
            cleartext: true,
          },
        },
      });

      expect(getServerUrl()).toBe('https://example.com:8080');
    });

    it('should handle config with only appId', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          appId: 'com.test.app',
          webDir: 'dist',
        },
      });

      expect(getServerUrl()).toBeNull();
    });

    it('should handle empty server object', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          server: {},
        },
      });

      expect(getServerUrl()).toBeNull();
    });

    it('should handle server with empty url', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          server: {
            url: '',
          },
        },
      });

      expect(getServerUrl()).toBeNull();
    });

    it('should handle localhost URLs', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          server: {
            url: 'http://localhost:3000',
          },
        },
      });

      expect(getServerUrl()).toBe('http://localhost:3000');
      expect(shouldSkipBuild()).toBeTruthy();
    });

    it('should handle IP address URLs', () => {
      mockExplorer.search.mockReturnValue({
        config: {
          server: {
            url: 'http://192.168.1.100:3000',
          },
        },
      });

      expect(getServerUrl()).toBe('http://192.168.1.100:3000');
      expect(shouldSkipBuild()).toBeTruthy();
    });
  });

  describe('TypeScript config parsing', () => {
    it('should parse TypeScript config with CapacitorConfig type', () => {
      const tsContent = `
        import { CapacitorConfig } from '@capacitor/cli';
        
        const config: CapacitorConfig = {
          appId: 'com.test.app',
          appName: 'Test App',
          webDir: 'dist',
          server: {
            url: 'http://localhost:3000',
          },
        };
        
        export default config;
      `;

      const result = tsLoader('capacitor.config.ts', tsContent);

      expect(result).toBeDefined();
      expect(result.appId).toBe('com.test.app');
      expect(result.server.url).toBe('http://localhost:3000');
    });

    it('should parse TypeScript config with export default', () => {
      const tsContent = `
        export default {
          appId: 'com.example.app',
          appName: 'Example',
          webDir: 'out',
        };
      `;

      const result = tsLoader('capacitor.config.ts', tsContent);

      expect(result).toBeDefined();
      expect(result.appId).toBe('com.example.app');
      expect(result.webDir).toBe('out');
    });

    it('should handle TypeScript with type annotations', () => {
      const tsContent = `
        const config: CapacitorConfig = {
          appId: 'com.test.app',
          server: {
            url: 'http://localhost:3000',
            cleartext: true,
          },
        };
        export default config;
      `;

      const result = tsLoader('capacitor.config.ts', tsContent);

      expect(result).toBeDefined();
      expect(result.server.cleartext).toBe(true);
    });

    it('should handle single quotes in TypeScript config', () => {
      const tsContent = `
        export default {
          appId: 'com.test.app',
          appName: 'My App',
          webDir: 'dist',
        };
      `;

      const result = tsLoader('capacitor.config.ts', tsContent);

      expect(result).toBeDefined();
      expect(result.appName).toBe('My App');
    });

    it('should return null for invalid TypeScript config', () => {
      const tsContent = `
        import something from 'somewhere';
        const notAConfig = 'invalid';
      `;

      const result = tsLoader('capacitor.config.ts', tsContent);

      expect(result).toBeNull();
    });

    it('should fallback to Function constructor on JSON parse failure', () => {
      const tsContent = `
        const config: CapacitorConfig = {
          appId: 'com.test.app',
          server: {
            url: 'http://localhost:3000',
            cleartext: true,
          },
        };
        export default config;
      `;

      const result = tsLoader('capacitor.config.ts', tsContent);

      expect(result).toBeDefined();
      expect(result.appId).toBe('com.test.app');
    });

    it('should handle parsing errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const tsContent = `
        const config: CapacitorConfig = {
          appId: 'com.test.app',
          malformed: {{{,
        };
        export default config;
      `;

      const result = tsLoader('capacitor.config.ts', tsContent);

      // Should return null on parse failure
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
