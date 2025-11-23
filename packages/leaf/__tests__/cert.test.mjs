import { jest } from '@jest/globals';
import { mockInquirer, mockExec, mockFs, mockOra, setupMocks, resetMocks } from './mocks.mjs';

// Import the module under test dynamically
let certCommand;

describe('leaf cert', () => {
  let program;
  let androidCommand;
  let iosCommand;
  let infoCommand;
  let androidAction;
  let iosAction;
  let infoAction;

  beforeAll(async () => {
    await setupMocks();
    const module = await import('../commands/cert.mjs');
    certCommand = module.default;
  });

  beforeEach(() => {
    resetMocks();

    // Mock program object structure
    const createMockCommand = (name) => ({
      command: jest.fn().mockReturnThis(),
      description: jest.fn().mockReturnThis(),
      showHelpAfterError: jest.fn().mockReturnThis(),
      configureHelp: jest.fn().mockReturnThis(),
      action: jest.fn(function (cb) {
        if (name === 'android') androidAction = cb;
        if (name === 'ios') iosAction = cb;
        if (name === 'info') infoAction = cb;
        return this;
      }),
    });

    androidCommand = createMockCommand('android');
    iosCommand = createMockCommand('ios');
    infoCommand = createMockCommand('info');

    program = {
      command: jest.fn((name) => {
        if (name === 'cert') {
          return {
            description: jest.fn().mockReturnThis(),
            showHelpAfterError: jest.fn().mockReturnThis(),
            configureHelp: jest.fn().mockReturnThis(),
            command: jest.fn((subName) => {
              if (subName === 'android') return androidCommand;
              if (subName === 'ios') return iosCommand;
              if (subName === 'info') return infoCommand;
              return createMockCommand(subName);
            }),
          };
        }
        return createMockCommand(name);
      }),
    };

    // Default mock implementations
    mockFs.existsSync.mockReturnValue(false);
  });

  it('should register cert commands', () => {
    certCommand(program);
    expect(program.command).toHaveBeenCalledWith('cert');
  });

  describe('android', () => {
    it('should fail if keytool missing', async () => {
      certCommand(program);
      mockExec.runCommand.mockRejectedValue(new Error('keytool not found'));

      await androidAction();

      expect(mockInquirer.prompt).not.toHaveBeenCalled();
    });

    it('should generate keystore', async () => {
      certCommand(program);

      mockInquirer.prompt
        .mockResolvedValueOnce({
          alias: 'upload',
          filename: 'upload.jks',
          name: 'Test User',
          country: 'US',
        })
        .mockResolvedValueOnce({
          password: 'password123',
          confirmPassword: 'password123',
        });

      await androidAction();

      expect(mockExec.runCommand).toHaveBeenCalledWith(
        expect.stringContaining('keytool -genkeypair')
      );
    });

    it('should handle password mismatch', async () => {
      certCommand(program);

      mockInquirer.prompt
        .mockResolvedValueOnce({
          alias: 'upload',
          filename: 'upload.jks',
          name: 'Test User',
          country: 'US',
        })
        .mockResolvedValueOnce({
          password: 'password123',
          confirmPassword: 'password456',
        })
        .mockResolvedValueOnce({
          password: 'password123',
          confirmPassword: 'password123',
        });

      await androidAction();

      expect(mockInquirer.prompt).toHaveBeenCalledTimes(3);
    });
  });

  describe('ios', () => {
    it('should generate CSR', async () => {
      certCommand(program);

      mockInquirer.prompt.mockResolvedValue({
        email: 'test@example.com',
        name: 'Test User',
        filename: 'test',
      });

      await iosAction();

      expect(mockExec.runCommand).toHaveBeenCalledWith(expect.stringContaining('openssl genrsa'));
      expect(mockExec.runCommand).toHaveBeenCalledWith(expect.stringContaining('openssl req -new'));
    });
  });
});
