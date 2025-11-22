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

  describe('edge cases', () => {
    it('should handle plugins with devDependencies', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            plugins: {
              '@capacitor/camera': '^6.0.0',
            },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            devDependencies: {
              '@capacitor/camera': '^6.0.0',
            },
          });
        }
      });

      const plugins = getInstalledPlugins();

      expect(plugins[0].installed).toBe(true);
    });

    it('should handle version mismatches', () => {
      mockFs.readFileSync.mockImplementation((path) => {
        if (path.includes('leaf.json')) {
          return JSON.stringify({
            plugins: {
              '@capacitor/camera': '^6.0.0',
            },
          });
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: {
              '@capacitor/camera': '^5.0.0',
            },
          });
        }
      });

      const plugins = getInstalledPlugins();

      expect(plugins[0].installed).toBe(true);
      expect(plugins[0].installedVersion).toBe('^5.0.0');
      expect(plugins[0].version).toBe('^6.0.0');
    });

    it('should filter out core packages from search', async () => {
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
          {
            name: '@capacitor/cli',
            version: '6.0.0',
            description: 'CLI',
          },
          {
            name: '@capacitor/ios',
            version: '6.0.0',
            description: 'iOS platform',
          },
          {
            name: '@capacitor/android',
            version: '6.0.0',
            description: 'Android platform',
          },
        ])
      );

      const results = await searchPlugins('');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('@capacitor/camera');
    });

    it('should handle npm view with detailed info', async () => {
      mockRunCommand.mockResolvedValue(
        JSON.stringify({
          name: '@capacitor/camera',
          version: '6.0.0',
          description: 'Camera plugin for Capacitor',
          keywords: ['capacitor', 'camera', 'photo'],
          license: 'MIT',
        })
      );

      const info = await getPluginInfo('@capacitor/camera');

      expect(info.name).toBe('@capacitor/camera');
      expect(info.keywords).toContain('capacitor');
      expect(info.license).toBe('MIT');
    });

    it('should handle search with no results', async () => {
      mockRunCommand.mockResolvedValue(JSON.stringify([]));

      const results = await searchPlugins('nonexistent');

      expect(results).toEqual([]);
    });

    it('should handle adding plugin to empty config', () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          dependencies: {},
        })
      );

      addPluginToConfig('@capacitor/camera', '^6.0.0');

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenContent = JSON.parse(mockFs.writeFileSync.mock.calls[0][1]);
      expect(writtenContent.plugins).toBeDefined();
      expect(writtenContent.dependencies).toBeDefined();
    });

    it('should handle removing non-existent plugin', () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          plugins: {
            '@capacitor/camera': '^6.0.0',
          },
        })
      );

      const result = removePluginFromConfig('@capacitor/filesystem');

      expect(result).toBe(false);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle search with query parameter', async () => {
      mockRunCommand.mockResolvedValue(
        JSON.stringify([
          {
            name: '@capacitor/camera',
            version: '6.0.0',
            description: 'Camera plugin',
          },
        ])
      );

      await searchPlugins('camera');

      expect(mockRunCommand).toHaveBeenCalledWith('npm search @capacitor/camera --json');
    });

    it('should handle plugins without description', async () => {
      mockRunCommand.mockResolvedValue(
        JSON.stringify([
          {
            name: '@capacitor/test-plugin',
            version: '1.0.0',
            // No description field
          },
        ])
      );

      const results = await searchPlugins('test');

      expect(results).toHaveLength(1);
      expect(results[0].description).toBe('No description');
    });

    it('should search all plugins when query is empty', async () => {
      mockRunCommand.mockResolvedValue(
        JSON.stringify([
          {
            name: '@capacitor/camera',
            version: '6.0.0',
            description: 'Camera',
          },
        ])
      );

      await searchPlugins('');

      expect(mockRunCommand).toHaveBeenCalledWith('npm search @capacitor/ --json');
    });

    it('should search all plugins when no query provided', async () => {
      mockRunCommand.mockResolvedValue(
        JSON.stringify([
          {
            name: '@capacitor/filesystem',
            version: '6.0.0',
            description: 'File system',
          },
        ])
      );

      await searchPlugins();

      expect(mockRunCommand).toHaveBeenCalledWith('npm search @capacitor/ --json');
    });
  });
});
