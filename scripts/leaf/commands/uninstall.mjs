import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { uninstallDependencies, uninstallCommands } from '../utils/installer.mjs';
import { checkInstallation } from '../utils/checker.mjs';

export default (program) => {
  program
    .command('uninstall')
    .description('Uninstall Capacitor dependencies and commands')
    .option('-y, --yes', 'Uninstall everything without confirmation')
    .action(async (options) => {
      console.log(chalk.cyan('\n🗑️  Capacitor Uninstallation\n'));

      // Check current status
      const status = checkInstallation();

      if (!status.depsInstalled && !status.commandsInstalled) {
        console.log(chalk.yellow('⚠️  Capacitor is not installed.'));
        return;
      }

      let confirm = false;

      if (options.yes) {
        confirm = true;
      } else {
        const answer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to uninstall Capacitor dependencies and commands?',
            default: false,
          },
        ]);
        confirm = answer.confirm;
      }

      if (!confirm) {
        console.log(chalk.yellow('\n⚠️  Uninstallation cancelled\n'));
        return;
      }

      console.log('');

      // Uninstall dependencies
      if (status.depsInstalled) {
        const spinner = ora('Uninstalling Capacitor dependencies...').start();
        try {
          await uninstallDependencies();
          spinner.succeed(chalk.green('Dependencies uninstalled'));
        } catch (error) {
          spinner.fail(chalk.red('Failed to uninstall dependencies'));
          console.error(chalk.red(error.message));
        }
      }

      // Uninstall commands
      if (status.commandsInstalled) {
        const spinner = ora('Uninstalling Capacitor commands...').start();
        try {
          await uninstallCommands();
          spinner.succeed(chalk.green('Commands uninstalled'));
        } catch (error) {
          spinner.fail(chalk.red('Failed to uninstall commands'));
          console.error(chalk.red(error.message));
        }
      }

      console.log(chalk.green('\n✨ Uninstallation complete!\n'));
    });
};
