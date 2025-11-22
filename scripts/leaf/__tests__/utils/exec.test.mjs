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

    it('should handle empty output', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(null, { stdout: '', stderr: '' });
      });

      const result = await runCommand('echo');
      expect(result).toBe('');
    });

    it('should handle multiline output', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(null, { stdout: 'line1\nline2\nline3\n', stderr: '' });
      });

      const result = await runCommand('echo test');
      expect(result).toBe('line1\nline2\nline3');
    });

    it('should throw error on command failure', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(new Error('Command failed'), null);
      });

      await expect(runCommand('invalid command')).rejects.toThrow('Command failed');
    });

    it('should throw error with exit code', async () => {
      const error = new Error('Command failed with exit code 1');
      error.code = 1;
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(error, null);
      });

      await expect(runCommand('failing command')).rejects.toThrow(
        'Command failed with exit code 1'
      );
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

    it('should handle stderr output', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(null, { stdout: 'output', stderr: 'warning message' });
      });

      const result = await runCommand('command with warnings');
      expect(result).toBe('output');
    });

    it('should handle commands with special characters', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(null, { stdout: 'success', stderr: '' });
      });

      await runCommand('echo "test with quotes"');
      expect(mockExec).toHaveBeenCalledWith('echo "test with quotes"', {}, expect.any(Function));
    });
  });
});
