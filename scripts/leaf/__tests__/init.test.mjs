import { jest } from '@jest/globals';
import { mockInquirer, mockExec, mockFs, mockOra, setupMocks, resetMocks } from './mocks.mjs';

// Import the module under test dynamically
let initCommand;

describe('leaf init', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/init.mjs');
    initCommand = module.default;
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
    mockFs.existsSync.mockReturnValue(false);
    mockExec.runCommand.mockResolvedValue('1.0.0');
  });

  it('should register init command', () => {
    initCommand(program);
    expect(program.command).toHaveBeenCalledWith('init');
  });

  it('should generate leaf.json', async () => {
    initCommand(program);

    await commandAction();

    expect(mockExec.runCommand).toHaveBeenCalledWith(
      expect.stringContaining('npm view @capacitor/core version'),
      expect.anything()
    );
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('leaf.json'),
      expect.stringContaining('"@capacitor/core": "^1.0.0"')
    );
  });

  it('should prompt to overwrite if exists', async () => {
    initCommand(program);
    mockFs.existsSync.mockReturnValue(true);

    mockInquirer.prompt.mockResolvedValue({
      overwrite: true,
    });

    await commandAction();

    expect(mockFs.writeFileSync).toHaveBeenCalled();
  });

  it('should not overwrite if declined', async () => {
    initCommand(program);
    mockFs.existsSync.mockReturnValue(true);

    mockInquirer.prompt.mockResolvedValue({
      overwrite: false,
    });

    await commandAction();

    expect(mockFs.writeFileSync).not.toHaveBeenCalled();
  });

  it('should handle version fetch failure', async () => {
    initCommand(program);
    mockExec.runCommand.mockRejectedValue(new Error('Network error'));

    await commandAction();

    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('leaf.json'),
      expect.stringContaining('"@capacitor/core": "^latest"')
    );
  });
});
