import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function runCommand(command, options = {}) {
  try {
    const { stdout, stderr } = await execAsync(command, options);
    return stdout.trim();
  } catch (error) {
    throw error;
  }
}
