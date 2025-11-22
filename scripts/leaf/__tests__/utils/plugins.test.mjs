import { jest } from '@jest/globals';

// Mock dependencies
const mockFs = {
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
};

const mockRunCommand = jest.fn();

jest.unstable_mockModule('fs', () => ({
  default: mockFs,
  readFileSync: mockFs.readFileSync,
  writeFileSync: mockFs.writeFileSync,
}));

jest.unstable_mockModule('../../utils/exec.mjs', () => ({
  runCommand: mockRunCommand,
}));

// Import after mocking
const {
  getInstalledPlugins,
  addPluginToConfig,
  removePluginFromConfig,
  getPluginInfo,
  searchPlugins,
  getPopularPlugins,
} = await import('../../utils/plugins.mjs');

describe('plugins utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstalledPlugins', () => {
    it('should return installed plugins with status', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            plugins: {
              '@capacitor/camera': '^6.0.0',
              '@capacitor/filesystem': '^6.0.0',
            },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: {
              '@capacitor/camera': '^6.0.0',
            },
          });
        }
      });

      const plugins = getInstalledPlugins();

      expect(plugins).toHaveLength(2);
      expect(plugins[0].name).toBe('@capacitor/camera');
      expect(plugins[0].installed).toBe(true);
      expect(plugins[1].name).toBe('@capacitor/filesystem');
      expect(plugins[1].installed).toBe(false);
    });

    it('should handle empty plugins', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({});
        }
        if (path.includes('package.json')) {
          return JSON.stringify({});
        }
      });

      const plugins = getInstalledPlugins();

      expect(plugins).toHaveLength(0);
    });
  });

  describe('addPluginToConfig', () => {
    it('should add plugin to leaf.json', () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          plugins: {},
        })
      );

      addPluginToConfig('@capacitor/camera', '^6.0.0');

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenContent = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
      expect(writtenContent.plugins['@capacitor/camera']).toBe('^6.0.0');
    });

    it('should create plugins object if missing', () => {
      mockFs.readFileSync.mockReturnValue(JSON.stringify({}));

      addPluginToConfig('@capacitor/camera', '^6.0.0');

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenContent = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
      expect(writtenContent.plugins).toBeDefined();
      expect(writtenContent.plugins['@capacitor/camera']).toBe('^6.0.0');
    });
  });

  describe('removePluginFromConfig', () => {
    it('should remove plugin from leaf.json', () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          plugins: {
            '@capacitor/camera': '^6.0.0',
            '@capacitor/filesystem': '^6.0.0',
          },
        })
      );

      const result = removePluginFromConfig('@capacitor/camera');

      expect(result).toBe(true);
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenContent = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
      expect(writtenContent.plugins['@capacitor/camera']).toBeUndefined();
      expect(writtenContent.plugins['@capacitor/filesystem']).toBe('^6.0.0');
    });

    it('should return false if plugin not found', () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          plugins: {},
        })
      );

      const result = removePluginFromConfig('@capacitor/camera');

      expect(result).toBe(false);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('getPluginInfo', () => {
    it('should fetch plugin info from npm', async () => {
      mockRunCommand.mockResolvedValue(
        JSON.stringify({
          name: '@capacitor/camera',
          version: '6.0.0',
          description: 'Camera plugin',
        })
      );

      const info = await getPluginInfo('@capacitor/camera');

      expect(info.name).toBe('@capacitor/camera');
      expect(info.version).toBe('6.0.0');
      expect(mockRunCommand).toHaveBeenCalledWith('npm view @capacitor/camera --json');
    });

    it('should return null on error', async () => {
      mockRunCommand.mockRejectedValue(new Error('Not found'));

      const info = await getPluginInfo('@capacitor/invalid');

      expect(info).toBeNull();
    });
  });

  describe('searchPlugins', () => {
    it('should search for capacitor plugins', async () => {
      mockRunCommand.mockResolvedValue(
        JSON.stringify([
          {
            name: '@capacitor/camera',
            version: '6.0.0',
            description: 'Camera plugin',
          },
          {
            name: '@capacitor/core',
            version: '6.0.0',
            description: 'Core',
          },
        ])
      );

      const results = await searchPlugins('camera');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('@capacitor/camera');
      expect(mockRunCommand).toHaveBeenCalledWith('npm search @capacitor/camera --json');
    });

    it('should return empty array on error', async () => {
      mockRunCommand.mockRejectedValue(new Error('Search failed'));

      const results = await searchPlugins('test');

      expect(results).toEqual([]);
    });
  });

  describe('getPopularPlugins', () => {
    it('should return list of popular plugins', () => {
      const plugins = getPopularPlugins();

      expect(Array.isArray(plugins)).toBe(true);
      expect(plugins.length).toBeGreaterThan(0);
      expect(plugins).toContain('@capacitor/camera');
      expect(plugins).toContain('@capacitor/filesystem');
    });
  });
});
