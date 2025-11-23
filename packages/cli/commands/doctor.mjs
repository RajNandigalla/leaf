import ora from 'ora';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { checkInstallation } from '../utils/checker.mjs';

export default (program) => {
  program
    .command('doctor')
    .description('Check environment health and dependencies')
    .action(async () => {
      console.log(chalk.cyan('\n🩺 Leaf Doctor\n'));

      const status = checkInstallation();

      // 1. Check Leaf Installation
      console.log(chalk.bold('Leaf CLI Status:'));
      if (status.isFullyInstalled) {
        console.log(chalk.green('✅ Leaf CLI dependencies installed'));
      } else {
        console.log(chalk.red('❌ Leaf CLI dependencies missing'));
      }

      console.log('');

      // 2. Check Capacitor Doctor
      if (status.depsInstalled) {
        console.log(chalk.bold('Running Capacitor Doctor:'));
        try {
          execSync('npx cap doctor', { stdio: 'inherit' });
        } catch (error) {
          console.log(chalk.red('\n❌ Capacitor Doctor failed'));
        }
      } else {
        console.log(chalk.yellow('⚠️  Skipping Capacitor Doctor (dependencies not installed)'));
      }

      console.log('');
    });
};
