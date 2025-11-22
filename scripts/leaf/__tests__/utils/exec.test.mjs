import { jest } from '@jest/globals';

// Mock child_process before importing exec
const mockExec = jest.fn();
jest.unstable_mockModule('child_process', () => ({
  exec: mockExec,
}));

// Import after mocking
const { runCommand } = await import('../../utils/exec.mjs');

describe('exec utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runCommand', () => {
    it('should execute command and return stdout', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(null, { stdout: 'success output\n', stderr: '' });
      });

      const result = await runCommand('echo test');
      expect(result).toBe('success output');
    });

    it('should trim whitespace from output', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(null, { stdout: '  output with spaces  \n', stderr: '' });
      });

      const result = await runCommand('echo test');
      expect(result).toBe('output with spaces');
    });

    it('should throw error on command failure', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(new Error('Command failed'), null);
      });

      await expect(runCommand('invalid command')).rejects.toThrow('Command failed');
    });

    it('should pass options to exec', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(null, { stdout: 'test', stderr: '' });
      });

      await runCommand('echo test', { encoding: 'utf8' });

      expect(mockExec).toHaveBeenCalledWith(
        'echo test',
        { encoding: 'utf8' },
        expect.any(Function)
      );
    });
  });
});
