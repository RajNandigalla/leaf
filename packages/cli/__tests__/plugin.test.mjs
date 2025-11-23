import { jest } from '@jest/globals';
import {
  mockInquirer,
  mockExec,
  mockPluginsUtils,
  mockOra,
  setupMocks,
  resetMocks,
} from './mocks.mjs';

// Import the module under test dynamically
let pluginCommand;

describe('leaf plugin', () => {
  let program;
  let addCommand;
  let removeCommand;
  let listCommand;
  let searchCommand;
  let addAction;
  let removeAction;
  let listAction;
  let searchAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/plugin.mjs');
    pluginCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();

    // Mock program object structure
    const createMockCommand = (name) => ({
      command: jest.fn().mockReturnThis(),
      alias: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      action: jest.fn(function (cb) {
        if (name === 'add') addAction = cb;
        if (name === 'remove') removeAction = cb;
        if (name === 'list') listAction = cb;
        if (name === 'search') searchAction = cb;
        return this;
      }),
    });

    addCommand = createMockCommand('add');
    removeCommand = createMockCommand('remove');
    listCommand = createMockCommand('list');
    searchCommand = createMockCommand('search');

    program = {
      command: jest.fn((name) => {
        if (name === 'plugin') {
          return {
            description: jest.fn().mockReturnThis(),
            command: jest.fn((subName) => {
              if (subName.startsWith('add')) return addCommand;
              if (subName.startsWith('remove')) return removeCommand;
              if (subName.startsWith('list')) return listCommand;
              if (subName.startsWith('search')) return searchCommand;
              return createMockCommand(subName);
            }),
          };
        }
        return createMockCommand(name);
      }),
    };

    // Default mock implementations
    mockPluginsUtils.getPopularPlugins.mockReturnValue(['@capacitor/camera']);
    mockPluginsUtils.getInstalledPlugins.mockReturnValue([]);
    mockPluginsUtils.getPluginInfo.mockResolvedValue({ version: '1.0.0' });
    mockPluginsUtils.searchPlugins.mockResolvedValue([
      { name: 'test-plugin', description: 'Test', version: '1.0.0' },
    ]);
  });

  it('should register plugin commands', () => {
    pluginCommand(program);
    expect(program.command).toHaveBeenCalledWith('plugin');
  });

  describe('add', () => {
    it('should add a plugin directly', async () => {
      pluginCommand(program);

      // Mock sync prompt
      mockInquirer.prompt.mockResolvedValue({ shouldSync: false });

      await addAction('test-plugin');

      expect(mockPluginsUtils.getPluginInfo).toHaveBeenCalledWith('test-plugin');
      expect(mockPluginsUtils.addPluginToConfig).toHaveBeenCalledWith('test-plugin', '^1.0.0');
      expect(mockExec.runCommand).toHaveBeenCalledWith('npm install test-plugin@^1.0.0');
    });

    it('should prompt if no plugin specified', async () => {
      pluginCommand(program);

      mockInquirer.prompt
        .mockResolvedValueOnce({
          plugin: '@capacitor/camera',
        })
        .mockResolvedValueOnce({
          shouldSync: false,
        });

      await addAction();

      expect(mockPluginsUtils.addPluginToConfig).toHaveBeenCalledWith(
        '@capacitor/camera',
        '^1.0.0'
      );
    });

    it('should sync if confirmed', async () => {
      pluginCommand(program);

      mockInquirer.prompt
        .mockResolvedValueOnce({
          plugin: '@capacitor/camera',
        })
        .mockResolvedValueOnce({
          shouldSync: true,
        });

      await addAction();

      expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap sync');
    });

    it('should not sync if declined', async () => {
      pluginCommand(program);

      mockInquirer.prompt
        .mockResolvedValueOnce({
          plugin: '@capacitor/camera',
        })
        .mockResolvedValueOnce({
          shouldSync: false,
        });

      await addAction();

      expect(mockExec.runCommand).not.toHaveBeenCalledWith('npx cap sync');
    });
  });

  describe('remove', () => {
    it('should remove a plugin directly', async () => {
      pluginCommand(program);

      mockInquirer.prompt.mockResolvedValueOnce({
        confirm: true,
      });
      mockPluginsUtils.removePluginFromConfig.mockReturnValue(true);

      await removeAction('test-plugin');

      expect(mockPluginsUtils.removePluginFromConfig).toHaveBeenCalledWith('test-plugin');
      expect(mockExec.runCommand).toHaveBeenCalledWith('npm uninstall test-plugin');
    });
  });

  describe('list', () => {
    it('should list installed plugins', async () => {
      pluginCommand(program);

      mockPluginsUtils.getInstalledPlugins.mockReturnValue([
        { name: 'test-plugin', version: '1.0.0', installed: true },
      ]);

      await listAction();

      expect(mockPluginsUtils.getInstalledPlugins).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search for plugins', async () => {
      pluginCommand(program);

      await searchAction('camera');

      expect(mockPluginsUtils.searchPlugins).toHaveBeenCalledWith('camera');
    });
  });
});
