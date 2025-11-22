import { jest } from '@jest/globals';
import {
  mockInquirer,
  mockChecker,
  mockChildProcess,
  mockOra,
  setupMocks,
  resetMocks,
} from './mocks.mjs';

// Import the module under test dynamically
let runCommand;

describe('leaf run', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/run.mjs');
    runCommand = module.default;
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
      platforms: { ios: true, android: true },
    });

    // Mock spawn to return a mock child process
    const mockChild = {
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(0), 0);
        }
        return mockChild;
      }),
    };
    mockChildProcess.spawn.mockReturnValue(mockChild);
    mockChildProcess.execSync.mockReturnValue('');
  });

  it('should register run command', () => {
    runCommand(program);
    expect(program.command).toHaveBeenCalledWith('run [platform]');
  });

  it('should fail if not fully installed', async () => {
    runCommand(program);
    mockChecker.checkInstallation.mockReturnValue({ isFullyInstalled: false });

    await commandAction();

    expect(mockChildProcess.execSync).not.toHaveBeenCalled();
  });

  it('should run specified platform', async () => {
    runCommand(program);

    await commandAction('ios');

    expect(mockChildProcess.execSync).toHaveBeenCalledWith('npx cap sync ios', expect.anything());
    expect(mockChildProcess.spawn).toHaveBeenCalledWith(
      'npx',
      ['cap', 'run', 'ios'],
      expect.anything()
    );
  });

  it('should prompt for platform if not specified', async () => {
    runCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      platforms: ['android'],
    });

    await commandAction();

    expect(mockChildProcess.execSync).toHaveBeenCalledWith(
      'npx cap sync android',
      expect.anything()
    );
    expect(mockChildProcess.spawn).toHaveBeenCalledWith(
      'npx',
      ['cap', 'run', 'android'],
      expect.anything()
    );
  });

  it('should fail if platform not added', async () => {
    runCommand(program);
    mockChecker.checkInstallation.mockReturnValue({
      isFullyInstalled: true,
      platforms: { ios: false, android: true },
    });

    await commandAction('ios');

    expect(mockChildProcess.execSync).not.toHaveBeenCalled();
  });

  it('should fail on invalid platform', async () => {
    runCommand(program);

    await commandAction('windows');

    expect(mockChildProcess.execSync).not.toHaveBeenCalled();
  });

  it('should validate platform selection in prompt', async () => {
    runCommand(program);

    let validationFn;
    mockInquirer.prompt.mockImplementation((questions) => {
      validationFn = questions[0].validate;
      return Promise.resolve({ platforms: ['ios'] });
    });

    await commandAction();

    // Test empty selection
    expect(validationFn([])).toBe('You must choose at least one platform.');
    // Test valid selection
    expect(validationFn(['ios'])).toBe(true);
  });

  it('should handle sync errors and continue', async () => {
    runCommand(program);

    mockChildProcess.execSync.mockImplementation(() => {
      throw new Error('Sync failed');
    });

    await commandAction('ios');

    expect(mockChildProcess.execSync).toHaveBeenCalled();
    expect(mockChildProcess.spawn).not.toHaveBeenCalled();
  });

  it('should handle non-zero exit codes', async () => {
    runCommand(program);

    const mockChild = {
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          setTimeout(() => callback(1), 0); // Non-zero exit code
        }
        return mockChild;
      }),
    };
    mockChildProcess.spawn.mockReturnValue(mockChild);

    await commandAction('ios');

    expect(mockChildProcess.spawn).toHaveBeenCalled();
  });

  it('should handle general errors', async () => {
    runCommand(program);

    jest.spyOn(process, 'exit').mockImplementation(() => {});

    // Mock spawn to throw an error
    mockChildProcess.spawn.mockImplementation(() => {
      throw new Error('General error');
    });

    await commandAction('ios');

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
