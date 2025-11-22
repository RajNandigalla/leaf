import { jest } from '@jest/globals';

// Mock cosmiconfig before importing capacitor
const mockExplorer = {
  search: jest.fn(),
};

const mockCosmiconfigSync = jest.fn(() => mockExplorer);

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
  });
});
