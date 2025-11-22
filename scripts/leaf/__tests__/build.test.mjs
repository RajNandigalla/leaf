import { jest } from '@jest/globals';
import {
  mockInquirer,
  mockExec,
  mockChecker,
  mockCapacitor,
  mockFs,
  setupMocks,
  resetMocks,
} from './mocks.mjs';

// Import the module under test dynamically
let buildCommand;

describe('leaf build', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/build.mjs');
    buildCommand = module.default;
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
    mockChecker.checkInstallation.mockReturnValue({ isFullyInstalled: true });
    mockCapacitor.shouldSkipBuild.mockReturnValue(false);
    mockCapacitor.getServerUrl.mockReturnValue(null);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ scripts: { build: 'npm run build' } }));
  });

  it('should register the build command', () => {
    buildCommand(program);
    expect(program.command).toHaveBeenCalledWith('build');
    expect(program.description).toHaveBeenCalledWith('Build web app and sync with Capacitor');
    expect(program.option).toHaveBeenCalledWith('--no-sync', 'Skip Capacitor sync');
    expect(program.action).toHaveBeenCalled();
  });

  it('should fail if Capacitor is not fully installed', async () => {
    mockChecker.checkInstallation.mockReturnValue({ isFullyInstalled: false });
    buildCommand(program);

    await commandAction({});

    expect(mockExec.runCommand).not.toHaveBeenCalled();
  });

  it('should build web app and sync by default', async () => {
    buildCommand(program);

    // Mock user answers
    mockInquirer.prompt.mockResolvedValue({
      buildMode: 'all',
      platform: 'all',
    });

    await commandAction({ sync: true });

    expect(mockExec.runCommand).toHaveBeenCalledWith('npm run build');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap sync');
  });

  it('should build web app only', async () => {
    buildCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      buildMode: 'web-only',
    });

    await commandAction({ sync: true });

    expect(mockExec.runCommand).toHaveBeenCalledWith('npm run build');
    expect(mockExec.runCommand).not.toHaveBeenCalledWith(expect.stringContaining('npx cap sync'));
  });

  it('should sync only', async () => {
    buildCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      buildMode: 'sync-only',
      platform: 'all',
    });

    await commandAction({ sync: true });

    expect(mockExec.runCommand).not.toHaveBeenCalledWith('npm run build');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap sync');
  });

  it('should skip build if server URL is detected', async () => {
    mockCapacitor.shouldSkipBuild.mockReturnValue(true);
    mockCapacitor.getServerUrl.mockReturnValue('http://localhost:3000');

    buildCommand(program);

    // When server URL is detected, it asks for platform to sync
    mockInquirer.prompt.mockResolvedValue({
      platform: 'android',
    });

    await commandAction({ sync: true });

    expect(mockExec.runCommand).not.toHaveBeenCalledWith('npm run build');
    expect(mockExec.runCommand).toHaveBeenCalledWith('npx cap sync android');
  });
});
