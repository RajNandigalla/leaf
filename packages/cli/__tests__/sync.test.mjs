import { jest } from '@jest/globals';
import { mockInquirer, mockChecker, mockChildProcess, setupMocks, resetMocks } from './mocks.mjs';

// Import the module under test dynamically
let syncCommand;

describe('leaf sync', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/sync.mjs');
    syncCommand = module.default;
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

    mockChildProcess.execSync.mockReturnValue('');
  });

  it('should register sync command', () => {
    syncCommand(program);
    expect(program.command).toHaveBeenCalledWith('sync [platform]');
  });

  it('should fail if not fully installed', async () => {
    syncCommand(program);
    mockChecker.checkInstallation.mockReturnValue({ isFullyInstalled: false });

    await commandAction();

    expect(mockChildProcess.execSync).not.toHaveBeenCalled();
  });

  it('should sync specified platform', async () => {
    syncCommand(program);

    await commandAction('ios');

    expect(mockChildProcess.execSync).toHaveBeenCalledWith('npx cap sync ios', expect.anything());
  });

  it('should prompt for platform if not specified', async () => {
    syncCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      platforms: ['android'],
    });

    await commandAction();

    expect(mockChildProcess.execSync).toHaveBeenCalledWith(
      'npx cap sync android',
      expect.anything()
    );
  });

  it('should fail if platform not added', async () => {
    syncCommand(program);
    mockChecker.checkInstallation.mockReturnValue({
      isFullyInstalled: true,
      platforms: { ios: false, android: true },
    });

    await commandAction('ios');

    expect(mockChildProcess.execSync).not.toHaveBeenCalled();
  });

  it('should fail on invalid platform', async () => {
    syncCommand(program);

    await commandAction('windows');

    expect(mockChildProcess.execSync).not.toHaveBeenCalled();
  });

  it('should validate platform selection in prompt', async () => {
    syncCommand(program);

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

  it('should handle sync errors', async () => {
    syncCommand(program);

    jest.spyOn(process, 'exit').mockImplementation(() => {});

    mockChildProcess.execSync.mockImplementation(() => {
      throw new Error('Sync failed');
    });

    await commandAction('ios');

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
