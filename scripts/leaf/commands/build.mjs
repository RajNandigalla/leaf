import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { runCommand } from '../utils/exec.mjs';
import { checkInstallation } from '../utils/checker.mjs';
import { shouldSkipBuild, getServerUrl } from '../utils/capacitor.mjs';

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

      // Check for server URL
      const skipBuild = shouldSkipBuild();
      const serverUrl = getServerUrl();

      if (skipBuild && serverUrl) {
        console.log(chalk.cyan('🔄 Live reload detected'));
        console.log(chalk.gray(`   Server URL: ${serverUrl}`));
        console.log(chalk.gray('   Skipping web build (using live server)\n'));
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
        // Build web app (unless sync-only or server URL configured)
        if (buildMode !== 'sync-only' && !skipBuild) {
          const leafConfig = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'leaf.json'), 'utf-8')
          );
          const buildCommand = leafConfig.scripts?.build || 'npm run build';

          const buildSpinner = ora(`Building web app (${buildCommand})...`).start();
          try {
            await runCommand(buildCommand);
            buildSpinner.succeed(chalk.green('Web app built successfully'));
          } catch (error) {
            buildSpinner.fail(chalk.red('Build failed'));
            console.error(chalk.red(error.message));
            process.exit(1);
          }
        } else if (skipBuild) {
          console.log(chalk.gray('⏭️  Skipping web build (server URL configured)\n'));
        }

        // Sync with Capacitor
        if (shouldSync && buildMode !== 'build-only') {
          const syncSpinner = ora('Syncing with Capacitor...').start();
          try {
            let syncCmd = 'npx cap sync';
            if (buildMode === 'ios') syncCmd = 'npx cap sync ios';
            if (buildMode === 'android') syncCmd = 'npx cap sync android';

            await runCommand(syncCmd);
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
