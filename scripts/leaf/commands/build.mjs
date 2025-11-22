import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { checkInstallation } from '../utils/checker.mjs';

export default (program) => {
  program
    .command('build')
    .description('Build web app and sync with Capacitor')
    .option('--no-sync', 'Skip Capacitor sync')
    .action(async (options) => {
      console.log(chalk.cyan('\n📦 Building for Mobile\n'));

      const status = checkInstallation();
      if (!status.isFullyInstalled) {
        console.log(chalk.red('❌ Capacitor is not fully installed.'));
        console.log(chalk.gray('Run'), chalk.bold('leaf install'), chalk.gray('first.\n'));
        return;
      }

      let buildMode = 'all'; // default
      let shouldSync = options.sync;

      // If no specific flags provided, ask interactively
      if (process.argv.slice(3).length === 0) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'mode',
            message: 'Select build mode:',
            choices: [
              { name: '🚀 Build & Sync All (Default)', value: 'all' },
              { name: '🍎 Build & Sync iOS', value: 'ios' },
              { name: '🤖 Build & Sync Android', value: 'android' },
              { name: '🏗️  Build Only (No Sync)', value: 'build-only' },
              { name: '🔄 Sync Only (All)', value: 'sync-only' },
            ],
          },
        ]);
        buildMode = answers.mode;
        if (buildMode === 'build-only') shouldSync = false;
      }

      try {
        // Build web app (unless sync-only)
        if (buildMode !== 'sync-only') {
          const buildSpinner = ora('Building web app...').start();
          try {
            // We use npx next build.
            // Note: User needs output: 'export' in next.config.ts for Capacitor to work.
            execSync('npx next build', { stdio: 'inherit' });
            buildSpinner.succeed(chalk.green('Web app built successfully'));
          } catch (error) {
            buildSpinner.fail(chalk.red('Build failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
          }
        }

        // Sync with Capacitor
        if (shouldSync && buildMode !== 'build-only') {
          const syncSpinner = ora('Syncing with Capacitor...').start();
          try {
            let syncCmd = 'npx cap sync';
            if (buildMode === 'ios') syncCmd = 'npx cap sync ios';
            if (buildMode === 'android') syncCmd = 'npx cap sync android';

            execSync(syncCmd, { stdio: 'inherit' });
            syncSpinner.succeed(chalk.green('Synced with Capacitor'));
          } catch (error) {
            syncSpinner.fail(chalk.red('Sync failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
          }
        }

        console.log(chalk.green('\n✨ Build complete!\n'));
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
        process.exit(1);
      }
    });
};
