import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { installDependencies } from '../utils/installer.mjs';
import { checkInstallation } from '../utils/checker.mjs';

export default (program) => {
  program
    .command('install')
    .alias('i')
    .description('Install Capacitor dependencies and commands')
    .option('-i, --interactive', 'Interactive mode (default)')
    .option('-y, --yes', 'Install everything without prompts')
    .option('--deps-only', 'Install only dependencies')
    .option('--commands-only', 'Install only commands')
    .action(async (options) => {
      console.log(chalk.cyan('\n📱 Capacitor Installation\n'));

      // Check current status
      const status = checkInstallation();

      if (status.isFullyInstalled && !options.interactive) {
        console.log(chalk.green('✅ Capacitor is already fully installed!'));
        console.log(chalk.gray('\nRun with -i for interactive mode\n'));
        return;
      }

      let installDeps = true;

      // Interactive mode (default)
      if (!options.yes && !options.depsOnly) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Install Capacitor dependencies?',
            default: true,
          },
        ]);

        if (!answers.proceed) {
          console.log(chalk.yellow('\n⚠️  Installation cancelled\n'));
          return;
        }

        installDeps = true;
      } else {
        // Non-interactive modes
        installDeps = true;
      }

      console.log('');

      // Install dependencies
      if (installDeps) {
        const spinner = ora('Installing Capacitor dependencies...').start();
        try {
          await installDependencies();
          spinner.succeed(chalk.green('Dependencies installed'));
        } catch (error) {
          spinner.fail(chalk.red('Failed to install dependencies'));
          console.error(chalk.red(error.message));
          process.exit(1);
        }
      }

      console.log(chalk.green('\n✨ Installation complete!\n'));
      console.log(chalk.gray('Next steps:'));
      console.log(
        chalk.cyan('  • Run'),
        chalk.bold('leaf setup'),
        chalk.cyan('to initialize Capacitor')
      );
      console.log(
        chalk.cyan('  • Run'),
        chalk.bold('leaf status'),
        chalk.cyan('to check installation')
      );
      console.log('');
    });
};
