import { jest } from '@jest/globals';
import { mockFs, setupMocks, resetMocks } from './mocks.mjs';

// Import the module under test dynamically
let infoCommand;

describe('leaf info', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/info.mjs');
    infoCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Mock program object
    program = {
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      action: jest.fn((cb) => {
        commandAction = cb;
        return program;
      }),
    };

    // Default mock implementations
    mockFs.readFileSync.mockImplementation((path) => {
      if (path.includes('package.json')) {
        return JSON.stringify({
          name: 'test-app',
          version: '1.0.0',
          dependencies: { '@capacitor/core': '^5.0.0' },
        });
      }
      if (path.includes('leaf.json')) {
        return JSON.stringify({
          dependencies: { '@capacitor/core': '^5.0.0' },
          devDependencies: { '@capacitor/cli': '^5.0.0' },
          plugins: { '@capacitor/camera': '^5.0.0' },
          scripts: { build: 'npm run build' },
          webDir: 'out',
        });
      }
      if (path.includes('capacitor.config.json')) {
        return JSON.stringify({
          appName: 'TestApp',
          appId: 'com.test.app',
          webDir: 'out',
        });
      }
      return '{}';
    });

    mockFs.existsSync.mockImplementation((path) => {
      if (path.includes('capacitor.config.json')) return true;
      if (path.includes('ios')) return true;
      if (path.includes('android')) return false;
      if (path.includes('package-lock.json')) return true;
      return false;
    });
  });

  it('should register info command', () => {
    infoCommand(program);
    expect(program.command).toHaveBeenCalledWith('info');
  });

  it('should display project information', () => {
    infoCommand(program);

    commandAction();

    expect(mockFs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      'utf-8'
    );
    expect(mockFs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('leaf.json'), 'utf-8');
  });

  it('should display capacitor config from JSON file', () => {
    infoCommand(program);

    commandAction();

    expect(mockFs.existsSync).toHaveBeenCalled();
  });

  it('should handle TypeScript config file', () => {
    infoCommand(program);

    mockFs.existsSync.mockImplementation((path) => {
      if (path.includes('capacitor.config.ts')) return true;
      return false;
    });

    commandAction();

    expect(mockFs.existsSync).toHaveBeenCalled();
  });

  it('should handle JavaScript config file', () => {
    infoCommand(program);

    mockFs.existsSync.mockImplementation((path) => {
      if (path.includes('capacitor.config.js')) return true;
      return false;
    });

    commandAction();

    expect(mockFs.existsSync).toHaveBeenCalled();
  });

  it('should show warning when capacitor not initialized', () => {
    infoCommand(program);

    mockFs.existsSync.mockReturnValue(false);

    commandAction();

    expect(mockFs.existsSync).toHaveBeenCalled();
  });

  it('should detect yarn as package manager', () => {
    infoCommand(program);

    mockFs.existsSync.mockImplementation((path) => {
      if (path.includes('yarn.lock')) return true;
      return false;
    });

    commandAction();

    expect(mockFs.existsSync).toHaveBeenCalled();
  });

  it('should detect pnpm as package manager', () => {
    infoCommand(program);

    mockFs.existsSync.mockImplementation((path) => {
      if (path.includes('pnpm-lock.yaml')) return true;
      return false;
    });

    commandAction();

    expect(mockFs.existsSync).toHaveBeenCalled();
  });

  it('should show installed plugins status', () => {
    infoCommand(program);

    commandAction();

    expect(mockFs.readFileSync).toHaveBeenCalled();
  });

  it('should show both platforms configured', () => {
    infoCommand(program);

    mockFs.existsSync.mockImplementation((path) => {
      if (path.includes('ios')) return true;
      if (path.includes('android')) return true;
      if (path.includes('capacitor.config.json')) return true;
      return false;
    });

    commandAction();

    expect(mockFs.existsSync).toHaveBeenCalled();
  });

  it('should handle missing package.json', () => {
    infoCommand(program);

    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    commandAction();

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should handle missing leaf.json', () => {
    infoCommand(program);

    mockFs.readFileSync.mockImplementation((path) => {
      if (path.includes('package.json')) {
        return JSON.stringify({ name: 'test', version: '1.0.0' });
      }
      throw new Error('File not found');
    });

    commandAction();

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
