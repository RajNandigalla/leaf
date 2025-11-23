import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { checkInstallation } from '../utils/checker.mjs';

export default (program) => {
  program
    .command('sync [platform]')
    .description('Sync app with iOS or Android Simulator/Device')
    .action(async (platform) => {
      console.log(chalk.cyan('\n🔄 Syncing with Native Platforms\n'));

      const status = checkInstallation();
      if (!status.isFullyInstalled) {
        console.log(chalk.red('❌ Capacitor is not fully installed.'));
        console.log(chalk.gray('Run'), chalk.bold('leaf install'), chalk.gray('first.\n'));
        return;
      }

      let platformsToSync = [];

      if (platform) {
        platformsToSync = [platform];
      } else {
        const answers = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'platforms',
            message: 'Select platform(s) to sync:',
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
        platformsToSync = answers.platforms;
      }

      for (const p of platformsToSync) {
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
        for (const p of platformsToSync) {
          console.log(chalk.gray(`\nSyncing ${p}...`));
          execSync(`npx cap sync ${p}`, { stdio: 'inherit' });
          console.log(chalk.green(`✅ Synced ${p} successfully.`));
        }
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error.message);
        process.exit(1);
      }
    });
};
