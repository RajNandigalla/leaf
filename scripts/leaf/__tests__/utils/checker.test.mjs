import { jest } from '@jest/globals';

// Mock fs before importing checker
const mockFs = {
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
};

jest.unstable_mockModule('fs', () => ({
  default: mockFs,
  readFileSync: mockFs.readFileSync,
  existsSync: mockFs.existsSync,
}));

// Import after mocking
const { checkInstallation } = await import('../../utils/checker.mjs');

describe('checker utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkInstallation', () => {
    it('should return fully installed status', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: { '@capacitor/cli': '^6.0.0' },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: { '@capacitor/cli': '^6.0.0' },
          });
        }
      });

      mockFs.existsSync.mockImplementation((path) => {
        if (path.includes('capacitor.config.ts')) return true;
        if (path.includes('ios')) return true;
        if (path.includes('android')) return true;
        return false;
      });

      const result = checkInstallation();

      expect(result.depsInstalled).toBe(true);
      expect(result.configExists).toBe(true);
      expect(result.isFullyInstalled).toBe(true);
      expect(result.platforms.ios).toBe(true);
      expect(result.platforms.android).toBe(true);
    });

    it('should detect missing dependencies', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: { '@capacitor/cli': '^6.0.0' },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: {},
            devDependencies: {},
          });
        }
      });

      mockFs.existsSync.mockReturnValue(true);

      const result = checkInstallation();

      expect(result.depsInstalled).toBe(false);
      expect(result.isFullyInstalled).toBe(false);
    });

    it('should detect missing config', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: {},
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: { '@capacitor/core': '^6.0.0' },
            devDependencies: {},
          });
        }
      });

      mockFs.existsSync.mockReturnValue(false);

      const result = checkInstallation();

      expect(result.configExists).toBe(false);
      expect(result.isFullyInstalled).toBe(false);
    });

    it('should detect platform status', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({ dependencies: {}, devDependencies: {} });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({ dependencies: {}, devDependencies: {} });
        }
      });

      mockFs.existsSync.mockImplementation((path) => {
        if (path.includes('ios')) return true;
        if (path.includes('android')) return false;
        return false;
      });

      const result = checkInstallation();

      expect(result.platforms.ios).toBe(true);
      expect(result.platforms.android).toBe(false);
    });
  });
});
