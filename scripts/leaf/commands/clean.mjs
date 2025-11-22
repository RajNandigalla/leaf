import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { runCommand } from '../utils/exec.mjs';

export default (program) => {
  program
    .command('clean')
    .description('Clean build artifacts and caches')
    .option('--all', 'Clean everything without prompting')
    .action(async (options) => {
      console.log(chalk.cyan('\n🧹 Clean Project\n'));

      // Read leaf.json to get webDir
      let webDir = 'dist'; // default
      try {
        const leafConfig = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'leaf.json'), 'utf-8')
        );
        webDir = leafConfig.webDir || 'dist';
      } catch (error) {
        // Use default if leaf.json doesn't exist
      }

      const cleanTargets = [
        {
          name: `Web build output (${webDir}/, dist/, .next/)`,
          value: 'web',
          paths: [webDir, 'dist', '.next'],
        },
        {
          name: 'iOS build artifacts (ios/build/)',
          value: 'ios-build',
          paths: ['ios/build', 'ios/DerivedData'],
        },
        {
          name: 'Android build artifacts (android/build/, android/app/build/)',
          value: 'android-build',
          paths: ['android/build', 'android/app/build', 'android/.gradle'],
        },
        {
          name: 'Node modules cache (node_modules/.cache/)',
          value: 'node-cache',
          paths: ['node_modules/.cache'],
        },
        {
          name: 'Capacitor generated files (android/, ios/)',
          value: 'platforms',
          paths: ['android', 'ios'],
          warning: true,
        },
      ];

      let selectedTargets = [];

      if (options.all) {
        selectedTargets = cleanTargets.filter((t) => !t.warning).map((t) => t.value);
      } else {
        const answers = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'targets',
            message: 'Select what to clean:',
            choices: cleanTargets.map((t) => ({
              name: t.warning ? `${t.name} ${chalk.red('(⚠️  Destructive)')}` : t.name,
              value: t.value,
              checked: !t.warning,
            })),
          },
        ]);

        selectedTargets = answers.targets;
      }

      if (selectedTargets.length === 0) {
        console.log(chalk.yellow('\n⚠️  Nothing selected to clean\n'));
        return;
      }

      // Confirm destructive operations
      const hasDestructive = selectedTargets.some(
        (t) => cleanTargets.find((ct) => ct.value === t)?.warning
      );

      if (hasDestructive) {
        const confirmAnswers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow('⚠️  This will delete platform folders. Continue?'),
            default: false,
          },
        ]);

        if (!confirmAnswers.confirm) {
          console.log(chalk.yellow('\n⚠️  Clean cancelled\n'));
          return;
        }
      }

      console.log('');

      // Clean selected targets
      for (const targetValue of selectedTargets) {
        const target = cleanTargets.find((t) => t.value === targetValue);
        if (!target) continue;

        const spinner = ora(`Cleaning ${target.name}...`).start();

        try {
          let cleaned = false;
          for (const p of target.paths) {
            const fullPath = path.join(process.cwd(), p);
            if (fs.existsSync(fullPath)) {
              await runCommand(`rm -rf ${fullPath}`);
              cleaned = true;
            }
          }

          if (cleaned) {
            spinner.succeed(chalk.green(`Cleaned ${target.name}`));
          } else {
            spinner.info(chalk.gray(`${target.name} - nothing to clean`));
          }
        } catch (error) {
          spinner.fail(chalk.red(`Failed to clean ${target.name}`));
          console.error(chalk.red(error.message));
        }
      }

      console.log(chalk.green('\n✨ Clean complete!\n'));
    });
};
