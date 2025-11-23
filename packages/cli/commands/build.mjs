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

      let buildMode = skipBuild ? 'sync-only' : 'all'; // Skip build if server URL configured
      let shouldSync = options.sync;
      let syncPlatform = 'all'; // all, android, or ios

      // Only show prompt if not using live reload
      if (!skipBuild) {
        const answers = await inquirer.prompt([
          {
            type: 'rawlist',
            name: 'buildMode',
            message: 'Select build mode:',
            choices: [
              { name: 'Build web app and sync', value: 'all' },
              { name: 'Build web app only (no sync)', value: 'web-only' },
              { name: 'Sync only (no build)', value: 'sync-only' },
            ],
            default: 0,
          },
          {
            type: 'rawlist',
            name: 'platform',
            message: 'Select platform to sync:',
            choices: [
              { name: 'All platforms', value: 'all' },
              { name: 'Android only', value: 'android' },
              { name: 'iOS only', value: 'ios' },
            ],
            default: 0,
            when: (answers) => answers.buildMode !== 'web-only',
          },
        ]);

        buildMode = answers.buildMode;
        shouldSync = buildMode !== 'web-only';
        syncPlatform = answers.platform || 'all';
      } else {
        // When live reload is detected, still ask which platform to sync
        console.log(''); // Add spacing
        const platformAnswer = await inquirer.prompt([
          {
            type: 'rawlist',
            name: 'platform',
            message: 'Select platform to sync:',
            choices: [
              { name: 'All platforms', value: 'all' },
              { name: 'Android only', value: 'android' },
              { name: 'iOS only', value: 'ios' },
            ],
            default: 0,
          },
        ]);
        syncPlatform = platformAnswer.platform;
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

        // Sync with Capacitor (if needed)
        if (shouldSync) {
          const syncSpinner = ora('Syncing with Capacitor...').start();
          try {
            if (syncPlatform === 'all') {
              await runCommand('npx cap sync');
            } else {
              await runCommand(`npx cap sync ${syncPlatform}`);
            }
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
