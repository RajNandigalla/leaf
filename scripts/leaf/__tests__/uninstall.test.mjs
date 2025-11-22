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
let uninstallCommand;

describe('leaf uninstall', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/uninstall.mjs');
    uninstallCommand = module.default;
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
    mockChecker.checkInstallation.mockReturnValue({ depsInstalled: true, commandsInstalled: true });
  });

  it('should register uninstall command', () => {
    uninstallCommand(program);
    expect(program.command).toHaveBeenCalledWith('uninstall');
  });

  it('should do nothing if not installed', async () => {
    uninstallCommand(program);
    mockChecker.checkInstallation.mockReturnValue({
      depsInstalled: false,
      commandsInstalled: false,
    });

    await commandAction({});

    expect(mockInstaller.uninstallDependencies).not.toHaveBeenCalled();
    expect(mockInstaller.uninstallCommands).not.toHaveBeenCalled();
  });

  it('should uninstall if confirmed', async () => {
    uninstallCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      confirm: true,
    });

    await commandAction({});

    expect(mockInstaller.uninstallDependencies).toHaveBeenCalled();
    expect(mockInstaller.uninstallCommands).toHaveBeenCalled();
  });

  it('should cancel if not confirmed', async () => {
    uninstallCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      confirm: false,
    });

    await commandAction({});

    expect(mockInstaller.uninstallDependencies).not.toHaveBeenCalled();
    expect(mockInstaller.uninstallCommands).not.toHaveBeenCalled();
  });

  it('should skip confirmation with --yes', async () => {
    uninstallCommand(program);

    await commandAction({ yes: true });

    expect(mockInquirer.prompt).not.toHaveBeenCalled();
    expect(mockInstaller.uninstallDependencies).toHaveBeenCalled();
    expect(mockInstaller.uninstallCommands).toHaveBeenCalled();
  });
});
