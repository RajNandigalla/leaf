import { jest } from '@jest/globals';
import {
  mockInquirer,
  mockExec,
  mockChecker,
  mockCapacitor,
  mockFs,
  mockOra,
  setupMocks,
  resetMocks,
} from './mocks.mjs';

// Import the module under test dynamically
let setupCommand;

describe('leaf setup', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/setup.mjs');
    setupCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();

    // Mock program object
    program = {
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn((cb) => {
        commandAction = cb;
        return program;
      }),
    };

    // Default mock implementations
    mockChecker.checkInstallation.mockReturnValue({ depsInstalled: true });
    mockCapacitor.shouldSkipBuild.mockReturnValue(false);
    mockCapacitor.getServerUrl.mockReturnValue(null);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ scripts: { build: 'npm run build' } }));
    mockFs.existsSync.mockReturnValue(false); // Default: nothing exists
  });

  it('should register setup command', () => {
    setupCommand(program);
    expect(program.command).toHaveBeenCalledWith('setup');
  });

  it('should fail if dependencies not installed', async () => {
    setupCommand(program);
    mockChecker.checkInstallation.mockReturnValue({ depsInstalled: false });

    await commandAction({});

    expect(mockExec.runCommand).not.toHaveBeenCalled();
  });

  it('should run full setup', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios', 'android'],
      buildFirst: true,
    });

    await commandAction({});

    expect(mockExec.runCommand).toHaveBeenCalledWith('npm run build');
    expect(mockExec.runCommand).toHaveBeenCalledWith(
      'npx cap init "TestApp" "com.test.app" --web-dir=out'
    );
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add ios');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add android');
  });

  it('should skip build if requested', async () => {
    setupCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: false,
    });

    await commandAction({ skipBuild: true });

    expect(mockExec.runCommand).not.toHaveBeenCalledWith('npm run build');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add ios');
  });

  it('should skip init if config exists', async () => {
    setupCommand(program);

    mockFs.existsSync.mockImplementation((path) => path.includes('capacitor.config.ts'));

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios'],
      buildFirst: false,
    });

    await commandAction({ skipBuild: true });

    expect(mockExec.runCommand).not.toHaveBeenCalledWith(expect.stringContaining('npx cap init'));
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add ios');
  });

  it('should skip existing platforms', async () => {
    setupCommand(program);

    // Mock ios folder exists
    mockFs.existsSync.mockImplementation((path) => path.endsWith('/ios'));

    mockInquirer.prompt.mockResolvedValue({
      appName: 'TestApp',
      appId: 'com.test.app',
      platforms: ['ios', 'android'],
      buildFirst: false,
    });

    await commandAction({ skipBuild: true });

    expect(mockExec.runCommand).not.toHaveBeenCalledWith('npx cap add ios');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap add android');
  });
});
