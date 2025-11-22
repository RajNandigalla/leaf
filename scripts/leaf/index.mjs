#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json');

const program = new Command();

// ASCII Art Banner
const banner = `
${chalk.cyan('╔═══════════════════════════════════════╗')}
${chalk.cyan('║')}     ${chalk.bold.green('🌿 Leaf CLI')}                       ${chalk.cyan('║')}
${chalk.cyan('║')}     ${chalk.gray('Mobile Development Tool')}           ${chalk.cyan('║')}
${chalk.cyan('╚═══════════════════════════════════════╝')}
`;

program.name('leaf').description(banner).version(packageJson.version);

import installCommand from './commands/install.mjs';
import statusCommand from './commands/status.mjs';
import setupCommand from './commands/setup.mjs';
import uninstallCommand from './commands/uninstall.mjs';
import buildCommand from './commands/build.mjs';
import runCommand from './commands/run.mjs';
import doctorCommand from './commands/doctor.mjs';

installCommand(program);
statusCommand(program);
setupCommand(program);
uninstallCommand(program);
buildCommand(program);
runCommand(program);
doctorCommand(program);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}

// Error handling
program.exitOverride();

(async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    if (err.code === 'commander.helpDisplayed' || err.code === 'commander.help') {
      process.exit(0);
    }
    // Handle Inquirer Ctrl+C (SIGINT)
    if (err.message.includes('User force closed the prompt with SIGINT')) {
      console.log(chalk.yellow('\n⚠️  Operation cancelled by user'));
      process.exit(0);
    }
    console.error(chalk.red('\n❌ Error:'), err.message);
    process.exit(1);
  }
})();
