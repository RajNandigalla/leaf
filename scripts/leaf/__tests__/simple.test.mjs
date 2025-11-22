import { jest } from '@jest/globals';

describe('CLI Test Environment', () => {
  it('should run a simple test', () => {
    expect(true).toBe(true);
  });

  it('should support ESM imports', async () => {
    const { runCommand } = await import('../utils/exec.mjs');
    expect(runCommand).toBeDefined();
  });
});
