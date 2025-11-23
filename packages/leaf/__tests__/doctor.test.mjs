import { jest } from '@jest/globals';
import { mockChecker, mockChildProcess, setupMocks, resetMocks } from './mocks.mjs';

// Import the module under test dynamically
let doctorCommand;

describe('leaf doctor', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/doctor.mjs');
    doctorCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();

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
    mockChecker.checkInstallation.mockReturnValue({
      isFullyInstalled: true,
      depsInstalled: true,
    });
    mockChildProcess.execSync.mockReturnValue('');
  });

  it('should register doctor command', () => {
    doctorCommand(program);
    expect(program.command).toHaveBeenCalledWith('doctor');
  });

  it('should run capacitor doctor when fully installed', async () => {
    doctorCommand(program);

    await commandAction();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
    expect(mockChildProcess.execSync).toHaveBeenCalledWith('npx cap doctor', expect.anything());
  });

  it('should skip capacitor doctor when not installed', async () => {
    doctorCommand(program);

    mockChecker.checkInstallation.mockReturnValue({
      isFullyInstalled: false,
      depsInstalled: false,
    });

    await commandAction();

    expect(mockChildProcess.execSync).not.toHaveBeenCalled();
  });

  it('should handle capacitor doctor errors', async () => {
    doctorCommand(program);

    mockChildProcess.execSync.mockImplementation(() => {
      throw new Error('Doctor failed');
    });

    await commandAction();

    expect(mockChildProcess.execSync).toHaveBeenCalled();
  });

  it('should show missing dependencies message', async () => {
    doctorCommand(program);

    mockChecker.checkInstallation.mockReturnValue({
      isFullyInstalled: false,
      depsInstalled: false,
    });

    await commandAction();

    expect(mockChecker.checkInstallation).toHaveBeenCalled();
  });
});
