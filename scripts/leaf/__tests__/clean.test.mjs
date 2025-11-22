import { jest } from '@jest/globals';
import { mockInquirer, mockExec, mockFs, mockOra, setupMocks, resetMocks } from './mocks.mjs';

// Import the module under test dynamically
let cleanCommand;

describe('leaf clean', () => {
  let program;
  let commandAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/clean.mjs');
    cleanCommand = module.default;
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
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ webDir: 'dist' }));
    mockFs.existsSync.mockReturnValue(true);
  });

  it('should register clean command', () => {
    cleanCommand(program);
    expect(program.command).toHaveBeenCalledWith('clean');
  });

  it('should clean selected targets', async () => {
    cleanCommand(program);

    mockInquirer.prompt.mockResolvedValue({
      targets: ['web', 'node-cache'],
    });

    await commandAction({});

    expect(mockExec.runCommand).toHaveBeenCalledWith(expect.stringContaining('rm -rf'));
    expect(mockExec.runCommand).toHaveBeenCalledWith(expect.stringContaining('dist'));
    expect(mockExec.runCommand).toHaveBeenCalledWith(
      expect.stringContaining('node_modules/.cache')
    );
  });

  it('should clean all with --all', async () => {
    cleanCommand(program);

    await commandAction({ all: true });

    expect(mockInquirer.prompt).not.toHaveBeenCalled();
    expect(mockExec.runCommand).toHaveBeenCalledWith(expect.stringContaining('dist'));
    expect(mockExec.runCommand).toHaveBeenCalledWith(expect.stringContaining('ios/build'));
    expect(mockExec.runCommand).toHaveBeenCalledWith(expect.stringContaining('android/build'));
    expect(mockExec.runCommand).toHaveBeenCalledWith(
      expect.stringContaining('node_modules/.cache')
    );
    // Should not clean platforms by default with --all (as per code: !t.warning)
    // We use regex to ensure we don't match android/build or ios/build
    expect(mockExec.runCommand).not.toHaveBeenCalledWith(
      expect.stringMatching(/rm -rf .*\/android$/)
    );
    expect(mockExec.runCommand).not.toHaveBeenCalledWith(expect.stringMatching(/rm -rf .*\/ios$/));
  });

  it('should prompt for destructive clean', async () => {
    cleanCommand(program);

    mockInquirer.prompt
      .mockResolvedValueOnce({
        targets: ['platforms'],
      })
      .mockResolvedValueOnce({
        confirm: true,
      });

    await commandAction({});

    expect(mockExec.runCommand).toHaveBeenCalledWith(expect.stringContaining('rm -rf'));
  });

  it('should cancel destructive clean if not confirmed', async () => {
    cleanCommand(program);

    mockInquirer.prompt
      .mockResolvedValueOnce({
        targets: ['platforms'],
      })
      .mockResolvedValueOnce({
        confirm: false,
      });

    await commandAction({});

    expect(mockExec.runCommand).not.toHaveBeenCalled();
  });
});
