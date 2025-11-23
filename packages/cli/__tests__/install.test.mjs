import { jest } from '@jest/globals';
import {
  mockInquirer,
  mockChecker,
  mockInstaller,
  mockOra,
  setupMocks,
  resetMocks,
} from './mocks.mjs';

// Import the module under test dynamically
let installCommand;

describe('leaf install', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/install.mjs');
    installCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();

    // Mock program object
    program = {
      command: jest.fn().mockReturnThis(),
      alias: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      option: jest.fn().mockReturnThis(),
      action: jest.fn((cb) => {
        commandAction = cb;
        return program;
      }),
    };

    // Default mock implementations
    mockChecker.checkInstallation.mockReturnValue({ isFullyInstalled: false });
  });

  it('should register install command', () => {
    installCommand(program);
    expect(program.command).toHaveBeenCalledWith('install');
  });

  it('should install dependencies if confirmed', async () => {
    installCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      proceed: true,
    });

    await commandAction({});

    expect(mockInstaller.installDependencies).toHaveBeenCalled();
  });

  it('should cancel if not confirmed', async () => {
    installCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      proceed: false,
    });

    await commandAction({});

    expect(mockInstaller.installDependencies).not.toHaveBeenCalled();
  });

  it('should skip confirmation with --yes', async () => {
    installCommand(program);

    await commandAction({ yes: true });

    expect(mockInquirer.prompt).not.toHaveBeenCalled();
    expect(mockInstaller.installDependencies).toHaveBeenCalled();
  });

  it('should skip if already installed (non-interactive)', async () => {
    installCommand(program);
    mockChecker.checkInstallation.mockReturnValue({ isFullyInstalled: true });

    await commandAction({});

    expect(mockInquirer.prompt).not.toHaveBeenCalled();
    expect(mockInstaller.installDependencies).not.toHaveBeenCalled();
  });

  it('should prompt if already installed but interactive', async () => {
    installCommand(program);
    mockChecker.checkInstallation.mockReturnValue({ isFullyInstalled: true });

    mockInquirer.prompt.mockResolvedValue({
      proceed: true,
    });

    await commandAction({ interactive: true });

    expect(mockInquirer.prompt).toHaveBeenCalled();
    expect(mockInstaller.installDependencies).toHaveBeenCalled();
  });
});
