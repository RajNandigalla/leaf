import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { checkInstallation } from '../utils/checker.mjs';

export default (program) => {
  program
    .command('setup')
    .description('Initialize Capacitor and add platforms')
    .option('--skip-build', 'Skip initial build')
    .action(async (options) => {
      console.log(chalk.cyan('\n🚀 Capacitor Setup\n'));

      // Check if Capacitor is installed
      const status = checkInstallation();
      if (!status.depsInstalled) {
        console.log(chalk.red('❌ Capacitor dependencies not installed'));
        console.log(chalk.gray('\nRun:'), chalk.bold('leaf install\n'));
        return;
      }

      // Interactive setup
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'appName',
          message: 'App name:',
          default: 'LeafInk',
        },
        {
          type: 'input',
          name: 'appId',
          message: 'App ID (reverse domain):',
          default: 'com.leafink.app',
          validate: (input) => {
            if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(input)) {
              return 'Please enter a valid app ID (e.g., com.example.app)';
            }
            return true;
          },
        },
        {
          type: 'checkbox',
          name: 'platforms',
          message: 'Select platforms to add:',
          choices: [
            { name: '📱 iOS', value: 'ios', checked: true },
            { name: '🤖 Android', value: 'android', checked: true },
          ],
          validate: (answer) => {
            if (answer.length < 1) {
              return 'You must choose at least one platform.';
            }
            return true;
          },
        },
        {
          type: 'confirm',
          name: 'buildFirst',
          message: 'Build web app before adding platforms?',
          default: true,
          when: () => !options.skipBuild,
        },
      ]);

      console.log('');

      try {
        // Build web app
        if (answers.buildFirst) {
          const buildSpinner = ora('Building web app...').start();
          try {
            execSync('npm run build:mobile', { stdio: 'pipe' });
            buildSpinner.succeed(chalk.green('Web app built'));
          } catch (error) {
            buildSpinner.fail(chalk.red('Build failed'));
            throw error;
          }
        }

        // Initialize Capacitor
        const initSpinner = ora('Initializing Capacitor...').start();
        try {
          execSync(`npx cap init "${answers.appName}" "${answers.appId}" --web-dir=out`, {
            stdio: 'pipe',
          });
          initSpinner.succeed(chalk.green('Capacitor initialized'));
        } catch (error) {
          initSpinner.fail(chalk.red('Initialization failed'));
          throw error;
        }

        // Add platforms
        for (const platform of answers.platforms) {
          const platformSpinner = ora(`Adding ${platform}...`).start();
          try {
            execSync(`npx cap add ${platform}`, { stdio: 'pipe' });
            platformSpinner.succeed(chalk.green(`${platform} added`));
          } catch (error) {
            platformSpinner.fail(chalk.red(`Failed to add ${platform}`));
            throw error;
          }
        }

        console.log(chalk.green('\n✨ Setup complete!\n'));
        console.log(chalk.gray('Next steps:'));

        if (answers.platforms.includes('ios')) {
          console.log(
            chalk.cyan('  • Run'),
            chalk.bold('leaf run ios'),
            chalk.cyan('to open Xcode')
          );
        }
        if (answers.platforms.includes('android')) {
          console.log(
            chalk.cyan('  • Run'),
            chalk.bold('leaf run android'),
            chalk.cyan('to open Android Studio')
          );
        }
        console.log('');
      } catch (error) {
        console.error(chalk.red('\n❌ Setup failed:'), error.message);
        process.exit(1);
      }
    });
};
