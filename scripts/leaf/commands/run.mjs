import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { checkInstallation } from '../utils/checker.mjs';

export default (program) => {
  program
    .command('run [platform]')
    .description('Run app on iOS or Android Simulator/Device')
    .action(async (platform) => {
      console.log(chalk.cyan('\n📱 Run on Device/Simulator\n'));

      const status = checkInstallation();
      if (!status.isFullyInstalled) {
        console.log(chalk.red('❌ Capacitor is not fully installed.'));
        console.log(chalk.gray('Run'), chalk.bold('leaf install'), chalk.gray('first.\n'));
        return;
      }

      let platformsToRun = [];

      if (platform) {
        platformsToRun = [platform];
      } else {
        const answers = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'platforms',
            message: 'Select platform(s) to run on:',
            choices: [
              { name: '📱 iOS', value: 'ios' },
              { name: '🤖 Android', value: 'android' },
            ],
            validate: (answer) => {
              if (answer.length < 1) {
                return 'You must choose at least one platform.';
              }
              return true;
            },
          },
        ]);
        platformsToRun = answers.platforms;
      }

      for (const p of platformsToRun) {
        if (p !== 'ios' && p !== 'android') {
          console.log(chalk.red(`❌ Invalid platform: ${p}. Use "ios" or "android".\n`));
          return;
        }

        if (!status.platforms[p]) {
          console.log(chalk.red(`❌ ${p} platform is not added.`));
          console.log(chalk.gray('Run'), chalk.bold('leaf setup'), chalk.gray('to add it.\n'));
          return;
        }
      }

      try {
        const { spawn } = await import('child_process');

        for (const p of platformsToRun) {
          console.log(chalk.gray(`\nStarting ${p}...`));

          // 1. Sync first (like dev:ios did)
          try {
            console.log(chalk.gray(`Syncing ${p}...`));
            execSync(`npx cap sync ${p}`, { stdio: 'inherit' });
          } catch (e) {
            console.error(chalk.red(`Failed to sync ${p}`));
            continue;
          }

          // 2. Run
          const cmd = 'npx';
          const args = ['cap', 'run', p];

          const child = spawn(cmd, args, { stdio: 'inherit' });

          // Wait for child to exit?
          // If running multiple, we might want to wait or run in parallel?
          // Usually 'run' opens Xcode/Android Studio or runs on device.
          // If it opens IDE, it exits immediately. If it runs on device, it might stay open.
          // For now, let's await it if we have multiple, or just spawn.
          // But spawn without await will exit the parent process if we don't keep it alive.
          // Let's wrap in a promise to wait for it.

          await new Promise((resolve) => {
            child.on('close', (code) => {
              if (code !== 0) {
                console.log(chalk.red(`\n❌ ${p} process exited with code ${code}\n`));
              }
              resolve();
            });
          });
        }
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
        process.exit(1);
      }
    });
};
