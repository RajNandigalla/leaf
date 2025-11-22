import { jest } from '@jest/globals';
import { setupMocks, resetMocks } from './mocks.mjs';

// Setup mocks
await setupMocks();

describe('leaf status', () => {
  let statusCommand;
  let mockChecker;
  let mockProgram;

  beforeAll(async () => {
    mockChecker = await import('../utils/checker.mjs');
    const module = await import('../commands/status.mjs');
    statusCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();
    mockProgram = {
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      action: jest.fn().mockReturnThis(),
    };
  });

  it('should register status command', () => {
    statusCommand(mockProgram);

    expect(mockProgram.command).toHaveBeenCalledWith('status');
    expect(mockProgram.description).toHaveBeenCalledWith('Check Capacitor installation status');
    expect(mockProgram.action).toHaveBeenCalled();
  });

  it('should show fully installed status', () => {
    jest.spyOn(mockChecker, 'checkInstallation').mockReturnValue({
      depsInstalled: true,
      configExists: true,
      isFullyInstalled: true,
      installedDeps: 5,
      totalDeps: 5,
      platforms: {
        ios: true,
        android: true,
      },
    });

    statusCommand(mockProgram);
    const actionFn = mockProgram.action.mock.calls[0][0];
    actionFn();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });

  it('should show partially installed status', () => {
    jest.spyOn(mockChecker, 'checkInstallation').mockReturnValue({
      depsInstalled: true,
      configExists: false,
      isFullyInstalled: false,
      installedDeps: 5,
      totalDeps: 5,
      platforms: {
        ios: false,
        android: false,
      },
    });

    statusCommand(mockProgram);
    const actionFn = mockProgram.action.mock.calls[0][0];
    actionFn();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });

  it('should show not installed status', () => {
    jest.spyOn(mockChecker, 'checkInstallation').mockReturnValue({
      depsInstalled: false,
      configExists: false,
      isFullyInstalled: false,
      installedDeps: 0,
      totalDeps: 5,
      platforms: {
        ios: false,
        android: false,
      },
    });

    statusCommand(mockProgram);
    const actionFn = mockProgram.action.mock.calls[0][0];
    actionFn();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });

  it('should show suggestions when not fully installed', () => {
    jest.spyOn(mockChecker, 'checkInstallation').mockReturnValue({
      depsInstalled: false,
      configExists: false,
      isFullyInstalled: false,
      installedDeps: 0,
      totalDeps: 5,
      platforms: {
        ios: false,
        android: false,
      },
    });

    statusCommand(mockProgram);
    const actionFn = mockProgram.action.mock.calls[0][0];
    actionFn();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });

  it('should show platform suggestions when config exists but no platforms', () => {
    jest.spyOn(mockChecker, 'checkInstallation').mockReturnValue({
      depsInstalled: true,
      configExists: true,
      isFullyInstalled: false,
      installedDeps: 5,
      totalDeps: 5,
      platforms: {
        ios: false,
        android: false,
      },
    });

    statusCommand(mockProgram);
    const actionFn = mockProgram.action.mock.calls[0][0];
    actionFn();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });

  it('should show iOS configured status', () => {
    jest.spyOn(mockChecker, 'checkInstallation').mockReturnValue({
      depsInstalled: true,
      configExists: true,
      isFullyInstalled: true,
      installedDeps: 5,
      totalDeps: 5,
      platforms: {
        ios: true,
        android: false,
      },
    });

    statusCommand(mockProgram);
    const actionFn = mockProgram.action.mock.calls[0][0];
    actionFn();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });

  it('should show Android configured status', () => {
    jest.spyOn(mockChecker, 'checkInstallation').mockReturnValue({
      depsInstalled: true,
      configExists: true,
      isFullyInstalled: true,
      installedDeps: 5,
      totalDeps: 5,
      platforms: {
        ios: false,
        android: true,
      },
    });

    statusCommand(mockProgram);
    const actionFn = mockProgram.action.mock.calls[0][0];
    actionFn();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });

  it('should show setup suggestion when config exists but no platforms added', () => {
    jest.spyOn(mockChecker, 'checkInstallation').mockReturnValue({
      depsInstalled: true,
      configExists: true,
      isFullyInstalled: false,
      installedDeps: 5,
      totalDeps: 5,
      platforms: {
        ios: false,
        android: false,
      },
    });

    statusCommand(mockProgram);
    const actionFn = mockProgram.action.mock.calls[0][0];
    actionFn();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });
});
